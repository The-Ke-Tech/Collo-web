import { db } from "@/common/lib/db";
import { NextResponse } from "next/server";
import slugify from "slugify";

export async function GET() {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://colltechhub.com";

  // Fetch products
  const products = await db.product.findMany({
    select: { slug: true, category: true, productImage: true, updatedAt: true, productName: true },
  });

  // Generate unique category slugs
  const categories = Array.from(new Set(products.map((p) => p.category).filter(Boolean))) as string[];

  // Generate search-friendly queries based on product names (top 20 unique keywords)
  const searchQueries = Array.from(
    new Set(
      products
        .map((p) => p.productName?.split(" ")[0]) 
        .filter(Boolean)
    )
  ).slice(0, 20);

  const staticPages = ["", "faq", "support", "contact", "returns", "category-product", "about-us", "blog"];

  const urls = [
    // Static pages
    ...staticPages.map(
      (page) => `
      <url>
        <loc>${baseUrl}/${page}</loc>
        <lastmod>${new Date().toISOString()}</lastmod>
        <changefreq>monthly</changefreq>
        <priority>${page === "" ? "1.0" : "0.8"}</priority>
      </url>
    `
    ),

    // Category pages
    ...categories.map((cat) => {
      const catSlug = slugify(cat, { lower: true, strict: true });
      return `
      <url>
        <loc>${baseUrl}/category-product/${catSlug}</loc>
        <lastmod>${new Date().toISOString()}</lastmod>
        <changefreq>weekly</changefreq>
        <priority>0.85</priority>
      </url>
    `;
    }),

    // Search pages
    ...searchQueries.map((q) => {
      const querySlug = encodeURIComponent(q);
      return `
      <url>
        <loc>${baseUrl}/search-product?q=${querySlug}</loc>
        <lastmod>${new Date().toISOString()}</lastmod>
        <changefreq>weekly</changefreq>
        <priority>0.7</priority>
      </url>
    `;
    }),

    // Product pages with images
    ...products.map((product) => {
      const images = product.productImage
        .map(
          (img) => `
          <image:image>
            <image:loc>${img}</image:loc>
            <image:caption>${product.productName || "Product image"}</image:caption>
          </image:image>
        `
        )
        .join("");

      return `
      <url>
        <loc>${baseUrl}/product-details/${product.slug}</loc>
        <lastmod>${product.updatedAt.toISOString()}</lastmod>
        <changefreq>weekly</changefreq>
        <priority>0.9</priority>
        ${images}
      </url>
    `;
    }),
  ];

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset 
  xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
  xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
${urls.join("\n")}
</urlset>`;

  return new NextResponse(sitemap, {
    headers: { "Content-Type": "application/xml" },
  });
}
