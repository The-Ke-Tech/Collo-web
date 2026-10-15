import type { Metadata, Viewport } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import { ClientLayout } from '@/components/ClientLayout';
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const geistSans = Geist({ variable: '--font-geist-sans', subsets: ['latin'] });
const geistMono = Geist_Mono({ variable: '--font-geist-mono', subsets: ['latin'] });

// Modern independent viewport object module export keeping your exact theme color configuration intact
export const viewport: Viewport = {
  themeColor: '#00C2D1',
};

export const metadata: Metadata = {
  metadataBase: new URL('http://localhost:3000'),
  title: 'COLLTECH - Tech & Office Supplies | Earphones, Routers, Printers & More',
  description: 'Shop high-quality tech gadgets and office supplies at COLLTECH. From earphones, routers, Bluetooth speakers, and printers to premium office essentials — we are your trusted tech & office partner in Kenya.',
  keywords: [
    'tech gadgets Kenya',
    'office supplies Nairobi',
    'earphones online shop',
    'Bluetooth speakers Kenya',
    'routers Nairobi',
    'printers Kenya',
    'COLLTECH shop'
  ],
  authors: [{ name: 'COLLTECH Team', url: 'https://www.colltechhub.com' }],
  creator: 'COLLTECH',
  publisher: 'COLLTECH',
  openGraph: {
    title: 'COLLTECH - Your Tech & Office Partner',
    description: 'Find premium gadgets and office supplies at affordable prices. Shop earphones, routers, printers, and more at COLLTECH Kenya.',
    url: 'https://www.colltechhub.com',
    siteName: 'COLLTECH',
    images: [
      {
        url: 'https://www.colltechhub.com/opengraph-image.png',
        width: 1200,
        height: 630,
        alt: 'COLLTECH - Tech & Office Supplies',
      },
    ],
    locale: 'en_KE',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'COLLTECH - Your Tech & Office Partner',
    description: 'Shop tech gadgets & office supplies: earphones, routers, printers & more. COLLTECH is your trusted tech & office partner in Kenya.',
    images: ['https://www.colltechhub.com/opengraph-image.png'],
    creator: '@COLLTECH_KE',
  },
  alternates: {
    canonical: 'https://www.colltechhub.com',
  },
  robots: {
    index: true,
    follow: true,
  },
  icons: {
    icon: '/favicon.ico',
    apple: '/apple-touch-icon.png',
    shortcut: '/favicon.ico',
  },
};

const BASE_URL = 'https://www.colltechhub.com';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Verification Meta */}
        <meta name="google-site-verification" content="73p9RpqwG7S8VmzC1VL25-2OArnPVs4dPMiBdyOkXIE" />
        <meta name="yandex-verification" content="YOUR_YANDEX_VERIFICATION_CODE" />
        <meta name="msvalidate.01" content="YOUR_BING_VERIFICATION_CODE" />

        {/* JSON-LD Structured Data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify([
              // Organization
              {
                "@context": "https://schema.org",
                "@type": "Organization",
                "name": "COLLTECH",
                "url": BASE_URL,
                "logo": `${BASE_URL}/logo.png`,
                "sameAs": [
                  "https://www.facebook.com/share/1AsYch1TgY/",
                  "https://x.com/Colltech_?t=jSzzUB5EdP_scsjNpjkSKA&s=08",
                  "https://www.instagram.com/COLLTECH",
                  "https://www.tiktok.com/@colltechaccessori?_t=ZM-8yZPmRqhauG&_r=1"
                ],
                "contactPoint": [
                  {
                    "@type": "ContactPoint",
                    "telephone": "+254700000000",
                    "contactType": "Customer Support",
                    "areaServed": "KE",
                    "availableLanguage": ["en", "sw"]
                  }
                ]
              },
              // Website + SearchAction
              {
                "@context": "https://schema.org",
                "@type": "WebSite",
                "url": BASE_URL,
                "name": "COLLTECH",
                "potentialAction": {
                  "@type": "SearchAction",
                  "target": `${BASE_URL}/search-product?q={search_term_string}`,
                  "query-input": "required name=search_term_string"
                }
              },
              // BreadcrumbList (Dynamic pages included)
              {
                "@context": "https://schema.org",
                "@type": "BreadcrumbList",
                "itemListElement": [
                  { "@type": "ListItem", "position": 1, "name": "Home", "item": BASE_URL },
                  { "@type": "ListItem", "position": 2, "name": "Shop", "item": `${BASE_URL}/shop` },
                  { "@type": "ListItem", "position": 3, "name": "Products", "item": `${BASE_URL}/category-product` },
                  { "@type": "ListItem", "position": 4, "name": "Services", "item": `${BASE_URL}/category-service` }
                ]
              }
            ]),
          }}
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased 
        bg-gradient-to-b from-[#00C2D1] via-[#4B3F72] to-[#7B2CBF] 
        text-gray-100 transition-colors duration-500`}
      >
        <ClientLayout>{children}</ClientLayout>
        <ToastContainer position="top-center" />
      </body>
    </html>
  );
}