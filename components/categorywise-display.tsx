"use client";

import React, { useContext, useEffect, useState } from "react";
import fetchCategoryWiseProduct from "../helpers/fetchCategoryWiseProduct";
import displayKESCurrency from "../helpers/displayCurrency";
import Link from "next/link";
import addToCart from "../helpers/addToCart";
import Context from "../context";
import { useRouter } from "next/navigation";

interface CategoryWiseProductDisplayProps {
  category: string;
  heading: string;
}

interface Product {
  id: string;
  productImage: string[];
  productName: string;
  category: string;
  sellingPrice: number;
  price: number;
  stock: number;
}

const CategoryWiseProductDisplay = ({
  category,
  heading,
}: CategoryWiseProductDisplayProps) => {
  const [data, setData] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const loadingList = new Array(13).fill(null);

  const { fetchUserAddToCart } = useContext(Context) || {
    fetchUserAddToCart: () => {},
  };
  const router = useRouter();

  const handleAddToCart = async (
    e: React.MouseEvent<HTMLButtonElement>,
    id: string
  ) => {
    e.preventDefault();
    await addToCart(e, id);
    fetchUserAddToCart();
  };

  const fetchData = async () => {
    setLoading(true);
    const categoryProduct = await fetchCategoryWiseProduct(category);
    setData(categoryProduct?.data || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <div className="bg-gradient-to-b from-black via-gray-900 to-gray-800 py-8 px-4 my-6 rounded-lg shadow-inner">
      <h2 className="text-2xl font-bold py-4 text-white">{heading}</h2>

      <div className="grid grid-cols-[repeat(auto-fit,minmax(300px,320px))] justify-between md:gap-6 overflow-x-scroll scrollbar-none transition-all">
        {loading ? (
          loadingList.map((_, index) => (
            <div
              key={index}
              className="w-full min-w-[280px] md:min-w-[320px] max-w-[280px] md:max-w-[320px] bg-white rounded-md shadow"
            >
              <div className="bg-gray-200 h-48 p-4 flex justify-center items-center animate-pulse rounded-t-md" />
              <div className="p-4 grid gap-3">
                <div className="h-5 bg-gray-200 animate-pulse rounded-full"></div>
                <div className="h-4 bg-gray-200 animate-pulse rounded-full"></div>
                <div className="flex gap-3">
                  <div className="w-full h-4 bg-gray-200 animate-pulse rounded-full"></div>
                  <div className="w-full h-4 bg-gray-200 animate-pulse rounded-full"></div>
                </div>
                <div className="h-8 bg-gray-200 animate-pulse rounded-full"></div>
              </div>
            </div>
          ))
        ) : (
          data.map((product) => (
            <Link
              key={product?.id}
              href={`/product/${product?.id}`}
              className="w-full min-w-[280px] md:min-w-[320px] max-w-[280px] md:max-w-[320px] bg-white rounded-md shadow hover:shadow-xl hover:border-blue-500 border border-gray-300 transition"
            >
              <div className="bg-gray-50 h-48 p-4 flex justify-center items-center relative rounded-t-md">
                <img
                  src={product?.productImage?.[0]}
                  alt={product?.productName}
                  className="object-scale-down h-full hover:scale-105 transition-transform duration-300"
                />
                {product.stock === 0 && (
                  <span className="absolute top-2 left-2 bg-red-600 text-white text-xs px-2 py-1 rounded">
                    Out of Stock
                  </span>
                )}
              </div>
              <div className="p-4 grid gap-3">
                <h2 className="font-semibold text-base md:text-lg text-gray-900 line-clamp-1 hover:text-blue-600 transition">
                  {product?.productName}
                </h2>
                <p className="capitalize text-gray-500 text-sm">{product?.category}</p>
                <div className="flex gap-3 items-center">
                  <p className="text-blue-700 font-bold text-base">
                    {displayKESCurrency(product?.sellingPrice)}
                  </p>
                  <p className="text-gray-400 line-through text-sm">
                    {displayKESCurrency(product?.price)}
                  </p>
                </div>
                <button
                  className={`text-sm px-3 py-1 rounded-full font-medium shadow ${
                    product.stock === 0
                      ? "bg-gray-400 text-white cursor-not-allowed"
                      : "bg-blue-700 hover:bg-blue-800 text-white transition"
                  }`}
                  onClick={(e) => product.stock > 0 && handleAddToCart(e, product?.id)}
                  disabled={product.stock === 0}
                >
                  {product.stock === 0 ? "Unavailable" : "Add to Cart"}
                </button>
              </div>
            </Link>
          ))
        )}
      </div>
    </div>
  );
};

export default CategoryWiseProductDisplay;
