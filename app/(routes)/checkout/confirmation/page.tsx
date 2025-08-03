"use client";

import { useEffect, useState, useContext } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import Context from "@/context";

type OrderStatus = "PENDING" | "CONFIRMED" | "FAILED";

export default function ConfirmationPage() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get("orderId");
  const [status, setStatus] = useState<OrderStatus>("PENDING");
  const [loading, setLoading] = useState(true);
  const { fetchUserAddToCart } = useContext(Context);
  const router = useRouter();

  useEffect(() => {
    if (!orderId) return;

    const interval = setInterval(async () => {
      try {
        const res = await fetch(`/api/orders/${orderId}/status`);
        const data = await res.json();
        if (res.ok) {
          setStatus(data.paymentStatus);
          if (data.paymentStatus !== "PENDING") {
            clearInterval(interval);
          }
        }
      } catch (err) {
        console.error("Error checking order status", err);
      } finally {
        setLoading(false);
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [orderId]);

  // Refresh cart after successful payment
  useEffect(() => {
    const interval = setInterval(async () => {
      const res = await fetch("/api/cart/count", { credentials: "include" });
      const data = await res.json();
      if (data?.data?.count === 0) {
        fetchUserAddToCart();
        clearInterval(interval);
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [fetchUserAddToCart]);

  // Redirect to dashboard 3s after confirmation
  useEffect(() => {
    if (status === "CONFIRMED") {
      const timeout = setTimeout(() => {
        router.push("/customer-dashboard");
      }, 3000);
      return () => clearTimeout(timeout);
    }
  }, [status, router]);

  return (
    <div className="max-w-lg mx-auto text-center py-16 bg-gradient-to-b from-black via-gray-900 to-gray-800 text-gray-200 rounded-lg shadow-lg mt-10">
      <h2
        className={`text-3xl font-semibold mb-4 ${
          status === "CONFIRMED"
            ? "text-green-500"
            : status === "FAILED"
            ? "text-red-500"
            : "text-yellow-400"
        }`}
      >
        {status === "PENDING" && "Awaiting Payment Confirmation"}
        {status === "CONFIRMED" && "Payment Successful!"}
        {status === "FAILED" && "Payment Failed"}
      </h2>

      <p className="text-gray-400 mb-6">
        {status === "PENDING" &&
          "We’ve sent an M-Pesa payment request to your phone. Please approve it to complete your purchase."}
        {status === "CONFIRMED" &&
          "Your payment has been confirmed. Redirecting to your dashboard..."}
        {status === "FAILED" &&
          "Your payment failed. Please try again or contact support."}
      </p>

      {orderId && (
        <p className="text-sm text-gray-500 mb-6">
          Order ID: <span className="font-mono text-gray-300">{orderId}</span>
        </p>
      )}

      {status === "FAILED" && (
        <Link
          href="/cart"
          className="inline-block bg-red-600 text-white px-6 py-3 rounded hover:bg-red-700 transition"
        >
          Try Again
        </Link>
      )}

      {status === "CONFIRMED" && (
        <p className="text-green-400 font-medium animate-pulse">
          Redirecting in 3 seconds...
        </p>
      )}
    </div>
  );
}
