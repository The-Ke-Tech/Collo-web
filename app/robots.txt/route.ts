// app/robots.txt/route.ts
import { NextResponse } from "next/server";

export async function GET() {
  const content = `
User-agent: *
Allow: /
Disallow: /admin-panel
Disallow: /customer-dashboard

# Sitemap
Sitemap: ${process.env.NEXT_PUBLIC_BASE_URL}/sitemap.xml
  `.trim();

  return new NextResponse(content, {
    headers: {
      "Content-Type": "text/plain",
    },
  });
}
