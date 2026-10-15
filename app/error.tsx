'use client';

import { useEffect } from 'react';
import StatusPage from '@/components/status-page';
import { ServerErrorIllustration } from '@/components/illustrations';
import { isNetworkError, redirectToNetworkError } from '@/helpers/network';

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Keep technical details in developer tools only.
    console.error(error);
    // Network failures use the dedicated connection page instead.
    if (isNetworkError(error)) redirectToNetworkError();
  }, [error]);

  return (
    <StatusPage
      overlay
      fullScreen
      code="500"
      tone="danger"
      wide
      illustration={<ServerErrorIllustration className="mx-auto block h-auto w-full max-w-[520px]" />}
      title="Something went wrong"
      description="We couldn't complete that action because something unexpected happened. Please try again. If the problem continues, come back in a few minutes."
      primary={{ label: 'Try again', onClick: reset }}
      secondary={{ label: 'Back to homepage', href: '/' }}
    >
      {error.digest ? (
        <p className="mt-4 text-xs text-slate-500">Reference: {error.digest}</p>
      ) : null}
    </StatusPage>
  );
}
