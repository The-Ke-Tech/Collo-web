"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "react-toastify";
import clsx from "clsx"; // optional, for conditional classNames

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export default function VerifyOtpPage() {
  const router = useRouter();
  const params = useSearchParams();

  const email = params.get("email") || "";
  const phone = params.get("phone") || "";

  const [otp, setOtp] = useState<string[]>(["", "", "", "", "", ""]);
  const inputRefs = useRef<Array<HTMLInputElement | null>>([]);
  const [resendTimer, setResendTimer] = useState(60);
  const [canResend, setCanResend] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false); // track invalid OTP for red border & shake
  const [shake, setShake] = useState(false); // trigger shake animation

  /* ================= OTP HANDLERS ================= */
  const handleChange = (value: string, index: number) => {
    if (!/^[0-9]?$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    setError(false); // clear error while typing

    if (value && index < 5) inputRefs.current[index + 1]?.focus();

    if (newOtp.every((d) => d !== "")) verifyOtp(newOtp.join(""));
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
    if (e.key === "Backspace" && otp[index] === "" && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  /* ================= VERIFY OTP ================= */
  const verifyOtp = async (finalOtp: string) => {
    if (finalOtp.length !== 6) {
      toast.error("Please enter the 6-digit OTP");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch(`${API_URL}/api/auth/verify-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, phone, otp: finalOtp }),
      });

      const data = await res.json();
      setLoading(false);

      if (data.success) {
        toast.success("Account verified successfully!");
        router.push("/login");
      } else {
        toast.error(data.message || "Invalid OTP");
        triggerErrorFeedback();
      }
    } catch {
      setLoading(false);
      toast.error("Verification failed. Try again.");
      triggerErrorFeedback();
    }
  };

  /* ================= ERROR FEEDBACK ================= */
  const triggerErrorFeedback = () => {
    setError(true);
    setOtp(["", "", "", "", "", ""]); // clear OTP
    inputRefs.current[0]?.focus(); // refocus first box
    setShake(true);

    setTimeout(() => {
      setShake(false);
    }, 500); // duration of shake
  };

  /* ================= RESEND OTP ================= */
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (resendTimer > 0) {
      setCanResend(false);
      timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000);
    } else {
      setCanResend(true);
    }
    return () => clearTimeout(timer);
  }, [resendTimer]);

  const resendOtp = async () => {
    if (!canResend) return;

    try {
      const res = await fetch(`${API_URL}/api/auth/resend-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, phone }),
      });

      const data = await res.json();

      if (data.success) {
        toast.success("OTP resent! Check your email or WhatsApp.");
        setOtp(["", "", "", "", "", ""]);
        inputRefs.current[0]?.focus();
        setResendTimer(60);
        setError(false);
      } else {
        toast.error(data.message || "Could not resend OTP");
      }
    } catch {
      toast.error("Failed to resend OTP");
    }
  };

  /* ================= UI ================= */
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 px-4">
      <div className="bg-white p-6 rounded-xl shadow-lg w-full max-w-md text-center">
        <h2 className="text-2xl font-bold text-gray-800 mb-3">Verify OTP</h2>
        <p className="text-gray-600 mb-5">
          Enter the 6-digit code sent to:
          <br />
          <strong>{email}</strong>
          <br />
          <strong>{phone}</strong>
        </p>

        {/* OTP INPUTS */}
        <div
          className={clsx(
            "flex justify-center gap-3 mb-6",
            shake ? "animate-shake" : ""
          )}
        >
          {otp.map((digit, i) => (
            <input
              key={i}
              ref={(el) => {
                inputRefs.current[i] = el!;
              }}
              maxLength={1}
              value={digit}
              onChange={(e) => handleChange(e.target.value, i)}
              onKeyDown={(e) => handleKeyDown(e, i)}
              className={clsx(
                "w-12 h-12 text-center text-2xl border rounded-lg shadow-sm outline-none",
                error ? "border-red-500 text-red-500" : "border-blue-500 text-blue-500",
                "focus:border-purple-500"
              )}
            />
          ))}
        </div>

        <button
          onClick={() => verifyOtp(otp.join(""))}
          disabled={loading}
          className="w-full bg-purple-600 hover:bg-purple-700 text-white py-2 rounded-lg transition mb-3 flex justify-center items-center gap-2"
        >
          {loading ? (
            <svg
              className="animate-spin h-5 w-5 text-white"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              ></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8v8H4z"
              ></path>
            </svg>
          ) : (
            "Verify"
          )}
        </button>

        <button
          onClick={resendOtp}
          disabled={!canResend}
          className={`w-full text-purple-700 font-bold py-2 rounded-lg ${
            !canResend ? "opacity-50 cursor-not-allowed" : "hover:bg-purple-100"
          }`}
        >
          {canResend ? "Resend OTP" : `Resend in ${resendTimer}s`}
        </button>
      </div>

      {/* SHAKE ANIMATION */}
      <style jsx>{`
        @keyframes shake {
          0% { transform: translateX(0); }
          20% { transform: translateX(-8px); }
          40% { transform: translateX(8px); }
          60% { transform: translateX(-8px); }
          80% { transform: translateX(8px); }
          100% { transform: translateX(0); }
        }
        .animate-shake {
          animation: shake 0.5s;
        }
      `}</style>
    </div>
  );
}
