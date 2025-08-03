import { Metadata } from "next";
import CategoryProductClient from "./_components/category-product";

export const metadata: Metadata = {
  title: "Shop by Category - COLLTECH Products",
  description:
    "Browse our wide range of categories at COLLTECH. From electronics and office supplies to gadgets and accessories, find the perfect products at the best prices in Kenya.",
  keywords: [
    "COLLTECH categories",
    "electronics Kenya",
    "office supplies Nairobi",
    "tech gadgets online",
    "affordable gadgets Kenya",
  ],
  openGraph: {
    title: "Shop by Category - COLLTECH Products",
    description:
      "Explore tech gadgets, office supplies, and accessories by category at COLLTECH Kenya.",
    url: `${process.env.NEXT_PUBLIC_BASE_URL}/category-product`,
    images: [
      {
        url: `${process.env.NEXT_PUBLIC_BASE_URL}/opengraph-image.png`,
        width: 1200,
        height: 630,
        alt: "COLLTECH Category Page",
      },
    ],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Shop by Category - COLLTECH Products",
    description:
      "Find the best deals on tech gadgets and office supplies. Browse categories at COLLTECH Kenya.",
    images: [`${process.env.NEXT_PUBLIC_BASE_URL}/opengraph-image.png`],
  },
  alternates: {
    canonical: `${process.env.NEXT_PUBLIC_BASE_URL}/category-product`,
  },
};

export default function CategoryProductPage() {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;

  return (
    <>
      {/* JSON-LD for CollectionPage */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "CollectionPage",
            name: "COLLTECH Product Categories",
            description:
              "Browse product categories at COLLTECH. Electronics, gadgets, office supplies, and more at the best prices in Kenya.",
            url: `${baseUrl}/category-product`,
            publisher: {
              "@type": "Organization",
              name: "COLLTECH",
              url: baseUrl,
              logo: `${baseUrl}/logo.png`,
              sameAs: [
                "https://www.facebook.com/share/1AsYch1TgY/",
                "https://x.com/Colltech_?t=jSzzUB5EdP_scsjNpjkSKA&s=08",
                "https://www.instagram.com/COLLTECH",
                "https://www.tiktok.com/@colltechaccessori?_t=ZM-8yZPmRqhauG&_r=1",
              ],
            },
          }),
        }}
      />

      {/* JSON-LD for Breadcrumbs */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            itemListElement: [
              {
                "@type": "ListItem",
                position: 1,
                name: "Home",
                item: baseUrl,
              },
              {
                "@type": "ListItem",
                position: 2,
                name: "Categories",
                item: `${baseUrl}/category-product`,
              },
            ],
          }),
        }}
      />

      <CategoryProductClient />
    </>
  );
}
