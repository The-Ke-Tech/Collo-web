import { Metadata } from "next";
import FAQClient from "./_components/faq";

export const metadata: Metadata = {
  title: "Frequently Asked Questions - COLLTECH Kenya",
  description:
    "Find answers to common questions about shopping at COLLTECH Kenya: orders, delivery, payments, returns, warranties, and more.",
  keywords: [
    "COLLTECH FAQ",
    "COLLTECH support Kenya",
    "returns and delivery Kenya",
    "COLLTECH payment options",
    "COLLTECH warranty policy",
  ],
  openGraph: {
    title: "Frequently Asked Questions - COLLTECH",
    description:
      "Get answers about shopping at COLLTECH. Learn about delivery, payments, returns, and warranties.",
    url: `${process.env.NEXT_PUBLIC_BASE_URL}/faq`,
    images: [
      {
        url: `${process.env.NEXT_PUBLIC_BASE_URL}/opengraph-image.png`,
        width: 1200,
        height: 630,
        alt: "COLLTECH FAQ",
      },
    ],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Frequently Asked Questions - COLLTECH",
    description:
      "Answers to common questions about COLLTECH Kenya — orders, delivery, payments, returns, and more.",
    images: [`${process.env.NEXT_PUBLIC_BASE_URL}/opengraph-image.png`],
  },
  alternates: { canonical: `${process.env.NEXT_PUBLIC_BASE_URL}/faq` },
};

export default function FAQPage() {
  const faqs = [
    {
      question: "How do I place an order?",
      answer:
        "Browse our categories, add items to your cart, and checkout using M-Pesa, card, or mobile banking. A confirmation email/SMS will be sent after successful checkout.",
    },
    {
      question: "How long does delivery take?",
      answer:
        "Orders are delivered within 1–3 working days in major cities and up to 5 working days for remote areas. Same-day delivery is available in select locations for express orders.",
    },
    {
      question: "Can I cancel or modify my order?",
      answer:
        "Yes. Orders can be modified or canceled before they are processed or shipped. Contact our support team immediately for assistance.",
    },
    {
      question: "What payment methods do you support?",
      answer:
        "We support M-Pesa, debit/credit cards, and selected mobile banking options for fast and secure payments.",
    },
    {
      question: "Do you offer returns or refunds?",
      answer:
        "Yes, items can be returned within 7 days if they meet our return policy. Refunds are processed within 3–5 working days after inspection.",
    },
    {
      question: "Do products come with a warranty?",
      answer:
        "Yes. Most electronics and gadgets include a manufacturer’s warranty. Warranty details are provided in the product description.",
    },
    {
      question: "Do I need an account to shop at COLLTECH?",
      answer:
        "No, you can checkout as a guest. However, creating an account allows you to track orders, save addresses, and enjoy a faster checkout experience.",
    },
    {
      question: "Where does COLLTECH deliver?",
      answer:
        "We deliver across Kenya, covering major cities and remote areas. Delivery charges may vary depending on your location.",
    },
    {
      question: "How do I contact customer support?",
      answer:
        "You can reach us via our Contact page, email at support@colltechhub.com, or call us at +254700000000.",
    },
  ];

  return (
    <>
      {/* Breadcrumbs JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            "itemListElement": [
              { "@type": "ListItem", "position": 1, "name": "Home", "item": process.env.NEXT_PUBLIC_BASE_URL },
              { "@type": "ListItem", "position": 2, "name": "FAQ", "item": `${process.env.NEXT_PUBLIC_BASE_URL}/faq` }
            ]
          }),
        }}
      />
      {/* FAQ Schema for Rich Results */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            "mainEntity": faqs.map((faq) => ({
              "@type": "Question",
              "name": faq.question,
              "acceptedAnswer": { "@type": "Answer", "text": faq.answer },
            })),
          }),
        }}
      />
      {/* Organization JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Organization",
            "name": "COLLTECH",
            "url": process.env.NEXT_PUBLIC_BASE_URL,
            "logo": `${process.env.NEXT_PUBLIC_BASE_URL}/logo.png`,
            "sameAs": [
              "https://www.facebook.com/share/1AsYch1TgY/",
              "https://x.com/Colltech_?t=jSzzUB5EdP_scsjNpjkSKA&s=08",
              "https://www.instagram.com/COLLTECH",
              "https://www.tiktok.com/@colltechaccessori?_t=ZM-8yZPmRqhauG&_r=1",
            ],
            "contactPoint": [{
              "@type": "ContactPoint",
              "telephone": "+254700000000",
              "contactType": "Customer Support",
              "areaServed": "KE",
              "availableLanguage": "en"
            }]
          }),
        }}
      />
      <FAQClient faqs={faqs} />
    </>
  );
}
