import CategoryList from '@/components/CategoryList'
import HorizontalCardProduct from '@/components/HorizontalCardProduct'
import VerticalCardProduct from '@/components/VerticalCardProduct'
import React from 'react'
import { Metadata } from 'next'
import AnimatedHeading from '@/components/home-header'
import ClientBanners from '@/components/client-banners'
import ServiceSection from '@/components/services'

export const metadata: Metadata = {
  title: 'COLLTECH - Tech Gadgets & Office Supplies in Kenya',
  description:
    'Shop top-quality tech gadgets, phone accessories, routers, printers, stationery, and office supplies at COLLTECH Kenya. Your trusted tech & office partner.',
  keywords: [
    'tech gadgets Kenya',
    'phone accessories Nairobi',
    'routers Kenya',
    'Bluetooth speakers Kenya',
    'printers Nairobi',
    'stationery online Kenya',
    'COLLTECH shop',
  ],
  openGraph: {
    title: 'COLLTECH - Tech & Office Supplies in Kenya',
    description:
      'Shop the best tech gadgets, routers, stationery, and office essentials at COLLTECH Kenya.',
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
    title: 'COLLTECH - Tech & Office Supplies',
    description:
      'Discover the best tech gadgets and office supplies in Kenya at COLLTECH. Routers, printers, stationery & more.',
    images: [`${process.env.NEXT_PUBLIC_BASE_URL}/opengraph-image.png`],
    creator: '@COLLTECH_KE',
  },
  alternates: { canonical: process.env.NEXT_PUBLIC_BASE_URL },
}

export default function Page() {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL

  return (
    <div>
      {/* Page Title for SEO */}
      <h1 className="sr-only">
        COLLTECH: Tech Gadgets & Office Supplies in Kenya
      </h1>

      {/* Animated Header inside a container */}
      <div className="container mx-auto px-0.5 mt-6">
        <AnimatedHeading />
      </div>

      {/* JSON-LD Structured Data */}
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
                "https://www.facebook.com/share/1AsYch1TgY/",
                "https://x.com/Colltech_?t=jSzzUB5EdP_scsjNpjkSKA&s=08",
                "https://www.instagram.com/COLLTECH",
                "https://www.tiktok.com/@colltechaccessori?_t=ZM-8yZPmRqhauG&_r=1"
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
            }
          ])
        }}
      />

      {/* Components */}
      <CategoryList />

      <div className="container w-full mt-6 overflow-hidden">
        <ClientBanners />
      </div>

      {/* Client-only Services Section */}
      <ServiceSection />

      <section>
        <h2 className="text-2xl font-semibold text-white mt-10 mb-4 text-center">
          Shop Top Phone Accessories
        </h2>
        <HorizontalCardProduct category="phone-accessories" heading="Top Phone Accessories" />
      </section>

      <section>
        <h2 className="text-2xl font-semibold text-white mt-10 mb-4 text-center">
          Best Computer Accessories for Every Need
        </h2>
        <HorizontalCardProduct category="computer-accessories" heading="Best Computer Accessories" />
      </section>

      <section>
        <h2 className="text-2xl font-semibold text-white mt-10 mb-4 text-center">
          Office & School Stationery
        </h2>
        <VerticalCardProduct category="stationery" heading="Stationery" />
      </section>

      <section>
        <h2 className="text-2xl font-semibold text-white mt-10 mb-4 text-center">
          Electronics & Smart Gadgets
        </h2>
        <VerticalCardProduct category="electronics" heading="Electronics & Gadgets" />
      </section>

      <section>
        <h2 className="text-2xl font-semibold text-white mt-10 mb-4 text-center">
          Internet Accessories for Home & Office
        </h2>
        <VerticalCardProduct category="internet-accessories" heading="Internet Accessories" />
      </section>
    </div>
  )
}
