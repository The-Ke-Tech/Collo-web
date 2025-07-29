'use client';

import React, {
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { FaStar, FaStarHalf } from 'react-icons/fa';
import Context from '@/context';
import addToCart from '@/helpers/addToCart';
import displayKESCurrency from '@/helpers/displayCurrency';
import CategoryWiseProductDisplay from '@/components/categorywise-display';

// ------------------- Types -------------------
interface ProductType {
  id: string;
  productName: string;
  brandName: string;
  category: string;
  productImage: string[];
  description: string;
  price: number;
  sellingPrice: number;
  stock: number;
}

interface ZoomCoords {
  x: number;
  y: number;
}
// ---------------------------------------------

const ProductDetails = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const productId = searchParams.get('id');

  const [data, setData] = useState<ProductType>({
    id: '',
    productName: '',
    brandName: '',
    category: '',
    productImage: [],
    description: '',
    price: 0,
    sellingPrice: 0,
    stock: 0,
  });

  const [loading, setLoading] = useState<boolean>(true);
  const [activeImage, setActiveImage] = useState<string>('');
  const [zoomImage, setZoomImage] = useState<boolean>(false);
  const [zoomCoords, setZoomCoords] = useState<ZoomCoords>({ x: 0, y: 0 });

  const scrollRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);

  const { fetchUserAddToCart } = useContext(Context);

  useEffect(() => {
  const fetchDetails = async () => {
    if (!productId) return;
    setLoading(true);
    try {
      const res = await fetch('/api/product-details', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId }),
      });
      const json = await res.json();
      if (json.success) {
        setData({
          _id: json.data.id,
          ...json.data
        });
        setActiveImage(json.data.productImage[0]);
      } else {
        console.error('Error:', json.message);
      }
    } catch (err) {
      console.error('Error fetching product details:', err);
    } finally {
      setLoading(false);
    }
  };
  fetchDetails();
}, [productId]);

  const handleZoom = useCallback(
    (e: React.MouseEvent<HTMLImageElement>) => {
      setZoomImage(true);
      const rect = e.currentTarget.getBoundingClientRect();
      setZoomCoords({
        x: (e.clientX - rect.left) / rect.width,
        y: (e.clientY - rect.top) / rect.height,
      });
    },
    []
  );

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

  const scrollLeft = () =>
    scrollRef.current?.scrollBy({ left: -150, behavior: 'smooth' });

  const scrollRight = () =>
    scrollRef.current?.scrollBy({ left: 150, behavior: 'smooth' });

  return (
    <div className="container mx-auto p-4">
      <div className="flex flex-col lg:flex-row gap-4 min-h-[200px]">
        {/* Image gallery */}
        <div className="flex flex-col lg:flex-row gap-4 h-full relative">
          <div
            ref={scrollRef}
            className="flex gap-2 lg:flex-col overflow-x-auto h-full scrollbar-none"
          >
            <button onClick={scrollLeft} className="hidden md:block">
              ◀
            </button>
            {loading
              ? Array.from({ length: 4 }).map((_, i) => (
                  <div
                    key={i}
                    className="h-20 w-20 bg-slate-200 animate-pulse"
                  />
                ))
              : data.productImage.map((url) => (
                  <img
                    key={url}
                    src={url}
                    onClick={() => setActiveImage(url)}
                    className="h-20 w-20 object-contain cursor-pointer"
                    alt="product thumbnail"
                  />
                ))}
            <button onClick={scrollRight} className="hidden md:block">
              ▶
            </button>
          </div>

          <div className="relative bg-slate-200 p-2 h-[300px] lg:h-96 lg:w-96">
            <img
              ref={imageRef}
              src={activeImage}
              alt={data.productName}
              className="h-full w-full object-contain mix-blend-multiply"
              onMouseMove={handleZoom}
              onMouseLeave={handleLeave}
              onTouchStart={handleTouchZoom}
              onTouchMove={handleTouchZoom}
              onTouchEnd={handleLeave}
            />
            {/* Zoom Preview */}
            {zoomImage && (
              <div className="absolute top-0 left-full ml-4 bg-white border hidden lg:block w-80 h-80 overflow-hidden z-10">
                <div
                  className="w-full h-full bg-no-repeat scale-150"
                  style={{
                    backgroundImage: `url(${activeImage})`,
                    backgroundPosition: `${zoomCoords.x * 100}% ${
                      zoomCoords.y * 100
                    }%`,
                    backgroundSize: '200% 200%',
                  }}
                />
              </div>
            )}
          </div>
        </div>

        {/* Product details */}
        {loading ? (
          <div className="space-y-4 animate-pulse w-full">
            <div className="bg-slate-200 h-6 w-32" />
            <div className="bg-slate-200 h-8 w-full" />
            <div className="bg-slate-200 h-6 w-24" />
            <div className="bg-slate-200 h-24 w-full" />
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            <span className="text-red-600 bg-red-200 inline-block px-2 rounded">
              {data.brandName}
            </span>
            <h2 className="text-2xl lg:text-4xl font-semibold">
              {data.productName}
            </h2>
            <p className="capitalize text-gray-500">{data.category}</p>

            <div className="text-yellow-500 flex items-center gap-1">
              <FaStar />
              <FaStar />
              <FaStar />
              <FaStar />
              <FaStarHalf />
            </div>

            <div className="flex items-center gap-4 text-2xl font-bold text-red-600">
              <span>{displayKESCurrency(data.sellingPrice)}</span>
              <span className="line-through text-gray-500">
                {displayKESCurrency(data.price)}
              </span>
            </div>
{/* Stock Status */}
<div className="mt-2">
  {data.stock > 0 ? (
    <p className="text-green-600 font-semibold">
      In Stock ({data.stock} available)
    </p>
  ) : (
    <p className="text-red-600 font-semibold">Out of Stock</p>
  )}
</div>

            <div className="flex gap-4">
  <button
    onClick={() => handleBuy(data.id)}
    disabled={data.stock <= 0}
    className={`border border-red-600 px-4 py-2 ${
      data.stock > 0
        ? 'text-red-600 hover:bg-red-600 hover:text-white'
        : 'text-gray-400 border-gray-400 cursor-not-allowed'
    }`}
  >
    Buy Now
  </button>
  <button
    onClick={() => handleAdd(data.id)}
    disabled={data.stock <= 0}
    className={`px-4 py-2 ${
      data.stock > 0
        ? 'bg-red-600 text-white hover:bg-red-700'
        : 'bg-gray-300 text-gray-500 cursor-not-allowed'
    }`}
  >
    Add to Cart
  </button>
</div>


            <div>
              <h3 className="font-semibold">Description</h3>
              <p>{data.description}</p>
            </div>
          </div>
        )}
      </div>

      {data.category && (
        <CategoryWiseProductDisplay
          category={data.category}
          heading="Recommended Products"
        />
      )}
    </div>
  );
};

export default ProductDetails;
