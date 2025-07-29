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
  stock: number; // Added stock
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
    e.preventDefault(); // Prevent navigation
    await addToCart(e, id);
    fetchUserAddToCart();
  };

  const fetchData = async () => {
    setLoading(true);
    const categoryProduct = await fetchCategoryWiseProduct(category);
    setLoading(false);
    setData(categoryProduct?.data || []);
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <div className="container mx-auto px-4 my-6 relative">
      <h2 className="text-2xl font-semibold py-4">{heading}</h2>

      <div className="grid grid-cols-[repeat(auto-fit,minmax(300px,320px))] justify-between md:gap-6 overflow-x-scroll scrollbar-none transition-all">
        {loading ? (
          loadingList.map((_, index) => (
            <div
              key={index}
              className="w-full min-w-[280px] md:min-w-[320px] max-w-[280px] md:max-w-[320px] bg-white rounded-sm shadow"
            >
              <div className="bg-slate-200 h-48 p-4 flex justify-center items-center animate-pulse" />
              <div className="p-4 grid gap-3">
                <div className="h-5 bg-slate-200 animate-pulse rounded-full"></div>
                <div className="h-4 bg-slate-200 animate-pulse rounded-full"></div>
                <div className="flex gap-3">
                  <div className="w-full h-4 bg-slate-200 animate-pulse rounded-full"></div>
                  <div className="w-full h-4 bg-slate-200 animate-pulse rounded-full"></div>
                </div>
                <div className="h-8 bg-slate-200 animate-pulse rounded-full"></div>
              </div>
            </div>
          ))
        ) : (
          data.map((product) => (
            <Link
              key={product?.id}
              href={`/product/${product?.id}`}
              className="w-full min-w-[280px] md:min-w-[320px] max-w-[280px] md:max-w-[320px] bg-white rounded-sm shadow relative"
            >
              <div className="bg-slate-200 h-48 p-4 flex justify-center items-center relative">
                <img
                  src={product?.productImage?.[0]}
                  alt={product?.productName}
                  className="object-scale-down h-full hover:scale-110 transition-all mix-blend-multiply"
                />
                {product.stock === 0 && (
                  <span className="absolute top-2 left-2 bg-red-600 text-white text-xs px-2 py-1 rounded">
                    Out of Stock
                  </span>
                )}
              </div>
              <div className="p-4 grid gap-3">
                <h2 className="font-medium text-base md:text-lg text-ellipsis line-clamp-1 text-black">
                  {product?.productName}
                </h2>
                <p className="capitalize text-slate-500">{product?.category}</p>
                <div className="flex gap-3">
                  <p className="text-red-600 font-medium">
                    {displayKESCurrency(product?.sellingPrice)}
                  </p>
                  <p className="text-slate-500 line-through">
                    {displayKESCurrency(product?.price)}
                  </p>
                </div>
                <button
                  className={`text-sm px-3 py-0.5 rounded-full ${
                    product.stock === 0
                      ? "bg-gray-400 text-white cursor-not-allowed"
                      : "bg-red-600 hover:bg-red-700 text-white"
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
