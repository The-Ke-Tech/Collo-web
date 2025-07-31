import { db } from "@/common/lib/db";
import { NextResponse } from "next/server";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ orderId: string }> }
) {
  try {
    const order = await db.order.findUnique({
      where: { id: (await params).orderId },
      select: {
        paymentStatus: true,
        stockUpdated: true,
        productDetails: { select: { productId: true, quantity: true } },
      },
    });

    if (!order) {
      return NextResponse.json({ message: "Order not found" }, { status: 404 });
    }

    // If confirmed, update stock (only once)
    if (order.paymentStatus === "CONFIRMED" && !order.stockUpdated) {
  await db.$transaction([
    ...order.productDetails.map((item) =>
      db.product.update({
        where: { id: item.productId },
        data: { stock: { decrement: item.quantity } },
      })
    ),
    db.order.update({
      where: { id: (await params).orderId },
      data: { stockUpdated: true },
    }),
  ]);
}


    return NextResponse.json({ paymentStatus: order.paymentStatus });
  } catch (err) {
    console.error("Error fetching order status:", err);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}
