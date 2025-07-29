'use client';

import React, { useContext } from 'react';
import scrollTop from '../helpers/scrollTop';
import displayKESCurrency from '../helpers/displayCurrency';
import Context from '../context';
import addToCart from '../helpers/addToCart';
import Link from 'next/link';

type Product = {
  id: string;
  productName: string;
  productImage: string[];
  category: string;
  price: number;
  sellingPrice: number;
  stock: number; // Added stock
};

interface VerticalCardProps {
  data: Product[];
  loading: boolean;
}

const VerticalCard: React.FC<VerticalCardProps> = ({ loading, data }) => {
  const loadingList = new Array(13).fill(null);
  const { fetchUserAddToCart } = useContext(Context);

  const handleAddToCart = async (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    await addToCart(e, id);
    fetchUserAddToCart();
  };

  return (
    <div className='grid grid-cols-[repeat(auto-fit,minmax(260px,300px))] justify-center md:justify-between md:gap-4 overflow-x-scroll scrollbar-none transition-all'>
      {loading ? (
        loadingList.map((_, index) => (
          <div key={index} className='w-full min-w-[280px] md:min-w-[320px] max-w-[280px] md:max-w-[320px] bg-white rounded-sm shadow'>
            <div className='bg-slate-200 h-48 p-4 flex justify-center items-center animate-pulse'></div>
            <div className='p-4 grid gap-3'>
              <div className='h-6 bg-slate-200 rounded'></div>
              <div className='h-4 bg-slate-200 rounded'></div>
              <div className='flex gap-3'>
                <div className='w-1/2 h-4 bg-slate-200 rounded'></div>
                <div className='w-1/2 h-4 bg-slate-200 rounded'></div>
              </div>
              <div className='h-8 bg-slate-200 rounded'></div>
            </div>
          </div>
        ))
      ) : (
        data.map((product) => (
          <div
            key={product.id}
            className='w-full min-w-[280px] md:min-w-[300px] max-w-[280px] md:max-w-[300px] bg-white rounded-sm shadow'
          >
            <Link
              href={`/product-details?id=${product.id}`}
              onClick={scrollTop}
              className='bg-slate-200 h-48 p-4 flex justify-center items-center relative'
            >
              <img
                src={product.productImage[0]}
                alt={product.productName}
                className='object-scale-down h-full hover:scale-110 transition-all mix-blend-multiply'
              />
              {product.stock === 0 && (
                <span className="absolute top-2 left-2 bg-red-600 text-white text-xs px-2 py-1 rounded">
                  Out of Stock
                </span>
              )}
            </Link>
            <div className='p-4 grid gap-3'>
              <Link
                href={`/product-details?id=${product.id}`}
                onClick={scrollTop}
                className='font-medium text-base md:text-lg text-black line-clamp-1 hover:underline'
              >
                {product.productName}
              </Link>
              <p className='capitalize text-slate-500'>{product.category}</p>
              <div className='flex gap-3'>
                <p className='text-red-600 font-medium'>{displayKESCurrency(product.sellingPrice)}</p>
                <p className='text-slate-500 line-through'>{displayKESCurrency(product.price)}</p>
              </div>
              <div className='flex gap-3'>
                <button
                  className={`text-sm px-3 py-0.5 rounded-full ${
                    product.stock === 0
                      ? 'bg-gray-400 text-white cursor-not-allowed'
                      : 'bg-red-600 hover:bg-red-700 text-white'
                  }`}
                  onClick={(e) => product.stock > 0 && handleAddToCart(e, product.id)}
                  disabled={product.stock === 0}
                >
                  {product.stock === 0 ? 'Unavailable' : 'Add to Cart'}
                </button>
                <Link
                  href={`/product-details?id=${product.id}`}
                  onClick={scrollTop}
                  className='text-sm text-blue-600 hover:underline px-3 py-0.5'
                >
                  See Details
                </Link>
              </div>
            </div>
          </div>
        ))
      )}
    </div>
  );
};

export default VerticalCard;
