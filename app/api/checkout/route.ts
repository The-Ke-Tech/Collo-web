import { NextRequest, NextResponse } from 'next/server';
import { PaymentStatus } from '@prisma/client';
import { db } from '@/common/lib/db';
import { initiateMpesaStkPush } from '@/store/mpesa';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      userId,
      phoneNumber,
      amount,
      accountReference,
      description,
      fullName,
      address,
      county,
      city,
      productDetails
    } = body;

    // Validate
    if (
      !userId || !phoneNumber || !amount || !accountReference || !description ||
      !fullName || !address || !county || !city || !productDetails || productDetails.length === 0
    ) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Create order (PENDING)
    const order = await db.order.create({
      data: {
        userId,
        phone: phoneNumber,
        fullName,
        address,
        county,
        city,
        totalAmount: amount,
        paymentStatus: PaymentStatus.PENDING,
        paymentMethod: ['MPESA'],
        productDetails: {
          create: productDetails.map((item: { productId: string; quantity: number }) => ({
            product: { connect: { id: item.productId } },
            quantity: item.quantity,
          })),
        },
      },
    });

    // Initiate M-PESA STK Push
    const stkResponse = await initiateMpesaStkPush({
      amount,
      phoneNumber,
      accountReference,
      description,
      userId,
      orderId: order.id,
    });

    // Save CheckoutRequestID for webhook lookup
    if (stkResponse?.CheckoutRequestID) {
      await db.order.update({
        where: { id: order.id },
        data: { mpesaCheckoutRequestId: stkResponse.CheckoutRequestID },
      });
    }

    return NextResponse.json({
      success: true,
      orderId: order.id,
      data: stkResponse,
    });
  } catch (error) {
    console.error('[STK_PUSH_TRIGGER_ERROR]', error);
    return NextResponse.json(
      { error: 'Failed to initiate STK push', details: (error as Error).message },
      { status: 500 }
    );
  }
}
