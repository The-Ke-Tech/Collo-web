// app/api/products/route.ts
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/common/lib/db";

// GET: Fetch all products
export async function GET() {
  try {
    const products = await db.product.findMany({
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json({ success: true, data: products });
  } catch (error) {
    console.error("Error fetching products:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch products" },
      { status: 500 }
    );
  }
}

// POST: Add new product
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      productName,
      brandName,
      category,
      productImage,
      description,
      price,
      sellingPrice,
      stock,
    } = body;

    if (!productName || !category || !sellingPrice || stock === undefined) {
      return NextResponse.json(
        { success: false, message: "Required fields missing" },
        { status: 400 }
      );
    }

    const newProduct = await db.product.create({
      data: {
        productName,
        brandName,
        category,
        productImage: productImage || [],
        description,
        price,
        sellingPrice,
        stock: parseInt(stock, 10) || 0,
      },
    });

    return NextResponse.json({ success: true, data: newProduct });
  } catch (error) {
    console.error("Error creating product:", error);
    return NextResponse.json(
      { success: false, message: "Failed to create product" },
      { status: 500 }
    );
  }
}
