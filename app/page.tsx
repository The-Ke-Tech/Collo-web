import CategoryList from '@/components/CategoryList'
import HorizontalCardProduct from '@/components/HorizontalCardProduct'
import VerticalCardProduct from '@/components/VerticalCardProduct'
import React from 'react'
import { Metadata } from 'next'
import AnimatedHeading from '@/components/home-header'
import ClientBanners from '@/components/client-banners'
import ServiceSection from '@/components/services'
import SectionHeading from '@/components/section-heading'
import MarqueeStrip from '@/components/marquee-strip'
import LazyMount from '@/components/lazy-mount'
import CyberServices from '@/components/cyber-services'
import GamingZone from '@/components/gaming-zone'

export const metadata: Metadata = {
  title: 'COLLTECH - Tech Gadgets, Printing Services & Gaming in Kenya',
  description:
    'Shop top-quality tech gadgets, phone accessories, routers, printers, stationery and office supplies at COLLTECH Kenya. Photocopying, printing, branding and a PS5 FIFA gaming lounge too.',
  keywords: [
    'tech gadgets Kenya',
    'phone accessories Nairobi',
    'routers Kenya',
    'Bluetooth speakers Kenya',
    'printers Nairobi',
    'stationery online Kenya',
    'photocopying and printing Nairobi',
    'branding services Kenya',
    'PS5 gaming FIFA Nairobi',
    'COLLTECH shop',
  ],
  openGraph: {
    title: 'COLLTECH - Tech, Print Services & Gaming in Kenya',
    description:
      'Shop the best tech gadgets, routers, stationery and office essentials, plus printing, branding and PS5 gaming at COLLTECH Kenya.',
    url: process.env.NEXT_PUBLIC_BASE_URL,
    siteName: 'COLLTECH',
    images: [
      {
        url: `${process.env.NEXT_PUBLIC_BASE_URL}/opengraph-image.png`,
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
    title: 'COLLTECH - Tech, Print Services & Gaming',
    description:
      'Discover the best tech gadgets and office supplies in Kenya at COLLTECH. Routers, printers, stationery, printing services and PS5 gaming.',
    images: [`${process.env.NEXT_PUBLIC_BASE_URL}/opengraph-image.png`],
    creator: '@COLLTECH_KE',
  },
  alternates: { canonical: process.env.NEXT_PUBLIC_BASE_URL },
}

export default function Page() {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL

  return (
    // 📐 Lowered padding bottom to compress spatial density cleanly
    // 📱 Content is capped at 2000px and centred, so ultra-wide monitors don't stretch it endlessly
    // 🧭 Top clearance from the fixed header now comes from ClientLayout (measured header height);
    //    pt-1/2/3 here is just a little extra breathing room before the first block.
    <div className="relative overflow-x-hidden pt-1 pb-6 bg-gray-900 sm:pt-2 sm:pb-8 md:pt-3">
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-0">
        <div className="absolute -top-24 left-[-10%] h-[420px] w-[420px] rounded-full bg-[#00C2D1]/15 blur-3xl" />
        <div className="absolute top-[900px] right-[-10%] h-[480px] w-[480px] rounded-full bg-[#7B2CBF]/20 blur-3xl" />
        <div className="absolute top-[1800px] left-[-10%] h-[420px] w-[420px] rounded-full bg-[#FF3D9A]/10 blur-3xl" />
      </div>

      <div className="relative z-10 mx-auto w-full max-w-[2000px]">
        <h1 className="sr-only">
          COLLTECH: Tech Gadgets, Printing Services & Gaming in Kenya
        </h1>

        {/* 📐 Stretched to w-full edge-to-edge layout with minimized mobile paddings */}
        <div className="w-full mt-1 px-1.5 sm:mt-2 sm:px-3 md:mt-3 md:px-4">
          <AnimatedHeading />
        </div>

        {/* Marquee right after the home header card */}
        <MarqueeStrip />

        {/* 🖼️ Banners now sit directly after the marquee */}
        <div className="w-full mt-1.5 px-1.5 overflow-hidden sm:mt-2 sm:px-3 md:px-4">
          <ClientBanners />
        </div>

        {/* 📐 Collapsed vertical spaces completely to 0. Rows are separated strictly by headings */}
        <section className="mt-0 w-full">
          <SectionHeading title="Shop Top Phone Accessories" />
          <HorizontalCardProduct category="phone-accessories" heading="Top Phone Accessories" action="view" />
        </section>

        {/* ⚡ Everything below the first row loads only when you scroll near it (faster first load) */}
        <LazyMount minHeight={220}>
          <section className="mt-0 w-full">
            <SectionHeading title="Best Computer Accessories for Every Need" />
            <HorizontalCardProduct category="computer-accessories" heading="Best Computer Accessories" />
          </section>
        </LazyMount>

        <LazyMount minHeight={220}>
          <section className="mt-0 w-full">
            <SectionHeading title="Office & School Stationery" />
            <VerticalCardProduct category="stationery" heading="Stationery" />
          </section>
        </LazyMount>

        <LazyMount minHeight={220}>
          <section className="mt-0 w-full">
            <SectionHeading title="Electronics & Smart Gadgets" />
            <VerticalCardProduct category="electronics" heading="Electronics & Gadgets" />
          </section>
        </LazyMount>

        <LazyMount minHeight={220}>
          <section className="mt-0 w-full">
            <SectionHeading title="Internet Accessories for Home & Office" />
            <VerticalCardProduct category="internet-accessories" heading="Internet Accessories" />
          </section>
        </LazyMount>

        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify([
              {
                "@context": "https://schema.org",
                "@type": "WebSite",
                "url": baseUrl,
                "name": "COLLTECH",
                "potentialAction": {
                  "@type": "SearchAction",
                  "target": `${baseUrl}/search-product?q={search_term_string}`,
                  "query-input": "required name=search_term_string"
                }
              },
              {
                "@context": "https://schema.org",
                "@type": "Organization",
                "name": "COLLTECH",
                "url": baseUrl,
                "logo": `${baseUrl}/logo.png`,
                "sameAs": [
                  "https://facebook.com",
                  "https://x.com",
                  "https://instagram.com",
                  "https://tiktok.com"
                ],
                "contactPoint": [
                  {
                    "@type": "ContactPoint",
                    "telephone": "+254728619730",
                    "contactType": "Customer Support",
                    "areaServed": "KE",
                    "availableLanguage": ["en", "sw"]
                  }
                ]
              },
              {
                "@context": "https://schema.org",
                "@type": "BreadcrumbList",
                "itemListElement": [
                  { "@type": "ListItem", "position": 1, "name": "Home", "item": baseUrl },
                  { "@type": "ListItem", "position": 2, "name": "Shop", "item": `${baseUrl}/shop` },
                  { "@type": "ListItem", "position": 3, "name": "Categories", "item": `${baseUrl}/category-product` },
                  { "@type": "ListItem", "position": 4, "name": "Services", "item": `${baseUrl}/category-service` }
                ]
              },
              {
                "@context": "https://schema.org",
                "@type": "ItemList",
                "name": "COLLTECH cyber, print and gaming services",
                "itemListElement": [
                  "Photocopying",
                  "Printing",
                  "Branding",
                  "Scanning & PDF",
                  "Lamination & Binding",
                  "Typing & Document Prep",
                  "Passport Photos",
                  "Internet Browsing",
                  "PS5 FIFA Gaming Lounge"
                ].map((name, i) => ({
                  "@type": "ListItem",
                  "position": i + 1,
                  "item": { "@type": "Service", "name": name, "provider": { "@type": "Organization", "name": "COLLTECH" } }
                }))
              }
            ])
          }}
        />

        {/* 🛍️ Shop & services by category, placed before the cyber services */}
        <LazyMount minHeight={260}>
          <CategoryList />
        </LazyMount>

        {/* 🛎️ "Book Our Services Now!" heading moved here from services.tsx so every section is managed from one place */}
        <LazyMount minHeight={240}>
          <section className="mt-1 w-full">
            <SectionHeading
              title="Book Our Services Now!"
              subtitle="Professional services you can book online."
            />
            <ServiceSection />
          </section>
        </LazyMount>

        <div className="mt-1 w-full sm:mt-2">
          <CyberServices />
        </div>

        <div className="mt-1 w-full sm:mt-2">
          <GamingZone />
        </div>

      </div>
    </div>
  )
}