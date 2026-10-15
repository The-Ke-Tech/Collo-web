'use client';

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
// Same toast library as the login and sign-up pages, so the toasts actually appear
import { toast } from "react-toastify";
import { FaEye, FaEyeSlash, FaArrowLeft, FaCheckCircle, FaRegCircle, FaLock } from "react-icons/fa";

const RESEND_THROTTLE_SECONDS = 60;
const API_URL = process.env.NEXT_PUBLIC_API_URL;

// How long we wait for the server before telling the user it is too slow
const REQUEST_TIMEOUT_MS = 15000;
// After this many wrong codes the user must request a fresh one
const MAX_OTP_ATTEMPTS = 5;

interface ApiResponse {
  success?: boolean;
  message?: string;
  error?: string;
  errors?: (string | { message?: string; msg?: string })[];
}

type ApiContext = "verify" | "resend" | "reset";

// Live checklist shown while the user types a new password
const PASSWORD_RULES: { id: string; label: string; test: (p: string) => boolean }[] = [
  { id: "len", label: "At least 8 characters", test: (p) => p.length >= 8 },
  { id: "upper", label: "An uppercase letter", test: (p) => /[A-Z]/.test(p) },
  { id: "lower", label: "A lowercase letter", test: (p) => /[a-z]/.test(p) },
  { id: "num", label: "A number", test: (p) => /[0-9]/.test(p) },
  { id: "special", label: "A special character (e.g. @, #, $, !)", test: (p) => /[\W_]/.test(p) },
];

const STRENGTH_LEVELS = [
  { label: "Too weak", bar: "bg-red-500", text: "text-red-600" },
  { label: "Weak", bar: "bg-red-500", text: "text-red-600" },
  { label: "Fair", bar: "bg-amber-500", text: "text-amber-600" },
  { label: "Good", bar: "bg-lime-500", text: "text-lime-600" },
  { label: "Good", bar: "bg-lime-500", text: "text-lime-600" },
  { label: "Strong", bar: "bg-emerald-500", text: "text-emerald-600" },
];

// Shows "a***@gmail.com" or "2547*****78" so the page doesn't expose the full address to over-the-shoulder viewers
function maskIdentifier(value: string): string {
  if (!value || value === "your account") return value;
  if (value.includes("@")) {
    const [local, domain] = value.split("@");
    return `${local.slice(0, 1)}***@${domain}`;
  }
  if (value.length > 6) return `${value.slice(0, 4)}${"*".repeat(value.length - 6)}${value.slice(-2)}`;
  return value;
}

// Pulls the most useful message out of whatever shape the backend replied with
function extractMessage(result: ApiResponse | null): string | undefined {
  if (!result || typeof result !== "object") return undefined;
  if (typeof result.message === "string" && result.message.trim()) return result.message.trim();
  if (typeof result.error === "string" && result.error.trim()) return result.error.trim();
  if (Array.isArray(result.errors) && result.errors.length > 0) {
    const first = result.errors[0];
    if (typeof first === "string") return first;
    if (first && typeof first.message === "string") return first.message;
    if (first && typeof first.msg === "string") return first.msg;
  }
  return undefined;
}

// Turns "Retry-After" (seconds) into friendly text, e.g. "2 minutes"
function formatWait(retryAfter: string | null): string {
  const seconds = retryAfter ? parseInt(retryAfter, 10) : NaN;
  if (!Number.isFinite(seconds) || seconds <= 0) return "a few minutes";
  if (seconds < 60) return `${seconds} second${seconds === 1 ? "" : "s"}`;
  const minutes = Math.ceil(seconds / 60);
  return `${minutes} minute${minutes === 1 ? "" : "s"}`;
}

// Maps an HTTP status to a clear message for each step. The server's own message wins when it sent one.
function messageForStatus(
  status: number,
  backendMessage: string | undefined,
  retryAfter: string | null,
  context: ApiContext
): string {
  if (status === 429) return `Too many attempts. Please wait ${formatWait(retryAfter)} and try again.`;
  if (status >= 500) return "Our server ran into a problem. Please try again in a moment.";

  if (context === "verify") {
    switch (status) {
      case 400:
      case 401:
      case 422:
        return backendMessage || "That code is incorrect or has expired. Check it and try again.";
      case 404:
        return backendMessage || "We couldn't find a reset request for this account. Please start again.";
      case 410:
        return backendMessage || "That code has expired. Request a new one.";
    }
  }

  if (context === "resend") {
    switch (status) {
      case 400:
      case 422:
        return backendMessage || "We couldn't send a new code. Please check your details and try again.";
      case 404:
        return backendMessage || "We couldn't find an account with those details.";
    }
  }

  if (context === "reset") {
    switch (status) {
      case 400:
      case 422:
        return backendMessage || "That password wasn't accepted. Try a different one.";
      case 401:
      case 403:
      case 410:
        return backendMessage || "Your verification has expired. Please verify a new code to continue.";
      case 404:
        return backendMessage || "We couldn't find a reset request for this account. Please start again.";
    }
  }

  if (status === 408) return "The request timed out. Please try again.";
  return backendMessage || `Something went wrong (error ${status}). Please try again.`;
}

