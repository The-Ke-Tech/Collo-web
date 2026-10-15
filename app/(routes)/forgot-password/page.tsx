"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
// Same toast library as the login, sign-up and reset-password pages, so the toasts actually appear
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";
import { FaArrowLeft, FaKey, FaCheckCircle } from "react-icons/fa";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

// How long we wait for the server before telling the user it is too slow
const REQUEST_TIMEOUT_MS = 15000;

interface ApiResponse {
  success?: boolean;
  message?: string;
  error?: string;
  errors?: (string | { message?: string; msg?: string })[];
}

// Common email typos we can catch before the server does
const EMAIL_TYPOS: Record<string, string> = {
  "gmial.com": "gmail.com",
  "gmai.com": "gmail.com",
  "gamil.com": "gmail.com",
  "gmail.con": "gmail.com",
  "hotmial.com": "hotmail.com",
  "hotmail.con": "hotmail.com",
  "yaho.com": "yahoo.com",
  "yahoo.con": "yahoo.com",
  "outlok.com": "outlook.com",
};

// Pulls the most useful message out of whatever shape the backend replied with
function extractMessage(result: ApiResponse | null): string | undefined {
  if (!result || typeof result !== "object") return undefined;
  if (typeof result.message === "string" && result.message.trim()) return result.message.trim();
  if (typeof result.error === "string" && result.error.trim()) return result.error.trim();
  if (Array.isArray(result.errors) && result.errors.length > 0) {
    const first = result.errors[0];
    if (typeof first === "string") return first;
    if (first && typeof first.message === "string") return first.message;
    if (first && typeof first.msg === "string") return first.msg;
  }
  return undefined;
}

// Turns "Retry-After" (seconds) into friendly text, e.g. "2 minutes"
function formatWait(seconds: number): string {
  if (!Number.isFinite(seconds) || seconds <= 0) return "a few minutes";
  if (seconds < 60) return `${seconds} second${seconds === 1 ? "" : "s"}`;
  const minutes = Math.ceil(seconds / 60);
  return `${minutes} minute${minutes === 1 ? "" : "s"}`;
}

// Maps an HTTP status to a clear message. The server's own message wins when it sent one.
function messageForStatus(status: number, backendMessage: string | undefined, waitSeconds: number): string {
  if (status === 429) return `Too many requests. Please wait ${formatWait(waitSeconds)} and try again.`;
  if (status >= 500) return "We couldn't send your code right now. Please try again in a moment.";
  switch (status) {
    case 400:
    case 422:
      return backendMessage || "We couldn't use those details. Check your email or phone and try again.";
    case 403:
      return backendMessage || "Password reset isn't available for this account. Please contact support.";
    case 404:
      return backendMessage || "We couldn't find an account with that email or phone number.";
    case 408:
      return "The request timed out. Please try again.";
    default:
      return backendMessage || `Something went wrong (error ${status}). Please try again.`;
  }
}

