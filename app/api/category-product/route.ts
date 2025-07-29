import { NextResponse } from 'next/server';
import { db } from '@/common/lib/db';
import type { Product } from '@prisma/client';

type GroupedCategory = {
  category: string;
  productImage: string[];
};

export async function GET() {
  try {
    // Get distinct categories with one product image per category
    const categories = await db.product.findMany({
      where: { category: { not: null } },
      select: {
        category: true,
        productImage: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    // Group by category and pick the first image
    const grouped: GroupedCategory[] = Object.values(
      categories.reduce<Record<string, GroupedCategory>>((acc, item) => {
        if (!item.category) return acc;

        if (!acc[item.category]) {
          acc[item.category] = {
            category: item.category,
            productImage: item.productImage.length ? [item.productImage[0]] : [],
          };
        }
        return acc;
      }, {})
    );

    return NextResponse.json({ success: true, data: grouped });
  } catch (error: unknown) {
    console.error('Error fetching categories:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch categories' },
      { status: 500 }
    );
  }
}
