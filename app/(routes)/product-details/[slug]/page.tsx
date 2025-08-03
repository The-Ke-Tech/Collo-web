import { Metadata } from 'next';
import Script from 'next/script';
import { redirect } from 'next/navigation';
import ProductDetailsClient from './_components/product-details';
import { db } from '@/common/lib/db';

async function getProductBySlug(slug: string) {
  return await db.product.findUnique({
    where: { slug },
    select: {
      id: true,
      slug: true,              // ✅ Include slug
      productName: true,
      brandName: true,
      category: true,
      productImage: true,
      description: true,
      price: true,
      sellingPrice: true,
      stock: true,
      createdAt: true,
      updatedAt: true,
    },
  });
}


export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const product = await getProductBySlug((await params).slug);

  if (!product) {
    return { title: 'Product Not Found | COLTECH' };
  }

  return {
    title: `${product.productName} - Buy at COLTECH`,
    description: product.description,
    openGraph: {
      title: product.productName ?? 'COLTECH',
      description: product.description ?? 'COLTECH',
      images: product.productImage.map((img: string) => ({
        url: img,
        width: 800,
        height: 800,
        alt: product.productName ?? 'COLTECH',
      })),
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: product.productName ?? 'COLTECH',
      description: product.description ?? 'COLTECH',
      images: [product.productImage[0]],
    },
    alternates: {
      canonical: `${process.env.NEXT_PUBLIC_BASE_URL}/product-details/${product.slug}`,
    },
    robots: { index: true, follow: true },
  };
}

export default async function ProductPage({ params, searchParams }: { params: Promise<{ slug: string }>, searchParams: Promise<{ id?: string }> }) {
  // Handle backward compatibility: redirect old ?id= to /product/[slug]
  if ((await searchParams).id) {
    const productById = await db.product.findUnique({ where: { id: (await searchParams).id } });
    if (productById) {
      redirect(`/product-details/${productById.slug}`);
    }
  }

  const product = await getProductBySlug((await params).slug);

  if (!product) {
    return <div className="p-6 text-center text-gray-400">Product not found</div>;
  }

  return (
    <>
      {/* JSON-LD Schema for Rich Results */}
      <Script
        id="product-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org/",
            "@type": "Product",
            "name": product.productName,
            "image": product.productImage,
            "description": product.description,
            "brand": { "@type": "Brand", "name": product.brandName },
            "offers": {
              "@type": "Offer",
              "url": `${process.env.NEXT_PUBLIC_BASE_URL}/product-details/${product.slug}`,
              "priceCurrency": "KES",
              "price": product.sellingPrice,
              "availability": product.stock > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
            },
          }),
        }}
      />

      {/* Breadcrumbs Schema */}
      <Script
        id="breadcrumbs-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            "itemListElement": [
              { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://colltechhub.com" },
              { "@type": "ListItem", "position": 2, "name": product.category, "item": `https://colltechhub.com/category-product/${product.category}` },
              { "@type": "ListItem", "position": 3, "name": product.productName }
            ]
          }),
        }}
      />

      <ProductDetailsClient product={product} />
    </>
  );
}
