"use client";

import displayKESCurrency from "@/helpers/displayCurrency";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { toast } from "react-toastify";
import { useAuthStore } from "@/store/auth-store";

// Product type
interface Product {
  _id: string;
  productName: string;
  sellingPrice: number;
}

// Cart item type
interface CartItem {
  productId: string;
  quantity: number;
  product: {
    _id: string;
    productName: string;
    sellingPrice: number;
  };
}

// Shipping info type
interface ShippingInfo {
  fullName: string;
  phone: string;
  address: string;
  county: string;
  city: string;
}

// Checkout payload type
interface CheckoutPayload {
  userId: string;
  phoneNumber: string;
  amount: number;
  accountReference: string;
  description: string;
  fullName: string;
  address: string;
  county: string;
  city: string;
  productDetails: { productId: string; quantity: number }[];
}

// Loose shape of the server replies (checkout + payment status)
interface ApiReply {
  success?: boolean;
  message?: string;
  error?: string;
  errors?: (string | { message?: string; msg?: string })[];
  paymentStatus?: string;
  resultDesc?: string;
  data?: { CheckoutRequestID?: string };
}

const API_URL = process.env.NEXT_PUBLIC_API_URL;

// Timing
const PAYMENT_TIMEOUT_MS = 2 * 60 * 1000; // how long we wait for the M-Pesa PIN
const POLL_INTERVAL_MS = 3000;
const REQUEST_TIMEOUT_MS = 30000; // how long we wait for the server to start the payment
const MAX_POLL_FAILURES = 5; // warn the user after this many failed status checks in a row

// Per-field helpers for the shipping form (keeps the original field list and order)
const FIELD_AUTOCOMPLETE: Record<keyof ShippingInfo, string> = {
  fullName: "name",
  phone: "tel",
  address: "street-address",
  county: "address-level1",
  city: "address-level2",
};

const FIELD_LABEL: Record<keyof ShippingInfo, string> = {
  fullName: "Full name",
  phone: "M-Pesa phone number",
  address: "Delivery address",
  county: "County",
  city: "Town/City",
};

// On phones the form is a 2-column grid so it stays short: county and city share a row
const FIELD_SPAN: Record<keyof ShippingInfo, string> = {
  fullName: "col-span-2 sm:col-span-1",
  phone: "col-span-2 sm:col-span-1",
  address: "col-span-2",
  county: "col-span-1",
  city: "col-span-1",
};

// Payment statuses the server can report that mean "this payment did not go through"
const FAILED_STATUSES = ["FAILED", "CANCELLED", "CANCELED", "TIMEOUT", "EXPIRED"];

// A cart item must have an id, a positive whole quantity and a numeric price
function isCartItem(value: unknown): value is CartItem {
  const v = value as Partial<CartItem> | null;
  return (
    !!v &&
    typeof v === "object" &&
    typeof v.quantity === "number" &&
    Number.isInteger(v.quantity) &&
    v.quantity > 0 &&
    !!v.product &&
    typeof v.product._id === "string" &&
    typeof v.product.sellingPrice === "number" &&
    v.product.sellingPrice >= 0
  );
}

// Pulls the most useful message out of whatever shape the backend replied with
function extractMessage(result: ApiReply | null): string | undefined {
  if (!result || typeof result !== "object") return undefined;
  if (typeof result.error === "string" && result.error.trim()) return result.error.trim();
  if (typeof result.message === "string" && result.message.trim()) return result.message.trim();
  if (Array.isArray(result.errors) && result.errors.length > 0) {
    const first = result.errors[0];
    if (typeof first === "string") return first;
    if (first && typeof first.message === "string") return first.message;
    if (first && typeof first.msg === "string") return first.msg;
  }
  return undefined;
}

// Turns "Retry-After" (seconds) into friendly text, e.g. "2 minutes"
function formatWait(retryAfter: string | null): string {
  const seconds = retryAfter ? parseInt(retryAfter, 10) : NaN;
  if (!Number.isFinite(seconds) || seconds <= 0) return "a few minutes";
  if (seconds < 60) return `${seconds} second${seconds === 1 ? "" : "s"}`;
  const minutes = Math.ceil(seconds / 60);
  return `${minutes} minute${minutes === 1 ? "" : "s"}`;
}

