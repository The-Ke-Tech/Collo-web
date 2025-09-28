import { NextRequest, NextResponse } from "next/server";
import { db } from "@/common/lib/db";
import slugify from "slugify";

// 🟢 GET all products
export async function GET(req: NextRequest) {
  try {
    const products = await db.product.findMany({
      orderBy: { createdAt: "desc" }, // optional sorting
    });

    return NextResponse.json({ success: true, data: products });
  } catch (error: any) {
    console.error("🔥 Error fetching products:", error.message);
    return NextResponse.json(
      { success: false, message: "Failed to fetch products", error: error.message },
      { status: 500 }
    );
  }
}

// 🔵 POST create product (your existing code)
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

    if (!productName || !category) {
      return NextResponse.json(
        { success: false, message: "Product name and category are required" },
        { status: 400 }
      );
    }

    const parsedPrice = Number(price);
    const parsedSellingPrice = Number(sellingPrice);
    const parsedStock = Number(stock);

    if (isNaN(parsedPrice) || isNaN(parsedSellingPrice) || isNaN(parsedStock)) {
      return NextResponse.json(
        {
          success: false,
          message: "Price, Selling Price, and Stock must be valid numbers",
        },
        { status: 400 }
      );
    }

    // slugify
    const baseSlug = slugify(productName, { lower: true, strict: true });
    let slug = baseSlug;
    let existing = await db.product.findUnique({ where: { slug } });
    let counter = 1;
    while (existing) {
      slug = `${baseSlug}-${counter}`;
      existing = await db.product.findUnique({ where: { slug } });
      counter++;
    }

    const newProduct = await db.product.create({
      data: {
        slug,
        productName,
        brandName,
        category,
        productImage: productImage || [],
        description,
        price: parsedPrice,
        sellingPrice: parsedSellingPrice,
        stock: parsedStock,
      },
    });

    return NextResponse.json({ success: true, data: newProduct });
  } catch (error: any) {
    console.error("🔥 Error creating product:", error.message);
    return NextResponse.json(
      { success: false, message: "Failed to create product", error: error.message },
      { status: 500 }
    );
  }
}
