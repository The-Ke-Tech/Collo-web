'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';

export interface StatusAction {
  label: string;
  href?: string;
  onClick?: () => void;
  /** Reloads the current page (handy for "Check again" / "Refresh page") */
  reload?: boolean;
  disabled?: boolean;
}

interface StatusPageProps {
  /** Error code shown as a small badge, e.g. "404" */
  code?: string;
  /** Large vector illustration; it scales down so the whole page fits on screen */
  illustration?: React.ReactNode;
  /** Optional round icon badge (used when there is no illustration) */
  icon?: React.ReactNode;
  title: string;
  description: string;
  primary?: StatusAction;
  secondary?: StatusAction;
  /** Small quick links shown under the buttons */
  links?: { label: string; href: string }[];
  /** Fills the whole screen (header and footer hidden behind it) and locks scrolling */
  overlay?: boolean;
  /** Kept for compatibility: min-h-screen when not an overlay */
  fullScreen?: boolean;
  /** Bigger card, used when the illustration needs more room */
  wide?: boolean;
  tone?: 'brand' | 'warning' | 'danger';
  /** Content between the description and the buttons */
  children?: React.ReactNode;
  /** Content below the buttons (e.g. a text link) */
  footer?: React.ReactNode;
}

const TONES = {
  brand: 'from-[#00C2D1] via-[#7B2CBF] to-[#FF3D9A]',
  warning: 'from-[#FFB020] via-[#FF3D9A] to-[#7B2CBF]',
  danger: 'from-[#FF3D9A] via-[#7B2CBF] to-[#3A86FF]',
};

const primaryClass =
  'inline-flex min-w-[140px] flex-1 items-center justify-center rounded-full bg-gradient-to-r from-[#00C2D1] to-[#7B2CBF] px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-[#7B2CBF]/30 transition hover:opacity-90 active:scale-95 disabled:cursor-not-allowed disabled:opacity-60 sm:flex-none sm:px-7 sm:py-3';
const secondaryClass =
  'inline-flex min-w-[140px] flex-1 items-center justify-center rounded-full border border-gray-600 px-5 py-2.5 text-sm font-semibold text-gray-200 transition hover:border-[#00C2D1] hover:bg-gray-800 active:scale-95 disabled:cursor-not-allowed disabled:opacity-60 sm:flex-none sm:px-7 sm:py-3';

function Action({ action, className }: { action: StatusAction; className: string }) {
  if (action.href) {
    return (
      <Link href={action.href} className={className}>
        {action.label}
      </Link>
    );
  }

  const handleClick = () => {
    if (action.reload) {
      window.location.reload();
      return;
    }
    action.onClick?.();
  };

  return (
    <button type="button" onClick={handleClick} disabled={action.disabled} className={className}>
      {action.label}
    </button>
  );
}

export default function StatusPage({
  code,
  illustration,
  icon,
  title,
  description,
  primary,
  secondary,
  links,
  overlay,
  fullScreen,
  wide,
  tone = 'brand',
  children,
  footer,
}: StatusPageProps) {
  // The overlay covers the whole screen, so the page behind it must not scroll
  useEffect(() => {
    if (!overlay) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previous;
    };
  }, [overlay]);

  // With a single action (e.g. only "Back to homepage") it is shown as the main button
  const first = primary ?? secondary;
  const second = primary ? secondary : undefined;

  const outer = overlay
    ? 'fixed inset-0 z-[99999] h-dvh overflow-hidden p-3 sm:p-6'
    : `${
        fullScreen ? 'min-h-screen' : 'min-h-[calc(100dvh-var(--header-h,132px)-12px)]'
      } overflow-hidden px-3 py-6 sm:px-4 sm:py-10`;

  return (
    <section
      className={`relative flex items-center justify-center bg-gradient-to-b from-black via-gray-900 to-gray-800 text-gray-200 ${outer}`}
    >
      {/* Ambient glows (same as the other pages) */}
      <div aria-hidden className="pointer-events-none absolute -top-24 left-[-10%] h-80 w-80 rounded-full bg-[#00C2D1]/15 blur-3xl" />
      <div aria-hidden className="pointer-events-none absolute bottom-0 right-[-10%] h-96 w-96 rounded-full bg-[#7B2CBF]/20 blur-3xl" />

      {/* max-h-full: the card can never be taller than the screen, so nothing needs scrolling */}
      <div
        className={`relative flex max-h-full w-full ${
          wide ? 'max-w-3xl' : 'max-w-xl'
        } flex-col overflow-y-auto overflow-x-hidden overscroll-contain rounded-2xl border border-white/10 bg-gray-900/80 text-center shadow-2xl shadow-black/40 backdrop-blur`}
      >
        <div className={`h-1.5 shrink-0 bg-gradient-to-r ${TONES[tone]}`} />

        {/* Illustration: fills the free height and shrinks to fit (vector, so it stays sharp) */}
        {illustration && (
          <div className="relative mx-3 mt-2 min-h-[64px] flex-1 basis-[clamp(120px,30dvh,400px)] sm:mx-8 sm:mt-4 [@media(max-height:460px)]:hidden [&>svg]:absolute [&>svg]:inset-0 [&>svg]:h-full [&>svg]:w-full">
            {illustration}
          </div>
        )}

        <div
          className={`flex shrink-0 flex-col items-center px-4 pb-3 sm:px-10 sm:pb-8 ${
            illustration ? 'pt-1 sm:pt-3' : 'pt-6 sm:pt-10'
          }`}
        >
          {!illustration && icon && (
            <div
              className={`mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br ${TONES[tone]} text-2xl text-white shadow-lg`}
            >
              {icon}
            </div>
          )}

          {code && (
            <span className="inline-block rounded-full border border-white/15 bg-white/5 px-3 py-0.5 text-[10px] font-semibold uppercase tracking-widest text-gray-300 sm:py-1 sm:text-[11px]">
              Error {code}
            </span>
          )}

          <h1 className="mt-2 text-lg font-bold tracking-tight text-white sm:mt-3 sm:text-2xl lg:text-3xl">
            {title}
          </h1>
          {/* Hidden only on very short screens (e.g. phones held sideways) so the buttons stay on screen */}
          <p className="mx-auto mt-1.5 max-w-lg text-xs leading-relaxed text-gray-400 sm:mt-2 sm:text-sm lg:text-base [@media(max-height:520px)]:hidden">
            {description}
          </p>

          {children}

          {(first || second) && (
            <div className="mt-4 flex w-full flex-wrap items-center justify-center gap-2 sm:mt-6 sm:gap-3">
              {first && <Action action={first} className={primaryClass} />}
              {second && <Action action={second} className={secondaryClass} />}
            </div>
          )}

          {footer}

          {links && links.length > 0 && (
            <div className="mt-4 w-full border-t border-white/10 pt-3 sm:mt-6 sm:pt-4 [@media(max-height:640px)]:hidden">
              <div className="flex flex-wrap justify-center gap-2">
                {links.map((l) => (
                  <Link
                    key={l.href}
                    href={l.href}
                    className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-medium text-gray-300 transition hover:border-[#00C2D1] hover:text-white"
                  >
                    {l.label}
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}