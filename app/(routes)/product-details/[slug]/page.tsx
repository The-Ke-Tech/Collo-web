import { Metadata } from 'next';
import Script from 'next/script';
import { redirect } from 'next/navigation';
import ProductDetailsClient from './_components/product-details';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

// Fetch product by slug
async function getProductBySlug(slug: string) {
  try {
    const res = await fetch(`${API_URL}/api/products/slug/${slug}`, { cache: 'no-store' });
    if (!res.ok) return null;
    const json = await res.json();
    return json.data ?? json; // backend may return { success, data }
  } catch (err) {
    console.error('Failed to fetch product by slug:', err);
    return null;
  }
}

// Fetch product by ID (backward compatibility)
async function getProductById(id: string) {
  try {
    const res = await fetch(`${API_URL}/api/products/id/${id}`, { cache: 'no-store' });
    if (!res.ok) return null;
    const json = await res.json();
    return json.data ?? json;
  } catch (err) {
    console.error('Failed to fetch product by ID:', err);
    return null;
  }
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const slug = (await params).slug;
  const product = await getProductBySlug(slug);

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

export default async function ProductPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ id?: string }>;
}) {
  const slug = (await params).slug;

  // Backward compatibility for old ?id=
  const idParam = (await searchParams).id;
  if (idParam) {
    const productById = await getProductById(idParam);
    if (productById) {
      redirect(`/product-details/${productById.slug}`);
    }
  }

  const product = await getProductBySlug(slug);

  if (!product) {
    return <div className="p-6 text-center text-gray-400">Product not found</div>;
  }

  return (
    <>
      {/* Product Schema */}
      <Script
        id="product-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org/",
            "@type": "Product",
            name: product.productName,
            image: product.productImage,
            description: product.description,
            brand: { "@type": "Brand", name: product.brandName },
            offers: {
              "@type": "Offer",
              url: `${process.env.NEXT_PUBLIC_BASE_URL}/product-details/${product.slug}`,
              priceCurrency: "KES",
              price: product.sellingPrice,
              availability:
                product.stock > 0
                  ? "https://schema.org/InStock"
                  : "https://schema.org/OutOfStock",
            },
          }),
        }}
      />

      {/* Breadcrumb Schema */}
      <Script
        id="breadcrumbs-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            itemListElement: [
              { "@type": "ListItem", position: 1, name: "Home", item: "https://colltechhub.com" },
              {
                "@type": "ListItem",
                position: 2,
                name: product.category,
                item: `https://colltechhub.com/category-product/${product.category}`,
              },
              { "@type": "ListItem", position: 3, name: product.productName },
            ],
          }),
        }}
      />

      <ProductDetailsClient product={product} />
    </>
  );
}
