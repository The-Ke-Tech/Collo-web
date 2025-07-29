import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/common/lib/db';

export async function DELETE(req: NextRequest) {
  try {
    const { _id } = await req.json();
    if (!_id) return NextResponse.json({ success: false, message: 'Invalid data' }, { status: 400 });

    await db.addToCart.delete({ where: { id: _id } });
    return NextResponse.json({ success: true, message: 'Product removed' });
  } catch (error) {
    return NextResponse.json({ success: false, message: 'Failed to delete cart item' }, { status: 500 });
  }
}
