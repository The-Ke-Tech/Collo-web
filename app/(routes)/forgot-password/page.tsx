"use client";

import { useState } from "react";
import toast from "react-hot-toast";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false); // Track submission state

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const res = await fetch("/api/auth/request-reset", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });

    const data = await res.json();
    setLoading(false);

    if (res.ok) {
      setSubmitted(true); // Switch to dialogue box
      toast.success(data.message || "Check your email account");
    } else {
      toast.error(data.message || "Something went wrong");
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
              Enter your email and we will send you a reset link.
            </p>
            <form onSubmit={handleSubmit}>
              <input
                type="email"
                className="w-full border text-gray-800 border-gray-300 rounded-lg p-3 mb-4 focus:outline-none focus:ring-2 focus:ring-[#00C2D1]"
                placeholder="Your email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#00C2D1] hover:bg-[#4B3F72] text-white py-3 rounded-lg font-semibold transition cursor-pointer"
              >
                {loading ? "Sending..." : "Send Reset Link"}
              </button>
            </form>
          </>
        ) : (
          // Dialogue box replacing form after success
          <div>
            <h2 className="text-2xl font-bold text-[#00C2D1] mb-4">
              Check Your Email
            </h2>
            <p className="text-gray-600">
              If an account with <strong>{email}</strong> exists, a password reset link has been sent. Check your email
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
