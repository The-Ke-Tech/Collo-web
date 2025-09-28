import { NextRequest, NextResponse } from "next/server";
import { db } from "@/common/lib/db";
import slugify from "slugify";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    console.log("📥 Incoming product data:", body);

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

    // ✅ Generate unique slug
    const baseSlug = slugify(productName, { lower: true, strict: true });
    let slug = baseSlug;

    let existing = await db.product.findUnique({ where: { slug } });
    let counter = 1;
    while (existing) {
      slug = `${baseSlug}-${counter}`;
      existing = await db.product.findUnique({ where: { slug } });
      counter++;
    }

    console.log("📝 Final slug:", slug);

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

    console.log("✅ Product created:", newProduct);

    return NextResponse.json({ success: true, data: newProduct });
  } catch (error: any) {
    console.error("🔥 Error creating product:", error.message, error.stack);
    return NextResponse.json(
      { success: false, message: "Failed to create product", error: error.message },
      { status: 500 }
    );
  }
}
