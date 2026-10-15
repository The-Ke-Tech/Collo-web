'use client';

import React, { Suspense, useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import StatusPage from '@/components/status-page';
import { NoConnectionIllustration } from '@/components/illustrations';
import { getSafeReturnPath } from '@/helpers/network';

const API_URL = process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, '') ?? '';
const AUTO_RETRY_SECONDS = 12;
const PROBE_TIMEOUT_MS = 6000;

type ServerStatus = 'checking' | 'unreachable';
type Tone = 'ok' | 'bad' | 'wait' | 'idle';

const DOT: Record<Tone, string> = {
  ok: 'bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,.6)]',
  bad: 'bg-rose-400 shadow-[0_0_10px_rgba(251,113,133,.55)]',
  wait: 'bg-amber-400 shadow-[0_0_10px_rgba(251,191,36,.55)]',
  idle: 'bg-slate-500',
};

const TEXT: Record<Tone, string> = {
  ok: 'text-emerald-300',
  bad: 'text-rose-300',
  wait: 'text-amber-300',
  idle: 'text-slate-400',
};

// Compact status tile: two sit side by side. Sizes step up at sm and lg so laptops get roomier tiles.
function StatusTile({
  label,
  value,
  tone,
  pulse,
}: {
  label: string;
  value: string;
  tone: Tone;
  pulse?: boolean;
}) {
  return (
    <div className="min-w-0 rounded-xl border border-white/[.06] bg-white/[.04] px-2.5 py-1.5 text-left sm:px-3 sm:py-2 lg:px-4 lg:py-2.5">
      <p className="truncate text-[10px] uppercase tracking-wider text-slate-500 sm:text-[11px] lg:text-xs">{label}</p>
      <p className={`mt-0.5 flex items-center gap-1.5 text-xs font-semibold tabular-nums sm:text-sm lg:mt-1 lg:text-base ${TEXT[tone]}`}>
        <span
          aria-hidden="true"
          className={`h-2 w-2 shrink-0 rounded-full lg:h-2.5 lg:w-2.5 ${DOT[tone]} ${pulse ? 'animate-pulse motion-reduce:animate-none' : ''}`}
        />
        <span className="truncate">{value}</span>
      </p>
    </div>
  );
}

