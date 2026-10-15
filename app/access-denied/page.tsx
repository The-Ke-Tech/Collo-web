import type { Metadata } from 'next';
import StatusPage from '@/components/status-page';
import { AccessDeniedIllustration } from '@/components/illustrations';

export const metadata: Metadata = {
  title: 'Access denied | COLLTECH',
  robots: { index: false, follow: false },
};

export default function AccessDeniedPage() {
  return (
    <StatusPage
      overlay
      fullScreen
      code="403"
      tone="warning"
      wide
      illustration={<AccessDeniedIllustration className="mx-auto block h-auto w-full max-w-[480px]" />}
      title="You don't have access to this page"
      description="Your current account or session isn't permitted to open this page. Return safely to the homepage to continue."
      // Trying again can't change permissions, so the only action is going home
      primary={{ label: 'Back to homepage', href: '/' }}
    />
  );
}