export default function ForgotPasswordPage() {
  const [identifier, setIdentifier] = useState(""); // email or phone
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  // Message shown under the input (and the input turns red) when the entry needs fixing
  const [fieldError, setFieldError] = useState("");
  // Seconds the user must wait after a "too many requests" reply
  const [retryIn, setRetryIn] = useState(0);

  const router = useRouter();

  useEffect(() => {
    if (retryIn <= 0) return;
    const interval = window.setInterval(() => setRetryIn((s) => s - 1), 1000);
    return () => window.clearInterval(interval);
  }, [retryIn]);

  /** Normalize Kenyan phone numbers to 254 format */
  const normalizePhone = (phone: string) => {
    let p = phone.replace(/\D/g, "");
    if (p.startsWith("07")) p = "254" + p.substring(1);
    if (p.startsWith("7") && p.length === 9) p = "254" + p;
    // Also support 01xx numbers, and "+254 0712..." typed with a stray zero
    if (p.startsWith("01")) p = "254" + p.substring(1);
    if (p.startsWith("1") && p.length === 9) p = "254" + p;
    if (p.startsWith("2540")) p = "254" + p.substring(4);
    return p;
  };

  /** Check if input is a valid email */
  const isValidEmail = (email: string) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  /** Check if input is a valid Kenyan phone */
  const isValidPhone = (phone: string) =>
    /^254[17]\d{8}$/.test(normalizePhone(phone));

  // Shows one validation toast (replacing any earlier one) and marks the input
  const reject = (message: string) => {
    toast.dismiss();
    toast.error(message);
    setFieldError(message);
    document.getElementById("identifier")?.focus();
  };

  const trimmed = identifier.trim();
  // What the user seems to be typing, so we can tell them where the code will go
  const detected: "email" | "phone" | null = trimmed.includes("@")
    ? "email"
    : /^[+\d\s()-]{5,}$/.test(trimmed)
      ? "phone"
      : null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Ignore extra clicks / Enter presses while a request is running or the wait time is active
    if (loading || retryIn > 0) return;

    const value = identifier.trim();
    setFieldError("");

    if (!value) {
      return reject("Email or phone is required");
    }

    let payload: { email?: string; phone?: string } = {};

    if (isValidEmail(value)) {
      const domain = value.split("@")[1]?.toLowerCase() ?? "";
      if (EMAIL_TYPOS[domain]) {
        return reject(`Did you mean ${value.split("@")[0]}@${EMAIL_TYPOS[domain]}? Please check your email address.`);
      }
      payload.email = value;
    } else if (isValidPhone(value)) {
      payload.phone = normalizePhone(value);
    } else if (value.includes("@")) {
      return reject("That email address looks incomplete. Use something like name@example.com.");
    } else if (/^[+\d\s()-]+$/.test(value)) {
      if (value.replace(/\D/g, "").length < 9) {
        return reject("That phone number is too short. Use a format like 0712 345 678.");
      }
      return reject("Enter a valid Kenyan phone number, for example 0712 345 678.");
    } else {
      return reject("Enter a valid email or Kenyan phone number");
    }

    if (!API_URL) {
      console.error("[ForgotPassword] NEXT_PUBLIC_API_URL is not set. Add it to .env.local and restart the dev server.");
      return reject("Password reset is not set up correctly. Please contact support.");
    }

    if (typeof navigator !== "undefined" && !navigator.onLine) {
      return reject("You're offline. Check your internet connection and try again.");
    }

    toast.dismiss();
    setLoading(true);
    const toastId = toast.loading("Sending your code…");

    const fail = (message: string) => {
      toast.update(toastId, {
        render: message,
        type: "error",
        isLoading: false,
        autoClose: 6000,
        closeOnClick: true,
        closeButton: true,
        draggable: true,
      });
      setFieldError(message);
    };

    const controller = new AbortController();
    const timer = window.setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

    try {
      const res = await fetch(`${API_URL}/api/auth/request-reset`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        signal: controller.signal,
        body: JSON.stringify(payload),
      });

      // Read the body safely: the server may reply with HTML or nothing (proxy errors, crashes)
      let data: ApiResponse | null = null;
      const raw = await res.text();
      if (raw) {
        try {
          data = JSON.parse(raw) as ApiResponse;
        } catch {
          data = null;
        }
      }

      if (res.ok && data?.success) {
        setSubmitted(true);
        toast.update(toastId, {
          render: data.message || "OTP sent. Check your email or phone.",
          type: "success",
          isLoading: false,
          autoClose: 4000,
          closeOnClick: true,
        });

        // Go to the reset page. Only the value we actually have is sent, and it is URL-encoded
        // (the old link could contain "undefined" and break on addresses with a + sign).
        const params = new URLSearchParams();
        if (payload.email) params.set("email", payload.email);
        if (payload.phone) params.set("phone", payload.phone);
        router.push(`/reset-password?${params.toString()}`);
      } else if (res.ok) {
        // 200 but the server did not confirm success
        console.error("[ForgotPassword] unexpected response:", data ?? raw.slice(0, 200));
        fail(extractMessage(data) || "Something went wrong");
      } else {
        console.error("[ForgotPassword] request failed:", res.status, data ?? raw.slice(0, 200));
        const headerWait = parseInt(res.headers.get("Retry-After") ?? "", 10);
        const wait = Number.isFinite(headerWait) && headerWait > 0 ? headerWait : 60;
        if (res.status === 429) setRetryIn(wait);
        fail(messageForStatus(res.status, extractMessage(data), wait));
      }
    } catch (err) {
      console.error(err);
      if (err instanceof DOMException && err.name === "AbortError") {
        fail("The server is taking too long to respond. Please try again.");
      } else if (typeof navigator !== "undefined" && !navigator.onLine) {
        fail("You're offline. Check your internet connection and try again.");
      } else {
        fail("Can't reach the server. Check your connection, or try again in a moment.");
      }
    } finally {
      window.clearTimeout(timer);
      setLoading(false);
    }
  };

  return (
    // Dark brand backdrop (same as the login, sign-up and reset-password pages); the card stays light.
    <div className="relative flex min-h-[calc(100dvh-var(--header-h,132px))] items-center justify-center overflow-hidden bg-gradient-to-b from-black via-gray-900 to-gray-800 px-3 py-6 sm:px-4 sm:py-10">
      {/* Ambient glows */}
      <div aria-hidden className="pointer-events-none absolute -top-24 left-[-10%] h-80 w-80 rounded-full bg-[#00C2D1]/15 blur-3xl" />
      <div aria-hidden className="pointer-events-none absolute bottom-0 right-[-10%] h-96 w-96 rounded-full bg-[#7B2CBF]/20 blur-3xl" />

      <div className="relative w-full max-w-md">
        {/* Back to login */}
        <button
          type="button"
          onClick={() => router.push("/login")}
          disabled={loading}
          className="mb-3 inline-flex items-center gap-2 rounded-md px-1 py-1 text-sm font-medium text-gray-300 transition hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00C2D1] disabled:opacity-50"
        >
          <FaArrowLeft aria-hidden className="text-xs" />
          Back to login
        </button>

        <div className="overflow-hidden rounded-2xl bg-white text-center shadow-2xl shadow-black/40">
          {/* Brand accent bar */}
          <div className="h-1.5 bg-gradient-to-r from-[#00C2D1] via-[#7B2CBF] to-[#FF3D9A]" />

          <div className="p-5 sm:p-8">
            {!submitted ? (
              <>
                <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-[#00C2D1] to-[#7B2CBF] text-lg text-white shadow-md">
                  <FaKey aria-hidden />
                </div>
                <h2 className="text-2xl font-bold mb-2 text-[#00C2D1]">
                  Forgot Password
                </h2>
                <p className="text-sm text-gray-500 mb-6">
                  Enter your email or phone, and we will send you a reset OTP.
                </p>
                <form onSubmit={handleSubmit} noValidate className="text-left">
                  <label htmlFor="identifier" className="mb-1 block text-sm font-medium text-gray-700">
                    Email or phone
                  </label>
                  <input
                    id="identifier"
                    name="identifier"
                    type="text"
                    autoFocus
                    autoComplete="username"
                    autoCapitalize="none"
                    autoCorrect="off"
                    spellCheck={false}
                    aria-invalid={!!fieldError}
                    aria-describedby="identifier-help"
                    disabled={loading}
                    className={`w-full border text-gray-800 rounded-lg p-3 focus:outline-none focus:ring-2 disabled:bg-gray-100 ${
                      fieldError
                        ? "border-red-500 bg-red-50/40 focus:ring-red-400"
                        : "border-gray-300 focus:ring-[#00C2D1]"
                    }`}
                    placeholder="Email or phone"
                    value={identifier}
                    onChange={(e) => {
                      setIdentifier(e.target.value);
                      if (fieldError) setFieldError("");
                    }}
                    required
                  />

                  {/* Helper text: tells the user where the code will go, or what is wrong */}
                  <p
                    id="identifier-help"
                    role={fieldError ? "alert" : undefined}
                    aria-live="polite"
                    className={`mt-1.5 mb-4 min-h-[1.25rem] text-xs ${fieldError ? "text-red-600" : "text-gray-500"}`}
                  >
                    {fieldError
                      ? fieldError
                      : detected === "email"
                        ? "We'll email a 6-digit code to this address."
                        : detected === "phone"
                          ? "We'll send a 6-digit code to this phone number."
                          : "Use the email or phone number you signed up with."}
                  </p>

                  <button
                    type="submit"
                    disabled={loading || retryIn > 0}
                    aria-busy={loading}
                    className="w-full bg-[#00C2D1] hover:bg-[#4B3F72] text-white py-3 rounded-lg font-semibold transition cursor-pointer disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {loading ? "Sending..." : retryIn > 0 ? `Try again in ${retryIn}s` : "Send OTP"}
                  </button>
                </form>

                <p className="mt-5 text-sm text-gray-600">
                  Remembered it?{" "}
                  <Link href="/login" className="font-semibold text-[#7B2CBF] hover:underline">
                    Log in
                  </Link>
                </p>
              </>
            ) : (
              <div>
                <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 text-2xl text-emerald-600">
                  <FaCheckCircle aria-hidden />
                </div>
                <h2 className="text-2xl font-bold text-[#00C2D1] mb-4">
                  Check Your Inbox
                </h2>
                <p className="text-gray-600">
                  If an account with <strong>{identifier}</strong> exists, a password reset OTP has been sent. Check your email or phone.
                </p>
                <div className="mt-5 flex flex-col gap-2 sm:flex-row sm:justify-center sm:gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setSubmitted(false);
                      setFieldError("");
                    }}
                    className="rounded-full border border-gray-300 px-5 py-2.5 text-sm font-semibold text-gray-700 transition hover:bg-gray-100"
                  >
                    Use a different email or phone
                  </button>
                  <Link
                    href="/login"
                    className="rounded-full bg-gradient-to-r from-[#00C2D1] to-[#7B2CBF] px-5 py-2.5 text-sm font-semibold text-white shadow-md shadow-[#7B2CBF]/30 transition hover:opacity-90"
                  >
                    Back to login
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}