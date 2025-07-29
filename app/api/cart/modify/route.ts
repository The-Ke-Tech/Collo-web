// app/api/cart/route.ts
import { getUserFromToken } from "@/common/getUserFromToken";
import { db } from "@/common/lib/db";
import { NextRequest, NextResponse } from "next/server";

// Add to cart
// Add to cart
export async function POST(req: NextRequest) {
  try {
    const { productId } = await req.json();
    const { id: userId } = await getUserFromToken();

    if (!productId) {
      return NextResponse.json(
        { success: false, message: "Product ID required" },
        { status: 400 }
      );
    }

    // Check if already in cart
    const existingItem = await db.addToCart.findFirst({ where: { productId, userId } });

    if (existingItem) {
      return NextResponse.json(
        { success: false, alreadyInCart: true, message: "This product is already in your cart" },
        { status: 409 } // 409 Conflict
      );
    }

    // Add new item
    const cartItem = await db.addToCart.create({
      data: { productId, userId, quantity: 1 },
    });

    return NextResponse.json({ success: true, message: "Added to cart", data: cartItem });
  } catch (error) {
    return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
  }
}
