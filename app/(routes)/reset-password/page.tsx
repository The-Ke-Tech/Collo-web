'use client';

import { useState, useRef, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import toast from "react-hot-toast";
import { FaEye, FaEyeSlash } from "react-icons/fa"; 

const RESEND_THROTTLE_SECONDS = 60;
const API_URL = process.env.NEXT_PUBLIC_API_URL;

export default function ResetPasswordPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const rawEmail = searchParams.get("email");
  const rawPhone = searchParams.get("phone");

  const email = rawEmail && rawEmail !== "undefined" ? rawEmail : "";
  const phone = rawPhone && rawPhone !== "undefined" ? rawPhone : "";

  const identifier = email || phone || "your account";

  const [otp, setOtp] = useState<string[]>(Array(6).fill(""));
  const [otpVerified, setOtpVerified] = useState(false);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false); // Toggle for password
  const [showConfirmPassword, setShowConfirmPassword] = useState(false); // Toggle for confirm
  const [loading, setLoading] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);
  const [otpError, setOtpError] = useState(false);

  const otpRefs = useRef<Array<HTMLInputElement | null>>([]);

  useEffect(() => {
    if (otp.every(d => d !== "")) handleOtpSubmit();
  }, [otp]);

  useEffect(() => {
    let interval: number;
    if (resendTimer > 0) {
      interval = window.setInterval(() => setResendTimer(prev => prev - 1), 1000);
    }
    return () => window.clearInterval(interval);
  }, [resendTimer]);

  const handleOtpChange = (idx: number, value: string) => {
    if (!/^\d?$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[idx] = value;
    setOtp(newOtp);
    if (value && idx < 5) otpRefs.current[idx + 1]?.focus();
  };

  const handleOtpKeyDown = (idx: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !otp[idx] && idx > 0) {
      otpRefs.current[idx - 1]?.focus();
    }
  };

  const handleOtpSubmit = async () => {
    if (!email && !phone) return toast.error("Missing email or phone");

    const otpCode = otp.join("");
    setLoading(true);

    try {
      const res = await fetch(`${API_URL}/api/auth/verify-reset-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email || undefined,
          phone: phone || undefined,
          otp: otpCode,
        }),
      });
      const data = await res.json();
      setLoading(false);

      if (res.ok && data.success) {
        setOtpVerified(true);
        toast.success("OTP verified! Enter your new password.");
      } else {
        setOtpError(true);
        setTimeout(() => setOtpError(false), 600);
        setOtp(Array(6).fill(""));
        otpRefs.current[0]?.focus();
        toast.error(data.message || "Invalid OTP");
      }
    } catch (err) {
      setLoading(false);
      console.error(err);
      toast.error("Server error. Try again later.");
    }
  };

  const handleResendOtp = async () => {
    if (resendTimer > 0) return;

    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/auth/request-reset`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email || undefined,
          phone: phone || undefined,
        }),
      });
      const data = await res.json();
      setLoading(false);

      if (res.ok && data.success) {
        toast.success("OTP resent successfully");
        setResendTimer(RESEND_THROTTLE_SECONDS);
        setOtp(Array(6).fill(""));
        otpRefs.current[0]?.focus();
      } else {
        toast.error(data.message || "Failed to resend OTP");
      }
    } catch (err) {
      setLoading(false);
      console.error(err);
      toast.error("Server error. Try again later.");
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otpVerified) return;

    if (password.length < 8) return toast.error("Password must be at least 8 characters");
    if (!/[A-Z]/.test(password)) return toast.error("Must include an uppercase letter");
    if (!/[a-z]/.test(password)) return toast.error("Must include a lowercase letter");
    if (!/[0-9]/.test(password)) return toast.error("Must include a number");
    if (!/[\W_]/.test(password)) return toast.error("Must include a special character");
    if (password !== confirmPassword) return toast.error("Passwords do not match");

    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/auth/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email || undefined,
          phone: phone || undefined,
          newPassword: password,
        }),
      });
      const data = await res.json();
      setLoading(false);

      if (res.ok && data.success) {
        toast.success("Password reset successfully. Redirecting to login...");
        router.push("/login");
      } else {
        toast.error(data.message || "Failed to reset password");
      }
    } catch (err) {
      setLoading(false);
      console.error(err);
      toast.error("Server error. Try again later.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-[#00C2D1] via-[#4B3F72] to-[#7B2CBF]">
      <form
        onSubmit={otpVerified ? handlePasswordSubmit : e => e.preventDefault()}
        className="bg-white rounded-2xl p-8 shadow-lg w-full max-w-md text-center"
      >
        <h2 className="text-2xl font-bold mb-6 text-[#00C2D1]">Reset Password</h2>

        {!otpVerified ? (
          <>
            <p className="mb-4 text-gray-600">
              Enter the 6-digit OTP sent to <strong>{identifier}</strong>
            </p>
            <div className="flex justify-between mb-4">
              {otp.map((digit, idx) => (
                <input
                  key={idx}
                  type="text"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleOtpChange(idx, e.target.value)}
                  onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                  ref={(el) => { otpRefs.current[idx] = el; }}
                  className={`w-12 h-12 border text-center text-lg text-black rounded focus:outline-none focus:ring-2 ${otpError ? "border-red-500 ring-red-400" : "border-gray-300 focus:ring-[#00C2D1]"}`}
                />
              ))}
            </div>

            <button
              type="button"
              disabled={resendTimer > 0 || loading}
              onClick={handleResendOtp}
              className={`text-sm mb-4 ${resendTimer > 0 ? "text-gray-400" : "text-[#7B2CBF] underline"}`}
            >
              {resendTimer > 0 ? `Resend OTP in ${resendTimer}s` : "Resend OTP"}
            </button>
            <p className="text-sm text-gray-500">OTP will auto-submit once all digits are entered.</p>
          </>
        ) : (
          <>
            {/* Password field with toggle */}
            <div className="relative mb-4">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="New Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full border border-gray-300 rounded-lg p-3 text-black focus:outline-none focus:ring-2 focus:ring-[#00C2D1]"
                required
              />
              <span
                className="absolute right-3 top-3 cursor-pointer text-gray-600"
                onClick={() => setShowPassword(prev => !prev)}
              >
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </span>
            </div>

            <div className="relative mb-6">
              <input
                type={showConfirmPassword ? "text" : "password"}
                placeholder="Confirm New Password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full border border-gray-300 rounded-lg p-3 text-black focus:outline-none focus:ring-2 focus:ring-[#00C2D1]"
                required
              />
              <span
                className="absolute right-3 top-3 cursor-pointer text-gray-600"
                onClick={() => setShowConfirmPassword(prev => !prev)}
              >
                {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
              </span>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#00C2D1] hover:bg-[#4B3F72] text-white py-3 rounded-lg font-semibold transition cursor-pointer"
            >
              {loading ? "Resetting..." : "Reset Password"}
            </button>
          </>
        )}
      </form>
    </div>
  );
}
