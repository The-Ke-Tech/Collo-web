"use client";

import displayKESCurrency from "@/helpers/displayCurrency";
import { useEffect, useState } from "react";
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

const API_URL = process.env.NEXT_PUBLIC_API_URL;

const CheckoutPage = () => {
  const searchParams = useSearchParams();
  const itemsParam = searchParams.get("items");
  const [items, setItems] = useState<CartItem[]>([]);
  const [shippingInfo, setShippingInfo] = useState<ShippingInfo>({
    fullName: "",
    phone: "",
    address: "",
    county: "",
    city: "",
  });
  const [loadingPayment, setLoadingPayment] = useState(false);

  const { user, isLoggedIn } = useAuthStore();
  const router = useRouter();

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
        setItems(parsed);
      } catch (error) {
        console.error("Failed to parse cart items", error);
        toast.error("Failed to load cart items.");
      }
    }
  }, [itemsParam]);

  const totalPrice = items.reduce(
    (sum, curr) => sum + curr.quantity * curr.product.sellingPrice,
    0
  );

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setShippingInfo({
      ...shippingInfo,
      [e.target.name]: e.target.value,
    });
  };

 const handleConfirmAndPay = async () => {
  if (!user) {
    toast.error("User not authenticated. Please login.");
    return;
  }

  if (!shippingInfo.phone || !shippingInfo.address || !shippingInfo.city) {
    toast.error("Please complete shipping information");
    return;
  }

  if (!items.length) {
    toast.error("Cart is empty");
    return;
  }

  const payload: CheckoutPayload = {
    userId: user.id,
    phoneNumber: shippingInfo.phone,
    amount: totalPrice,
    accountReference: `Order-${Date.now()}`,
    description: "Coltech Business Product(s)",
    fullName: shippingInfo.fullName,
    address: shippingInfo.address,
    county: shippingInfo.county,
    city: shippingInfo.city,
    productDetails: items.map((item) => ({
      productId: item.product._id,
      quantity: item.quantity,
    })),
  };

  try {
    setLoadingPayment(true);

    const res = await useAuthStore
      .getState()
      .fetchWithAuth(`${API_URL}/api/checkout`, {
        method: "POST",
        body: JSON.stringify(payload),
      });

    const data = await res.json();

    if (!res.ok || !data?.success) {
      console.error("Checkout failed:", data);
      setLoadingPayment(false);
      return toast.error(data?.error || "Checkout failed. Please try again.");
    }

    toast.info("Waiting for payment confirmation...");

    const checkoutRequestId = data.data.CheckoutRequestID;

    // Timeout after 2 minutes
    const timeout = setTimeout(() => {
      setLoadingPayment(false);
      toast.error("Payment failed (timeout). Please try again.");
    }, 2 * 60 * 1000);

    const interval = setInterval(async () => {
      try {
        const statusRes = await useAuthStore
          .getState()
          .fetchWithAuth(`${API_URL}/api/orders/status?checkoutRequestId=${checkoutRequestId}`);

        const statusData = await statusRes.json();

        if (statusData?.paymentStatus === "CONFIRMED") {
          clearInterval(interval);
          clearTimeout(timeout);
          setLoadingPayment(false);
          toast.success("Payment confirmed! Redirecting...");
          router.push("/customer-dashboard");
        } else if (statusData?.paymentStatus === "FAILED") {
          clearInterval(interval);
          clearTimeout(timeout);
          setLoadingPayment(false);
          toast.error("Payment failed. Please try again.");
        }
      } catch (err) {
        console.error("Error checking payment status:", err);
      }
    }, 3000);
  } catch (error) {
    console.error("Error placing order:", error);
    setLoadingPayment(false);
    toast.error("Something went wrong. Please retry.");
  }
};


  return (
    <div className="relative max-w-6xl mx-auto px-4 sm:px-6 py-8 bg-gradient-to-b from-[#00C2D1] via-[#4B3F72] to-[#7B2CBF] text-white min-h-screen rounded-lg shadow-lg">
      {loadingPayment && (
        <div className="absolute inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="text-white text-lg font-semibold animate-pulse">
            Processing payment, please wait...
          </div>
        </div>
      )}

      <h2 className="text-3xl font-bold mb-6 text-center">Checkout</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Shipping Form */}
        <div className="bg-white/10 backdrop-blur-md p-6 shadow rounded-xl border border-white/20 space-y-4">
          <h3 className="text-lg font-semibold mb-2">Shipping Information</h3>
          <div className="grid grid-cols-1 gap-4">
            {["fullName", "phone", "address", "county", "city"].map((field) => (
              <input
                key={field}
                type={field === "phone" ? "tel" : "text"}
                name={field}
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
                className="bg-white/5 border border-white/20 rounded px-3 py-2 text-white placeholder-white/60 focus:outline-none focus:border-[#00C2D1] focus:ring focus:ring-[#00C2D1]/50"
                required
              />
            ))}
          </div>
        </div>

        {/* Order Summary */}
        <div className="bg-white/10 backdrop-blur-md p-6 shadow rounded-xl border border-white/20 flex flex-col justify-between">
          <div>
            <h3 className="text-lg font-semibold mb-3">Order Summary</h3>
            <ul className="divide-y divide-white/20 text-sm">
              {items.map((item, idx) => (
                <li key={idx} className="py-2 flex justify-between text-white/90">
                  <span>
                    {item.product?.productName} × {item.quantity}
                  </span>
                  <span>
                    {displayKESCurrency(
                      item.quantity * (item.product?.sellingPrice ?? 0)
                    )}
                  </span>
                </li>
              ))}
            </ul>

            <div className="flex justify-between mt-4 font-bold text-base">
              <span>Total</span>
              <span>{displayKESCurrency(totalPrice)}</span>
            </div>
          </div>

          <button
            className="mt-6 bg-gradient-to-r from-[#00C2D1] to-[#7B2CBF] hover:opacity-90 text-white w-full py-3 rounded-lg text-lg shadow-lg transition cursor-pointer"
            onClick={handleConfirmAndPay}
            disabled={loadingPayment}
          >
            Confirm & Pay via M-Pesa
          </button>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;
