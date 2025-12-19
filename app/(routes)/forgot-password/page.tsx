"use client";

import { useState } from "react";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export default function ForgotPasswordPage() {
  const [identifier, setIdentifier] = useState(""); // email or phone
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const router = useRouter();

  /** Normalize Kenyan phone numbers to 254 format */
  const normalizePhone = (phone: string) => {
    let p = phone.replace(/\D/g, "");
    if (p.startsWith("07")) p = "254" + p.substring(1);
    if (p.startsWith("7") && p.length === 9) p = "254" + p;
    return p;
  };

  /** Check if input is a valid email */
  const isValidEmail = (email: string) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  /** Check if input is a valid Kenyan phone */
  const isValidPhone = (phone: string) =>
    /^2547\d{8}$/.test(normalizePhone(phone));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!identifier) {
      return toast.error("Email or phone is required");
    }

    let payload: { email?: string; phone?: string } = {};

    if (isValidEmail(identifier)) {
      payload.email = identifier;
    } else if (isValidPhone(identifier)) {
      payload.phone = normalizePhone(identifier);
    } else {
      return toast.error("Enter a valid email or Kenyan phone number");
    }

    setLoading(true);

    try {
      const res = await fetch(`${API_URL}/api/auth/request-reset`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      setLoading(false);

      if (res.ok && data.success) {
        setSubmitted(true);
        toast.success(data.message || "OTP sent. Check your email or phone.");
        // Optionally redirect to a verify OTP page
        router.push(`/reset-password?email=${payload.email}&phone=${payload.phone}`);
      } else {
        toast.error(data.message || "Something went wrong");
      }
    } catch (err) {
      setLoading(false);
      console.error(err);
      toast.error("Failed to send OTP. Try again later.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-[#00C2D1] via-[#4B3F72] to-[#7B2CBF]">
      <div className="bg-white rounded-2xl p-8 shadow-lg w-full max-w-md text-center">
        {!submitted ? (
          <>
            <h2 className="text-2xl font-bold mb-6 text-[#00C2D1]">
              Forgot Password
            </h2>
            <p className="text-sm text-gray-500 mb-6">
              Enter your email or phone, and we will send you a reset OTP.
            </p>
            <form onSubmit={handleSubmit}>
              <input
                type="text"
                className="w-full border text-gray-800 border-gray-300 rounded-lg p-3 mb-4 focus:outline-none focus:ring-2 focus:ring-[#00C2D1]"
                placeholder="Email or phone"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                required
              />
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#00C2D1] hover:bg-[#4B3F72] text-white py-3 rounded-lg font-semibold transition cursor-pointer"
              >
                {loading ? "Sending..." : "Send OTP"}
              </button>
            </form>
          </>
        ) : (
          <div>
            <h2 className="text-2xl font-bold text-[#00C2D1] mb-4">
              Check Your Inbox
            </h2>
            <p className="text-gray-600">
              If an account with <strong>{identifier}</strong> exists, a password reset OTP has been sent. Check your email or phone.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
