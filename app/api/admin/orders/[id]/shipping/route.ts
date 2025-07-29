import { db } from "@/common/lib/db";
import { NextResponse } from "next/server";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { shippingStage } = await req.json();

    if (!shippingStage) {
      return NextResponse.json(
        { success: false, message: "Shipping stage is required" },
        { status: 400 }
      );
    }

    const updatedOrder = await db.order.update({
      where: { id },
      data: { shippingStage },
    });

    return NextResponse.json({ success: true, data: updatedOrder });
  } catch (error: unknown) {
    console.error("Error updating order:", error);
    return NextResponse.json(
      { success: false, message: "Failed to update order" },
      { status: 500 }
    );
  }
}
