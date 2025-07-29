import { db } from "@/common/lib/db";
import { NextRequest, NextResponse } from "next/server";

interface Params {
  params: Promise<{ id: string }>;
}

// GET: Fetch single product
export async function GET(req: NextRequest, { params }: Params) {
  try {
    const { id } = await params;

    const product = await db.product.findUnique({
      where: { id },
    });

    if (!product) {
      return NextResponse.json(
        { success: false, message: "Product not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: product });
  } catch (error) {
    console.error("Error fetching product:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch product" },
      { status: 500 }
    );
  }
}

// PATCH: Update product
export async function PATCH(req: NextRequest, { params }: Params) {
  try {
    const { id } = await params;

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

    const updatedProduct = await db.product.update({
      where: { id },
      data: {
        productName,
        brandName,
        category,
        productImage,
        description,
        price,
        sellingPrice,
        stock,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Product updated successfully",
      data: updatedProduct,
    });
  } catch (error) {
    console.error("Error updating product:", error);
    return NextResponse.json(
      { success: false, message: "Failed to update product" },
      { status: 500 }
    );
  }
}

// DELETE: Remove product
export async function DELETE(req: NextRequest, { params }: Params) {
  try {
    const { id } = await params;

    await db.product.delete({
      where: { id },
    });

    return NextResponse.json({
      success: true,
      message: "Product deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting product:", error);
    return NextResponse.json(
      { success: false, message: "Failed to delete product" },
      { status: 500 }
    );
  }
}
