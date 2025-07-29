import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/common/lib/db';

export async function PATCH(req: NextRequest) {
  try {
    const { _id, quantity } = await req.json();
    if (!_id || !quantity) return NextResponse.json({ success: false, message: 'Invalid data' }, { status: 400 });

    await db.addToCart.update({
      where: { id: _id },
      data: { quantity },
    });

    return NextResponse.json({ success: true, message: 'Quantity updated' });
  } catch (error) {
    return NextResponse.json({ success: false, message: 'Failed to update cart' }, { status: 500 });
  }
}
