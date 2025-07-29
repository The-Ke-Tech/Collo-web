// app/api/webhook/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/common/lib/db';
import { PaymentStatus } from '@prisma/client';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    console.log("📩 [M-PESA WEBHOOK] Incoming data:", JSON.stringify(body, null, 2));

    const callback = body?.Body?.stkCallback;
    if (!callback) {
      return NextResponse.json({ error: "Invalid M-PESA callback format" }, { status: 400 });
    }

    const { CheckoutRequestID, ResultCode, ResultDesc, CallbackMetadata } = callback;

    // Find order by CheckoutRequestID
    const order = await db.order.findUnique({
      where: { mpesaCheckoutRequestId: CheckoutRequestID },
    });

    if (!order) {
      console.error("❌ No order found for CheckoutRequestID:", CheckoutRequestID);
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    // Extract metadata (Receipt, Phone, Amount)
    let mpesaReceiptNumber = null;
    let mpesaPhoneNumber = null;
    let paidAmount = null;

    if (CallbackMetadata?.Item) {
      for (const item of CallbackMetadata.Item) {
        if (item.Name === "MpesaReceiptNumber") mpesaReceiptNumber = item.Value;
        if (item.Name === "PhoneNumber") mpesaPhoneNumber = item.Value?.toString();
        if (item.Name === "Amount") paidAmount = item.Value;
      }
    }

    // Determine new status
    const newStatus =
      ResultCode === 0 ? PaymentStatus.CONFIRMED : PaymentStatus.FAILED;

    // Atomic transaction: update order + clear cart if confirmed
    const updatedOrder = await db.$transaction(async (tx) => {
      const updated = await tx.order.update({
        where: { id: order.id },
        data: {
          paymentStatus: newStatus,
          mpesaReceiptNumber,
          mpesaPhoneNumber,
          totalAmount: paidAmount || order.totalAmount,
        },
      });

      // If payment confirmed, clear the user's cart
      if (newStatus === PaymentStatus.CONFIRMED && order.userId) {
        await tx.addToCart.deleteMany({ where: { userId: order.userId } });
        console.log(`🛒 Cleared cart for user: ${order.userId}`);
      }

      return updated;
    });

    console.log("✅ [M-PESA WEBHOOK] Order updated:", updatedOrder.id, newStatus);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[MPESA_WEBHOOK_ERROR]", error);
    return NextResponse.json({ error: "Failed to process webhook" }, { status: 500 });
  }
}
