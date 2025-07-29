// pages/api/products/search/route.ts
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/common/lib/db";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const q = searchParams.get("q") || "";

    const products = await db.product.findMany({
      where: q
        ? {
            OR: [
              { productName: { contains: q, mode: "insensitive" } },
              { brandName: { contains: q, mode: "insensitive" } },
              { category: { contains: q, mode: "insensitive" } },
            ],
          }
        : {},
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(products || []); // always return an array
  } catch (error) {
    console.error("[SEARCH_API_ERROR]", error);
    return NextResponse.json([], { status: 200 }); // return empty array on error
  }
}
