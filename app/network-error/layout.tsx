import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Connection problem | COLLTECH',
  description: 'COLLTECH could not load the requested content. Check your internet connection and try again.',
  robots: { index: false, follow: false },
};

export default function NetworkErrorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}