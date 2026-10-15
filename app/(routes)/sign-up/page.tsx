"use client";

import React, { ChangeEvent, JSX, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
// Same toast library as the login page, so the toasts actually appear (react-hot-toast needs its own <Toaster />)
import { toast } from "react-toastify";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "";

// How long we wait for the server before telling the user it is too slow
const SIGNUP_TIMEOUT_MS = 15000;

// Where the "Terms and Conditions" and "Privacy Policy" links open.
// Both point at your privacy page for now. If you add a separate terms page later, change TERMS_PATH only.
const PRIVACY_PATH = "/privacy-policy";
const TERMS_PATH = "/privacy-policy";

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
  error?: string;
  errors?: (string | { message?: string; msg?: string })[];
}

// Common email typos we can catch before the server does
const EMAIL_TYPOS: Record<string, string> = {
  "gmial.com": "gmail.com",
  "gmai.com": "gmail.com",
  "gamil.com": "gmail.com",
  "gmail.con": "gmail.com",
  "hotmial.com": "hotmail.com",
  "hotmail.con": "hotmail.com",
  "yaho.com": "yahoo.com",
  "yahoo.con": "yahoo.com",
  "outlok.com": "outlook.com",
};

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

// Works out which input a server message is about, so we can highlight it
function guessField(message: string): keyof SignUpData | null {
  if (/e-?mail/i.test(message)) return "email";
  if (/phone|mobile|number/i.test(message)) return "phone";
  if (/password/i.test(message)) return "password";
  if (/name/i.test(message)) return "name";
  return null;
}

