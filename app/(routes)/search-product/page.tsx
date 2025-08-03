import { Metadata } from "next";
import SearchProductClient from "./_components/search-product";

export const metadata: Metadata = {
  title: "Search Products - COLLTECH",
  description:
    "Find tech gadgets, office supplies, electronics, and accessories at COLLTECH. Use our search to quickly locate the products you need.",
  keywords: [
    "COLLTECH search",
    "find products Kenya",
    "tech gadgets search",
    "office supplies Nairobi",
    "electronics Kenya",
  ],
  openGraph: {
    title: "Search Products - COLLTECH",
    description:
      "Quickly search and find tech gadgets, electronics, and office supplies at COLLTECH Kenya.",
    url: `${process.env.NEXT_PUBLIC_BASE_URL}/search-product`,
    images: [
      {
        url: `${process.env.NEXT_PUBLIC_BASE_URL}/opengraph-image.png`,
        width: 1200,
        height: 630,
        alt: "COLLTECH Search Page",
      },
    ],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Search Products - COLLTECH",
    description:
      "Use COLLTECH search to quickly find tech gadgets, electronics & office essentials in Kenya.",
    images: [`${process.env.NEXT_PUBLIC_BASE_URL}/opengraph-image.png`],
  },
  alternates: {
    canonical: `${process.env.NEXT_PUBLIC_BASE_URL}/search-product`,
  },
};

export default function SearchPage() {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;

  return (
    <>
      {/* JSON-LD for Search Page */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "SearchResultsPage",
            "name": "COLLTECH Product Search",
            "description":
              "Search for tech gadgets, electronics, and office supplies on COLLTECH Kenya.",
            "url": `${baseUrl}/search-product`,
            "potentialAction": {
              "@type": "SearchAction",
              "target": `${baseUrl}/search-product?q={search_term_string}`,
              "query-input": "required name=search_term_string",
            },
            "publisher": {
              "@type": "Organization",
              "name": "COLLTECH",
              "url": baseUrl,
              "logo": `${baseUrl}/logo.png`,
            },
          }),
        }}
      />
      {/* Breadcrumbs JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            "itemListElement": [
              { "@type": "ListItem", "position": 1, "name": "Home", "item": baseUrl },
              { "@type": "ListItem", "position": 2, "name": "Search Products", "item": `${baseUrl}/search-product` },
            ],
          }),
        }}
      />

      <SearchProductClient />
    </>
  );
}
