import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/common/lib/db';
import { jwtVerify } from 'jose';

const secret = new TextEncoder().encode(process.env.TOKEN_SECRET_KEY);

export async function GET(req: NextRequest) {
  try {
    const token = req.cookies.get('token')?.value;
    if (!token) return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });

    const { payload } = await jwtVerify(token, secret);
    const userId = payload.id as string;

    const cart = await db.addToCart.findMany({
      where: { userId },
      include: {
        product: {
          select: {
            id: true,
            productImage: true,
            productName: true,
            category: true,
            sellingPrice: true,
          },
        },
      },
      orderBy: { createdAt: 'asc' },
    });

    // Reshape for frontend
    const formatted = cart.map(item => ({
      _id: item.id,
      quantity: item.quantity,
      productId: item.product, 
    }));

    return NextResponse.json({ success: true, data: formatted });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ success: false, message: 'Failed to fetch cart' }, { status: 500 });
  }
}
