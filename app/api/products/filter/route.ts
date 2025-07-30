import { NextRequest, NextResponse } from "next/server";
import { db } from '@/common/lib/db';

export async function POST(req: NextRequest) {
  try {
    const { category = [] } = await req.json();

    const products = await db.product.findMany({
      where: category.length > 0 ? { category: { in: category } } : undefined,
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ success: true, data: products });
  } catch (error) {
    console.error("Error filtering products:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch products" },
      { status: 500 }
    );
  }
}
