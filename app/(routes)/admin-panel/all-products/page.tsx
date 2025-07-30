"use client";

import AdminProductCard from "@/components/admin-product-card";
import UploadProduct from "@/components/upload-product";
import React, { useEffect, useState } from "react";

const AllProducts = () => {
  const [openUploadProduct, setOpenUploadProduct] = useState(false);
  const [allProduct, setAllProduct] = useState([]);

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

      {/* All products grid */}
      <div className="flex items-center flex-wrap gap-5 py-6 h-[calc(100vh-200px)] overflow-y-auto">
        {allProduct.map((product, index) => (
          <AdminProductCard
            data={product}
            key={index + "allProduct"}
            fetchdata={fetchAllProduct}
          />
        ))}
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
