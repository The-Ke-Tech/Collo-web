'use client';

import React, { useCallback, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { FaStar, FaStarHalf } from 'react-icons/fa';
import Image from 'next/image';
import displayKESCurrency from '@/helpers/displayCurrency';
import CategoryWiseProductDisplay from '@/components/categorywise-display';
import { useAuthStore } from '@/store/auth-store';
import { useCartStore } from '@/store/cart-store';

interface ProductType {
  _id: string;
  slug: string;
  productName?: string | null;
  brandName?: string | null;
  category?: string | null;
  productImage: string[];
  description?: string | null;
  price?: number | null;
  sellingPrice?: number | null;
  stock: number;
}

interface ZoomCoords {
  x: number;
  y: number;
}

const perks = [
  { icon: '🚚', title: 'Fast delivery', text: 'Nairobi & countrywide shipping' },
  { icon: '💳', title: 'Pay on delivery', text: 'M-Pesa & cash options' },
  { icon: '🛡️', title: 'Genuine products', text: 'Quality checked before dispatch' },
  { icon: '↩️', title: 'Easy returns', text: 'Help from our support team' },
];

export default function ProductDetailsClient({ product }: { product: ProductType }) {
  const router = useRouter();
  const isLoggedIn = useAuthStore((s) => s.isLoggedIn);
  const addToCart = useCartStore((s) => s.addToCart);

  const [activeImage, setActiveImage] = useState<string>(product.productImage[0]);
  const [zoomImage, setZoomImage] = useState(false);
  const [zoomCoords, setZoomCoords] = useState<ZoomCoords>({ x: 0, y: 0 });
  const scrollRef = useRef<HTMLDivElement>(null);

  const redirectToLogin = () => {
    const path = typeof window !== 'undefined' ? window.location.pathname : '/';
    router.push(`/login?redirect=${encodeURIComponent(path)}`);
  };

  const handleZoom = useCallback((e: React.MouseEvent<HTMLImageElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setZoomCoords({
      x: (e.clientX - rect.left) / rect.width,
      y: (e.clientY - rect.top) / rect.height,
    });
    setZoomImage(true);
  }, []);

  const handleTouchZoom = (e: React.TouchEvent<HTMLImageElement>) => {
    if (e.touches.length === 1) {
      const rect = e.currentTarget.getBoundingClientRect();
      const touch = e.touches[0];
      setZoomCoords({
        x: (touch.clientX - rect.left) / rect.width,
        y: (touch.clientY - rect.top) / rect.height,
      });
      setZoomImage(true);
    }
  };

  const handleLeave = () => setZoomImage(false);

  const [adding, setAdding] = useState(false);
  const [added, setAdded] = useState(false);

  const handleAdd = async () => {
    if (!isLoggedIn()) return redirectToLogin();
    if (adding) return; // prevent double click
    setAdding(true);
    await addToCart(product._id);
    setAdding(false);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  const handleBuy = async () => {
    if (!isLoggedIn()) return redirectToLogin();
    await addToCart(product._id);
    router.push('/cart');
  };

  const scrollLeft = () => scrollRef.current?.scrollBy({ left: -150, behavior: 'smooth' });
  const scrollRight = () => scrollRef.current?.scrollBy({ left: 150, behavior: 'smooth' });

  const inStock = product.stock > 0;
  const discount =
    product.price && product.sellingPrice && product.price > product.sellingPrice
      ? Math.round(((product.price - product.sellingPrice) / product.price) * 100)
      : 0;

  return (
    <div className="bg-slate-100 min-h-screen w-full overflow-x-hidden">
      <div className="mx-auto w-full max-w-7xl px-2 sm:px-4 lg:px-6 py-2 sm:py-4 space-y-2 sm:space-y-3">
        {/* Breadcrumb */}
        <nav className="text-[11px] sm:text-sm text-slate-500 flex items-center gap-1 min-w-0" aria-label="Breadcrumb">
          <Link href="/" className="shrink-0 hover:text-[#7B2CBF]">Home</Link>
          <span>/</span>
          {product.category && (
            <>
              <Link href={`/category-product/${product.category}`} className="shrink-0 capitalize hover:text-[#7B2CBF]">
                {product.category}
              </Link>
              <span>/</span>
            </>
          )}
          <span className="text-slate-800 truncate min-w-0">{product.productName}</span>
        </nav>

        {/* On phones this block is exactly one screen tall, so image, buttons and every product
            detail are visible without scrolling the page (long descriptions scroll inside their card). */}
        <div className="flex flex-col gap-2 h-[calc(100dvh-var(--header-h,132px)-5rem)] min-h-[26rem] md:h-auto md:min-h-0 md:grid md:grid-cols-12 md:gap-3 md:items-start">
          {/* LEFT: product display card + action buttons directly below it */}
          <div className="flex flex-col gap-2 shrink-0 md:col-span-5 min-w-0">
            <section className="bg-white rounded-xl shadow-sm p-2 md:p-4 relative min-w-0">
              {discount > 0 && (
                <span className="absolute top-2 left-2 md:top-4 md:left-4 z-10 bg-[#7B2CBF] text-white text-[10px] md:text-xs font-bold px-2 py-0.5 md:px-2.5 md:py-1 rounded-full">
                  -{discount}%
                </span>
              )}
              <div className="flex flex-col-reverse lg:flex-row gap-2 md:gap-3 relative">
                <div className="flex lg:flex-col items-center gap-1.5 min-w-0">
                  <button onClick={scrollLeft} aria-label="Scroll left" className="hidden sm:block lg:hidden text-slate-400 hover:text-[#7B2CBF]">◀</button>
                  <div ref={scrollRef} className="flex gap-1.5 md:gap-2 lg:flex-col overflow-x-auto lg:overflow-visible scrollbar-none min-w-0">
                    {product.productImage.map((url) => (
                      <Image
                        key={url}
                        src={url}
                        width={80}
                        height={80}
                        alt={product.productName ?? 'COLLTECH'}
                        onClick={() => setActiveImage(url)}
                        className={`h-10 w-10 sm:h-12 sm:w-12 lg:h-[72px] lg:w-[72px] shrink-0 object-contain cursor-pointer rounded-lg border-2 bg-white p-0.5 lg:p-1 transition ${
                          activeImage === url ? 'border-[#7B2CBF]' : 'border-slate-200 hover:border-[#00C2D1]'
                        }`}
                      />
                    ))}
                  </div>
                  <button onClick={scrollRight} aria-label="Scroll right" className="hidden sm:block lg:hidden text-slate-400 hover:text-[#7B2CBF]">▶</button>
                </div>

                <div className="relative bg-white w-full h-[26dvh] min-h-[140px] sm:h-[34dvh] md:h-[300px] lg:h-[420px] lg:flex-1 rounded-lg border border-slate-100 min-w-0">
                  <Image
                    src={activeImage}
                    alt={product.productName ?? 'COLLTECH'}
                    width={400}
                    height={400}
                    priority
                    className="h-full w-full object-contain lg:cursor-zoom-in"
                    onMouseMove={handleZoom}
                    onMouseLeave={handleLeave}
                    onTouchStart={handleTouchZoom}
                    onTouchMove={handleTouchZoom}
                    onTouchEnd={handleLeave}
                  />
                  {zoomImage && (
                    <div className="absolute top-0 left-full ml-4 bg-white border border-slate-200 shadow-2xl hidden lg:block w-80 h-80 overflow-hidden z-20 rounded-lg">
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
            </section>

            {/* Action buttons: right below the product display card on every screen size */}
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={handleAdd}
                disabled={!inStock || adding}
                className={`w-full py-2.5 md:py-3 rounded-lg text-sm md:text-base font-semibold shadow-sm ${
                  inStock
                    ? 'bg-gradient-to-r from-[#00C2D1] to-[#7B2CBF] text-white hover:opacity-90 active:scale-[0.98] transition'
                    : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                }`}
              >
                {adding ? 'Adding…' : added ? '✓ Added' : 'Add to Cart'}
              </button>
              <button
                onClick={handleBuy}
                disabled={!inStock}
                className={`w-full py-2.5 md:py-3 rounded-lg text-sm md:text-base font-semibold border-2 ${
                  inStock
                    ? 'border-[#7B2CBF] bg-white text-[#7B2CBF] hover:bg-[#7B2CBF] hover:text-white active:scale-[0.98] transition'
                    : 'text-slate-400 border-slate-200 bg-white cursor-not-allowed'
                }`}
              >
                Buy Now
              </button>
            </div>
          </div>

          {/* MIDDLE: product info (fills the remaining phone height; scrolls inside if very long) */}
          <section className="bg-white rounded-xl shadow-sm p-3 md:p-5 flex flex-col gap-1.5 md:gap-3 flex-1 min-h-0 overflow-y-auto md:overflow-visible md:flex-none md:col-span-7 lg:col-span-4 min-w-0">
            <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
              {product.brandName && (
                <span className="text-[#00C2D1] bg-[#00C2D1]/10 w-fit px-2 py-0.5 md:px-2.5 md:py-1 rounded-md text-xs md:text-sm font-medium">
                  {product.brandName}
                </span>
              )}
              {product.category && (
                <p className="capitalize text-xs md:text-sm text-slate-500">Category: {product.category}</p>
              )}
            </div>

            <h2 className="text-base sm:text-lg md:text-xl lg:text-2xl font-semibold text-slate-900 leading-snug break-words">
              {product.productName}
            </h2>

            <div className="text-yellow-400 flex items-center gap-1 text-xs md:text-sm">
              <FaStar /><FaStar /><FaStar /><FaStar /><FaStarHalf />
              <span className="ml-1.5 text-slate-500">(4.5)</span>
            </div>

            <hr className="hidden md:block border-slate-100" />

            <div className="flex flex-wrap items-baseline gap-x-3 gap-y-0.5">
              <span className="text-xl md:text-3xl font-bold text-slate-900">{displayKESCurrency(product.sellingPrice ?? 0)}</span>
              {product.price && (
                <span className="line-through text-sm text-slate-400">{displayKESCurrency(product.price)}</span>
              )}
              {discount > 0 && (
                <span className="bg-[#7B2CBF]/10 text-[#7B2CBF] text-xs md:text-sm font-semibold px-2 py-0.5 rounded">
                  Save {discount}%
                </span>
              )}
            </div>

            <div>
              {inStock ? (
                <p className="text-emerald-600 font-semibold text-xs md:text-sm">
                  ● In Stock ({product.stock} available)
                  {product.stock <= 5 && <span className="ml-2 text-orange-500">Only a few left!</span>}
                </p>
              ) : (
                <p className="text-red-500 font-semibold text-xs md:text-sm">● Out of Stock</p>
              )}
            </div>

            {product.description && (
              <div className="md:mt-2">
                <h3 className="font-semibold text-sm md:text-base text-slate-900 mb-0.5 md:mb-1">Product Description</h3>
                <p className="text-slate-600 leading-relaxed text-xs md:text-sm whitespace-pre-line break-words">{product.description}</p>
              </div>
            )}
          </section>

          {/* RIGHT: delivery & trust. A slim one-line strip on phones, a full card on larger screens */}
          <aside className="bg-white rounded-xl shadow-sm p-2 md:p-4 lg:p-5 shrink-0 md:col-span-12 lg:col-span-3 lg:h-fit min-w-0">
            <h3 className="hidden lg:block font-semibold text-slate-900 mb-3">Delivery &amp; Services</h3>
            <ul className="flex gap-2 overflow-x-auto scrollbar-none md:grid md:grid-cols-4 md:gap-4 md:overflow-visible lg:flex lg:flex-col lg:gap-4">
              {perks.map((p) => (
                <li
                  key={p.title}
                  className="flex shrink-0 items-center gap-1.5 rounded-full bg-slate-50 px-2.5 py-1 md:items-start md:gap-3 md:rounded-none md:bg-transparent md:p-0"
                >
                  <span className="text-base md:text-xl" aria-hidden>{p.icon}</span>
                  <div>
                    <p className="text-[11px] md:text-sm font-medium text-slate-800 whitespace-nowrap md:whitespace-normal">{p.title}</p>
                    <p className="hidden md:block text-xs text-slate-500">{p.text}</p>
                  </div>
                </li>
              ))}
            </ul>
            <a
              href="https://wa.me/254728619730"
              target="_blank"
              rel="noopener noreferrer"
              className="hidden lg:block mt-5 text-center text-sm font-medium text-[#00C2D1] border border-[#00C2D1] rounded-lg py-2 hover:bg-[#00C2D1] hover:text-white transition"
            >
              Chat with us on WhatsApp
            </a>
          </aside>
        </div>

        {product.category && (
          <CategoryWiseProductDisplay category={product.category} heading="Recommended Products" />
        )}
      </div>
    </div>
  );
}