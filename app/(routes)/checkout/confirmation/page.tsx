"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import displayKESCurrency from "@/helpers/displayCurrency";

interface Product {
  productName: string;
  sellingPrice: number;
}

interface OrderProduct {
  productId: Product;
  quantity: number;
}

interface Order {
  _id: string;
  paymentStatus: "PENDING" | "CONFIRMED" | "FAILED";
  totalAmount: number;
  fullName: string;
  phone: string;
  address: string;
  county: string;
  city: string;
  productDetails: OrderProduct[];
}

export default function ConfirmationPage() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get("orderId");
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const API_URL = process.env.NEXT_PUBLIC_API_URL;

  // Poll for order confirmation
  useEffect(() => {
    if (!orderId) return;

    const interval = setInterval(async () => {
      try {
        const res = await fetch(`${API_URL}/api/orders/${orderId}`);
        const data = await res.json();
        if (res.ok) {
          setOrder(data);
          if (data.paymentStatus === "CONFIRMED" || data.paymentStatus === "FAILED") {
            clearInterval(interval);
          }
        }
      } catch (err) {
        console.error("Error fetching order:", err);
      } finally {
        setLoading(false);
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [orderId, API_URL]);

  // Redirect after 3s if payment confirmed
  useEffect(() => {
    if (order?.paymentStatus === "CONFIRMED") {
      const timeout = setTimeout(() => {
        router.push("/customer-dashboard");
      }, 3000);
      return () => clearTimeout(timeout);
    }
  }, [order?.paymentStatus, router]);

  if (!orderId || loading) {
    return (
      <div className="text-center py-16 text-gray-200">
        Loading order confirmation...
      </div>
    );
  }

  if (!order) {
    return (
      <div className="text-center py-16 text-red-400">
        Order not found.
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto text-center py-16 bg-gradient-to-b from-black via-gray-900 to-gray-800 text-gray-200 rounded-lg shadow-lg mt-10">
      <h2
        className={`text-3xl font-semibold mb-4 ${
          order.paymentStatus === "CONFIRMED"
            ? "text-green-500"
            : "text-red-500"
        }`}
      >
        {order.paymentStatus === "CONFIRMED" ? "Payment Successful!" : "Payment Failed"}
      </h2>

      <p className="text-gray-400 mb-6">
        {order.paymentStatus === "CONFIRMED"
          ? "Your payment has been confirmed. Redirecting to your dashboard..."
          : "Your payment failed. Please try again or contact support."}
      </p>

      <p className="text-sm text-gray-500 mb-6">
        Order ID: <span className="font-mono text-gray-300">{order._id}</span>
      </p>

      {order.paymentStatus === "CONFIRMED" && (
        <div className="text-left bg-white/10 p-4 rounded-lg mb-4">
          <h3 className="font-semibold text-lg mb-2">Purchased Products:</h3>
          <ul className="divide-y divide-white/20 text-sm">
            {order.productDetails.map((item, idx) => (
              <li key={idx} className="py-2 flex justify-between">
                <span>{item.productId.productName} × {item.quantity}</span>
                <span>{displayKESCurrency(item.quantity * item.productId.sellingPrice)}</span>
              </li>
            ))}
          </ul>

          <h3 className="font-semibold text-lg mt-4 mb-2">Shipping Info:</h3>
          <p>{order.fullName}</p>
          <p>{order.phone}</p>
          <p>{order.address}, {order.county}, {order.city}</p>
          <p className="font-bold mt-2">Total: {displayKESCurrency(order.totalAmount)}</p>
        </div>
      )}

      {order.paymentStatus === "CONFIRMED" && (
        <p className="text-green-400 font-medium animate-pulse">
          Redirecting in 3 seconds...
        </p>
      )}
    </div>
  );
}
