// app/robots.txt/route.ts
import { NextResponse } from "next/server";

export async function GET() {
  const content = `User-agent: *
Allow: /

Disallow: /admin/admin-panel
Disallow: /customer-dashboard

Sitemap: https://www.colltechhub.com/sitemap.xml`;

  return new NextResponse(content, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
    },
  });
}