// Maps an HTTP status from the checkout request to a clear message (the server's own message wins)
function messageForStatus(status: number, backendMessage: string | undefined, retryAfter: string | null): string {
  if (status === 429) return `Too many attempts. Please wait ${formatWait(retryAfter)} and try again.`;
  if (status >= 500) return "We couldn't start the payment right now. Please try again in a moment.";
  switch (status) {
    case 400:
    case 422:
      return backendMessage || "Please check your details and try again.";
    case 401:
      return "Your session has expired. Please log in again.";
    case 403:
      return backendMessage || "You're not allowed to place this order.";
    case 404:
      return backendMessage || "One of the items in your order is no longer available.";
    case 409:
      return backendMessage || "Some items are out of stock or have changed. Please review your cart.";
    case 408:
      return "The request timed out. Please try again.";
    default:
      return backendMessage || "Checkout failed. Please try again.";
  }
}

// Rejects if the promise takes longer than `ms` (the payment request must not hang forever)
function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const timer = window.setTimeout(() => reject(new Error("REQUEST_TIMEOUT")), ms);
    promise.then(
      (value) => {
        window.clearTimeout(timer);
        resolve(value);
      },
      (err) => {
        window.clearTimeout(timer);
        reject(err);
      }
    );
  });
}

// Reads a reply safely: the server may send HTML or nothing (proxy errors, crashes)
async function readReply(res: Response): Promise<{ data: ApiReply | null; raw: string }> {
  const raw = await res.text();
  let data: ApiReply | null = null;
  if (raw) {
    try {
      data = JSON.parse(raw) as ApiReply;
    } catch {
      data = null;
    }
  }
  return { data, raw };
}

// Friendly text for a failed request (offline, timeout, server down)
function describeNetworkError(err: unknown): string {
  if (typeof navigator !== "undefined" && !navigator.onLine) {
    return "You're offline. Check your internet connection and try again.";
  }
  if (err instanceof Error && err.message === "REQUEST_TIMEOUT") {
    return "The server is taking too long to respond. If you get an M-Pesa prompt, complete it; otherwise try again.";
  }
  return "Can't reach the server. Check your connection, or try again in a moment.";
}

/** Normalize Kenyan phone numbers to 254 format (what M-Pesa expects) */
const normalizePhone = (phone: string) => {
  let p = phone.replace(/\D/g, "");
  if (p.startsWith("07")) p = "254" + p.substring(1);
  if (p.startsWith("7") && p.length === 9) p = "254" + p;
  if (p.startsWith("01")) p = "254" + p.substring(1);
  if (p.startsWith("1") && p.length === 9) p = "254" + p;
  if (p.startsWith("2540")) p = "254" + p.substring(4);
  return p;
};

const isValidPhone = (phone: string) => /^254[17]\d{8}$/.test(normalizePhone(phone));

// 254712345678 -> 0712 345 678
const displayPhone = (phone: string) => {
  const n = normalizePhone(phone);
  if (/^254[17]\d{8}$/.test(n)) return `0${n.slice(3, 6)} ${n.slice(6, 9)} ${n.slice(9)}`;
  return phone;
};

const formatCountdown = (seconds: number) =>
  `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, "0")}`;

