import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/common/lib/db';
import { jwtVerify } from 'jose';

const secret = new TextEncoder().encode(process.env.TOKEN_SECRET_KEY);

export async function GET(req: NextRequest) {
  try {
    const token = req.cookies.get('token')?.value;
    if (!token) {
      return NextResponse.json({ success: false, data: { count: 0 } }, { status: 200 });
    }

    const { payload } = await jwtVerify(token, secret);
    const userId = payload.id as string;

    // Count user's cart items
    const count = await db.addToCart.count({
      where: { userId },
    });

    return NextResponse.json({ success: true, data: { count } });
  } catch (error) {
    console.error('Error fetching cart count:', error);
    return NextResponse.json({ success: false, message: 'Failed to fetch count' }, { status: 500 });
  }
}
