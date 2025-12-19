"use client";

import React, { useEffect, useState, useMemo } from "react";
import AdminProductCard from "@/components/admin-product-card";
import UploadProduct from "@/components/upload-product";
import UploadService from "@/components/upload-service";
import { Product } from "@/helpers/product-types";
import productCategory, { serviceCategory } from "@/helpers/productCategory";
import Service from "@/helpers/service-types";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState<"products" | "services">("products");

  // Product state
  const [allProduct, setAllProduct] = useState<Product[]>([]);
  const [selectedProductCategory, setSelectedProductCategory] = useState<string>("All");
  const [openUploadProduct, setOpenUploadProduct] = useState(false);

  // Service state
  const [allServices, setAllServices] = useState<Service[]>([]);
  const [selectedServiceCategory, setSelectedServiceCategory] = useState<string>("All");
  const [openUploadService, setOpenUploadService] = useState(false);

  // Fetch products
  const fetchAllProduct = async () => {
    try {
      const response = await fetch(`${API_URL}/api/products`);
      const dataResponse = await response.json();
      if (dataResponse.success) {
        const mappedProducts: Product[] = dataResponse.data.map((p: any) => ({
          _id: p._id,
          slug: p.slug || "",
          productName: p.productName,
          productImage: p.productImage || [],
          category: p.category || "Uncategorized",
          price: p.price ?? 0,
          sellingPrice: p.sellingPrice ?? 0,
          stock: p.stock ?? 0,
          createdBy: p.createdBy || "",
          createdAt: p.createdAt || "",
          updatedAt: p.updatedAt || "",
        }));
        setAllProduct(mappedProducts);
      }
    } catch (err) {
      console.error("Failed to fetch products:", err);
    }
  };

  // Fetch services
  const fetchAllServices = async () => {
    try {
      const response = await fetch(`${API_URL}/api/services`);
      const dataResponse = await response.json();
      if (dataResponse.success) {
        const mappedServices: Service[] = dataResponse.data.map((s: any) => ({
          _id: s._id,
          serviceName: s.serviceName,
          category: s.category || "Uncategorized",
          serviceImage: s.serviceImage || [],
          price: s.price ?? undefined,
          description: s.description || "",
          createdBy: s.createdBy || "",
          createdAt: s.createdAt || "",
          updatedAt: s.updatedAt || "",
        }));
        setAllServices(mappedServices);
      }
    } catch (err) {
      console.error("Failed to fetch services:", err);
    }
  };

  useEffect(() => {
    fetchAllProduct();
    fetchAllServices();
  }, []);

  // Categories
  const productCategories = useMemo(() => ["All", ...productCategory.map((c) => c.value)], [allProduct]);
  const serviceCategories = useMemo(() => ["All", ...serviceCategory.map((c) => c.value)], [allServices]);

  // Filtered lists
  const filteredProducts = useMemo(() => {
    if (selectedProductCategory === "All") return allProduct;
    return allProduct.filter((p) => p.category === selectedProductCategory);
  }, [selectedProductCategory, allProduct]);

  const filteredServices = useMemo(() => {
    if (selectedServiceCategory === "All") return allServices;
    return allServices.filter((s) => s.category === selectedServiceCategory);
  }, [selectedServiceCategory, allServices]);
  console.log(allServices);


  return (
    <div className="bg-gradient-to-b from-black via-gray-900 to-gray-800 text-gray-300 min-h-screen p-4">
      {/* Tabs */}
      <div className="flex gap-4 mb-4">
        <button
          onClick={() => setActiveTab("products")}
          className={`px-4 py-2 rounded-full font-semibold ${
            activeTab === "products" ? "bg-blue-600 text-white" : "bg-gray-800 text-gray-400"
          }`}
        >
          Products
        </button>
        <button
          onClick={() => setActiveTab("services")}
          className={`px-4 py-2 rounded-full font-semibold ${
            activeTab === "services" ? "bg-blue-600 text-white" : "bg-gray-800 text-gray-400"
          }`}
        >
          Services
        </button>
      </div>

      {/* Tab Content */}
      {activeTab === "products" ? (
        <>
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

          {/* Category Filter */}
          <div className="flex items-center gap-3 mt-4">
            <label htmlFor="productCategoryFilter" className="text-sm text-gray-400">
              Filter by category:
            </label>
            <select
              id="productCategoryFilter"
              value={selectedProductCategory}
              onChange={(e) => setSelectedProductCategory(e.target.value)}
              className="bg-gray-800 border border-gray-700 rounded px-3 py-1 text-white focus:ring-2 focus:ring-blue-500"
            >
              {productCategories.map((cat, idx) => (
                <option key={idx} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          {/* Products Grid */}
          <div className="flex items-start flex-wrap gap-5 py-6 h-[calc(100vh-240px)] overflow-y-auto">
            {filteredProducts.length > 0 ? (
              filteredProducts.map((product) => (
                <AdminProductCard key={product._id} data={product} fetchdata={fetchAllProduct} />
              ))
            ) : (
              <p className="text-gray-400 italic">No products in this category.</p>
            )}
          </div>

          {/* Upload Product Modal */}
          {openUploadProduct && <UploadProduct onClose={() => setOpenUploadProduct(false)} fetchData={fetchAllProduct} />}
        </>
      ) : (
        <>
          {/* Header */}
          <div className="bg-gray-900 border border-gray-700 py-3 px-4 flex justify-between items-center rounded-lg shadow-md">
            <h2 className="font-bold text-lg text-white">All Services</h2>
            <button
              className="border-2 border-green-500 text-green-500 hover:bg-green-600 hover:text-white transition-all py-1 px-4 rounded-full"
              onClick={() => setOpenUploadService(true)}
            >
              Upload Service
            </button>
          </div>

          {/* Category Filter */}
          <div className="flex items-center gap-3 mt-4">
            <label htmlFor="serviceCategoryFilter" className="text-sm text-gray-400">
              Filter by category:
            </label>
            <select
              id="serviceCategoryFilter"
              value={selectedServiceCategory}
              onChange={(e) => setSelectedServiceCategory(e.target.value)}
              className="bg-gray-800 border border-gray-700 rounded px-3 py-1 text-white focus:ring-2 focus:ring-green-500"
            >
              {serviceCategories.map((cat, idx) => (
                <option key={idx} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          {/* Services Grid */}
          <div className="flex items-start flex-wrap gap-5 py-6 h-[calc(100vh-240px)] overflow-y-auto">
            {filteredServices.length > 0 ? (
              filteredServices.map((service) => (
                <AdminProductCard key={service._id} data={service} fetchdata={fetchAllServices} isService />
              ))
            ) : (
              <p className="text-gray-400 italic">No services in this category.</p>
            )}
          </div>

          {/* Upload Service Modal */}
          {openUploadService && <UploadService onClose={() => setOpenUploadService(false)} fetchData={fetchAllServices} />}
        </>
      )}
    </div>
  );
};

export default AdminDashboard;
