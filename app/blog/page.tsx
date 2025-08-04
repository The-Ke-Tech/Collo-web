import Script from "next/script";
import BlogContent from "./_components/blog";

export const metadata = {
  title: "COLLTECH Blog | Tech Tips, Reviews & Office Trends in Kenya",
  description:
    "Stay updated with COLLTECH's blog: Tech tips, gadget reviews, productivity hacks, and the latest trends in office & technology solutions for Kenya.",
  keywords: [
    "tech blog Kenya",
    "gadget reviews Kenya",
    "office productivity tips",
    "COLLTECH articles",
    "Bluetooth speakers reviews",
    "routers and modems blog",
    "earphones reviews Kenya",
    "office supplies Nairobi",
  ],
};

export default function BlogPage() {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://colltechhub.com";

  const posts = [
    {
      title: "Top 10 Affordable Earphones You Should Try in 2025",
      excerpt:
        "Looking for budget-friendly earphones that deliver premium sound? Here is our curated list of the best affordable options in Kenya.",
      image: "/earphones.webp",
      slug: "/blog",
      category: "Gadgets",
      date: "2025-08-02",
    },
    {
      title: "How to Choose the Best Router for Your Home or Office",
      excerpt:
        "From speed to security — here is everything you need to know before buying a router in 2025.",
      image: "/router.jpg",
      slug: "/blog",
      category: "Tech Tips",
      date: "2025-07-28",
    },
    {
      title: "5 Office Hacks to Boost Your Productivity Instantly",
      excerpt:
        "Transform your workday with these simple but effective productivity hacks using tech and smart office supplies.",
      image: "/officehacks.jpg",
      slug: "/blog",
      category: "Productivity",
      date: "2025-07-20",
    },
  ];

  const blogSchema = {
  "@context": "https://schema.org",
  "@type": "Blog",
  name: "COLLTECH Blog",
  description:
    "Tech tips, gadget reviews, productivity hacks, and the latest trends in office & technology solutions in Kenya.",
  url: `${baseUrl}/blog`,
  publisher: {
    "@type": "Organization",
    name: "COLLTECH",
    url: baseUrl,
    logo: {
      "@type": "ImageObject",
      url: `${baseUrl}/logo.png`,
    },
    sameAs: [
      "https://www.facebook.com/share/1AsYch1TgY/",
      "https://x.com/Colltech_?t=jSzzUB5EdP_scsjNpjkSKA&s=08",
      "https://www.instagram.com/COLLTECH",
      "https://www.tiktok.com/@colltechaccessori?_t=ZM-8yZPmRqhauG&_r=1"
    ],
    founder: {
      "@type": "Person",
      name: "Collins Otieno",
      description:
        "Visionary and strategic entrepreneur, founder of COLLTECH, bridging trust, technology, and community impact in Nairobi.",
    },
    foundingLocation: {
      "@type": "Place",
      name: "Nairobi, Kenya",
    },
  },
  blogPost: posts.map((post) => ({
    "@type": "BlogPosting",
    headline: post.title,
    description: post.excerpt,
    image: `${baseUrl}${post.image}`,
    thumbnailUrl: `${baseUrl}${post.image}`,
    url: `${baseUrl}${post.slug}`,
    datePublished: post.date,
    dateModified: post.date,
    mainEntityOfPage: `${baseUrl}${post.slug}`,
    author: {
      "@type": "Organization",
      name: "COLLTECH",
    },
  })),
};


  return (
    <>
      {/* JSON-LD Structured Data */}
      <Script
        id="blog-jsonld"
        type="application/ld+json"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(blogSchema) }}
      />
      <BlogContent posts={posts} />
    </>
  );
}
