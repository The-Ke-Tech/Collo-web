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
  stock: number;
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
    <div className="bg-gradient-to-b from-black via-gray-900 to-gray-800 p-6 rounded-lg">
  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6">
    {loading
      ? loadingList.map((_, index) => (
          <div
            key={index}
            className="bg-white rounded-lg shadow-md border border-gray-300 animate-pulse"
          >
            <div className="bg-gray-500 h-48 rounded-t-lg"></div>
            <div className="p-4 grid gap-3">
              <div className="h-6 bg-gray-500 rounded"></div>
              <div className="h-4 bg-gray-500 rounded"></div>
              <div className="flex gap-3">
                <div className="w-1/2 h-4 bg-gray-500 rounded"></div>
                <div className="w-1/2 h-4 bg-gray-500 rounded"></div>
              </div>
              <div className="h-8 bg-gray-500 rounded"></div>
            </div>
          </div>
        ))
      : data.map((product) => (
          <div
            key={product.id}
            className="bg-white rounded-lg shadow-md border border-gray-300 hover:shadow-xl hover:border-blue-500 transition-all duration-300 flex flex-col"
          >
            <Link
              href={`/product-details?id=${product.id}`}
              onClick={scrollTop}
              className="bg-gray-50 h-48 flex justify-center items-center relative rounded-t-lg overflow-hidden"
            >
              <img
                src={product.productImage[0]}
                alt={product.productName}
                className="object-contain h-full max-w-full hover:scale-105 transition-transform duration-300"
              />
              {product.stock === 0 && (
                <span className="absolute top-2 left-2 bg-red-600 text-white text-xs px-2 py-1 rounded">
                  Out of Stock
                </span>
              )}
            </Link>
            <div className="p-4 flex-1 flex flex-col justify-between">
              <div>
                <Link
                  href={`/product-details?id=${product.id}`}
                  onClick={scrollTop}
                  className="font-semibold text-lg text-gray-900 line-clamp-2 hover:text-blue-600 transition"
                >
                  {product.productName}
                </Link>
                <p className="capitalize text-gray-500 text-sm">{product.category}</p>
                <div className="flex gap-3 items-center mt-2">
                  <p className="text-blue-700 font-bold text-base">
                    {displayKESCurrency(product.sellingPrice)}
                  </p>
                  <p className="text-gray-400 line-through text-sm">
                    {displayKESCurrency(product.price)}
                  </p>
                </div>
              </div>
              <div className="mt-4 flex gap-3">
                <button
                  className={`w-full text-sm px-3 py-2 rounded-md font-medium shadow ${
                    product.stock === 0
                      ? 'bg-gray-400 text-white cursor-not-allowed'
                      : 'bg-blue-700 hover:bg-blue-800 text-white transition'
                  }`}
                  onClick={(e) => product.stock > 0 && handleAddToCart(e, product.id)}
                  disabled={product.stock === 0}
                >
                  {product.stock === 0 ? 'Unavailable' : 'Add to Cart'}
                </button>
                <Link
                  href={`/product-details?id=${product.id}`}
                  onClick={scrollTop}
                  className="text-sm text-blue-700 hover:underline px-3 py-2"
                >
                  See Details
                </Link>
              </div>
            </div>
          </div>
        ))}
  </div>
</div>

  );
};

export default VerticalCard;
