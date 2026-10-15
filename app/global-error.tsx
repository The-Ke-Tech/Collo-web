'use client';

import './globals.css';
import { useEffect } from 'react';
import StatusPage from '@/components/status-page';
import { ServerErrorIllustration } from '@/components/illustrations';
import { isNetworkError, redirectToNetworkError } from '@/helpers/network';

// Next.js uses this screen if the root layout itself crashes.
// It must render its own <html> and <body> elements.
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
    if (isNetworkError(error)) redirectToNetworkError();
  }, [error]);

  return (
    <html lang="en">
      <body className="m-0 min-h-screen bg-[#050711] text-gray-100 antialiased">
        <StatusPage
          overlay
          fullScreen
          code="500"
          tone="danger"
          wide
          illustration={<ServerErrorIllustration className="mx-auto block h-auto w-full max-w-[520px]" />}
          title="COLLTECH hit an unexpected error"
          description="The page could not finish loading. Try again, or return to the homepage and continue from there."
          primary={{ label: 'Try again', onClick: reset }}
          secondary={{ label: 'Back to homepage', href: '/' }}
        >
          {error.digest ? (
            <p className="mt-4 text-xs text-slate-500">Reference: {error.digest}</p>
          ) : null}
        </StatusPage>
      </body>
    </html>
  );
}
