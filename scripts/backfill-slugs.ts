// scripts/backfill-slugs.ts
import { PrismaClient } from '@prisma/client';
import slugify from 'slugify';

const prisma = new PrismaClient();

async function main() {
  const products = await prisma.product.findMany({
  where: { slug: undefined },
});

  console.log(`Found ${products.length} products without slug.`);

  for (const product of products) {
    if (!product.productName) continue;

    const newSlug = slugify(product.productName, { lower: true, strict: true });

    // Ensure slug is unique (add a suffix if needed)
    let finalSlug = newSlug;
    let counter = 1;
    while (await prisma.product.findUnique({ where: { slug: finalSlug } })) {
      finalSlug = `${newSlug}-${counter++}`;
    }

    await prisma.product.update({
      where: { id: product.id },
      data: { slug: finalSlug },
    });

    console.log(`Updated product: ${product.productName} → ${finalSlug}`);
  }

  console.log('Slugs backfilled successfully.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
