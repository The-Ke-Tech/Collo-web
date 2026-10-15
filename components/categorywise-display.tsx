'use client';

import React, { useEffect, useState } from "react";
import fetchCategoryWiseProduct from "../helpers/fetchCategoryWiseProduct";
import displayKESCurrency from "@/helpers/displayCurrency";
import Link from "next/link";
import { useCartStore } from "@/store/cart-store";

interface CategoryWiseProductDisplayProps {
  category: string;
  heading: string;
}

interface Product {
  id?: string;   // some responses use `id`...
  _id?: string;  // ...the backend (MongoDB) sends `_id`
  slug: string;
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
  const loadingList = new Array(8).fill(null);

  const { addToCart } = useCartStore();

  const handleAddToCart = async (e: React.MouseEvent<HTMLButtonElement>, id: string) => {
    e.preventDefault();
    await addToCart(id); // uses cart store which handles login & toast
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      const categoryProduct = await fetchCategoryWiseProduct(category);
      setData(categoryProduct?.data || []);
    } catch (err) {
      console.error("Failed to fetch category products:", err);
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [category]);

  // 📱 Small screens: ONE horizontal swipe row of small cards (snap scrolling).
  // sm and up: a compact auto-fitting grid.
  const rowClass =
    "flex gap-2 overflow-x-auto snap-x snap-mandatory scrollbar-none -mx-1 px-1 pb-1 " +
    "sm:mx-0 sm:px-0 sm:pb-0 sm:grid sm:grid-cols-[repeat(auto-fill,minmax(150px,1fr))] sm:gap-3 sm:overflow-visible " +
    "lg:grid-cols-[repeat(auto-fill,minmax(170px,1fr))] lg:gap-4";
  const cardSize = "w-[128px] shrink-0 snap-start sm:w-auto sm:shrink";

  return (
    <div className="bg-gradient-to-b from-[#00C2D1] via-[#4B3F72] to-[#7B2CBF] py-3 px-2.5 sm:py-5 sm:px-4 my-3 sm:my-5 rounded-xl shadow-lg">
      <h2 className="text-base sm:text-xl lg:text-2xl font-bold pb-2 sm:pb-3 text-white">{heading}</h2>

      <div className={rowClass}>
        {loading
          ? loadingList.map((_, index) => (
              <div key={index} className={`${cardSize} bg-white rounded-lg shadow-md p-2 animate-pulse`}>
                <div className="bg-gray-300 h-20 sm:h-28 rounded-md"></div>
                <div className="mt-2 space-y-2">
                  <div className="h-3 bg-gray-300 rounded"></div>
                  <div className="h-3 bg-gray-300 rounded w-2/3"></div>
                  <div className="h-6 bg-gray-300 rounded"></div>
                </div>
              </div>
            ))
          : data.map((product, index) => {
              // The API returns `_id` (not `id`), so the old key={product.id} was undefined -> React key warning,
              // and "Add to Cart" received undefined. Use whichever id exists, with safe fallbacks for the key.
              const productId = (product._id ?? product.id) as string;
              return (
              <Link
                key={productId ?? product.slug ?? index}
                href={`/product-details/${product.slug}`}
                className={`${cardSize} bg-white rounded-lg shadow-md hover:shadow-xl hover:border-[#7B2CBF] border border-gray-200 transition-all flex flex-col`}
              >
                {/* Image */}
                <div className="bg-gray-50 h-20 sm:h-32 lg:h-36 flex justify-center items-center relative rounded-t-lg overflow-hidden p-1">
                  <img
                    src={product.productImage[0]}
                    alt={product.productName}
                    loading="lazy"
                    className="object-contain h-full max-w-full hover:scale-105 transition-transform duration-300"
                  />
                  {product.stock === 0 && (
                    <span className="absolute top-1 left-1 bg-red-600 text-white text-[9px] sm:text-xs px-1.5 py-0.5 rounded">
                      Out of Stock
                    </span>
                  )}
                </div>

                {/* Content */}
                <div className="p-2 sm:p-3 flex flex-col gap-1 flex-1">
                  <h2 className="font-semibold text-xs sm:text-sm text-gray-900 line-clamp-2 leading-tight hover:text-[#7B2CBF] transition">
                    {product.productName}
                  </h2>
                  <p className="hidden sm:block capitalize text-gray-500 text-xs">{product.category}</p>
                  <div className="flex flex-wrap gap-x-2 items-baseline">
                    <p className="text-[#7B2CBF] font-bold text-xs sm:text-base">
                      {displayKESCurrency(product.sellingPrice)}
                    </p>
                    <p className="text-gray-400 line-through text-[10px] sm:text-xs">
                      {displayKESCurrency(product.price)}
                    </p>
                  </div>
                  <button
                    className={`mt-auto w-full text-[11px] sm:text-sm px-2 py-1.5 rounded-md font-medium shadow ${
                      product.stock === 0
                        ? "bg-gray-400 text-white cursor-not-allowed"
                        : "bg-gradient-to-r from-[#00C2D1] to-[#7B2CBF] hover:opacity-90 text-white transition active:scale-95"
                    }`}
                    onClick={(e) => product.stock > 0 && handleAddToCart(e, productId)}
                    disabled={product.stock === 0}
                  >
                    {product.stock === 0 ? "Unavailable" : "Add to Cart"}
                  </button>
                </div>
              </Link>
              );
            })}
      </div>
    </div>
  );
};

export default CategoryWiseProductDisplay;