'use client';

import React, { useEffect, useRef, useState } from 'react';
import fetchCategoryWiseProduct from '../helpers/fetchCategoryWiseProduct';
import { FaAngleLeft, FaAngleRight } from 'react-icons/fa6';
import Link from 'next/link';
import displayKESCurrency from '@/helpers/displayCurrency';
import { useCartStore } from '@/store/cart-store';

interface HorizontalCardProductProps {
  category: string;
  heading: string;
  // 'cart' (default) shows "Add To Cart"; 'view' shows a "View" button that opens the product page
  action?: 'cart' | 'view';
}

interface Product {
  _id: string;
  slug: string;
  productName: string;
  category: string;
  productImage: string[];
  sellingPrice: number;
  price: number;
  stock: number;
}

const HorizontalCardProduct = ({ category, heading, action = 'cart' }: HorizontalCardProductProps) => {
  const [data, setData] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const loadingList = new Array(13).fill(null);
  const scrollElement = useRef<HTMLDivElement>(null);
  const pausedRef = useRef(false);

  const { addToCart, fetchCart } = useCartStore();

  const handleAddToCart = async (
    e: React.MouseEvent<HTMLButtonElement>,
    id: string
  ) => {
    e.preventDefault();
    await addToCart(id);
  };

  const fetchData = async () => {
    setLoading(true);
    const categoryProduct = await fetchCategoryWiseProduct(category);
    setData(categoryProduct?.data || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, [category]);

  useEffect(() => {
    if (loading || data.length < 2) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const id = setInterval(() => {
      const el = scrollElement.current;
      if (!el || pausedRef.current) return;
      const atEnd = el.scrollLeft + el.clientWidth >= el.scrollWidth - 8;
      if (atEnd) el.scrollTo({ left: 0, behavior: 'smooth' });
      else el.scrollBy({ left: Math.max(220, el.clientWidth * 0.9), behavior: 'smooth' });
    }, 3500);

    return () => clearInterval(id);
  }, [loading, data.length]);

  const scrollRight = () => {
    const el = scrollElement.current;
    el?.scrollBy({ left: Math.max(220, el.clientWidth * 0.9), behavior: 'smooth' });
  };

  const scrollLeft = () => {
    const el = scrollElement.current;
    el?.scrollBy({ left: -Math.max(220, el.clientWidth * 0.9), behavior: 'smooth' });
  };

  const pause = () => { pausedRef.current = true; };
  const resume = () => { pausedRef.current = false; };
  const resumeLater = () => { setTimeout(resume, 4000); };

  // 📱 Fluid card widths (share of the row) instead of fixed pixel sizes:
  // Jumia-style density: 4 cards + a peek of the 5th on phones, growing to ~11 on very wide monitors.
  // Cards get bigger as the screen gets bigger, and a min width keeps them tappable on tiny phones.
  const cardSize =
    'basis-[22.5%] min-w-[72px] ' +
    'sm:basis-[18%] ' +
    'md:basis-[14.5%] ' +
    'lg:basis-[12%] ' +
    'xl:basis-[10.5%] ' +
    '2xl:basis-[9%]';
  // Slightly wide image box on phones (keeps cards short, not tall and slim), square from 640px up itself
  const imgSize = 'aspect-[5/4] w-full sm:aspect-square';

  return (
    // 📐 Stripped section spacing layout parameters entirely down to my-0
    <section className='mx-auto my-0 w-full px-1 md:px-3'>
      <div className='overflow-hidden rounded-md border border-white/5 shadow-sm sm:rounded-lg'>
        {/* Compact Heading Row */}
        <div className="flex items-center justify-between bg-gradient-to-r from-[#00C2D1] via-[#3A86FF] to-[#7B2CBF] px-2 py-1.5 sm:px-3 sm:py-2 md:py-2.5">
          <h2 className='text-xs font-bold text-white sm:text-sm md:text-base lg:text-lg'>{heading}</h2>
          {!loading && data.length > 0 && (
            <span className="rounded-full bg-white/20 px-1.5 py-px text-[9px] font-medium text-white sm:px-2 sm:text-[10px] md:text-xs">
              {data.length} items
            </span>
          )}
        </div>

        {/* Product List container */}
        <div
          className='relative bg-white'
          onMouseEnter={pause}
          onMouseLeave={resume}
          onFocus={pause}
          onBlur={resume}
          onTouchStart={pause}
          onTouchEnd={resumeLater}
        >
          {/* Scroll Buttons */}
          <button
            type='button'
            aria-label='Scroll left'
            className='absolute left-1 top-1/2 z-10 hidden -translate-y-1/2 rounded-full bg-gradient-to-r from-[#00C2D1] to-[#7B2CBF] p-2 text-sm shadow-lg transition hover:scale-105 md:block lg:p-2.5'
            onClick={scrollLeft}
          >
            <FaAngleLeft className="text-white" />
          </button>
          <button
            type='button'
            aria-label='Scroll right'
            className='absolute right-1 top-1/2 z-10 hidden -translate-y-1/2 rounded-full bg-gradient-to-r from-[#00C2D1] to-[#7B2CBF] p-2 text-sm shadow-lg transition hover:scale-105 md:block lg:p-2.5'
            onClick={scrollRight}
          >
            <FaAngleRight className="text-white" />
          </button>

          <div
            className='flex snap-x snap-mandatory items-stretch gap-1 overflow-x-auto p-1.5 scrollbar-none sm:gap-1.5 sm:p-2 md:gap-2 lg:gap-2.5'
            ref={scrollElement}
          >
            {/* Loading / Data Mapping remains identical to previous code */}
            {loading
              ? loadingList.map((_, index) => (
                  <div key={index} className={`flex ${cardSize} shrink-0 flex-col overflow-hidden rounded bg-gray-50`}>
                    <div className={`animate-pulse bg-gray-100 ${imgSize}`} />
                  </div>
                ))
              : data.map((product) => {
                  const discount = product.price > product.sellingPrice ? Math.round((1 - product.sellingPrice / product.price) * 100) : 0;
                  return (
                    <div key={product._id} className={`group relative flex ${cardSize} shrink-0 snap-start flex-col overflow-hidden rounded-md border border-gray-100 bg-white shadow-2xs transition duration-200 hover:border-[#7B2CBF] hover:shadow-md`}>
                      <Link href={`/product-details/${product.slug}`} className={`relative flex flex-shrink-0 items-center justify-center overflow-hidden bg-gradient-to-b from-gray-50 to-gray-100 ${imgSize}`}>
                        <img src={product.productImage[0]} loading='lazy' decoding='async' className='h-full w-full object-contain p-1 transition-transform duration-200 group-hover:scale-105' alt={product.productName} />
                        {product.stock === 0 && (
                          <span className='absolute left-1 top-1 rounded bg-red-600 px-1 py-px text-[8px] text-white sm:text-[9px] md:text-[10px]'>Out</span>
                        )}
                        {product.stock > 0 && discount > 0 && (
                          <span className='absolute right-1 top-1 rounded-full bg-gradient-to-r from-[#FF3D9A] to-[#7B2CBF] px-1 py-px text-[8px] font-bold text-white shadow sm:text-[9px] md:text-[10px]'>-{discount}%</span>
                        )}
                      </Link>
                      <div className='flex flex-1 flex-col justify-between gap-1 p-1 sm:p-2'>
                        <Link href={`/product-details/${product.slug}`} className='line-clamp-2 block break-words text-[10px] font-semibold leading-tight text-gray-800 hover:text-[#7B2CBF] sm:text-xs md:text-[13px] lg:text-sm'>{product.productName}</Link>
                        <div className='flex flex-wrap items-baseline gap-x-1'>
                          <p className='text-[11px] font-bold text-[#7B2CBF] sm:text-sm md:text-[15px] lg:text-base'>{displayKESCurrency(product.sellingPrice)}</p>
                          {discount > 0 && (
                            <p className='text-[8px] text-gray-400 line-through sm:text-[10px] md:text-xs'>{displayKESCurrency(product.price)}</p>
                          )}
                        </div>
                        {/* 👆 Full-width, thumb-sized button so "Add" is easy to tap on phones */}
                        {action === 'view' ? (
                          <Link
                            href={`/product-details/${product.slug}`}
                            className='flex min-h-6 w-full items-center justify-center whitespace-nowrap rounded-md bg-gradient-to-r from-[#00C2D1] to-[#7B2CBF] px-1 py-0.5 text-[9px] font-semibold text-white transition hover:opacity-90 active:scale-95 sm:min-h-8 sm:px-1.5 sm:py-1 sm:text-xs md:text-[13px]'
                          >
                            View
                          </Link>
                        ) : (
                          <button
                            className={`min-h-6 w-full whitespace-nowrap rounded-md px-1 py-0.5 text-[9px] font-semibold text-white transition active:scale-95 sm:min-h-8 sm:px-1.5 sm:py-1 sm:text-xs md:text-[13px] ${
                              product.stock === 0
                                ? 'cursor-not-allowed bg-gray-300'
                                : 'bg-gradient-to-r from-[#00C2D1] to-[#7B2CBF] hover:opacity-90'
                            }`}
                            onClick={(e) => product.stock > 0 && handleAddToCart(e, product._id)}
                            disabled={product.stock === 0}
                            type='button'
                          >
                            {product.stock === 0 ? 'Sold Out' : 'Add To Cart'}
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
          </div>
        </div>
      </div>
    </section>
  );
};

export default HorizontalCardProduct;