const CheckoutPage = () => {
  const searchParams = useSearchParams();
  const itemsParam = searchParams.get("items");
  const [items, setItems] = useState<CartItem[]>([]);
  const [itemsReady, setItemsReady] = useState(false);
  const [shippingInfo, setShippingInfo] = useState<ShippingInfo>({
    fullName: "",
    phone: "",
    address: "",
    county: "",
    city: "",
  });
  const [loadingPayment, setLoadingPayment] = useState(false);
  // Phones: the order summary starts collapsed so the form and the pay button fit on screen
  const [summaryOpen, setSummaryOpen] = useState(false);
  // Which inputs are highlighted red after a validation error
  const [fieldErrors, setFieldErrors] = useState<Partial<Record<keyof ShippingInfo, boolean>>>({});
  const [secondsLeft, setSecondsLeft] = useState(Math.ceil(PAYMENT_TIMEOUT_MS / 1000));

  // Timers for the payment-status polling (kept in refs so they can be cleared on leave/stop)
  const pollRef = useRef<number | null>(null);
  const timeoutRef = useRef<number | null>(null);
  const countdownRef = useRef<number | null>(null);
  const pollBusyRef = useRef(false);
  const pollFailuresRef = useRef(0);

  const { user, isLoggedIn } = useAuthStore();
  const router = useRouter();

  const stopPolling = () => {
    if (pollRef.current !== null) window.clearInterval(pollRef.current);
    if (timeoutRef.current !== null) window.clearTimeout(timeoutRef.current);
    if (countdownRef.current !== null) window.clearInterval(countdownRef.current);
    pollRef.current = null;
    timeoutRef.current = null;
    countdownRef.current = null;
    pollBusyRef.current = false;
    pollFailuresRef.current = 0;
  };

  // Never leave timers running if the user navigates away
  useEffect(() => {
    return () => stopPolling();
  }, []);

  useEffect(() => {
    if (!isLoggedIn()) {
      const currentPath = window.location.pathname + window.location.search;
      router.push(`/login?redirect=${encodeURIComponent(currentPath)}`);
    }
  }, [isLoggedIn, router]);

  useEffect(() => {
  if (user) {
    setShippingInfo((prev) => ({
      ...prev,
      fullName: user.name ?? "",
      phone: user.phone ?? "",
    }));
  }
}, [user]);

  useEffect(() => {
    if (itemsParam) {
      try {
        const parsed: CartItem[] = JSON.parse(decodeURIComponent(itemsParam));
        if (!Array.isArray(parsed) || !parsed.every(isCartItem)) {
          throw new Error("Invalid cart items");
        }
        setItems(parsed);
      } catch (error) {
        console.error("Failed to parse cart items", error);
        toast.error("Failed to load cart items.", { toastId: "cart-load-error" });
      }
    }
    setItemsReady(true);
  }, [itemsParam]);

  const totalPrice = items.reduce(
    (sum, curr) => sum + curr.quantity * curr.product.sellingPrice,
    0
  );
  const itemCount = items.reduce((sum, curr) => sum + curr.quantity, 0);
  const phoneLooksValid = shippingInfo.phone ? isValidPhone(shippingInfo.phone) : false;

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setShippingInfo({
      ...shippingInfo,
      [e.target.name]: e.target.value,
    });
    // Clear the red highlight as soon as the user starts fixing that field
    const name = e.target.name as keyof ShippingInfo;
    if (fieldErrors[name]) setFieldErrors((prev) => ({ ...prev, [name]: false }));
  };

  // Shows one validation toast (replacing any earlier one), highlights the field and focuses it
  const rejectField = (message: string, field?: keyof ShippingInfo) => {
    toast.dismiss();
    toast.error(message);
    if (field) {
      setFieldErrors({ [field]: true });
      document.getElementById(`checkout-${field}`)?.focus();
    }
  };

  // Called when the payment ends (success, failure, timeout or the user stops waiting)
  const finishPayment = () => {
    stopPolling();
    setLoadingPayment(false);
  };

  const startPolling = (checkoutRequestId: string, waitingToastId: ReturnType<typeof toast.info>) => {
    stopPolling();
    const deadline = Date.now() + PAYMENT_TIMEOUT_MS;
    setSecondsLeft(Math.ceil(PAYMENT_TIMEOUT_MS / 1000));

    // Visible countdown in the "check your phone" screen
    countdownRef.current = window.setInterval(() => {
      setSecondsLeft(Math.max(0, Math.ceil((deadline - Date.now()) / 1000)));
    }, 1000);

    // Timeout after 2 minutes
    timeoutRef.current = window.setTimeout(() => {
      finishPayment();
      toast.dismiss(waitingToastId);
      toast.error("Payment failed (timeout). Please try again.");
      toast.info("If M-Pesa already took the money, check your orders in your dashboard before paying again.", {
        autoClose: 9000,
      });
    }, PAYMENT_TIMEOUT_MS);

    pollRef.current = window.setInterval(async () => {
      // Don't start a new check while the previous one is still running
      if (pollBusyRef.current) return;
      pollBusyRef.current = true;
      try {
        const statusRes = await useAuthStore
          .getState()
          .fetchWithAuth(`${API_URL}/api/orders/status?checkoutRequestId=${checkoutRequestId}`);

        if (statusRes.status === 401) {
          finishPayment();
          toast.dismiss(waitingToastId);
          toast.error("Your session expired while waiting. Log in and check your orders before paying again.");
          return;
        }

        const { data: statusData } = await readReply(statusRes);

        if (!statusRes.ok) throw new Error(`Status check failed (${statusRes.status})`);
        pollFailuresRef.current = 0;

        const status = (statusData?.paymentStatus ?? "").toUpperCase();

        if (status === "CONFIRMED") {
          finishPayment();
          toast.dismiss(waitingToastId);
          toast.success("Payment confirmed! Redirecting...");
          router.push("/customer-dashboard");
        } else if (status === "FAILED" || FAILED_STATUSES.includes(status)) {
          finishPayment();
          toast.dismiss(waitingToastId);
          if (status === "CANCELLED" || status === "CANCELED") {
            toast.error("You cancelled the M-Pesa request. Try again when you're ready.");
          } else {
            const reason = statusData?.resultDesc || statusData?.message;
            toast.error(reason ? `Payment failed. ${reason}` : "Payment failed. Please try again.");
          }
        }
      } catch (err) {
        console.error("Error checking payment status:", err);
        pollFailuresRef.current += 1;
        if (pollFailuresRef.current === MAX_POLL_FAILURES) {
          toast.warn("We're having trouble checking your payment. Still trying...", {
            toastId: "poll-trouble",
          });
        }
      } finally {
        pollBusyRef.current = false;
      }
    }, POLL_INTERVAL_MS);
  };

  // The user stops waiting: we only stop checking, the payment itself may still complete
  const handleStopWaiting = () => {
    finishPayment();
    toast.dismiss();
    toast.info("Stopped waiting. If you already paid, your order will appear in your dashboard shortly.", {
      autoClose: 8000,
    });
  };

 const handleConfirmAndPay = async () => {
  // Ignore extra clicks while a payment is already in progress
  if (loadingPayment) return;

  if (!user) {
    toast.error("User not authenticated. Please login.");
    return;
  }

  if (!items.length) {
    toast.error("Cart is empty");
    return;
  }

  // ---------- Checks done in the browser (instant feedback, nothing is sent yet) ----------
  const fullName = shippingInfo.fullName.trim();
  const address = shippingInfo.address.trim();
  const county = shippingInfo.county.trim();
  const city = shippingInfo.city.trim();
  const phoneRaw = shippingInfo.phone.trim();

  if (!fullName) return rejectField("Enter your full name.", "fullName");
  if (fullName.length < 2) return rejectField("Your name is too short.", "fullName");
  if (!phoneRaw) return rejectField("Enter the phone number to receive the M-Pesa prompt.", "phone");
  if (!/^[+\d\s()-]+$/.test(phoneRaw)) {
    return rejectField("Your phone number can only contain digits, spaces and a leading +.", "phone");
  }
  if (!isValidPhone(phoneRaw)) {
    return rejectField("Enter a valid Safaricom number for M-Pesa, for example 0712 345 678.", "phone");
  }
  if (!address) return rejectField("Enter your delivery address (street, building).", "address");
  if (address.length < 3) return rejectField("Your address is too short. Add the street or building.", "address");
  if (!county) return rejectField("Enter your county.", "county");
  if (!city) return rejectField("Enter your town or city.", "city");

  if (!shippingInfo.phone || !shippingInfo.address || !shippingInfo.city) {
    toast.error("Please complete shipping information");
    return;
  }

  if (!(totalPrice > 0)) {
    toast.error("Your order total is not valid. Please go back and review your cart.");
    return;
  }

  if (!API_URL) {
    console.error("[Checkout] NEXT_PUBLIC_API_URL is not set. Add it to .env.local and restart the dev server.");
    toast.error("Checkout is not set up correctly. Please contact support.");
    return;
  }

  if (typeof navigator !== "undefined" && !navigator.onLine) {
    toast.error("You're offline. Check your internet connection and try again.");
    return;
  }

  setFieldErrors({});

  const payload: CheckoutPayload = {
    userId: user.id,
    phoneNumber: normalizePhone(phoneRaw),
    amount: totalPrice,
    accountReference: `Order-${Date.now()}`,
    description: "Coltech Business Product(s)",
    fullName,
    address,
    county,
    city,
    productDetails: items.map((item) => ({
      productId: item.product._id,
      quantity: item.quantity,
    })),
  };

  try {
    setLoadingPayment(true);
    toast.dismiss();

    const res = await withTimeout(
      useAuthStore
        .getState()
        .fetchWithAuth(`${API_URL}/api/checkout`, {
          method: "POST",
          body: JSON.stringify(payload),
        }),
      REQUEST_TIMEOUT_MS
    );

    const { data, raw } = await readReply(res);

    if (!res.ok || !data?.success) {
      console.error("Checkout failed:", res.status, data ?? raw.slice(0, 200));
      setLoadingPayment(false);

      // Expired login: send the user to log in and come straight back here
      if (res.status === 401) {
        toast.error(messageForStatus(401, undefined, null));
        const currentPath = window.location.pathname + window.location.search;
        router.push(`/login?redirect=${encodeURIComponent(currentPath)}`);
        return;
      }

      return toast.error(
        messageForStatus(res.status || 500, extractMessage(data), res.headers.get("Retry-After"))
      );
    }

    const checkoutRequestId = data?.data?.CheckoutRequestID;

    // The server accepted the order but gave us nothing to track the payment with
    if (!checkoutRequestId) {
      console.error("Checkout succeeded but CheckoutRequestID is missing:", data);
      setLoadingPayment(false);
      return toast.error(
        "We couldn't confirm the payment request. Check your M-Pesa messages and your orders before trying again."
      );
    }

    const waitingToastId = toast.info("Waiting for payment confirmation...", { autoClose: false });

    startPolling(checkoutRequestId, waitingToastId);
  } catch (error) {
    console.error("Error placing order:", error);
    setLoadingPayment(false);
    toast.error(describeNetworkError(error) || "Something went wrong. Please retry.");
  }
};

  const inputClass = (field: keyof ShippingInfo) =>
    `w-full rounded-lg border px-3 py-2.5 text-base text-white placeholder-white/60 transition focus:outline-none focus:ring ${
      fieldErrors[field]
        ? "border-red-400 bg-red-500/10 focus:border-red-400 focus:ring-red-400/40"
        : "border-white/20 bg-white/5 focus:border-[#00C2D1] focus:ring-[#00C2D1]/50"
    }`;

  const payButtonClass =
    "bg-gradient-to-r from-[#00C2D1] to-[#7B2CBF] hover:opacity-90 text-white w-full py-3 rounded-lg text-base sm:text-lg font-semibold shadow-lg transition cursor-pointer active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60";

  return (
    // Dark brand backdrop (same as the login, sign-up and reset pages). Height = screen minus the header.
    // overflow-x-clip (not hidden) so the sticky pay bar below keeps working.
    <div className="relative min-h-[calc(100dvh-var(--header-h,132px))] overflow-x-clip bg-gradient-to-b from-black via-gray-900 to-gray-800 text-white">
      {/* Ambient glows */}
      <div aria-hidden className="pointer-events-none absolute -top-24 left-[-10%] h-80 w-80 rounded-full bg-[#00C2D1]/15 blur-3xl" />
      <div aria-hidden className="pointer-events-none absolute bottom-0 right-[-10%] h-96 w-96 rounded-full bg-[#7B2CBF]/20 blur-3xl" />

      <div className="relative mx-auto max-w-6xl px-3 pt-3 pb-4 sm:px-6 sm:pt-6 md:pb-10">
        {/* "Check your phone" screen while we wait for the M-Pesa PIN */}
        {loadingPayment && (
          <div
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="pay-wait-title"
            className="fixed inset-0 z-[60] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
          >
            <div className="w-full max-w-sm overflow-hidden rounded-2xl border border-white/15 bg-gray-900 text-center shadow-2xl">
              <div className="h-1.5 bg-gradient-to-r from-[#00C2D1] via-[#7B2CBF] to-[#FF3D9A]" />
              <div className="p-5 sm:p-6">
                <div
                  aria-hidden
                  className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-4 border-white/15 border-t-[#00C2D1] motion-reduce:animate-none"
                />
                <h3 id="pay-wait-title" className="text-lg font-bold">Check your phone</h3>
                <p className="mt-2 text-sm text-white/80">
                  We sent an M-Pesa prompt to <strong>{displayPhone(shippingInfo.phone)}</strong>. Enter your M-Pesa PIN to pay{" "}
                  <strong>{displayKESCurrency(totalPrice)}</strong>.
                </p>
                <p className="mt-3 text-2xl font-semibold tabular-nums" aria-live="off">
                  {formatCountdown(secondsLeft)}
                </p>
                <div className="text-white/60 text-xs animate-pulse motion-reduce:animate-none" role="status">
                  Processing payment, please wait...
                </div>
                <button
                  type="button"
                  onClick={handleStopWaiting}
                  className="mt-4 rounded-full border border-white/25 px-5 py-2 text-sm font-medium text-white/90 transition hover:bg-white/10"
                >
                  Stop waiting
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Header: back, title, secure tag */}
        <div className="mb-3 flex items-center gap-3 sm:mb-6">
          <button
            type="button"
            onClick={() => router.back()}
            disabled={loadingPayment}
            aria-label="Go back"
            className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-white/15 bg-white/5 text-white/90 transition hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00C2D1] disabled:opacity-50"
          >
            <svg aria-hidden viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M15 18l-6-6 6-6" />
            </svg>
          </button>
          <h2 className="text-xl font-bold sm:text-3xl">Checkout</h2>
          <span className="ml-auto inline-flex items-center gap-1.5 rounded-full border border-emerald-400/30 bg-emerald-400/10 px-2.5 py-1 text-[11px] font-medium text-emerald-300 sm:text-xs">
            <svg aria-hidden viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <rect x="5" y="11" width="14" height="9" rx="2" />
              <path d="M8 11V8a4 4 0 018 0v3" />
            </svg>
            Secure M-Pesa
          </span>
        </div>

        {itemsReady && items.length === 0 ? (
          // Nothing to pay for (bad link, or the cart was empty)
          <div className="mx-auto max-w-md rounded-xl border border-white/15 bg-white/5 p-6 text-center backdrop-blur-md">
            <h3 className="text-lg font-semibold">Your checkout is empty</h3>
            <p className="mt-1 text-sm text-white/70">
              We couldn&apos;t find any items to pay for. Go back to your cart or keep shopping.
            </p>
            <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:justify-center">
              <button
                type="button"
                onClick={() => router.back()}
                className="rounded-full border border-white/25 px-5 py-2.5 text-sm font-semibold text-white/90 transition hover:bg-white/10"
              >
                Back to cart
              </button>
              <Link
                href="/"
                className="rounded-full bg-gradient-to-r from-[#00C2D1] to-[#7B2CBF] px-5 py-2.5 text-sm font-semibold text-white shadow-md transition hover:opacity-90"
              >
                Continue shopping
              </Link>
            </div>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 gap-3 md:grid-cols-5 md:gap-6">
              {/* Shipping Form (below the summary on phones, left column on larger screens) */}
              <form
                id="checkout-form"
                noValidate
                onSubmit={(e) => {
                  e.preventDefault();
                  handleConfirmAndPay();
                }}
                className="order-2 md:order-1 md:col-span-3 bg-white/10 backdrop-blur-md p-3 shadow rounded-xl border border-white/20 sm:p-6"
              >
                <h3 className="mb-2 text-base font-semibold sm:mb-3 sm:text-lg">Shipping Information</h3>
                <div className="grid grid-cols-2 gap-2.5 sm:gap-4">
                  {["fullName", "phone", "address", "county", "city"].map((field) => (
                    <div key={field} className={FIELD_SPAN[field as keyof ShippingInfo]}>
                      {/* Labels show from tablet size up; on phones the placeholder keeps the form short */}
                      <label
                        htmlFor={`checkout-${field}`}
                        className="sr-only mb-1 text-xs font-medium text-white/70 sm:not-sr-only sm:block"
                      >
                        {FIELD_LABEL[field as keyof ShippingInfo]}
                      </label>
                      <input
                        id={`checkout-${field}`}
                        key={field}
                        type={field === "phone" ? "tel" : "text"}
                        name={field}
                        inputMode={field === "phone" ? "tel" : undefined}
                        autoComplete={FIELD_AUTOCOMPLETE[field as keyof ShippingInfo]}
                        aria-invalid={!!fieldErrors[field as keyof ShippingInfo]}
                        disabled={loadingPayment}
                        placeholder={
                          field === "fullName"
                            ? "Full Name"
                            : field === "phone"
                            ? "Phone Number"
                            : field === "address"
                            ? "Address (Street, Building)"
                            : field === "county"
                            ? "County"
                            : "Town/City"
                        }
                        value={shippingInfo[field as keyof ShippingInfo]}
                        onChange={handleInputChange}
                        className={inputClass(field as keyof ShippingInfo)}
                        required
                      />
                    </div>
                  ))}
                </div>

                {/* Tells the user exactly where the M-Pesa prompt will go */}
                <p className="mt-2.5 flex items-start gap-1.5 text-xs text-white/70 sm:mt-4 sm:text-sm" aria-live="polite">
                  <svg aria-hidden viewBox="0 0 24 24" className="mt-0.5 h-4 w-4 shrink-0 text-[#00C2D1]" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="7" y="2" width="10" height="20" rx="2" />
                    <path d="M11 18h2" />
                  </svg>
                  {phoneLooksValid ? (
                    <span>
                      You&apos;ll get an M-Pesa prompt on <strong className="text-white">{displayPhone(shippingInfo.phone)}</strong>.
                    </span>
                  ) : (
                    <span>Enter a Safaricom number, like 0712 345 678, to receive the M-Pesa prompt.</span>
                  )}
                </p>
              </form>

              {/* Order Summary (collapsible on phones, sticky on larger screens) */}
              <div className="order-1 md:order-2 md:col-span-2 bg-white/10 backdrop-blur-md shadow rounded-xl border border-white/20 flex flex-col justify-between md:sticky md:top-[calc(var(--header-h,132px)+12px)] md:self-start">
                {/* Phone header: item count, total and a toggle */}
                <button
                  type="button"
                  onClick={() => setSummaryOpen((open) => !open)}
                  aria-expanded={summaryOpen}
                  aria-controls="order-summary-list"
                  className="flex w-full items-center justify-between gap-3 p-3 text-left md:hidden"
                >
                  <span className="min-w-0">
                    <span className="block text-sm font-semibold">Order Summary</span>
                    <span className="block text-xs text-white/70">
                      {itemCount} item{itemCount === 1 ? "" : "s"} · {summaryOpen ? "tap to hide" : "tap to view"}
                    </span>
                  </span>
                  <span className="flex shrink-0 items-center gap-2">
                    <span className="text-base font-bold tabular-nums">{displayKESCurrency(totalPrice)}</span>
                    <svg
                      aria-hidden
                      viewBox="0 0 24 24"
                      className={`h-4 w-4 transition-transform motion-reduce:transition-none ${summaryOpen ? "rotate-180" : ""}`}
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M6 9l6 6 6-6" />
                    </svg>
                  </span>
                </button>

                <div className="p-3 pt-0 md:p-6">
                  <div>
                    <h3 className="mb-3 hidden text-lg font-semibold md:block">Order Summary</h3>
                    <ul
                      id="order-summary-list"
                      className={`${summaryOpen ? "block" : "hidden"} max-h-[34dvh] divide-y divide-white/20 overflow-y-auto text-sm md:block md:max-h-[45dvh]`}
                    >
                      {items.map((item, idx) => (
                        <li key={idx} className="py-2 flex justify-between gap-3 text-white/90">
                          <span className="min-w-0 break-words">
                            {item.product?.productName} × {item.quantity}
                          </span>
                          <span className="shrink-0 tabular-nums">
                            {displayKESCurrency(
                              item.quantity * (item.product?.sellingPrice ?? 0)
                            )}
                          </span>
                        </li>
                      ))}
                    </ul>

                    {/* Total + pay button here on tablets and desktops; phones use the sticky bar below */}
                    <div className="mt-4 hidden justify-between text-base font-bold md:flex">
                      <span>Total</span>
                      <span className="tabular-nums">{displayKESCurrency(totalPrice)}</span>
                    </div>
                  </div>

                  <button
                    className={`${payButtonClass} mt-6 hidden md:block`}
                    onClick={handleConfirmAndPay}
                    disabled={loadingPayment}
                    aria-busy={loadingPayment}
                  >
                    {loadingPayment ? "Processing..." : "Confirm & Pay via M-Pesa"}
                  </button>
                </div>
              </div>
            </div>

            {/* Phones: the total and pay button stay visible at the bottom of the screen */}
            <div className="sticky bottom-0 z-30 -mx-3 mt-3 border-t border-white/10 bg-gray-900/95 px-3 pb-[max(.625rem,env(safe-area-inset-bottom))] pt-2.5 backdrop-blur md:hidden">
              <div className="flex items-center gap-3">
                <div className="shrink-0">
                  <p className="text-[11px] text-white/60">Total</p>
                  <p className="text-lg font-bold leading-tight tabular-nums">{displayKESCurrency(totalPrice)}</p>
                </div>
                <button
                  className={`${payButtonClass} flex-1`}
                  onClick={handleConfirmAndPay}
                  disabled={loadingPayment}
                  aria-busy={loadingPayment}
                >
                  {loadingPayment ? "Processing..." : "Confirm & Pay via M-Pesa"}
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default CheckoutPage;