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
  id: string;
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

  return (
    <div className="bg-gradient-to-b from-[#00C2D1] via-[#4B3F72] to-[#7B2CBF] py-10 px-6 my-8 rounded-xl shadow-lg">
      <h2 className="text-3xl font-bold py-4 text-white">{heading}</h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {loading
          ? loadingList.map((_, index) => (
              <div key={index} className="bg-white rounded-lg shadow-md p-4 animate-pulse">
                <div className="bg-gray-300 h-48 rounded-md"></div>
                <div className="mt-4 space-y-3">
                  <div className="h-6 bg-gray-300 rounded"></div>
                  <div className="h-4 bg-gray-300 rounded"></div>
                  <div className="h-4 bg-gray-300 rounded"></div>
                  <div className="h-8 bg-gray-300 rounded"></div>
                </div>
              </div>
            ))
          : data.map((product) => (
              <Link
                key={product.id}
                href={`/product-details/${product.slug}`}
                className="bg-white rounded-lg shadow-md hover:shadow-xl hover:border-[#7B2CBF] border border-gray-200 transition-all flex flex-col"
              >
                {/* Image */}
                <div className="bg-gray-50 h-52 flex justify-center items-center relative rounded-t-lg overflow-hidden">
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
                </div>

                {/* Content */}
                <div className="p-4 flex flex-col gap-2 flex-1">
                  <h2 className="font-semibold text-lg text-gray-900 line-clamp-2 hover:text-[#7B2CBF] transition">
                    {product.productName}
                  </h2>
                  <p className="capitalize text-gray-500 text-sm">{product.category}</p>
                  <div className="flex gap-3 items-center mt-1">
                    <p className="text-[#7B2CBF] font-bold text-lg">
                      {displayKESCurrency(product.sellingPrice)}
                    </p>
                    <p className="text-gray-400 line-through text-sm">
                      {displayKESCurrency(product.price)}
                    </p>
                  </div>
                  <button
                    className={`mt-auto text-sm px-4 py-2 rounded-md font-medium shadow ${
                      product.stock === 0
                        ? "bg-gray-400 text-white cursor-not-allowed"
                        : "bg-gradient-to-r from-[#00C2D1] to-[#7B2CBF] hover:opacity-90 text-white transition"
                    }`}
                    onClick={(e) => product.stock > 0 && handleAddToCart(e, product.id)}
                    disabled={product.stock === 0}
                  >
                    {product.stock === 0 ? "Unavailable" : "Add to Cart"}
                  </button>
                </div>
              </Link>
            ))}
      </div>
    </div>
  );
};

export default CategoryWiseProductDisplay;
