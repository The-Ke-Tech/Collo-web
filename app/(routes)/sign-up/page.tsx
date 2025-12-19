"use client";

import React, { ChangeEvent, JSX, useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "";

interface SignUpData {
  name: string;
  email: string;
  phone: string;
  password: string;
  confirmPassword: string;
}

interface ApiResponse {
  success: boolean;
  message?: string;
}

export default function SignUp(): JSX.Element {
  const [data, setData] = useState<SignUpData>({
    name: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });
  const [loading, setLoading] = useState<boolean>(false);
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState<boolean>(false);

  const router = useRouter();

  const handleOnChange = (e: ChangeEvent<HTMLInputElement>): void => {
    const { name, value } = e.target;
    setData((prev) => ({ ...prev, [name]: value }));
  };

  const isValidEmail = (email: string): boolean => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const normalizePhone = (phone: string): string => {
    let p = phone.replace(/\D/g, "");
    if (p.startsWith("07")) p = "254" + p.substring(1);
    if (p.startsWith("7") && p.length === 9) p = "254" + p;
    return p;
  };

  const handleSubmit = async (): Promise<void> => {
    const { name, email, phone, password, confirmPassword } = data;

    if (!name || !email || !phone || !password || !confirmPassword) {
      toast.error("All fields are required");
      return;
    }

    if (!isValidEmail(email)) {
      toast.error("Invalid email format");
      return;
    }

    if (password.length < 8) {
      toast.error("Password must be at least 8 characters long");
      return;
    }

    if (!/[A-Z]/.test(password)) {
      toast.error("Password must include at least one uppercase letter");
      return;
    }

    if (!/[a-z]/.test(password)) {
      toast.error("Password must include at least one lowercase letter");
      return;
    }

    if (!/[0-9]/.test(password)) {
      toast.error("Password must include at least one number");
      return;
    }

    if (!/[\W_]/.test(password)) {
      toast.error("Password must include at least one special character (e.g. @, #, $, !)");
      return;
    }

    if (password !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch(`${API_URL}/api/auth/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, phone: normalizePhone(phone), password }),
      });

      const resData: ApiResponse = await res.json();
      setLoading(false);

      if (resData.success) {
        // Navigate immediately to verification page
        router.push(`/verify-otp?email=${encodeURIComponent(email)}&phone=${encodeURIComponent(normalizePhone(phone))}`);

        // Optional: show toast after redirect
        toast.success("OTP is being sent. Check your WhatsApp/email.");
      } else {
        toast.error(resData.message || "Signup failed");
      }
    } catch (err: unknown) {
      setLoading(false);
      const errorObj = err as { message?: string };
      toast.error(errorObj.message || "An error occurred");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 text-gray-800">
      <div className="bg-white p-8 rounded-2xl shadow-lg w-full max-w-md text-center">
        <img src={"/logo.png"} alt="Logo" className="w-28 h-28 mx-auto mb-6" />
        <div className="flex flex-col gap-4">
          <input type="text" name="name" placeholder="Name" value={data.name} onChange={handleOnChange} className="w-full p-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#00C2D1]" required />
          <input type="email" name="email" placeholder="Email" value={data.email} onChange={handleOnChange} className="w-full p-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#00C2D1]" required />
          <input type="text" name="phone" placeholder="Phone (Kenya)" value={data.phone} onChange={handleOnChange} className="w-full p-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#00C2D1]" required />

          <div className="relative">
            <input type={showPassword ? "text" : "password"} name="password" placeholder="Password" value={data.password} onChange={handleOnChange} className="w-full p-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#00C2D1]" required />
            <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-600">{showPassword ? "Hide" : "Show"}</button>
          </div>

          <div className="relative">
            <input type={showConfirmPassword ? "text" : "password"} name="confirmPassword" placeholder="Confirm Password" value={data.confirmPassword} onChange={handleOnChange} className="w-full p-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#00C2D1]" required />
            <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-600">{showConfirmPassword ? "Hide" : "Show"}</button>
          </div>

          <button type="button" onClick={handleSubmit} className="bg-[#00C2D1] text-white py-3 rounded-lg font-semibold hover:opacity-90 transition disabled:opacity-50" disabled={loading}>
            {loading ? "Signing up..." : "Sign Up"}
          </button>
        </div>

        <p className="mt-4 text-gray-600">
          Already have an account?{" "}
          <span className="text-[#7B2CBF] cursor-pointer" onClick={() => router.push("/login")}>Login</span>
        </p>
      </div>
    </div>
  );
}