// Maps an HTTP status to a clear message. The server's own message wins when it sent one.
function messageForStatus(status: number, backendMessage: string | undefined, retryAfter: string | null): string {
  if (status === 429) {
    return `Too many attempts. Please wait ${formatWait(retryAfter)} and try again.`;
  }
  if (status >= 500) {
    return "Our server ran into a problem. Please try again in a moment.";
  }
  switch (status) {
    case 400:
    case 422:
      return backendMessage || "Some of your details are not valid. Please check them and try again.";
    case 403:
      return backendMessage || "Sign up is not available right now. Please contact support.";
    case 404:
      return "The sign up service could not be found. Please contact support.";
    case 408:
      return "The request timed out. Please try again.";
    case 409:
      return backendMessage || "An account with this email or phone number already exists. Try logging in instead.";
    default:
      return backendMessage || `Sign up failed (error ${status}). Please try again.`;
  }
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
  // Which input to highlight in red after an error
  const [errorField, setErrorField] = useState<keyof SignUpData | null>(null);
  // "I agree to the Terms and Conditions" checkbox, and whether it should be highlighted red
  const [acceptedTerms, setAcceptedTerms] = useState<boolean>(false);
  const [termsError, setTermsError] = useState<boolean>(false);

  const router = useRouter();

  const handleOnChange = (e: ChangeEvent<HTMLInputElement>): void => {
    const { name, value } = e.target;
    setData((prev) => ({ ...prev, [name]: value }));
    // Clear the red highlight as soon as the user starts fixing that field
    if (errorField === name) setErrorField(null);
  };

  const handleTermsChange = (e: ChangeEvent<HTMLInputElement>): void => {
    setAcceptedTerms(e.target.checked);
    // Clear the red highlight as soon as the box is ticked
    if (e.target.checked) setTermsError(false);
  };

  const isValidEmail = (email: string): boolean => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const normalizePhone = (phone: string): string => {
    let p = phone.replace(/\D/g, "");
    if (p.startsWith("07")) p = "254" + p.substring(1);
    if (p.startsWith("7") && p.length === 9) p = "254" + p;
    // Also support 01xx numbers, and "+254 0712..." typed with a stray zero
    if (p.startsWith("01")) p = "254" + p.substring(1);
    if (p.startsWith("1") && p.length === 9) p = "254" + p;
    if (p.startsWith("2540")) p = "254" + p.substring(4);
    return p;
  };

  // Shows one validation toast (replacing any earlier one), highlights the field and focuses it
  const reject = (message: string, field?: keyof SignUpData): void => {
    toast.dismiss();
    toast.error(message);
    if (field) {
      setErrorField(field);
      document.getElementById(field)?.focus();
    }
  };

  // Same as reject(), but for the terms checkbox (it is not one of the text fields)
  const rejectTerms = (message: string): void => {
    toast.dismiss();
    toast.error(message);
    setTermsError(true);
    document.getElementById("terms")?.focus();
  };

  const handleSubmit = async (): Promise<void> => {
    // Ignore extra clicks / Enter presses while a sign up is already in progress
    if (loading) return;

    const { password, confirmPassword } = data;
    const name = data.name.trim();
    const email = data.email.trim();
    const phone = data.phone.trim();

    setErrorField(null);
    setTermsError(false);

    // ---------- 1. Checks done in the browser (instant feedback, no server call) ----------
    if (!name && !email && !phone && !password && !confirmPassword) {
      reject("All fields are required", "name");
      return;
    }

    // Name
    if (!name) {
      reject("Enter your name.", "name");
      return;
    }
    if (name.length < 2) {
      reject("Your name is too short. Use at least 2 characters.", "name");
      return;
    }
    if (name.length > 60) {
      reject("Your name is too long. Use 60 characters or fewer.", "name");
      return;
    }
    if (!/^[\p{L}][\p{L}\s'.-]*$/u.test(name)) {
      reject("Your name can only contain letters, spaces, apostrophes, dots and hyphens.", "name");
      return;
    }

    // Email
    if (!email) {
      reject("Enter your email address.", "email");
      return;
    }
    if (!isValidEmail(email)) {
      reject("Invalid email format. Use something like name@example.com.", "email");
      return;
    }
    if (email.length > 254) {
      reject("That email address is too long.", "email");
      return;
    }
    const emailDomain = email.split("@")[1]?.toLowerCase() ?? "";
    if (EMAIL_TYPOS[emailDomain]) {
      reject(`Did you mean ${email.split("@")[0]}@${EMAIL_TYPOS[emailDomain]}? Please check your email address.`, "email");
      return;
    }

    // Phone
    if (!phone) {
      reject("Enter your phone number.", "phone");
      return;
    }
    if (!/^[+\d\s()-]+$/.test(phone)) {
      reject("Your phone number can only contain digits, spaces and a leading +.", "phone");
      return;
    }
    const normalizedPhone = normalizePhone(phone);
    if (normalizedPhone.length < 12) {
      reject("That phone number is too short. Use a format like 0712 345 678.", "phone");
      return;
    }
    if (!/^254[17]\d{8}$/.test(normalizedPhone)) {
      reject("Enter a valid Kenyan phone number, for example 0712 345 678.", "phone");
      return;
    }

    // Password
    if (!password) {
      reject("Create a password.", "password");
      return;
    }

    if (password.length < 8) {
      reject("Password must be at least 8 characters long", "password");
      return;
    }

    if (password.length > 72) {
      reject("Password is too long. Use 72 characters or fewer.", "password");
      return;
    }

    if (!/[A-Z]/.test(password)) {
      reject("Password must include at least one uppercase letter", "password");
      return;
    }

    if (!/[a-z]/.test(password)) {
      reject("Password must include at least one lowercase letter", "password");
      return;
    }

    if (!/[0-9]/.test(password)) {
      reject("Password must include at least one number", "password");
      return;
    }

    if (!/[\W_]/.test(password)) {
      reject("Password must include at least one special character (e.g. @, #, $, !)", "password");
      return;
    }

    // Confirm password
    if (!confirmPassword) {
      reject("Confirm your password by typing it again.", "confirmPassword");
      return;
    }

    if (password !== confirmPassword) {
      reject("Passwords do not match", "confirmPassword");
      return;
    }

    // Terms and Conditions must be accepted before an account can be created
    if (!acceptedTerms) {
      rejectTerms("Please agree to the Terms and Conditions to create your account.");
      return;
    }

    // Setup / connection checks
    if (!API_URL) {
      console.error("[SignUp] NEXT_PUBLIC_API_URL is not set. Add it to .env.local and restart the dev server.");
      reject("Sign up is not set up correctly. Please contact support.");
      return;
    }

    if (typeof navigator !== "undefined" && !navigator.onLine) {
      reject("You're offline. Check your internet connection and try again.");
      return;
    }

    // ---------- 2. Call the server, with a loading toast that turns into the result ----------
    toast.dismiss();
    setLoading(true);
    const toastId = toast.loading("Creating your account…");

    const fail = (message: string, field?: keyof SignUpData | null): void => {
      toast.update(toastId, {
        render: message,
        type: "error",
        isLoading: false,
        autoClose: 6000,
        closeOnClick: true,
        closeButton: true,
        draggable: true,
      });
      // undefined = guess from the message, null = highlight nothing
      const target = field === undefined ? guessField(message) : field;
      if (target) {
        setErrorField(target);
        document.getElementById(target)?.focus();
      }
    };

    const controller = new AbortController();
    const timer = window.setTimeout(() => controller.abort(), SIGNUP_TIMEOUT_MS);

    try {
      const res = await fetch(`${API_URL}/api/auth/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        signal: controller.signal,
        body: JSON.stringify({ name, email, phone: normalizedPhone, password }),
      });

      // Read the body safely: the server may reply with HTML or nothing (proxy errors, crashes)
      let resData: ApiResponse | null = null;
      const raw = await res.text();
      if (raw) {
        try {
          resData = JSON.parse(raw) as ApiResponse;
        } catch {
          resData = null;
        }
      }

      if (!res.ok) {
        console.error("[SignUp] server responded with", res.status, resData ?? raw.slice(0, 200));
        const backendMessage = extractMessage(resData);
        const message = messageForStatus(res.status, backendMessage, res.headers.get("Retry-After"));

        // A "duplicate" reply points at email or phone; otherwise highlight whatever the message mentions
        const field = res.status === 409 && !backendMessage ? "email" : res.status >= 500 ? null : undefined;
        fail(message, field);
        return;
      }

      if (resData && resData.success) {
        toast.update(toastId, {
          render: "OTP is being sent. Check your WhatsApp/email.",
          type: "success",
          isLoading: false,
          autoClose: 5000,
          closeOnClick: true,
        });

        // Navigate immediately to verification page
        router.push(`/verify-otp?email=${encodeURIComponent(email)}&phone=${encodeURIComponent(normalizedPhone)}`);
      } else if (resData && resData.success === false) {
        fail(extractMessage(resData) || "Signup failed");
      } else {
        console.error("[SignUp] unexpected response shape:", resData);
        fail("We got an unexpected reply from the server. Please try again.");
      }
    } catch (err: unknown) {
      console.error("[SignUp] error:", err);

      if (err instanceof DOMException && err.name === "AbortError") {
        fail("The server is taking too long to respond. Please try again.", null);
      } else if (typeof navigator !== "undefined" && !navigator.onLine) {
        fail("You're offline. Check your internet connection and try again.", null);
      } else {
        fail("Can't reach the server. Check your connection, or try again in a moment.", null);
      }
    } finally {
      window.clearTimeout(timer);
      setLoading(false);
    }
  };

  // Shared look for every text field (same cyan focus ring as before)
  const inputClass =
    "w-full rounded-lg border border-gray-300 bg-white p-2.5 text-gray-800 placeholder:text-gray-400 transition sm:p-3 focus:border-[#00C2D1] focus:outline-none focus:ring-2 focus:ring-[#00C2D1]";

  // Same look in red for the field that needs attention
  const inputErrorClass =
    "w-full rounded-lg border border-red-500 bg-red-50/40 p-2.5 text-gray-800 sm:p-3 placeholder:text-gray-400 transition focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-400";

  const fieldClass = (field: keyof SignUpData): string => (errorField === field ? inputErrorClass : inputClass);

  return (
    // Dark brand backdrop (same as the other pages); card stays light so the form reads clearly.
    <div className="relative flex min-h-[calc(100dvh-var(--header-h,132px))] items-center justify-center overflow-hidden bg-gradient-to-b from-black via-gray-900 to-gray-800 px-3 py-4 text-gray-800 sm:px-4 sm:py-8">
      {/* Ambient glows */}
      <div aria-hidden className="pointer-events-none absolute -top-24 left-[-10%] h-80 w-80 rounded-full bg-[#00C2D1]/15 blur-3xl" />
      <div aria-hidden className="pointer-events-none absolute bottom-0 right-[-10%] h-96 w-96 rounded-full bg-[#7B2CBF]/20 blur-3xl" />

      <div
        className="relative w-full max-w-sm overflow-hidden rounded-2xl bg-white text-center shadow-2xl shadow-black/40 sm:max-w-md"
        // Pressing Enter in any field submits the form
        onKeyDown={(e) => {
          if (e.key === "Enter" && (e.target as HTMLElement).tagName === "INPUT") {
            e.preventDefault();
            void handleSubmit();
          }
        }}
      >
        {/* Brand accent bar */}
        <div className="h-1.5 bg-gradient-to-r from-[#00C2D1] via-[#7B2CBF] to-[#FF3D9A]" />

        <div className="p-4 sm:p-6">
          <img src={"/logo.png"} alt="Logo" className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-1.5 sm:mb-2 object-contain" />
          <h1 className="text-xl font-bold text-gray-900 sm:text-2xl [@media(max-height:700px)]:mb-3">Create your account</h1>
          <p className="mt-1 mb-3 text-sm text-gray-500 sm:mb-5 [@media(max-height:700px)]:hidden">Shop gadgets and book print &amp; gaming services in minutes.</p>

          <div className="flex flex-col gap-2.5 text-left sm:gap-3">
            <input id="name" type="text" name="name" placeholder="Name" aria-label="Name" aria-invalid={errorField === "name"} autoComplete="name" value={data.name} onChange={handleOnChange} className={fieldClass("name")} required />
            <input id="email" type="email" name="email" placeholder="Email" aria-label="Email" aria-invalid={errorField === "email"} autoComplete="email" value={data.email} onChange={handleOnChange} className={fieldClass("email")} required />
            <input id="phone" type="text" name="phone" placeholder="Phone (Kenya)" aria-label="Phone" aria-invalid={errorField === "phone"} autoComplete="tel" inputMode="tel" value={data.phone} onChange={handleOnChange} className={fieldClass("phone")} required />

            {/* Passwords sit side by side on tablets/desktops, stacked on phones */}
            <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 sm:gap-3">
              <div className="relative">
                <input id="password" type={showPassword ? "text" : "password"} name="password" placeholder="Password" aria-label="Password" aria-invalid={errorField === "password"} autoComplete="new-password" value={data.password} onChange={handleOnChange} className={`${fieldClass("password")} pr-14`} required />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 transform -translate-y-1/2 text-sm font-medium text-gray-600 hover:text-[#7B2CBF]">{showPassword ? "Hide" : "Show"}</button>
              </div>

              <div className="relative">
                <input id="confirmPassword" type={showConfirmPassword ? "text" : "password"} name="confirmPassword" placeholder="Confirm Password" aria-label="Confirm password" aria-invalid={errorField === "confirmPassword"} autoComplete="new-password" value={data.confirmPassword} onChange={handleOnChange} className={`${fieldClass("confirmPassword")} pr-14`} required />
                <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-3 top-1/2 transform -translate-y-1/2 text-sm font-medium text-gray-600 hover:text-[#7B2CBF]">{showConfirmPassword ? "Hide" : "Show"}</button>
              </div>
            </div>

            <p className="-mt-1 text-xs text-gray-500">
              Use 8+ characters with an uppercase letter, a lowercase letter, a number and a symbol.
            </p>

            {/* Terms and Conditions: must be ticked to sign up. Links open in a new tab so the form is not lost. */}
            <div>
              <label
                htmlFor="terms"
                className={`flex cursor-pointer items-start gap-2.5 rounded-lg border p-2 text-xs leading-snug transition sm:text-sm ${
                  termsError ? "border-red-400 bg-red-50/60 text-red-700" : "border-transparent text-gray-600"
                }`}
              >
                <input
                  id="terms"
                  name="terms"
                  type="checkbox"
                  checked={acceptedTerms}
                  onChange={handleTermsChange}
                  aria-invalid={termsError}
                  aria-describedby={termsError ? "terms-error" : undefined}
                  className="mt-0.5 h-4 w-4 shrink-0 cursor-pointer rounded border-gray-300 accent-[#7B2CBF] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#00C2D1]"
                  required
                />
                <span>
                  I agree to the{" "}
                  <Link
                    href={TERMS_PATH}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="font-semibold text-[#7B2CBF] underline-offset-2 hover:underline"
                  >
                    Terms and Conditions
                  </Link>{" "}
                  and{" "}
                  <Link
                    href={PRIVACY_PATH}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="font-semibold text-[#7B2CBF] underline-offset-2 hover:underline"
                  >
                    Privacy Policy
                  </Link>
                  .
                </span>
              </label>
              {termsError && (
                <p id="terms-error" role="alert" className="mt-1 text-xs text-red-600">
                  You need to agree to the Terms and Conditions to sign up.
                </p>
              )}
            </div>

            <button type="button" onClick={handleSubmit} aria-busy={loading} className="w-full rounded-full bg-gradient-to-r from-[#00C2D1] to-[#7B2CBF] py-3 font-semibold text-white shadow-md shadow-[#7B2CBF]/30 transition hover:opacity-90 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50" disabled={loading}>
              {loading ? "Signing up..." : "Sign Up"}
            </button>
          </div>

          <p className="mt-3 text-sm text-gray-600 sm:text-base">
            Already have an account?{" "}
            <span className="cursor-pointer font-semibold text-[#7B2CBF] hover:underline" onClick={() => router.push("/login")}>Login</span>
          </p>
        </div>
      </div>
    </div>
  );
}