function NetworkErrorContent() {
  const searchParams = useSearchParams();
  const returnTo = getSafeReturnPath(searchParams.get('from'));
  const [offline, setOffline] = useState(false);
  const [checking, setChecking] = useState(false);
  const [failedOnce, setFailedOnce] = useState(false);
  const [serverStatus, setServerStatus] = useState<ServerStatus>('checking');
  const [lastChecked, setLastChecked] = useState<string | null>(null);
  const [secondsLeft, setSecondsLeft] = useState(AUTO_RETRY_SECONDS);
  const busy = useRef(false);
  const countdown = useRef(AUTO_RETRY_SECONDS);

  const stamp = () => {
    setLastChecked(
      new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
    );
  };

  const checkConnection = useCallback(async () => {
    if (busy.current) return;

    // Restart the automatic-retry countdown after every check
    countdown.current = AUTO_RETRY_SECONDS;
    setSecondsLeft(AUTO_RETRY_SECONDS);

    if (typeof navigator !== 'undefined' && !navigator.onLine) {
      setOffline(true);
      setFailedOnce(true);
      setServerStatus('unreachable');
      stamp();
      return;
    }

    busy.current = true;
    setChecking(true);
    setServerStatus('checking');
    const controller = new AbortController();
    const timer = window.setTimeout(() => controller.abort(), PROBE_TIMEOUT_MS);

    try {
      // Any HTTP response means the API host can be reached; HTTP errors are
      // handled by the actual page request after we navigate back.
      // "no-cors" for a cross-origin API: the response is opaque, but fetch only
      // throws on real network failures, not on CORS rules.
      const probeUrl = API_URL ? `${API_URL}/api/services` : '/api/services';
      await fetch(probeUrl, {
        cache: 'no-store',
        signal: controller.signal,
        mode: API_URL ? 'no-cors' : 'same-origin',
        credentials: 'same-origin',
      });
      window.location.replace(returnTo);
    } catch {
      setFailedOnce(true);
      setServerStatus('unreachable');
    } finally {
      stamp();
      window.clearTimeout(timer);
      busy.current = false;
      setChecking(false);
    }
  }, [returnTo]);

  useEffect(() => {
    setOffline(!navigator.onLine);

    const handleOnline = () => {
      setOffline(false);
      void checkConnection();
    };
    const handleOffline = () => setOffline(true);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // One-second tick: drives the countdown and runs the automatic re-check at zero.
    // Skipped while the tab is hidden so we don't poll in the background.
    const interval = window.setInterval(() => {
      if (document.hidden) return;
      countdown.current -= 1;
      if (countdown.current <= 0) {
        countdown.current = AUTO_RETRY_SECONDS;
        if (navigator.onLine) void checkConnection();
      }
      setSecondsLeft(countdown.current);
    }, 1000);

    const handleVisible = () => {
      if (!document.hidden && navigator.onLine) void checkConnection();
    };
    document.addEventListener('visibilitychange', handleVisible);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      document.removeEventListener('visibilitychange', handleVisible);
      window.clearInterval(interval);
    };
  }, [checkConnection]);

  const serverValue = offline
    ? 'Unavailable'
    : checking
      ? 'Checking…'
      : serverStatus === 'unreachable'
        ? 'Not responding'
        : 'Checking…';
  const serverTone: Tone = offline ? 'idle' : serverStatus === 'unreachable' && !checking ? 'bad' : 'wait';
  const progress = offline ? 0 : ((AUTO_RETRY_SECONDS - secondsLeft) / AUTO_RETRY_SECONDS) * 100;

  return (
    <StatusPage
      tone="warning"
      wide
      illustration={
        // StatusPage reserves a height for this area (about 30% of the screen). Our own
        // absolutely-filled box makes the illustration fill it and scale to fit
        // (object-contain never stretches it).
        <div className="absolute inset-0 flex items-center justify-center">
          <NoConnectionIllustration className="h-full w-full max-w-[640px] object-contain" />
        </div>
      }
      title="Failed to load the products"
      // Short on purpose: the diagnostics below carry the details, so the buttons stay on screen on small phones
      description="Check your internet connection and try again. If it's working, our servers may be temporarily unavailable."
      primary={{
        label: checking ? 'Checking…' : 'Check connection',
        onClick: checkConnection,
        disabled: checking,
      }}
      secondary={{ label: 'Refresh page', reload: true }}
      footer={
        // Offline = nowhere to go, so the homepage link only appears when a connection exists
        !offline ? (
          <Link
            href="/"
            className="mt-2 rounded-md px-2 py-1 text-xs font-medium text-slate-400 underline-offset-4 transition-colors hover:text-white hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00C2D1] sm:mt-3 sm:text-sm"
          >
            Back to homepage
          </Link>
        ) : null
      }
    >
      {/* Live diagnostics. The page scrolls normally, so this never needs to be hidden. */}
      <section
        aria-label="Connection diagnostics"
        className="mx-auto mt-2 w-full max-w-md rounded-2xl border border-white/10 bg-white/[.035] p-2 sm:mt-4 sm:p-3 lg:mt-5 lg:max-w-xl lg:p-4"
      >
        <div className="grid grid-cols-2 gap-2 lg:gap-3">
          <StatusTile label="Your device" value={offline ? 'Offline' : 'Online'} tone={offline ? 'bad' : 'ok'} />
          <StatusTile label="COLLTECH servers" value={serverValue} tone={serverTone} pulse={checking} />
        </div>

        <div className="mt-2 lg:mt-3">
          <div
            role="progressbar"
            aria-label="Time until next automatic check"
            aria-valuemin={0}
            aria-valuemax={AUTO_RETRY_SECONDS}
            aria-valuenow={AUTO_RETRY_SECONDS - secondsLeft}
            className="h-1 w-full overflow-hidden rounded-full bg-white/10 lg:h-1.5"
          >
            <div
              className="h-full rounded-full bg-gradient-to-r from-[#00C2D1] to-[#7B2CBF] transition-[width] duration-1000 ease-linear motion-reduce:transition-none"
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="mt-1 flex items-center justify-between gap-2 text-[10px] text-slate-500 sm:text-xs lg:mt-1.5 lg:text-sm">
            <p role="status" aria-live="polite" className="min-w-0 truncate text-left">
              {offline
                ? "We'll reconnect when you're back online."
                : failedOnce && !checking
                  ? `Can't reach the service. Retrying in ${secondsLeft}s`
                  : `Checking again in ${secondsLeft}s`}
            </p>
            {lastChecked && <span className="hidden shrink-0 tabular-nums sm:inline">Last checked {lastChecked}</span>}
          </div>
        </div>
      </section>
    </StatusPage>
  );
}

export default function NetworkErrorPage() {
  return (
    <Suspense
      fallback={
        <main
          className="grid min-h-[60dvh] place-items-center px-5 text-center text-slate-300"
          aria-label="Loading connection status"
        >
          <div className="h-10 w-10 animate-spin rounded-full border-2 border-white/15 border-t-[#00C2D1] motion-reduce:animate-none" />
        </main>
      }
    >
      <NetworkErrorContent />
    </Suspense>
  );
}