'use client';

import React, { useEffect, useState } from 'react';
import { useAuthStore } from '@/store/auth-store';
import { useRouter } from 'next/navigation';
import { FaUser, FaEnvelope, FaPhoneAlt } from 'react-icons/fa';
import Link from 'next/link';

const ProfilePage: React.FC = () => {
  const { user, logout } = useAuthStore();
  const router = useRouter();

  // Which detail was just copied (drives the "Copied" label on its tile)
  const [copied, setCopied] = useState<string | null>(null);
  // Logout confirmation dialog
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  // Close the dialog with the Escape key
  useEffect(() => {
    if (!confirmOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !loggingOut) setConfirmOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [confirmOpen, loggingOut]);

  if (!user) return null;

  const initial = (user.name || user.email || 'C').charAt(0).toUpperCase();

  // Profile completeness is based on the fields shown on this page
  const filled = [user.name, user.email, user.phone].filter(Boolean).length;
  const completeness = Math.round((filled / 3) * 100);

  const copyValue = async (key: string, value?: string | null) => {
    if (!value) return;
    try {
      await navigator.clipboard.writeText(value);
      setCopied(key);
      setTimeout(() => setCopied(null), 1500);
    } catch {
      // clipboard can be blocked (e.g. non-HTTPS); ignore silently
    }
  };

  // Confirmed logout: clear the session, then send the user to the home page (same as the header menu)
  const handleConfirmLogout = () => {
    setLoggingOut(true);
    logout();
    router.push('/');
  };

  // Detail tiles: icons live here, buttons elsewhere stay text-only
  const details: {
    key: string;
    label: string;
    value: string;
    raw?: string | null;
    icon: React.ReactNode;
    tone: string;
    wide?: boolean;
  }[] = [
    { key: 'name', label: 'Name', value: user.name || 'N/A', raw: user.name, icon: <FaUser />, tone: 'from-[#00C2D1] to-[#3A86FF]' },
    { key: 'phone', label: 'Phone', value: user.phone || 'N/A', raw: user.phone, icon: <FaPhoneAlt />, tone: 'from-[#00C2D1] to-[#7B2CBF]' },
    // Email is the longest value, so it gets the full width on tablets and up
    { key: 'email', label: 'Email', value: user.email || 'N/A', raw: user.email, icon: <FaEnvelope />, tone: 'from-[#7B2CBF] to-[#FF3D9A]', wide: true },
  ];

  return (
    // Fills exactly the space under the header (header height is measured in ClientLayout),
    // and the content below is sized to fit it without scrolling on phones, tablets and desktops.
    <div className="flex min-h-[calc(100dvh-var(--header-h,132px)-12px)] flex-col bg-gray-900 text-white lg:min-h-[calc(100dvh-var(--header-h,76px)-12px)]">
      <div className="mx-auto grid w-full max-w-5xl flex-1 content-start gap-2.5 px-2.5 py-1.5 sm:gap-4 sm:px-6 sm:py-3 lg:grid-cols-[minmax(0,340px)_minmax(0,1fr)] lg:items-start lg:gap-6 lg:py-6">
        {/* Top Bar: cover + avatar + logout (left column on desktop) */}
        <header className="relative w-full overflow-hidden rounded-2xl border border-purple-700 bg-gray-800 shadow-xl">
          {/* Cover */}
          <div className="relative h-12 bg-gradient-to-r from-[#00C2D1] via-[#7B2CBF] to-[#FF3D9A] sm:h-20 [@media(max-height:620px)]:h-9">
            <div aria-hidden className="absolute -right-6 -top-10 h-28 w-28 rounded-full bg-white/15 blur-2xl" />
            <div aria-hidden className="absolute -bottom-12 left-1/3 h-24 w-24 rounded-full bg-black/20 blur-2xl" />
          </div>

          <div className="px-3 pb-3 sm:px-5 sm:pb-5">
            {/* Avatar overlaps the cover; logout sits beside it */}
            <div className="-mt-7 flex items-end justify-between gap-2 sm:-mt-10">
              <div className="relative z-10 flex h-14 w-14 shrink-0 items-center justify-center rounded-full border-4 border-gray-800 bg-gradient-to-br from-[#00C2D1] to-[#7B2CBF] text-xl font-bold text-white shadow-lg sm:h-20 sm:w-20 sm:text-3xl">
                {initial}
              </div>

            </div>

            {/* Name on the left, Logout on the right. It sits below the cover (not over it), so the
                cover can never cover or block taps on the button, even on very small screens. */}
            <div className="relative z-20 mt-1.5 flex items-start justify-between gap-3 sm:mt-3">
              <div className="min-w-0 flex-1">
                <p className="min-w-0 text-base font-bold [overflow-wrap:anywhere] sm:text-xl">{user.name}</p>
                <p className="hidden text-xs text-gray-300 [overflow-wrap:anywhere] sm:block sm:text-sm">{user.email || 'N/A'}</p>
              </div>

              <button
                type="button"
                onClick={() => setConfirmOpen(true)}
                className="shrink-0 touch-manipulation rounded-full bg-red-600 px-5 py-2 text-sm font-semibold transition hover:bg-red-700 active:scale-95"
              >
                Logout
              </button>
            </div>

            {/* Completeness */}
            <div className="mt-2 sm:mt-4">
              <div className="mb-1 flex items-center justify-between text-[11px] text-gray-300 sm:text-sm">
                <span>Profile completeness</span>
                <span className="font-semibold text-white">{completeness}%</span>
              </div>
              <div className="h-1.5 w-full overflow-hidden rounded-full bg-gray-700 sm:h-2">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-[#00C2D1] via-[#7B2CBF] to-[#FF3D9A] transition-all duration-700"
                  style={{ width: `${completeness}%` }}
                />
              </div>
              {completeness < 100 && (
                <p className="mt-1 hidden text-xs text-gray-400 sm:block">
                  Some details are missing, so your profile isn&apos;t fully complete yet.
                </p>
              )}
            </div>
          </div>
        </header>

        {/* Main Content (right column on desktop) */}
        <main className="min-w-0">
          {/* Title is kept for screen readers/SEO; shown visually from tablets up to save phone space */}
          <h1 className="sr-only text-2xl font-bold sm:not-sr-only sm:mb-1 sm:text-3xl">Profile</h1>
          <p className="sr-only text-gray-300 sm:not-sr-only sm:mb-4 sm:text-base">
            View your account information.
          </p>

          {/* Quick actions: text-only buttons */}
          <div className="mb-2.5 grid grid-cols-2 gap-2.5 sm:mb-4 sm:gap-4">
            <Link
              href="/customer-dashboard"
              className="rounded-xl bg-gradient-to-r from-[#00C2D1] to-[#7B2CBF] px-3 py-2.5 text-center text-sm font-semibold shadow-md shadow-[#7B2CBF]/30 transition hover:opacity-90 active:scale-[0.98] sm:px-4 sm:py-3 sm:text-base"
            >
              My Dashboard
            </Link>
            <Link
              href="/cart"
              className="rounded-xl border border-gray-600 bg-gray-800 px-3 py-2.5 text-center text-sm font-semibold transition hover:border-[#00C2D1] hover:bg-gray-700 active:scale-[0.98] sm:px-4 sm:py-3 sm:text-base"
            >
              My Cart
            </Link>
          </div>

          <div className="overflow-hidden rounded-2xl border border-gray-700 bg-gray-800 shadow-md">
            <div className="h-1 bg-gradient-to-r from-[#00C2D1] via-[#7B2CBF] to-[#FF3D9A]" />
            <div className="p-3 sm:p-5">
              <h2 className="mb-2 text-sm font-semibold sm:mb-4 sm:text-lg">Personal Information</h2>

              {/* One full-width row per detail on phones (so values are never cut), 2 columns from tablets up; tap a tile to copy it */}
              <div className="grid grid-cols-1 gap-1.5 text-gray-200 sm:grid-cols-2 sm:gap-4">
                {details.map((d) => {
                  const tile = (
                    <>
                      {/* Icon badge */}
                      <span
                        className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br ${d.tone} text-xs text-white shadow sm:h-10 sm:w-10 sm:text-base`}
                      >
                        {d.icon}
                      </span>

                      <span className="min-w-0 flex-1 text-left">
                        <span className={`block text-[10px] sm:text-xs ${copied === d.key ? 'text-[#00C2D1]' : 'text-gray-400'}`}>
                          {copied === d.key ? 'Copied' : d.label}
                        </span>
                        <span className="block text-sm font-semibold text-gray-100 [overflow-wrap:anywhere] sm:text-base" title={d.value}>
                          {d.value}
                        </span>
                      </span>
                    </>
                  );

                  const tileClass = `flex min-w-0 items-center gap-2 rounded-xl border border-gray-700 bg-gray-900/60 p-2 transition sm:gap-3 sm:p-3 ${
                    d.wide ? 'sm:col-span-2' : ''
                  }`;

                  return d.raw ? (
                    <button
                      key={d.key}
                      type="button"
                      onClick={() => copyValue(d.key, d.raw)}
                      title={`Tap to copy ${d.label.toLowerCase()}`}
                      className={`${tileClass} cursor-pointer hover:border-[#7B2CBF] hover:bg-gray-900 active:scale-[0.98]`}
                    >
                      {tile}
                    </button>
                  ) : (
                    <div key={d.key} className={tileClass}>
                      {tile}
                    </div>
                  );
                })}
              </div>
              <p className="mt-2 hidden text-xs text-gray-500 sm:block">Tap a detail to copy it.</p>
            </div>
          </div>
        </main>
      </div>

      {/* Logout confirmation dialog */}
      {confirmOpen && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
          onClick={() => {
            if (!loggingOut) setConfirmOpen(false);
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="logout-title"
            aria-describedby="logout-desc"
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-sm overflow-hidden rounded-2xl border border-white/10 bg-gray-800 shadow-2xl shadow-black/50"
          >
            <div className="h-1 bg-gradient-to-r from-[#00C2D1] via-[#7B2CBF] to-[#FF3D9A]" />
            <div className="p-5 text-center sm:p-6">
              <h3 id="logout-title" className="text-lg font-bold text-white sm:text-xl">
                Log out of your account?
              </h3>
              <p id="logout-desc" className="mt-2 text-sm text-gray-300">
                You&apos;ll need to log in again to see your orders, cart and profile.
              </p>

              <div className="mt-5 grid grid-cols-2 gap-3">
                <button
                  type="button"
                  autoFocus
                  disabled={loggingOut}
                  onClick={() => setConfirmOpen(false)}
                  className="rounded-full border border-gray-600 px-4 py-2.5 text-sm font-semibold text-gray-200 transition hover:border-[#00C2D1] hover:bg-gray-700 disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={loggingOut}
                  onClick={handleConfirmLogout}
                  className="rounded-full bg-red-600 px-4 py-2.5 text-sm font-semibold text-white shadow-md shadow-red-900/40 transition hover:bg-red-700 active:scale-95 disabled:opacity-50"
                >
                  {loggingOut ? 'Logging out...' : 'Log out'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfilePage;