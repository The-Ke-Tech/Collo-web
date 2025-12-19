import { Metadata } from 'next';
import Script from 'next/script';
import { redirect } from 'next/navigation';
import ServiceDetailsClient from '../_components/service-client';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

// Fetch service by slug
async function getServiceBySlug(slug: string) {
  try {
    const res = await fetch(`${API_URL}/api/services/slug/${slug}`, {
      cache: 'no-store',
    });
    if (!res.ok) return null;
    const json = await res.json();
    return json.data ?? json;
  } catch (err) {
    console.error('Failed to fetch service by slug:', err);
    return null;
  }
}

// (Optional) Backward compatibility by ID
async function getServiceById(id: string) {
  try {
    const res = await fetch(`${API_URL}/api/services/id/${id}`, {
      cache: 'no-store',
    });
    if (!res.ok) return null;
    const json = await res.json();
    return json.data ?? json;
  } catch (err) {
    console.error('Failed to fetch service by ID:', err);
    return null;
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const slug = (await params).slug;
  const service = await getServiceBySlug(slug);

  if (!service) {
    return { title: 'Service Not Found | COLLTECH' };
  }

  return {
    title: `${service.serviceName} | COLLTECH Services`,
    description: service.description,
    openGraph: {
      title: service.serviceName,
      description: service.description,
      images: service.serviceImage?.map((img: string) => ({
        url: img,
        width: 800,
        height: 800,
        alt: service.serviceName,
      })),
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: service.serviceName,
      description: service.description,
      images: service.serviceImage?.[0],
    },
    alternates: {
      canonical: `${process.env.NEXT_PUBLIC_BASE_URL}/service-details/${service.slug}`,
    },
    robots: { index: true, follow: true },
  };
}

export default async function ServicePage({
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
    const serviceById = await getServiceById(idParam);
    if (serviceById) {
      redirect(`/service-details/${serviceById.slug}`);
    }
  }

  const service = await getServiceBySlug(slug);

  if (!service) {
    return (
      <div className="p-6 text-center text-gray-400">
        Service not found
      </div>
    );
  }

  return (
    <>
      {/* Service Schema */}
      <Script
        id="service-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'Service',
            name: service.serviceName,
            description: service.description,
            image: service.serviceImage,
            areaServed: 'KE',
            provider: {
              '@type': 'Organization',
              name: 'COLLTECH',
            },
            offers: {
              '@type': 'Offer',
              priceCurrency: 'KES',
              price: service.price,
              url: `${process.env.NEXT_PUBLIC_BASE_URL}/service-details/${service.slug}`,
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
            '@context': 'https://schema.org',
            '@type': 'BreadcrumbList',
            itemListElement: [
              {
                '@type': 'ListItem',
                position: 1,
                name: 'Home',
                item: 'https://colltechhub.com',
              },
              {
                '@type': 'ListItem',
                position: 2,
                name: service.category,
                item: `https://colltechhub.com/services/${service.category}`,
              },
              {
                '@type': 'ListItem',
                position: 3,
                name: service.serviceName,
              },
            ],
          }),
        }}
      />

      <ServiceDetailsClient service={service} />
    </>
  );
}
