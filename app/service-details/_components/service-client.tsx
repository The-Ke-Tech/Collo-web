'use client';

import React, { useCallback, useRef, useState } from 'react';
import Image from 'next/image';
import { FaStar, FaStarHalf } from 'react-icons/fa';
import displayKESCurrency from '@/helpers/displayCurrency';
import ServicesSection from '@/components/services';

interface ServiceType {
  _id: string;
  slug: string;
  serviceName: string;
  category: string;
  serviceImage?: string[];
  description?: string;
  price: number;
  startingFrom?: boolean;
  pricingType?: string;
  unitLabel?: string;
}

interface ZoomCoords {
  x: number;
  y: number;
}

export default function ServiceDetailsClient({ service }: { service: ServiceType }) {
  const images = service.serviceImage?.length ? service.serviceImage : ['/placeholder.png'];

  const [activeImage, setActiveImage] = useState(images[0]);
  const [zoomImage, setZoomImage] = useState(false);
  const [zoomCoords, setZoomCoords] = useState<ZoomCoords>({ x: 0, y: 0 });

  const scrollRef = useRef<HTMLDivElement>(null);

  const handleZoom = useCallback((e: React.MouseEvent<HTMLImageElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setZoomCoords({
      x: (e.clientX - rect.left) / rect.width,
      y: (e.clientY - rect.top) / rect.height,
    });
    setZoomImage(true);
  }, []);

  const handleLeave = () => setZoomImage(false);

  const scrollLeft = () => scrollRef.current?.scrollBy({ left: -150, behavior: 'smooth' });
  const scrollRight = () => scrollRef.current?.scrollBy({ left: 150, behavior: 'smooth' });

  return (
    <div className="container mx-auto p-6 bg-gradient-to-b from-[#00C2D1] via-[#4B3F72] to-[#7B2CBF] text-gray-100 rounded-xl shadow-lg">
      <div className="flex flex-col lg:flex-row gap-6">

        {/* Image Gallery */}
        <div className="flex flex-col lg:flex-row gap-4 relative">
          <div
            ref={scrollRef}
            className="flex gap-2 lg:flex-col overflow-x-auto scrollbar-none"
          >
            <button onClick={scrollLeft} className="hidden md:block text-gray-300">◀</button>

            {images.map((img) => (
              <Image
                key={img}
                src={img}
                width={80}
                height={80}
                alt={service.serviceName}
                onClick={() => setActiveImage(img)}
                className="h-20 w-20 object-cover rounded cursor-pointer border border-gray-400 hover:border-[#7B2CBF]"
              />
            ))}

            <button onClick={scrollRight} className="hidden md:block text-gray-300">▶</button>
          </div>

          <div className="relative bg-gray-800 p-2 h-[300px] lg:h-96 lg:w-96 rounded">
            <Image
              src={activeImage}
              alt={service.serviceName}
              width={400}
              height={400}
              priority
              className="w-full h-full object-cover"
              onMouseMove={handleZoom}
              onMouseLeave={handleLeave}
            />

            {zoomImage && (
              <div className="absolute top-0 left-full ml-4 hidden lg:block w-80 h-80 border border-gray-700 bg-gray-900 rounded overflow-hidden">
                <div
                  className="w-full h-full bg-no-repeat scale-150"
                  style={{
                    backgroundImage: `url(${activeImage})`,
                    backgroundPosition: `${zoomCoords.x * 100}% ${zoomCoords.y * 100}%`,
                    backgroundSize: '200% 200%',
                  }}
                />
              </div>
            )}
          </div>
        </div>

        {/* Service Info */}
        <div className="flex flex-col gap-4">
          <span className="text-[#00C2D1] bg-[#00C2D1]/10 px-3 py-1 rounded text-sm w-fit">
            {service.category}
          </span>

          <h1 className="text-3xl lg:text-4xl font-bold">{service.serviceName}</h1>

          <div className="flex items-center gap-1 text-yellow-400">
            <FaStar /><FaStar /><FaStar /><FaStar /><FaStarHalf />
          </div>

         <div className="w-fit text-2xl font-bold text-[#7B2CBF] bg-white px-3 py-1 rounded">
  {service.startingFrom ? 'From ' : ''}
  {displayKESCurrency(service.price)}
  {service.unitLabel && ` / ${service.unitLabel}`}
</div>


          {service.pricingType && (
            <p className="text-sm text-gray-300">
              Pricing type: <span className="capitalize">{service.pricingType}</span>
            </p>
          )}

          {service.description && (
            <div>
              <h3 className="font-semibold text-gray-200">Service Description</h3>
              <p className="text-gray-300 leading-relaxed">
                {service.description}
              </p>
            </div>
          )}

          <a
            href="https://wa.me/254728619730"
            target="_blank"
            className="mt-4 inline-block w-fit bg-gradient-to-r from-[#00C2D1] to-[#7B2CBF] text-white px-6 py-3 rounded-full font-medium hover:opacity-90 transition"
          >
            Request This Service
          </a>
        </div>
      </div>

      {/* Related Services */}
      {service.category && (
        <div className="mt-12">
          <ServicesSection />
        </div>
      )}
    </div>
  );
}
