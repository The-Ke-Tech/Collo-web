'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import loginIcons from '@/public/signin.gif';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { toast } from 'react-toastify';
import { useAuthStore } from '@/store/auth-store';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

// How long we wait for the server before telling the user it is too slow
const LOGIN_TIMEOUT_MS = 15000;

interface LoginFormData {
  identifier: string; // email or phone
  password: string;
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

// Pulls the most useful message out of whatever shape the backend replied with
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function extractMessage(result: any): string | undefined {
  if (!result || typeof result !== 'object') return undefined;
  if (typeof result.message === 'string' && result.message.trim()) return result.message.trim();
  if (typeof result.error === 'string' && result.error.trim()) return result.error.trim();
  if (Array.isArray(result.errors) && result.errors.length > 0) {
    const first = result.errors[0];
    if (typeof first === 'string') return first;
    if (first && typeof first.message === 'string') return first.message;
    if (first && typeof first.msg === 'string') return first.msg;
  }
  return undefined;
}

// Turns "Retry-After" (seconds) into friendly text, e.g. "2 minutes"
function formatWait(retryAfter: string | null): string {
  const seconds = retryAfter ? parseInt(retryAfter, 10) : NaN;
  if (!Number.isFinite(seconds) || seconds <= 0) return 'a few minutes';
  if (seconds < 60) return `${seconds} second${seconds === 1 ? '' : 's'}`;
  const minutes = Math.ceil(seconds / 60);
  return `${minutes} minute${minutes === 1 ? '' : 's'}`;
}

// Maps an HTTP status to a clear message. The server's own message wins when it sent one
// (so "Wrong password" or "No account with this email" show exactly as the backend says).
function messageForStatus(status: number, backendMessage: string | undefined, retryAfter: string | null): string {
  if (status === 429) {
    return `Too many login attempts. Please wait ${formatWait(retryAfter)} and try again.`;
  }
  if (status >= 500) {
    return 'Our server ran into a problem. Please try again in a moment.';
  }
  switch (status) {
    case 400:
      return backendMessage || 'Please check the details you entered and try again.';
    case 401:
      return backendMessage || 'Incorrect email/phone or password. Please try again.';
    case 403:
      return backendMessage || 'This account cannot sign in right now. Please verify your account or contact support.';
    case 404:
      return backendMessage || 'No account found with that email or phone number.';
    case 408:
      return 'The request timed out. Please try again.';
    case 423:
      return backendMessage || 'Your account is temporarily locked. Try again later or reset your password.';
    default:
      return backendMessage || `Login failed (error ${status}). Please try again.`;
  }
}

const Login: React.FC = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [data, setData] = useState<LoginFormData>({
    identifier: '',
    password: '',
  });

  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectPath = searchParams.get('redirect') ?? '/';

  const { setUser, isLoggedIn } = useAuthStore();

  // If already logged in, redirect immediately
  if (isLoggedIn()) {
    router.push(redirectPath);
    return null;
  }

