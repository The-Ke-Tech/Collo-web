import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import { ReduxProvider } from '@/components/ReduxProvider';
import { ClientLayout } from '@/components/ClientLayout';

const geistSans = Geist({ variable: '--font-geist-sans', subsets: ['latin'] });
const geistMono = Geist_Mono({ variable: '--font-geist-mono', subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'COLTECH - Your Tech & Office Partner',
  description:
    'Shop earphones, routers, Bluetooth speakers, office supplies, and more at COLLTECH.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased 
        bg-gradient-to-b from-black via-gray-900 to-gray-800 
        text-gray-300 transition-colors duration-500`}
      >
        <ReduxProvider>
          <ClientLayout>{children}</ClientLayout>
        </ReduxProvider>
      </body>
    </html>
  );
}
