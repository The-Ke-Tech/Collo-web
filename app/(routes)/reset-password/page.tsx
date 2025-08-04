"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import toast from "react-hot-toast";

export default function ResetPasswordPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password.length < 8)
      return toast.error("Password must be at least 8 characters long");
    if (!/[A-Z]/.test(password))
      return toast.error("Must include at least one uppercase letter");
    if (!/[a-z]/.test(password))
      return toast.error("Must include at least one lowercase letter");
    if (!/[0-9]/.test(password))
      return toast.error("Must include at least one number");
    if (!/[\W_]/.test(password))
      return toast.error("Must include at least one special character");
    if (password !== confirmPassword)
      return toast.error("Passwords do not match");

    setLoading(true);
    const res = await fetch("/api/auth/reset-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, password }),
    });

    const data = await res.json();
    setLoading(false);

    if (res.ok) {
      toast.success("Password reset successfully. Redirecting...");
      router.push("/login");
    } else {
      toast.error(data.message || "Something went wrong");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-[#00C2D1] via-[#4B3F72] to-[#7B2CBF]">
      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-2xl p-8 shadow-lg w-full max-w-md"
      >
        <h2 className="text-2xl font-bold mb-6 text-center text-[#00C2D1]">
          Reset Password
        </h2>
        <input
          type="password"
          className="w-full border border-gray-300 rounded-lg p-3 mb-4 focus:outline-none focus:ring-2 focus:ring-[#00C2D1]"
          placeholder="New password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <input
          type="password"
          className="w-full border border-gray-300 rounded-lg p-3 mb-6 focus:outline-none focus:ring-2 focus:ring-[#00C2D1]"
          placeholder="Confirm new password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
        />
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-[#00C2D1] hover:bg-[#4B3F72] text-white py-3 rounded-lg font-semibold transition cursor-pointer"
        >
          {loading ? "Resetting..." : "Reset Password"}
        </button>
      </form>
    </div>
  );
}
