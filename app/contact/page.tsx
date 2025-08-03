import { Metadata } from "next";
import ContactClient from "./_components/contact";

export const metadata: Metadata = {
  title: "Contact COLLTECH - Get in Touch with Us",
  description:
    "Have questions or need help? Contact COLLTECH today. Our team is here to assist you with tech gadgets, office supplies, orders, and more.",
  keywords: [
    "COLLTECH contact",
    "customer support Kenya",
    "tech help",
    "office supplies contact",
  ],
  openGraph: {
    title: "Contact COLLTECH - We're Here to Help",
    description:
      "Need help with your order or have a query? Contact COLLTECH via phone, email, or form. We're here to support you.",
    url: `${process.env.NEXT_PUBLIC_BASE_URL}/contact`,
    images: [
      {
        url: `${process.env.NEXT_PUBLIC_BASE_URL}/opengraph-image.png`,
        width: 1200,
        height: 630,
        alt: "Contact COLLTECH",
      },
    ],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Contact COLLTECH - We're Here to Help",
    description:
      "Get in touch with COLLTECH for assistance with your tech and office needs in Kenya.",
    images: [`${process.env.NEXT_PUBLIC_BASE_URL}/opengraph-image.png`],
  },
  alternates: {
    canonical: `${process.env.NEXT_PUBLIC_BASE_URL}/contact`,
  },
};

export default function ContactPage() {
  return (
    <>
      {/* JSON-LD Schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "ContactPage",
            name: "Contact COLLTECH",
            description:
              "Get in touch with COLLTECH for inquiries, orders, or support. We're here to help you with tech gadgets and office supplies.",
            url: `${process.env.NEXT_PUBLIC_BASE_URL}/contact`,
            publisher: {
              "@type": "Organization",
              name: "COLLTECH",
              url: process.env.NEXT_PUBLIC_BASE_URL,
              logo: `${process.env.NEXT_PUBLIC_BASE_URL}/logo.png`,
              "sameAs": [
                  "https://www.facebook.com/share/1AsYch1TgY/",
                  "https://x.com/Colltech_?t=jSzzUB5EdP_scsjNpjkSKA&s=08",
                  "https://www.instagram.com/COLLTECH",
                  "https://www.tiktok.com/@colltechaccessori?_t=ZM-8yZPmRqhauG&_r=1",
                ],
              contactPoint: [
                {
                  "@type": "ContactPoint",
                  telephone: "+254700000000",
                  contactType: "Customer Support",
                  areaServed: "KE",
                  availableLanguage: "en",
                },
              ],
            },
          }),
        }}
      />
      <ContactClient />
    </>
  );
}
