import type { Metadata } from 'next';
import StatusPage from '@/components/status-page';
import { MaintenanceIllustration } from '@/components/illustrations';

export const metadata: Metadata = {
  title: 'System maintenance | COLLTECH',
  description: 'COLLTECH is carrying out scheduled system maintenance. Please check back shortly.',
  robots: { index: false, follow: false },
};

export default function MaintenancePage() {
  return (
    <StatusPage
      overlay
      fullScreen
      code="503"
      tone="brand"
      wide
      illustration={<MaintenanceIllustration className="mx-auto block h-auto w-full max-w-[640px]" />}
      title="We're making COLLTECH better"
      description="Our team is upgrading the system. Some services are temporarily unavailable, so please check again shortly."
      primary={{ label: 'Check again', reload: true }}
      secondary={{ label: 'Back to homepage', href: '/' }}
    >
      {/* Always visible; on very short screens the whole card scrolls so nothing is cut off */}
      <div className="mx-auto mt-3 flex max-w-lg items-center justify-center gap-3 rounded-2xl border border-[#00C2D1]/20 bg-[#00C2D1]/[.06] px-4 py-2 text-left sm:mt-5 sm:py-3">
        <span className="relative flex h-2.5 w-2.5 shrink-0">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#00C2D1] opacity-50" />
          <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-[#00C2D1]" />
        </span>
        <span className="text-xs leading-5 text-slate-300 sm:text-sm sm:leading-6">
          Maintenance in progress. Your patience is appreciated.
        </span>
      </div>
    </StatusPage>
  );
}