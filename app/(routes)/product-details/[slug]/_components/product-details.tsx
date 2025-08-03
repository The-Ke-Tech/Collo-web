'use client';

import React, { useCallback, useContext, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { FaStar, FaStarHalf } from 'react-icons/fa';
import Context from '@/context';
import addToCart from '@/helpers/addToCart';
import displayKESCurrency from '@/helpers/displayCurrency';
import CategoryWiseProductDisplay from '@/components/categorywise-display';
import Image from 'next/image';

interface ProductType {
  id: string;
  slug: string;
  productName: string | null;
  brandName: string | null;
  category: string | null;
  productImage: string[];
  description: string | null;
  price: number | null;
  sellingPrice: number | null;
  stock: number;
}

interface ZoomCoords { x: number; y: number; }

export default function ProductDetailsClient({ product }: { product: ProductType }) {
  const router = useRouter();
  const { fetchUserAddToCart } = useContext(Context);

  const [activeImage, setActiveImage] = useState<string>(product.productImage[0]);
  const [zoomImage, setZoomImage] = useState<boolean>(false);
  const [zoomCoords, setZoomCoords] = useState<ZoomCoords>({ x: 0, y: 0 });

  const scrollRef = useRef<HTMLDivElement>(null);

  const handleZoom = useCallback((e: React.MouseEvent<HTMLImageElement>) => {
    setZoomImage(true);
    const rect = e.currentTarget.getBoundingClientRect();
    setZoomCoords({
      x: (e.clientX - rect.left) / rect.width,
      y: (e.clientY - rect.top) / rect.height,
    });
  }, []);

  const handleTouchZoom = (e: React.TouchEvent<HTMLImageElement>) => {
    if (e.touches.length === 1) {
      const rect = e.currentTarget.getBoundingClientRect();
      const touch = e.touches[0];
      setZoomImage(true);
      setZoomCoords({
        x: (touch.clientX - rect.left) / rect.width,
        y: (touch.clientY - rect.top) / rect.height,
      });
    }
  };

  const handleLeave = () => setZoomImage(false);

  const handleAdd = async (id: string) => {
    await addToCart({} as React.SyntheticEvent, id);
    fetchUserAddToCart();
  };

  const handleBuy = async (id: string) => {
    await addToCart({} as React.SyntheticEvent, id);
    fetchUserAddToCart();
    router.push('/cart');
  };

  const scrollLeft = () => scrollRef.current?.scrollBy({ left: -150, behavior: 'smooth' });
  const scrollRight = () => scrollRef.current?.scrollBy({ left: 150, behavior: 'smooth' });

  return (
    <div className="container mx-auto p-6 bg-gradient-to-b from-[#00C2D1] via-[#4B3F72] to-[#7B2CBF] text-gray-100 rounded-lg shadow-lg">
      <div className="flex flex-col lg:flex-row gap-6 min-h-[200px]">
        {/* Image gallery */}
        <div className="flex flex-col lg:flex-row gap-4 h-full relative">
          <div ref={scrollRef} className="flex gap-2 lg:flex-col overflow-x-auto h-full scrollbar-none">
            <button onClick={scrollLeft} className="hidden md:block text-gray-300 hover:text-white">◀</button>
            {product.productImage.map((url) => (
              <Image
                key={url}
                src={url}
                width={80}
                height={80}
                onClick={() => setActiveImage(url)}
                className="h-20 w-20 object-contain cursor-pointer rounded border border-gray-400 hover:border-[#7B2CBF] transition"
                alt={product.productName ?? 'COLLTECH'}
              />
            ))}
            <button onClick={scrollRight} className="hidden md:block text-gray-300 hover:text-white">▶</button>
          </div>

          <div className="relative bg-gray-800 p-2 h-[300px] lg:h-96 lg:w-96 rounded">
            <Image
              src={activeImage}
              alt={product.productName ?? 'COLLTECH'}
              width={400}
              height={400}
              priority
              className="h-full w-full object-contain"
              onMouseMove={handleZoom}
              onMouseLeave={handleLeave}
              onTouchStart={handleTouchZoom}
              onTouchMove={handleTouchZoom}
              onTouchEnd={handleLeave}
            />
            {/* Zoom Preview */}
            {zoomImage && (
              <div className="absolute top-0 left-full ml-4 bg-gray-900 border border-gray-700 hidden lg:block w-80 h-80 overflow-hidden z-10 rounded">
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

        {/* Product details */}
        <div className="flex flex-col gap-3">
          <span className="text-[#00C2D1] bg-[#00C2D1]/10 inline-block px-2 py-1 rounded text-sm font-medium">{product.brandName}</span>
          <h2 className="text-2xl lg:text-4xl font-semibold text-white">{product.productName}</h2>
          <p className="capitalize text-gray-300">{product.category}</p>
          <div className="text-yellow-400 flex items-center gap-1"><FaStar /><FaStar /><FaStar /><FaStar /><FaStarHalf /></div>

          <div className="flex items-center gap-4 text-2xl font-bold text-[#7B2CBF]">
            <span>{displayKESCurrency(product.sellingPrice ?? 0)}</span>
            <span className="line-through text-gray-400">{displayKESCurrency(product.price ?? 0)}</span>
          </div>
          <div className="mt-2">
            {product.stock > 0 ? (
              <p className="text-green-400 font-semibold">In Stock ({product.stock} available)</p>
            ) : (
              <p className="text-red-500 font-semibold">Out of Stock</p>
            )}
          </div>

          <div className="flex gap-4">
            <button
              onClick={() => handleBuy(product.id)}
              disabled={product.stock <= 0}
              className={`border px-4 py-2 rounded ${
                product.stock > 0
                  ? 'border-[#00C2D1] text-[#00C2D1] hover:bg-[#00C2D1] hover:text-white transition'
                  : 'text-gray-500 border-gray-600 cursor-not-allowed'
              }`}
            >
              Buy Now
            </button>
            <button
              onClick={() => handleAdd(product.id)}
              disabled={product.stock <= 0}
              className={`px-4 py-2 rounded ${
                product.stock > 0
                  ? 'bg-gradient-to-r from-[#00C2D1] to-[#7B2CBF] text-white hover:opacity-90 transition'
                  : 'bg-gray-700 text-gray-500 cursor-not-allowed'
              }`}
            >
              Add to Cart
            </button>
          </div>

          <div>
            <h3 className="font-semibold text-gray-200">Description</h3>
            <p className="text-gray-300">{product.description}</p>
          </div>
        </div>
      </div>

      {product.category && (
        <CategoryWiseProductDisplay category={product.category} heading="Recommended Products" />
      )}
    </div>
  );
}
