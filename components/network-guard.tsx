'use client';

import { useEffect, useState } from 'react';
import StatusPage from '@/components/status-page';
import { NoConnectionIllustration } from '@/components/illustrations';
import { isNetworkError, redirectToNetworkError } from '@/helpers/network';

/**
 * Mounted once in ClientLayout.
 *
 *  - Device offline  -> a full-screen "You're offline" screen is shown on top of the page.
 *                       It has NO links (there is nowhere to go without a connection), keeps whatever
 *                       the visitor was typing, and disappears by itself when the connection returns.
 *  - Device online but a request fails with a raw network error nobody handled
 *                    -> the server is unreachable, so the visitor is sent to /network-error.
 */
export default function NetworkGuard() {
  const [offline, setOffline] = useState(false);

  useEffect(() => {
    setOffline(!navigator.onLine);

    const onOffline = () => setOffline(true);
    const onOnline = () => setOffline(false);

    const onRejection = (e: PromiseRejectionEvent) => {
      if (!isNetworkError(e.reason)) return;
      e.preventDefault(); // keep the raw "Failed to fetch" out of the console overlay
      if (!navigator.onLine) setOffline(true);
      else redirectToNetworkError();
    };

    window.addEventListener('offline', onOffline);
    window.addEventListener('online', onOnline);
    window.addEventListener('unhandledrejection', onRejection);
    return () => {
      window.removeEventListener('offline', onOffline);
      window.removeEventListener('online', onOnline);
      window.removeEventListener('unhandledrejection', onRejection);
    };
  }, []);

  if (!offline) return null;

  return (
    <StatusPage
      overlay
      tone="warning"
      wide
      illustration={<NoConnectionIllustration className="mx-auto block h-auto w-full max-w-[560px]" />}
      title="You're offline"
      description="Your device isn't connected to the internet. Check your Wi-Fi or mobile data, and this screen will disappear as soon as you're back online."
      primary={{ label: 'Check connection', onClick: () => setOffline(!navigator.onLine) }}
    />
  );
}