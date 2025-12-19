import { NextResponse } from "next/server";
import slugify from "slugify";

const BACKEND_URL = "https://colltechhubserver.vercel.app";
const BASE_URL = "https://www.colltechhub.com";

/* -------------------- TYPES -------------------- */
interface Product {
  slug: string;
  category: string | null;
  productImage: string[];
  updatedAt: string;
  productName: string;
}

interface Service {
  slug: string;
  category: string | null;
  serviceImage: string[];
  updatedAt: string;
  serviceName: string;
}

interface CategoryItem {
  category: string;
}

/* -------------------- HELPERS -------------------- */
const fetchJSON = async <T,>(url: string): Promise<T | null> => {
  try {
    const res = await fetch(url, { cache: "no-store" });
    if (!res.ok) throw new Error(`Failed: ${url}`);
    const json = await res.json();
    return json.data ?? json;
  } catch (err) {
    console.error("[SITEMAP FETCH ERROR]", url, err);
    return null;
  }
};

/* -------------------- SITEMAP -------------------- */
export async function GET() {
  const [
    products,
    services,
    productCategories,
    serviceCategories,
  ] = await Promise.all([
    fetchJSON<Product[]>(`${BACKEND_URL}/api/products`),
    fetchJSON<Service[]>(`${BACKEND_URL}/api/services`),
    fetchJSON<CategoryItem[]>(`${BACKEND_URL}/api/category-product`),
    fetchJSON<CategoryItem[]>(`${BACKEND_URL}/api/category-service`),
  ]);

  /* ---------- STATIC PAGES ---------- */
  const staticPages = [
    "",
    "faq",
    "support",
    "contact",
    "returns",
    "about-us",
    "blog",
  ];

  const urls: string[] = [
    ...staticPages.map(
      (page) => `
      <url>
        <loc>${BASE_URL}/${page}</loc>
        <lastmod>${new Date().toISOString()}</lastmod>
        <changefreq>monthly</changefreq>
        <priority>${page === "" ? "1.0" : "0.8"}</priority>
      </url>`
    ),
  ];

  /* ---------- PRODUCT CATEGORIES ---------- */
  if (productCategories) {
    urls.push(
      ...productCategories.map((c) => {
        const slug = slugify(c.category, { lower: true, strict: true });
        return `
        <url>
          <loc>${BASE_URL}/category-product/${slug}</loc>
          <lastmod>${new Date().toISOString()}</lastmod>
          <changefreq>weekly</changefreq>
          <priority>0.85</priority>
        </url>`;
      })
    );
  }

  /* ---------- SERVICE CATEGORIES ---------- */
  if (serviceCategories) {
    urls.push(
      ...serviceCategories.map((c) => {
        const slug = slugify(c.category, { lower: true, strict: true });
        return `
        <url>
          <loc>${BASE_URL}/category-service/${slug}</loc>
          <lastmod>${new Date().toISOString()}</lastmod>
          <changefreq>weekly</changefreq>
          <priority>0.85</priority>
        </url>`;
      })
    );
  }

  /* ---------- PRODUCT PAGES ---------- */
  if (products) {
    urls.push(
      ...products.map((p) => {
        const images = (p.productImage || [])
          .map(
            (img) => `
            <image:image>
              <image:loc>${img}</image:loc>
              <image:caption>${p.productName}</image:caption>
            </image:image>`
          )
          .join("");

        return `
        <url>
          <loc>${BASE_URL}/product-details/${p.slug}</loc>
          <lastmod>${new Date(p.updatedAt).toISOString()}</lastmod>
          <changefreq>weekly</changefreq>
          <priority>0.9</priority>
          ${images}
        </url>`;
      })
    );
  }

  /* ---------- SERVICE PAGES ---------- */
  if (services) {
    urls.push(
      ...services.map((s) => {
        const images = (s.serviceImage || [])
          .map(
            (img) => `
            <image:image>
              <image:loc>${img}</image:loc>
              <image:caption>${s.serviceName}</image:caption>
            </image:image>`
          )
          .join("");

        return `
        <url>
          <loc>${BASE_URL}/service-details/${s.slug}</loc>
          <lastmod>${new Date(s.updatedAt).toISOString()}</lastmod>
          <changefreq>weekly</changefreq>
          <priority>0.9</priority>
          ${images}
        </url>`;
      })
    );
  }

  /* ---------- FINAL XML ---------- */
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