  const handleOnChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  // Normalize Kenyan phone numbers
  const normalizePhone = (phone: string) => {
    let p = phone.replace(/\D/g, '');
    if (p.startsWith('07')) p = '254' + p.substring(1);
    if (p.startsWith('7') && p.length === 9) p = '254' + p;
    return p;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // Ignore extra clicks while a login is already in progress
    if (submitting) return;

    const identifier = data.identifier.trim();

    // ---------- 1. Checks done in the browser (instant feedback, no server call) ----------
    if (!identifier && !data.password) {
      toast.error('Enter your email or phone number and your password.');
      return;
    }
    if (!identifier) {
      toast.error('Enter your email or phone number.');
      return;
    }
    if (!data.password) {
      toast.error('Enter your password.');
      return;
    }

    if (identifier.includes('@')) {
      if (!EMAIL_REGEX.test(identifier)) {
        toast.error('That email address looks incomplete. Check it and try again.');
        return;
      }
    } else if (/^[+\d\s-]+$/.test(identifier)) {
      if (identifier.replace(/\D/g, '').length < 9) {
        toast.error('That phone number is too short. Use a format like 0712 345 678.');
        return;
      }
    } else {
      toast.error('Enter a valid email address or phone number.');
      return;
    }

    if (!API_URL) {
      console.error('[Login] NEXT_PUBLIC_API_URL is not set. Add it to .env.local and restart the dev server.');
      toast.error('Login is not set up correctly. Please contact support.');
      return;
    }

    if (typeof navigator !== 'undefined' && !navigator.onLine) {
      toast.error("You're offline. Check your internet connection and try again.");
      return;
    }

    let identifierToSend = identifier;
    const isPhone = /^[0+]?7\d{8}$|^2547\d{8}$/.test(identifier);

    if (isPhone) {
      identifierToSend = normalizePhone(identifier);
    }

    // ---------- 2. Call the server, with a loading toast that turns into the result ----------
    setSubmitting(true);
    const toastId = toast.loading('Signing you in…');

    const fail = (message: string) => {
      toast.update(toastId, {
        render: message,
        type: 'error',
        isLoading: false,
        autoClose: 6000,
        closeOnClick: true,
        closeButton: true,
        draggable: true,
      });
    };

    const controller = new AbortController();
    const timer = window.setTimeout(() => controller.abort(), LOGIN_TIMEOUT_MS);

    try {
      const res = await fetch(`${API_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        signal: controller.signal,
        body: JSON.stringify({
          emailOrPhone: identifierToSend,
          password: data.password,
        }),
      });

      // Read the body safely: the server may reply with HTML or nothing (proxy errors, crashes)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      let result: any = null;
      const raw = await res.text();
      if (raw) {
        try {
          result = JSON.parse(raw);
        } catch {
          result = null;
        }
      }

      if (!res.ok) {
        console.error('[Login] server responded with', res.status, result ?? raw.slice(0, 200));

        // Not JSON and 404 = the login route itself was not found (wrong API address/path)
        if (result === null && res.status === 404) {
          fail('The login service could not be found. Please contact support.');
          return;
        }

        fail(messageForStatus(res.status, extractMessage(result), res.headers.get('Retry-After')));
        return;
      }

      if (result && result.success && result.user && result.token) {
        toast.update(toastId, {
          render: result.message || 'Login successful',
          type: 'success',
          isLoading: false,
          autoClose: 2500,
          closeOnClick: true,
        });

        // Save user + access token
        setUser(result.user, result.token);

        // Redirect
        router.push(redirectPath);
      } else if (result && result.success === false) {
        fail(extractMessage(result) || 'Login failed. Please try again.');
      } else {
        console.error('[Login] unexpected response shape:', result);
        fail('We got an unexpected reply from the server. Please try again.');
      }
    } catch (error) {
      console.error('[Login] error:', error);

      if (error instanceof DOMException && error.name === 'AbortError') {
        fail('The server is taking too long to respond. Please try again.');
      } else if (typeof navigator !== 'undefined' && !navigator.onLine) {
        fail("You're offline. Check your internet connection and try again.");
      } else {
        fail("Can't reach the server. Check your connection, or try again in a moment.");
      }
    } finally {
      window.clearTimeout(timer);
      setSubmitting(false);
    }
  };

  return (
    // Dark brand backdrop (same as the other pages) so there's no light/dark seam under the header.
    // Height = screen minus the measured header, so the card is centred without extra scrolling.
    <section className="relative flex min-h-[calc(100dvh-var(--header-h,132px))] items-center justify-center overflow-hidden bg-gradient-to-b from-black via-gray-900 to-gray-800 px-3 py-6 text-gray-800 sm:px-4 sm:py-10">
      {/* Ambient glows */}
      <div aria-hidden className="pointer-events-none absolute -top-24 left-[-10%] h-80 w-80 rounded-full bg-[#00C2D1]/15 blur-3xl" />
      <div aria-hidden className="pointer-events-none absolute bottom-0 right-[-10%] h-96 w-96 rounded-full bg-[#7B2CBF]/20 blur-3xl" />

      <div className="relative mx-auto container p-0 sm:p-4">
        <div className="mx-auto w-full max-w-sm overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-2xl shadow-black/40 sm:max-w-md">
          {/* Brand accent bar */}
          <div className="h-1.5 bg-gradient-to-r from-[#00C2D1] via-[#7B2CBF] to-[#FF3D9A]" />

          <div className="p-5 sm:p-8">
            <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto relative">
              <Image src={loginIcons} alt="login icon" fill sizes="(max-width: 640px) 64px, 80px" className="object-contain" />
            </div>

            <div className="mt-3 text-center">
              <h1 className="text-xl font-bold text-gray-900 sm:text-2xl">Welcome back</h1>
              <p className="mt-1 text-sm text-gray-500">Log in to track orders and check out faster.</p>
            </div>

            <form className="pt-5 sm:pt-6 flex flex-col gap-3 sm:gap-4" onSubmit={handleSubmit}>
              <div>
                <label htmlFor="identifier" className="mb-1 block text-sm font-medium text-gray-700">Email or Phone</label>
                <div className="rounded-lg border border-gray-300 bg-gray-100 p-2.5 transition focus-within:border-[#00C2D1] focus-within:bg-white focus-within:ring-2 focus-within:ring-[#00C2D1]/40">
                  <input
                    id="identifier"
                    type="text"
                    name="identifier"
                    value={data.identifier}
                    onChange={handleOnChange}
                    placeholder="Enter email or phone"
                    autoComplete="username"
                    className="w-full outline-none bg-transparent"
                    required
                  />
                </div>
              </div>

              <div>
                <label htmlFor="password" className="mb-1 block text-sm font-medium text-gray-700">Password</label>
                <div className="flex items-center rounded-lg border border-gray-300 bg-gray-100 p-2.5 transition focus-within:border-[#00C2D1] focus-within:bg-white focus-within:ring-2 focus-within:ring-[#00C2D1]/40">
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    value={data.password}
                    onChange={handleOnChange}
                    placeholder="Enter password"
                    autoComplete="current-password"
                    className="w-full outline-none bg-transparent"
                    required
                  />
                  <div
                    role="button"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                    className="cursor-pointer text-xl ml-2 text-gray-500 hover:text-[#7B2CBF]"
                    onClick={() => setShowPassword(p => !p)}
                  >
                    {showPassword ? <FaEyeSlash /> : <FaEye />}
                  </div>
                </div>

                <Link
                  href="/forgot-password"
                  className="block w-fit ml-auto text-sm mt-1.5 text-[#7B2CBF] hover:underline"
                >
                  Forgot password?
                </Link>
              </div>

              <button
                type="submit"
                disabled={submitting}
                aria-busy={submitting}
                className="bg-gradient-to-r from-[#00C2D1] to-[#7B2CBF] text-white px-6 py-2.5 w-full rounded-full mx-auto mt-3 sm:mt-4 font-semibold shadow-md shadow-[#7B2CBF]/30 hover:opacity-90 active:scale-[0.98] transition disabled:cursor-not-allowed disabled:opacity-60"
              >
                {submitting ? 'Logging in…' : 'Login'}
              </button>
            </form>

            <p className="mt-5 mb-1 text-center text-sm text-gray-600 sm:text-base">
              Don&apos;t have an account?{' '}
              <Link href="/sign-up" className="font-semibold text-[#7B2CBF] hover:underline">
                Sign up
              </Link>
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Login;