// Calls the API with a timeout and reads the reply safely (the server may send HTML or nothing)
async function callApi(
  path: string,
  body: Record<string, unknown>
): Promise<{ res: Response; data: ApiResponse | null; raw: string }> {
  const controller = new AbortController();
  const timer = window.setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  try {
    const res = await fetch(`${API_URL}${path}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      signal: controller.signal,
      body: JSON.stringify(body),
    });
    const raw = await res.text();
    let data: ApiResponse | null = null;
    if (raw) {
      try {
        data = JSON.parse(raw) as ApiResponse;
      } catch {
        data = null;
      }
    }
    return { res, data, raw };
  } finally {
    window.clearTimeout(timer);
  }
}

// Friendly text for a failed fetch (offline, timeout, server down)
function describeNetworkError(err: unknown): string {
  if (err instanceof DOMException && err.name === "AbortError") {
    return "The server is taking too long to respond. Please try again.";
  }
  if (typeof navigator !== "undefined" && !navigator.onLine) {
    return "You're offline. Check your internet connection and try again.";
  }
  return "Can't reach the server. Check your connection, or try again in a moment.";
}

export default function ResetPasswordPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const rawEmail = searchParams.get("email");
  const rawPhone = searchParams.get("phone");

  const email = rawEmail && rawEmail !== "undefined" ? rawEmail : "";
  const phone = rawPhone && rawPhone !== "undefined" ? rawPhone : "";

  const identifier = email || phone || "your account";
  const maskedIdentifier = maskIdentifier(identifier);

  const [otp, setOtp] = useState<string[]>(Array(6).fill(""));
  const [otpVerified, setOtpVerified] = useState(false);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false); // Toggle for password
  const [showConfirmPassword, setShowConfirmPassword] = useState(false); // Toggle for confirm
  const [loading, setLoading] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);
  const [otpError, setOtpError] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false); // confirmation dialog before sending the new password
  const [failedAttempts, setFailedAttempts] = useState(0);
  const [capsLock, setCapsLock] = useState(false);

  const otpRefs = useRef<Array<HTMLInputElement | null>>([]);
  const confirmButtonRef = useRef<HTMLButtonElement | null>(null);

  const locked = failedAttempts >= MAX_OTP_ATTEMPTS;
  const passedRules = PASSWORD_RULES.filter((r) => r.test(password)).length;
  const strength = STRENGTH_LEVELS[password ? passedRules : 0];
  const passwordsMatch = confirmPassword.length > 0 && password === confirmPassword;
  const passwordsMismatch = confirmPassword.length > 0 && password !== confirmPassword;

  useEffect(() => {
    // Auto-submit once all 6 digits are in (skipped while a request is running or the user is locked out)
    if (otp.every(d => d !== "") && !loading && !otpVerified && !locked) handleOtpSubmit();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [otp]);

  useEffect(() => {
    let interval: number;
    if (resendTimer > 0) {
      interval = window.setInterval(() => setResendTimer(prev => prev - 1), 1000);
    }
    return () => window.clearInterval(interval);
  }, [resendTimer]);

  // Confirmation dialog: Escape closes it, and the confirm button gets focus
  useEffect(() => {
    if (!showConfirm) return;
    confirmButtonRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !loading) setShowConfirm(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [showConfirm, loading]);

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
    if (e.key === "ArrowLeft" && idx > 0) otpRefs.current[idx - 1]?.focus();
    if (e.key === "ArrowRight" && idx < 5) otpRefs.current[idx + 1]?.focus();
  };

  // Paste a whole code (e.g. copied from WhatsApp or email) into the boxes
  const handleOtpPaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    const digits = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (!digits) return;
    e.preventDefault();
    const newOtp = Array(6).fill("");
    digits.split("").forEach((d, i) => {
      newOtp[i] = d;
    });
    setOtp(newOtp);
    otpRefs.current[Math.min(digits.length, 5)]?.focus();
  };

  // Shared check before any request: setup + connection problems
  const preflight = (): boolean => {
    if (!API_URL) {
      console.error("[ResetPassword] NEXT_PUBLIC_API_URL is not set. Add it to .env.local and restart the dev server.");
      toast.error("Password reset is not set up correctly. Please contact support.");
      return false;
    }
    if (typeof navigator !== "undefined" && !navigator.onLine) {
      toast.error("You're offline. Check your internet connection and try again.");
      return false;
    }
    return true;
  };

  const settle = (toastId: ReturnType<typeof toast.loading>, type: "success" | "error", message: string) => {
    toast.update(toastId, {
      render: message,
      type,
      isLoading: false,
      autoClose: type === "success" ? 4000 : 6000,
      closeOnClick: true,
      closeButton: true,
      draggable: true,
    });
  };

  const handleOtpSubmit = async () => {
    if (!email && !phone) return toast.error("Missing email or phone");
    if (loading) return;
    if (!preflight()) {
      setOtp(Array(6).fill(""));
      otpRefs.current[0]?.focus();
      return;
    }

    const otpCode = otp.join("");
    setLoading(true);
    const toastId = toast.loading("Verifying your code…");

    try {
      const { res, data, raw } = await callApi("/api/auth/verify-reset-otp", {
        email: email || undefined,
        phone: phone || undefined,
        otp: otpCode,
      });
      setLoading(false);

      if (res.ok && data?.success) {
        setOtpVerified(true);
        setFailedAttempts(0);
        settle(toastId, "success", "OTP verified! Enter your new password.");
      } else {
        console.error("[ResetPassword] verify failed:", res.status, data ?? raw.slice(0, 200));
        setOtpError(true);
        setTimeout(() => setOtpError(false), 600);
        setOtp(Array(6).fill(""));
        otpRefs.current[0]?.focus();

        let message = messageForStatus(res.status, extractMessage(data), res.headers.get("Retry-After"), "verify");

        // Only wrong-code replies count towards the attempt limit (not server or rate-limit errors)
        if (res.status >= 400 && res.status < 500 && res.status !== 429) {
          const attempts = failedAttempts + 1;
          setFailedAttempts(attempts);
          if (attempts >= MAX_OTP_ATTEMPTS) {
            message = "Too many incorrect codes. Request a new code to continue.";
          } else {
            const left = MAX_OTP_ATTEMPTS - attempts;
            message = `${message} (${left} attempt${left === 1 ? "" : "s"} left)`;
          }
        }
        settle(toastId, "error", message);
      }
    } catch (err) {
      setLoading(false);
      console.error(err);
      setOtp(Array(6).fill(""));
      otpRefs.current[0]?.focus();
      settle(toastId, "error", describeNetworkError(err));
    }
  };

  const handleResendOtp = async () => {
    if (resendTimer > 0) return;
    if (loading) return;
    if (!email && !phone) return toast.error("Missing email or phone");
    if (!preflight()) return;

    setLoading(true);
    const toastId = toast.loading("Sending a new code…");
    try {
      const { res, data, raw } = await callApi("/api/auth/request-reset", {
        email: email || undefined,
        phone: phone || undefined,
      });
      setLoading(false);

      if (res.ok && data?.success) {
        settle(toastId, "success", "OTP resent successfully");
        setResendTimer(RESEND_THROTTLE_SECONDS);
        setOtp(Array(6).fill(""));
        setFailedAttempts(0);
        otpRefs.current[0]?.focus();
      } else {
        console.error("[ResetPassword] resend failed:", res.status, data ?? raw.slice(0, 200));
        // If the server tells us to wait, start the countdown so the button reflects it
        if (res.status === 429) {
          const wait = parseInt(res.headers.get("Retry-After") ?? "", 10);
          setResendTimer(Number.isFinite(wait) && wait > 0 ? wait : RESEND_THROTTLE_SECONDS);
        }
        settle(toastId, "error", messageForStatus(res.status, extractMessage(data), res.headers.get("Retry-After"), "resend"));
      }
    } catch (err) {
      setLoading(false);
      console.error(err);
      settle(toastId, "error", describeNetworkError(err));
    }
  };

  // Step 1 of resetting: check the new password, then ask the user to confirm
  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otpVerified) return;
    if (loading) return;

    if (!password) return toast.error("Enter your new password");
    if (password.length < 8) return toast.error("Password must be at least 8 characters");
    if (password.length > 72) return toast.error("Password is too long. Use 72 characters or fewer.");
    if (!/[A-Z]/.test(password)) return toast.error("Must include an uppercase letter");
    if (!/[a-z]/.test(password)) return toast.error("Must include a lowercase letter");
    if (!/[0-9]/.test(password)) return toast.error("Must include a number");
    if (!/[\W_]/.test(password)) return toast.error("Must include a special character");
    if (!confirmPassword) return toast.error("Confirm your new password by typing it again");
    if (password !== confirmPassword) return toast.error("Passwords do not match");
    if (!preflight()) return;

    // All good: ask for confirmation before anything is sent
    setShowConfirm(true);
  };

  // Step 2: the user confirmed in the dialog, so send the new password
  const performReset = async () => {
    if (loading) return;
    setShowConfirm(false);
    if (!preflight()) return;

    setLoading(true);
    const toastId = toast.loading("Resetting your password…");
    try {
      const { res, data, raw } = await callApi("/api/auth/reset-password", {
        email: email || undefined,
        phone: phone || undefined,
        newPassword: password,
      });
      setLoading(false);

      if (res.ok && data?.success) {
        settle(toastId, "success", "Password reset successfully. Redirecting to login...");
        router.push("/login");
      } else {
        console.error("[ResetPassword] reset failed:", res.status, data ?? raw.slice(0, 200));
        // The verification expired on the server: send the user back to the code step
        if (res.status === 401 || res.status === 403 || res.status === 410) {
          setOtpVerified(false);
          setOtp(Array(6).fill(""));
        }
        settle(toastId, "error", messageForStatus(res.status, extractMessage(data), res.headers.get("Retry-After"), "reset") || "Failed to reset password");
      }
    } catch (err) {
      setLoading(false);
      console.error(err);
      settle(toastId, "error", describeNetworkError(err));
    }
  };

  // Warns when Caps Lock is on while typing a password
  const handlePasswordKey = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (typeof e.getModifierState === "function") setCapsLock(e.getModifierState("CapsLock"));
  };

  const stepDot = (active: boolean, done: boolean) =>
    `flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold transition ${
      done ? "bg-emerald-500 text-white" : active ? "bg-gradient-to-r from-[#00C2D1] to-[#7B2CBF] text-white" : "bg-gray-200 text-gray-500"
    }`;

  const passwordInputClass = "w-full rounded-lg border border-gray-300 bg-white p-3 pr-11 text-black placeholder:text-gray-400 transition focus:border-[#00C2D1] focus:outline-none focus:ring-2 focus:ring-[#00C2D1]";

  return (
    // Dark brand backdrop (same as the login and sign-up pages); the card stays light so the form reads clearly.
    <div className="relative flex min-h-[calc(100dvh-var(--header-h,132px))] items-center justify-center overflow-hidden bg-gradient-to-b from-black via-gray-900 to-gray-800 px-3 py-6 sm:px-4 sm:py-10">
      {/* Ambient glows */}
      <div aria-hidden className="pointer-events-none absolute -top-24 left-[-10%] h-80 w-80 rounded-full bg-[#00C2D1]/15 blur-3xl" />
      <div aria-hidden className="pointer-events-none absolute bottom-0 right-[-10%] h-96 w-96 rounded-full bg-[#7B2CBF]/20 blur-3xl" />

      <div className="relative w-full max-w-md">
        {/* Back to login */}
        <button
          type="button"
          onClick={() => router.push("/login")}
          disabled={loading}
          className="mb-3 inline-flex items-center gap-2 rounded-md px-1 py-1 text-sm font-medium text-gray-300 transition hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00C2D1] disabled:opacity-50"
        >
          <FaArrowLeft aria-hidden className="text-xs" />
          Back to login
        </button>

        <form
          onSubmit={otpVerified ? handlePasswordSubmit : e => e.preventDefault()}
          className="overflow-hidden rounded-2xl bg-white text-center shadow-2xl shadow-black/40"
        >
          {/* Brand accent bar */}
          <div className="h-1.5 bg-gradient-to-r from-[#00C2D1] via-[#7B2CBF] to-[#FF3D9A]" />

          <div className="p-5 sm:p-8">
            <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-[#00C2D1] to-[#7B2CBF] text-lg text-white shadow-md">
              <FaLock aria-hidden />
            </div>

            <h2 className="text-2xl font-bold mb-2 text-[#00C2D1]">Reset Password</h2>

            {/* Step indicator: this really is a two-step flow */}
            <ol className="mb-6 flex items-center justify-center gap-2 text-xs text-gray-500" aria-label="Progress">
              <li className="flex items-center gap-1.5" aria-current={!otpVerified ? "step" : undefined}>
                <span className={stepDot(!otpVerified, otpVerified)}>{otpVerified ? "✓" : "1"}</span>
                <span className={!otpVerified ? "font-semibold text-gray-800" : ""}>Verify code</span>
              </li>
              <span aria-hidden className="h-px w-6 bg-gray-300" />
              <li className="flex items-center gap-1.5" aria-current={otpVerified ? "step" : undefined}>
                <span className={stepDot(otpVerified, false)}>2</span>
                <span className={otpVerified ? "font-semibold text-gray-800" : ""}>New password</span>
              </li>
            </ol>

            {!email && !phone ? (
              // The link had no email or phone, so there is nothing to verify
              <div role="alert" className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-left text-sm text-amber-900">
                <p className="font-semibold">This reset link is incomplete</p>
                <p className="mt-1">We couldn&apos;t tell which account to reset. Request a new code to continue.</p>
                <Link
                  href="/forgot-password"
                  className="mt-3 inline-flex rounded-full bg-gradient-to-r from-[#00C2D1] to-[#7B2CBF] px-5 py-2 text-sm font-semibold text-white shadow-md shadow-[#7B2CBF]/30 transition hover:opacity-90"
                >
                  Request a new code
                </Link>
              </div>
            ) : !otpVerified ? (
              <>
                <p className="mb-4 text-gray-600">
                  Enter the 6-digit OTP sent to <strong>{maskedIdentifier}</strong>
                </p>
                <div className="mb-4 flex justify-center gap-2 sm:gap-3">
                  {otp.map((digit, idx) => (
                    <input
                      key={idx}
                      type="text"
                      inputMode="numeric"
                      autoComplete={idx === 0 ? "one-time-code" : "off"}
                      aria-label={`Digit ${idx + 1} of 6`}
                      maxLength={1}
                      value={digit}
                      disabled={loading || locked}
                      onChange={(e) => handleOtpChange(idx, e.target.value)}
                      onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                      onPaste={handleOtpPaste}
                      ref={(el) => { otpRefs.current[idx] = el; }}
                      className={`h-12 w-full max-w-[3rem] border text-center text-lg text-black rounded focus:outline-none focus:ring-2 disabled:cursor-not-allowed disabled:bg-gray-100 sm:h-14 sm:max-w-[3.25rem] ${otpError ? "border-red-500 ring-red-400" : "border-gray-300 focus:ring-[#00C2D1]"}`}
                    />
                  ))}
                </div>

                {locked && (
                  <p role="alert" className="mb-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
                    Too many incorrect codes. Request a new code to try again.
                  </p>
                )}

                <button
                  type="button"
                  disabled={resendTimer > 0 || loading}
                  onClick={handleResendOtp}
                  className={`text-sm mb-4 ${resendTimer > 0 ? "text-gray-400" : "text-[#7B2CBF] underline"}`}
                >
                  {resendTimer > 0 ? `Resend OTP in ${resendTimer}s` : "Resend OTP"}
                </button>
                <p className="text-sm text-gray-500">OTP will auto-submit once all digits are entered.</p>
                <p className="mt-3 text-sm text-gray-500">
                  Wrong email or phone?{" "}
                  <Link href="/forgot-password" className="font-semibold text-[#7B2CBF] hover:underline">
                    Start again
                  </Link>
                </p>
              </>
            ) : (
              <>
                {/* Password field with toggle */}
                <div className="relative mb-3 text-left">
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="New Password"
                    aria-label="New password"
                    autoComplete="new-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onKeyDown={handlePasswordKey}
                    onKeyUp={handlePasswordKey}
                    className={passwordInputClass}
                    required
                  />
                  <span
                    role="button"
                    tabIndex={0}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                    className="absolute right-3 top-3.5 cursor-pointer text-gray-600 hover:text-[#7B2CBF]"
                    onClick={() => setShowPassword(prev => !prev)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        setShowPassword(prev => !prev);
                      }
                    }}
                  >
                    {showPassword ? <FaEyeSlash /> : <FaEye />}
                  </span>
                </div>

                {/* Strength meter + live checklist */}
                <div className="mb-4 rounded-xl bg-gray-50 p-3 text-left" aria-live="polite">
                  <div className="flex items-center gap-2">
                    <div className="flex flex-1 gap-1" aria-hidden>
                      {PASSWORD_RULES.map((rule, i) => (
                        <span
                          key={rule.id}
                          className={`h-1.5 flex-1 rounded-full transition-colors ${password && i < passedRules ? strength.bar : "bg-gray-200"}`}
                        />
                      ))}
                    </div>
                    <span className={`text-xs font-semibold ${password ? strength.text : "text-gray-400"}`}>
                      {password ? strength.label : "Enter a password"}
                    </span>
                  </div>
                  <ul className="mt-2 grid grid-cols-1 gap-x-3 gap-y-1 text-xs sm:grid-cols-2">
                    {PASSWORD_RULES.map((rule) => {
                      const ok = rule.test(password);
                      return (
                        <li key={rule.id} className={`flex items-center gap-1.5 ${ok ? "text-emerald-600" : "text-gray-500"}`}>
                          {ok ? <FaCheckCircle aria-hidden /> : <FaRegCircle aria-hidden />}
                          <span>{rule.label}</span>
                        </li>
                      );
                    })}
                  </ul>
                </div>

                <div className="relative mb-1 text-left">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Confirm New Password"
                    aria-label="Confirm new password"
                    aria-invalid={passwordsMismatch}
                    autoComplete="new-password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    onKeyDown={handlePasswordKey}
                    onKeyUp={handlePasswordKey}
                    className={`${passwordInputClass} ${passwordsMismatch ? "!border-red-500 focus:!ring-red-400" : ""}`}
                    required
                  />
                  <span
                    role="button"
                    tabIndex={0}
                    aria-label={showConfirmPassword ? "Hide confirm password" : "Show confirm password"}
                    className="absolute right-3 top-3.5 cursor-pointer text-gray-600 hover:text-[#7B2CBF]"
                    onClick={() => setShowConfirmPassword(prev => !prev)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        setShowConfirmPassword(prev => !prev);
                      }
                    }}
                  >
                    {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                  </span>
                </div>

                <div className="mb-6 min-h-[1.25rem] text-left text-xs" aria-live="polite">
                  {passwordsMatch && <p className="text-emerald-600">Passwords match</p>}
                  {passwordsMismatch && <p className="text-red-600">Passwords do not match</p>}
                  {capsLock && <p className="mt-0.5 text-amber-600">Caps Lock is on</p>}
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  aria-busy={loading}
                  className="w-full bg-[#00C2D1] hover:bg-[#4B3F72] text-white py-3 rounded-lg font-semibold transition cursor-pointer disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {loading ? "Resetting..." : "Reset Password"}
                </button>
              </>
            )}
          </div>
        </form>
      </div>

      {/* Confirmation dialog: shown before the new password is sent */}
      {showConfirm && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
          onClick={() => !loading && setShowConfirm(false)}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="confirm-reset-title"
            aria-describedby="confirm-reset-desc"
            className="w-full max-w-sm overflow-hidden rounded-2xl bg-white text-center shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="h-1.5 bg-gradient-to-r from-[#00C2D1] via-[#7B2CBF] to-[#FF3D9A]" />
            <div className="p-5 sm:p-6">
              <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-[#00C2D1] to-[#7B2CBF] text-lg text-white">
                <FaLock aria-hidden />
              </div>
              <h3 id="confirm-reset-title" className="text-lg font-bold text-gray-900">Reset your password?</h3>
              <p id="confirm-reset-desc" className="mt-2 text-sm text-gray-600">
                You&apos;re about to set a new password for <strong>{maskedIdentifier}</strong>. You&apos;ll need it the next time you log in.
              </p>
              <div className="mt-5 flex flex-col-reverse gap-2 sm:flex-row sm:gap-3">
                <button
                  type="button"
                  onClick={() => setShowConfirm(false)}
                  disabled={loading}
                  className="flex-1 rounded-full border border-gray-300 px-5 py-2.5 text-sm font-semibold text-gray-700 transition hover:bg-gray-100 disabled:opacity-60"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  ref={confirmButtonRef}
                  onClick={performReset}
                  disabled={loading}
                  className="flex-1 rounded-full bg-gradient-to-r from-[#00C2D1] to-[#7B2CBF] px-5 py-2.5 text-sm font-semibold text-white shadow-md shadow-[#7B2CBF]/30 transition hover:opacity-90 active:scale-[0.98] disabled:opacity-60"
                >
                  Yes, reset password
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}