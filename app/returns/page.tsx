import PageLayout from "@/components/page-layout";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Returns & Refunds Policy - COLLTECH Kenya",
  description:
    "Read COLLTECH's returns & refunds policy. Easily return or exchange products within 7 days. Get full refunds processed within 5-7 working days. Shop confidently with COLLTECH Kenya.",
  keywords: [
    "COLLTECH returns policy",
    "refund policy Kenya",
    "COLLTECH refund process",
    "return gadgets Nairobi",
    "office supplies return policy",
  ],
  openGraph: {
    title: "Returns & Refunds Policy - COLLTECH Kenya",
    description:
      "Learn how COLLTECH handles returns and refunds. Hassle-free returns within 7 days & quick refunds in 5-7 days.",
    url: `${process.env.NEXT_PUBLIC_BASE_URL}/returns`,
    images: [
      {
        url: `${process.env.NEXT_PUBLIC_BASE_URL}/opengraph-image.png`,
        width: 1200,
        height: 630,
        alt: "COLLTECH Returns & Refunds Policy",
      },
    ],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Returns & Refunds Policy - COLLTECH Kenya",
    description:
      "Shop confidently at COLLTECH. Read our returns and refunds policy for a smooth shopping experience.",
    images: [`${process.env.NEXT_PUBLIC_BASE_URL}/opengraph-image.png`],
  },
  alternates: { canonical: `${process.env.NEXT_PUBLIC_BASE_URL}/returns` },
};

export default function Returns() {
  return (
    <PageLayout title="Returns & Refunds Policy">
      {/* Breadcrumbs JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            "itemListElement": [
              { "@type": "ListItem", "position": 1, "name": "Home", "item": process.env.NEXT_PUBLIC_BASE_URL },
              { "@type": "ListItem", "position": 2, "name": "Returns & Refunds Policy", "item": `${process.env.NEXT_PUBLIC_BASE_URL}/returns` }
            ]
          }),
        }}
      />
      {/* Refund Policy JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "RefundPolicy",
            "name": "COLLTECH Returns & Refunds Policy",
            "url": `${process.env.NEXT_PUBLIC_BASE_URL}/returns`,
            "merchantReturnDays": 7,
            "refundType": "FullRefund",
            "returnFees": "FreeReturn",
            "inStoreReturnsOffered": false
          }),
        }}
      />
      {/* Organization JSON-LD with sameAs */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Organization",
            "name": "COLLTECH",
            "url": process.env.NEXT_PUBLIC_BASE_URL,
            "logo": `${process.env.NEXT_PUBLIC_BASE_URL}/logo.png`,
            "contactPoint": [
              {
                "@type": "ContactPoint",
                "telephone": "+254728619730",
                "contactType": "Customer Support",
                "areaServed": "KE",
                "availableLanguage": "en"
              }
            ],
            "sameAs": [
              "https://www.facebook.com/share/1AsYch1TgY/",
              "https://x.com/Colltech_?t=jSzzUB5EdP_scsjNpjkSKA&s=08",
              "https://www.instagram.com/COLLTECH",
              "https://www.tiktok.com/@colltechaccessori?_t=ZM-8yZPmRqhauG&_r=1"
            ]
          }),
        }}
      />

      <h1 className="text-3xl font-bold text-white mb-6">
        Returns & Refunds Policy
      </h1>
      <p className="mb-4 text-gray-300">
        At <strong>COLLTECH</strong>, your satisfaction is our priority. If your purchase
        doesn’t meet your expectations, our easy and transparent returns policy
        ensures you can shop confidently with us.
      </p>

      <h2 className="text-xl font-semibold text-white mt-6">Eligibility for Returns</h2>
      <ul className="list-disc pl-6 space-y-2 text-gray-300 mt-2">
        <li>Returns are accepted within <strong>7 days</strong> of delivery.</li>
        <li>Products must be <strong>unused</strong>, in original packaging, with proof of purchase.</li>
        <li>Some products (e.g., software, digital goods, hygiene products) may not be eligible.</li>
      </ul>

      <h2 className="text-xl font-semibold text-white mt-6">Refund Process</h2>
      <p className="text-gray-300 mt-2">
        After we receive and inspect your returned item, your refund will be processed
        within <strong>5-7 working days</strong> and sent to your original payment method.
      </p>

      <h2 className="text-xl font-semibold text-white mt-6">How to Initiate a Return</h2>
      <ol className="list-decimal pl-6 space-y-2 text-gray-300 mt-2">
        <li>Contact our support team at <a href="mailto:support@colltechhub.com" className="text-blue-400">support@colltechhub.com</a>.</li>
        <li>Provide your order number and reason for the return.</li>
        <li>Follow the instructions provided by our team for pickup or drop-off.</li>
      </ol>

      <h2 className="text-xl font-semibold text-white mt-6">Need Help?</h2>
      <p className="text-gray-300 mt-2">
        For questions or assistance, call us at <strong>+254728619730</strong> or email
        <a href="mailto:support@colltechhub.com" className="text-blue-400"> support@colltechhub.com</a>.
      </p>

      <h2 className="text-xl font-semibold text-white mt-6">Frequently Asked Questions</h2>
      <div className="space-y-3 text-gray-300 mt-2">
        <p><strong>Q: Can I exchange an item instead of a refund?</strong><br/>Yes, eligible products can be exchanged for similar items.</p>
        <p><strong>Q: Are there return fees?</strong><br/>No, returns are free for qualifying items.</p>
        <p><strong>Q: How will I know when my refund is approved?</strong><br/>You’ll receive an email confirmation once your return is approved.</p>
      </div>
    </PageLayout>
  );
}
