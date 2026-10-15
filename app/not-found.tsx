import type { Metadata } from 'next';
import StatusPage from '@/components/status-page';
import { NotFoundIllustration } from '@/components/illustrations';

export const metadata: Metadata = {
  title: 'Page not found | COLLTECH',
  robots: { index: false, follow: false },
};

export default function NotFound() {
  return (
    <StatusPage
      overlay
      fullScreen
      code="404"
      tone="brand"
      wide
      illustration={<NotFoundIllustration className="mx-auto block h-auto w-full max-w-[520px]" />}
      title="We couldn't find that page"
      description="The page may have moved, the address may be incorrect, or the page may no longer be available. Head back to the homepage to keep browsing."
      // Reloading a missing page can't fix it, so the only action is going home
      primary={{ label: 'Back to homepage', href: '/' }}
    />
  );
}