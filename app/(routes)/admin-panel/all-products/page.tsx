"use client";

import AdminProductCard from "@/components/admin-product-card";
import UploadProduct from "@/components/upload-product";
import React, { useEffect, useState, useMemo } from "react";

const AllProducts = () => {
  const [openUploadProduct, setOpenUploadProduct] = useState(false);
  const [allProduct, setAllProduct] = useState<any[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("All");

  const fetchAllProduct = async () => {
    try {
      const response = await fetch("/api/products", { method: "GET" });
      const dataResponse = await response.json();
      if (dataResponse.success) {
        setAllProduct(dataResponse.data || []);
      }
    } catch (error) {
      console.error("Failed to fetch products:", error);
    }
  };

  useEffect(() => {
    fetchAllProduct();
  }, []);

  // 🔹 Extract unique categories
  const categories = useMemo(() => {
    const unique = new Set(allProduct.map((p) => p.category));
    return ["All", ...Array.from(unique)];
  }, [allProduct]);

  // 🔹 Filter products
  const filteredProducts = useMemo(() => {
    if (selectedCategory === "All") return allProduct;
    return allProduct.filter((p) => p.category === selectedCategory);
  }, [selectedCategory, allProduct]);

  return (
    <div className="bg-gradient-to-b from-black via-gray-900 to-gray-800 text-gray-300 min-h-screen p-4">
      {/* Header */}
      <div className="bg-gray-900 border border-gray-700 py-3 px-4 flex justify-between items-center rounded-lg shadow-md">
        <h2 className="font-bold text-lg text-white">All Products</h2>
        <button
          className="border-2 border-blue-500 text-blue-500 hover:bg-blue-600 hover:text-white transition-all py-1 px-4 rounded-full"
          onClick={() => setOpenUploadProduct(true)}
        >
          Upload Product
        </button>
      </div>

      {/* 🔹 Category Filter */}
      <div className="flex items-center gap-3 mt-4">
        <label htmlFor="categoryFilter" className="text-sm text-gray-400">
          Filter by category:
        </label>
        <select
          id="categoryFilter"
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="bg-gray-800 border border-gray-700 rounded px-3 py-1 text-white focus:ring-2 focus:ring-blue-500"
        >
          {categories.map((cat, idx) => (
            <option key={idx} value={cat}>
              {cat}
            </option>
          ))}
        </select>
      </div>

      {/* Products grid */}
      <div className="flex items-start flex-wrap gap-5 py-6 h-[calc(100vh-240px)] overflow-y-auto">
        {filteredProducts.length > 0 ? (
          filteredProducts.map((product, index) => (
            <AdminProductCard
              data={product}
              key={index + "filteredProduct"}
              fetchdata={fetchAllProduct}
            />
          ))
        ) : (
          <p className="text-gray-400 italic">No products in this category.</p>
        )}
      </div>

      {/* Upload product modal */}
      {openUploadProduct && (
        <UploadProduct
          onClose={() => setOpenUploadProduct(false)}
          fetchData={fetchAllProduct}
        />
      )}
    </div>
  );
};

export default AllProducts;
