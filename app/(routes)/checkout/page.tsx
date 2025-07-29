"use client";

import displayKESCurrency from "@/helpers/displayCurrency";
import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { toast } from "react-toastify";

// Product type
interface Product {
  id: string;
  productName: string;
  sellingPrice: number;
}

// Cart item type
interface CartItem {
  productId: Product;
  quantity: number;
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

const CheckoutPage = () => {
  const searchParams = useSearchParams();
  const itemsParam = searchParams.get("items");
  const [items, setItems] = useState<CartItem[]>([]);
  const [userId, setUserId] = useState<string | null>(null);

  const [shippingInfo, setShippingInfo] = useState<ShippingInfo>({
    fullName: "",
    phone: "",
    address: "",
    county: "",
    city: "",
  });

  useEffect(() => {
    const getUserId = async () => {
      try {
        const res = await fetch("/api/users/me");
        const data = await res.json();
        setUserId(data?.id || null);
      } catch (err) {
        console.error("Failed to get user ID", err);
        toast.error("Failed to get user info");
      }
    };
    getUserId();
  }, []);

  useEffect(() => {
    if (itemsParam) {
      try {
        const parsed: CartItem[] = JSON.parse(decodeURIComponent(itemsParam));
        setItems(parsed);
      } catch (error) {
        console.error("Failed to parse cart items", error);
      }
    }
  }, [itemsParam]);

  const totalPrice = items.reduce(
    (sum, curr) => sum + curr.quantity * curr.productId.sellingPrice,
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

  const router = useRouter();
  const handleConfirmAndPay = async () => {
    if (!userId) {
      toast.error("User not authenticated. Please login.");
      return;
    }

    const payload: CheckoutPayload = {
      userId,
      phoneNumber: shippingInfo.phone,
      amount: totalPrice,
      accountReference: `Order-${Date.now()}`,
      description: "Coltech Business Product(s)",
      fullName: shippingInfo.fullName,
      address: shippingInfo.address,
      county: shippingInfo.county,
      city: shippingInfo.city,
      productDetails: items.map((item) => ({
        productId: item.productId.id,
        quantity: item.quantity,
      })),
    };

    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      console.log("Checkout response:", data);
      if (!res.ok) {
        toast.error(data?.error || "Failed to place order.");
        return;
      }

      toast.success("Order placed. Check your phone for M-Pesa STK push.");
      if (data?.orderId) {
        router.push(`/checkout/confirmation?orderId=${data.orderId}`);
      } else {
        toast.error("No order ID returned. Please try again.");
      }
    } catch (error) {
      console.error("Error placing order", error);
      toast.error("Something went wrong. Please try again.");
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
      <h2 className="text-2xl sm:text-3xl font-semibold mb-6 text-center">
        Checkout
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Shipping Form */}
        <div className="bg-white p-4 sm:p-6 shadow rounded space-y-4">
          <h3 className="text-lg font-medium mb-2">Shipping Information</h3>
          <div className="grid grid-cols-1 gap-4">
            <input
              type="text"
              name="fullName"
              placeholder="Full Name"
              value={shippingInfo.fullName}
              onChange={handleInputChange}
              className="border border-gray-300 rounded px-3 py-2"
              required
            />
            <input
              type="tel"
              name="phone"
              placeholder="Phone Number"
              value={shippingInfo.phone}
              onChange={handleInputChange}
              className="border border-gray-300 rounded px-3 py-2"
              required
            />
            <input
              type="text"
              name="address"
              placeholder="Address (Street, Building)"
              value={shippingInfo.address}
              onChange={handleInputChange}
              className="border border-gray-300 rounded px-3 py-2"
              required
            />
            <input
              type="text"
              name="county"
              placeholder="County"
              value={shippingInfo.county}
              onChange={handleInputChange}
              className="border border-gray-300 rounded px-3 py-2"
              required
            />
            <input
              type="text"
              name="city"
              placeholder="Town/City"
              value={shippingInfo.city}
              onChange={handleInputChange}
              className="border border-gray-300 rounded px-3 py-2"
              required
            />
          </div>
        </div>

        {/* Order Summary */}
        <div className="bg-white p-4 sm:p-6 shadow rounded flex flex-col justify-between">
          <div>
            <h3 className="text-lg font-medium mb-3">Order Summary</h3>
            <ul className="divide-y divide-slate-200 text-sm">
              {items.map((item, idx) => (
                <li key={idx} className="py-2 flex justify-between">
                  <span>
                    {item.productId.productName} × {item.quantity}
                  </span>
                  <span>
                    {displayKESCurrency(
                      item.quantity * item.productId.sellingPrice
                    )}
                  </span>
                </li>
              ))}
            </ul>

            <div className="flex justify-between mt-4 font-semibold text-base">
              <span>Total</span>
              <span>{displayKESCurrency(totalPrice)}</span>
            </div>
          </div>

          <button
            className="mt-6 bg-green-600 hover:bg-green-700 text-white w-full py-3 rounded text-lg"
            onClick={handleConfirmAndPay}
          >
            Confirm & Pay via M-Pesa
          </button>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;
