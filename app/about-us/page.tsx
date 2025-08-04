import Script from "next/script";
import AboutContent from "./_components/about-us";

export const metadata = {
  title: "About Us - COLLTECH | Tech & Office Supplies in Kenya",
  description:
    "Learn about COLLTECH – your trusted partner for premium tech gadgets & office supplies in Kenya. Discover our story, mission, and how Collins Otieno founded COLLTECH to bridge trust, technology, and community impact.",
  keywords: [
    "about COLLTECH",
    "Collins Otieno entrepreneur",
    "tech gadgets Kenya",
    "office supplies Nairobi",
    "earphones and speakers Kenya",
    "routers and modems Kenya",
    "Bluetooth speakers Nairobi",
    "printers Kenya",
    "COLLTECH mission and vision",
  ],
  openGraph: {
    title: "About COLLTECH - Your Trusted Tech & Office Partner",
    description:
      "Discover COLLTECH's story, our founder Collins Otieno, our commitment to quality tech gadgets & office essentials, and how we serve individuals and businesses across Kenya.",
    url: `${process.env.NEXT_PUBLIC_BASE_URL}/about-us`,
    siteName: "COLLTECH",
    images: [
      {
        url: `${process.env.NEXT_PUBLIC_BASE_URL}/about-us-banner.jpg`,
        width: 1200,
        height: 630,
        alt: "About COLLTECH - Tech & Office Supplies",
      },
    ],
    locale: "en_KE",
    type: "website",
  },
};

export default function AboutUsPage() {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://colltechhub.com";

  // JSON-LD: Organization + AboutPage + Founder + BreadcrumbList
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "AboutPage",
    mainEntity: {
      "@type": "Organization",
      name: "COLLTECH",
      url: baseUrl,
      logo: `${baseUrl}/logo.png`,
      image: `${baseUrl}/about-us-banner.jpg`,
      description:
        "COLLTECH is a Kenyan-based provider of premium tech gadgets and office supplies. Founded by Collins Otieno, the company focuses on trust, technology, and community empowerment.",
      sameAs: [
        "https://www.facebook.com/share/1AsYch1TgY/",
        "https://x.com/Colltech_?t=jSzzUB5EdP_scsjNpjkSKA&s=08",
        "https://www.instagram.com/COLLTECH",
        "https://www.tiktok.com/@colltechaccessori?_t=ZM-8yZPmRqhauG&_r=1",
      ],
      founder: {
        "@type": "Person",
        name: "Collins Otieno",
        description:
          "Visionary and strategic entrepreneur, founder of COLLTECH, committed to bridging trust, technology, and community impact in Kenya.",
        image: `${baseUrl}/founder-collins.jpg`,
      },
      contactPoint: {
        "@type": "ContactPoint",
        telephone: "+254700000000",
        contactType: "Customer Support",
        areaServed: "KE",
        availableLanguage: ["en", "sw"],
      },
      foundingLocation: {
        "@type": "Place",
        name: "Nairobi, Kenya",
      },
    },
  };

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: `${baseUrl}/` },
      { "@type": "ListItem", position: 2, name: "About Us", item: `${baseUrl}/about-us` },
    ],
  };

  return (
    <>
      <Script
        id="about-jsonld"
        type="application/ld+json"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Script
        id="breadcrumb-jsonld"
        type="application/ld+json"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <AboutContent />
    </>
  );
}
