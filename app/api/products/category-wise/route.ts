import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/common/lib/db';

export async function POST(req: NextRequest) {
  try {
    const { category } = await req.json();
    if (!category) return NextResponse.json({ success: false, message: 'Category required' }, { status: 400 });

    const products = await db.product.findMany({
      where: { category },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ success: true, data: products });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ success: false, message: 'Failed to fetch products' }, { status: 500 });
  }
}
