'use client';

import React, { useCallback, useRef, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
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

const perks = [
  { icon: '⚡', text: 'Quick response' },
  { icon: '✅', text: 'Trusted team' },
  { icon: '💬', text: 'Clear pricing' },
];

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

  const waLink = `https://wa.me/254728619730?text=${encodeURIComponent(`Hello COLLTECH, I would like to request: ${service.serviceName}`)}`;

  return (
    <div className="bg-slate-100 min-h-screen w-full overflow-x-hidden">
      {/* Main block: stacks on phones, side-by-side from tablets up, fits one screen on large displays */}
      <div className="mx-auto w-full max-w-7xl px-3 sm:px-5 lg:px-8 py-3 flex flex-col gap-3 lg:min-h-[calc(100vh-4rem)] lg:justify-center">
        <nav className="text-xs sm:text-sm text-slate-500 flex flex-wrap items-center gap-x-1 gap-y-0.5" aria-label="Breadcrumb">
          <Link href="/" className="hover:text-[#7B2CBF]">Home</Link>
          <span>/</span>
          <Link href={`/services/${service.category}`} className="capitalize hover:text-[#7B2CBF]">{service.category}</Link>
          <span>/</span>
          <span className="text-slate-800 line-clamp-1 min-w-0">{service.serviceName}</span>
        </nav>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-start">
          {/* Image Gallery */}
          <section className="md:col-span-5 lg:col-span-5 bg-white rounded-2xl shadow-sm p-2.5 sm:p-3 min-w-0">
            <div className="flex flex-col-reverse lg:flex-row gap-2">
              {/* Thumbnails: row under the image, column beside it on large screens */}
              <div className="flex lg:flex-col items-center gap-1.5 min-w-0">
                <button onClick={scrollLeft} aria-label="Scroll thumbnails left" className="hidden sm:block lg:hidden text-slate-400 hover:text-[#7B2CBF] px-1">◀</button>
                <div ref={scrollRef} className="flex gap-2 lg:flex-col overflow-x-auto lg:overflow-x-visible lg:overflow-y-auto lg:max-h-[min(58vh,380px)] scrollbar-none min-w-0">
                  {images.map((img) => (
                    <Image
                      key={img}
                      src={img}
                      width={80}
                      height={80}
                      alt={service.serviceName}
                      onClick={() => setActiveImage(img)}
                      className={`h-11 w-11 sm:h-12 sm:w-12 lg:h-14 lg:w-14 shrink-0 object-cover rounded-lg cursor-pointer border-2 transition ${
                        activeImage === img ? 'border-[#7B2CBF]' : 'border-slate-200 hover:border-[#00C2D1]'
                      }`}
                    />
                  ))}
                </div>
                <button onClick={scrollRight} aria-label="Scroll thumbnails right" className="hidden sm:block lg:hidden text-slate-400 hover:text-[#7B2CBF] px-1">▶</button>
              </div>

              {/* Main image: fluid square on small screens, viewport-capped height on desktop */}
              <div className="relative bg-slate-50 rounded-xl overflow-hidden flex-1 min-w-0 aspect-[4/3] max-h-[55vh] sm:aspect-square md:max-h-none lg:aspect-auto lg:h-[min(58vh,380px)]">
                <Image
                  src={activeImage}
                  alt={service.serviceName}
                  width={400}
                  height={400}
                  sizes="(max-width: 768px) 100vw, (max-width: 1280px) 40vw, 500px"
                  priority
                  className="w-full h-full object-cover lg:cursor-zoom-in"
                  onMouseMove={handleZoom}
                  onMouseLeave={handleLeave}
                />
                {/* Inner zoom (desktop only) so it never overflows the screen */}
                {zoomImage && (
                  <div className="absolute inset-0 hidden lg:block pointer-events-none bg-white">
                    <div
                      className="w-full h-full bg-no-repeat"
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
          </section>

          {/* Service details card + request button directly below it */}
          <div className="md:col-span-7 lg:col-span-7 flex flex-col gap-3 min-w-0">
            <section className="bg-white rounded-2xl shadow-sm p-3.5 sm:p-4 lg:p-5 flex flex-col gap-2">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="text-[#00C2D1] bg-[#00C2D1]/10 px-2.5 py-0.5 rounded-md text-xs font-medium capitalize">
                  {service.category}
                </span>
                <div className="flex items-center gap-0.5 text-yellow-400 text-xs">
                  <FaStar /><FaStar /><FaStar /><FaStar /><FaStarHalf />
                  <span className="ml-1.5 text-slate-500">(4.5)</span>
                </div>
              </div>

              <h1 className="text-lg sm:text-xl lg:text-2xl font-semibold text-slate-900 leading-snug break-words">
                {service.serviceName}
              </h1>

              <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                <div className="text-xl sm:text-2xl lg:text-3xl font-bold text-slate-900 break-words">
                  {service.startingFrom ? <span className="text-sm font-medium text-slate-500">From </span> : ''}
                  {displayKESCurrency(service.price)}
                  {service.unitLabel && <span className="text-sm font-medium text-slate-500">{` / ${service.unitLabel}`}</span>}
                </div>
                {service.pricingType && (
                  <p className="text-xs text-slate-500">
                    Pricing type: <span className="capitalize font-medium text-slate-700">{service.pricingType}</span>
                  </p>
                )}
              </div>

              {service.description && (
                <div className="border-t border-slate-100 pt-2">
                  <h3 className="font-semibold text-slate-900 text-sm mb-1">Service Description</h3>
                  <p className="text-slate-600 leading-relaxed text-sm whitespace-pre-line break-words max-h-32 sm:max-h-40 lg:max-h-[18vh] overflow-y-auto pr-1">
                    {service.description}
                  </p>
                </div>
              )}
            </section>

            <a
              href={waLink}
              target="_blank"
              rel="noopener noreferrer"
              className="block text-center w-full bg-gradient-to-r from-[#00C2D1] to-[#7B2CBF] text-white py-3 px-4 rounded-xl font-semibold text-sm sm:text-base shadow-md hover:opacity-90 hover:shadow-lg active:scale-[0.99] transition focus:outline-none focus-visible:ring-2 focus-visible:ring-[#7B2CBF] focus-visible:ring-offset-2"
            >
              Request This Service
            </a>

            <ul className="grid grid-cols-3 gap-2 text-[11px] sm:text-xs text-slate-600">
              {perks.map((p) => (
                <li key={p.text} className="bg-white rounded-xl shadow-sm py-2 px-1.5 flex flex-col sm:flex-row items-center justify-center gap-0.5 sm:gap-1.5 text-center">
                  <span aria-hidden>{p.icon}</span>
                  <span className="font-medium leading-tight">{p.text}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Related Services (below the fold) */}
      {service.category && (
        <div className="mx-auto w-full max-w-7xl px-3 sm:px-5 lg:px-8 pb-6">
          <div className="bg-white rounded-2xl shadow-sm p-3 sm:p-4 overflow-hidden">
            <ServicesSection />
          </div>
        </div>
      )}
    </div>
  );
}