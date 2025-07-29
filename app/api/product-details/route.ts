import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/common/lib/db';

export async function POST(req: NextRequest) {
  try {
    const { productId } = await req.json();

    if (!productId) {
      return NextResponse.json({ success: false, message: 'Product ID is required' }, { status: 400 });
    }

    const product = await db.product.findUnique({
      where: { id: productId },
      select: {
        id: true,
        productName: true,
        brandName: true,
        category: true,
        productImage: true,
        description: true,
        price: true,
        sellingPrice: true,
        stock: true, // <-- Added stock
      },
    });

    if (!product) {
      return NextResponse.json({ success: false, message: 'Product not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: product });
  } catch (error) {
    console.error('Error fetching product:', error);
    return NextResponse.json({ success: false, message: 'Server error' }, { status: 500 });
  }
}
