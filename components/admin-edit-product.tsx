"use client";

import React, { useState } from "react";
import { CgClose } from "react-icons/cg";
import productCategory from "../helpers/productCategory";
import { FaCloudUploadAlt } from "react-icons/fa";
import uploadImage from "../helpers/uploadImage";
import { MdDelete } from "react-icons/md";
import { toast } from "react-toastify";
import DisplayImage from "./display-image";
import { Product } from "@/helpers/product-types";
import { useAuthStore } from "@/store/auth-store";

interface AdminEditProductProps {
  onClose: () => void;
  productData: Product;
  fetchdata: () => void;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL;

const AdminEditProduct: React.FC<AdminEditProductProps> = ({
  onClose,
  productData,
  fetchdata,
}) => {
  const [data, setData] = useState<Product>({
    ...productData,
    brandName: productData.brandName || "",
    description: productData.description || "",
    productImage: productData.productImage || [],
  });

  const [openFullScreenImage, setOpenFullScreenImage] = useState(false);
  const [fullScreenImage, setFullScreenImage] = useState("");

  const { fetchWithAuth } = useAuthStore();

  const handleOnChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setData((prev) => ({
      ...prev,
      [name]:
        name === "price" || name === "sellingPrice" || name === "stock"
          ? Number(value)
          : value,
    }));
  };

  const handleUploadProduct = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    try {
      // Upload multiple files in parallel with progress
      const uploadedUrls = await Promise.all(
        Array.from(files).map((file) =>
          uploadImage(file, (progress) => {
            console.log(`Upload progress for ${file.name}: ${progress}%`);
          })
        )
      );

      setData((prev) => ({
        ...prev,
        productImage: [...prev.productImage, ...uploadedUrls],
      }));
    } catch (err) {
      toast.error("Failed to upload one or more images");
    }
  };

  const handleDeleteProductImage = (index: number) => {
    setData((prev) => ({
      ...prev,
      productImage: prev.productImage.filter((_, i) => i !== index),
    }));
  };

  if (!data._id) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
        <div className="bg-gray-900 text-red-400 p-6 rounded">
          Product ID is missing. Cannot edit product.
        </div>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!data.productImage.length) {
      toast.error("Please upload at least one product image.");
      return;
    }

    if (data.sellingPrice > data.price) {
      toast.error("Selling price cannot be greater than actual price.");
      return;
    }

    try {
      // ✅ Use fetchWithAuth to include the token automatically
      const response = await fetchWithAuth(`${API_URL}/api/products/${data._id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const responseData = await response.json();

      if (response.ok && responseData.success) {
        toast.success("Product updated successfully!");
        onClose();
        fetchdata();
      } else {
        toast.error(responseData.message || "Failed to update product");
      }
    } catch (error: any) {
      console.error("Error updating product:", error);
      toast.error(error?.message || "Something went wrong while updating the product");
    }
  };

  return (
    <div className="fixed w-full h-full bg-black bg-opacity-50 top-0 left-0 mt-14 right-0 bottom-0 flex justify-center items-center">
      <div className="bg-gradient-to-b from-black via-gray-900 to-gray-800 text-gray-200 p-4 rounded-lg w-full max-w-2xl h-full max-h-[80%] overflow-hidden shadow-lg">
        <div className="flex justify-between items-center pb-3 border-b border-gray-700">
          <h2 className="font-bold text-xl text-white">Edit Product</h2>
          <div
            className="w-fit ml-auto text-2xl hover:text-red-500 cursor-pointer"
            onClick={onClose}
          >
            <CgClose />
          </div>
        </div>

        <form
          className="grid p-4 gap-3 overflow-y-scroll h-full pb-5"
          onSubmit={handleSubmit}
        >
          {/* Product Name */}
          <label htmlFor="productName">Product Name :</label>
          <input
            type="text"
            id="productName"
            name="productName"
            value={data.productName}
            onChange={handleOnChange}
            className="p-2 bg-gray-800 border border-gray-700 rounded text-white"
            required
          />

          {/* Brand Name */}
          <label htmlFor="brandName" className="mt-3">
            Brand Name :
          </label>
          <input
            type="text"
            id="brandName"
            value={data.brandName}
            name="brandName"
            onChange={handleOnChange}
            className="p-2 bg-gray-800 border border-gray-700 rounded text-white"
          />

          {/* Category */}
          <label htmlFor="category" className="mt-3">
            Category :
          </label>
          <select
            required
            value={data.category}
            name="category"
            onChange={handleOnChange}
            className="p-2 bg-gray-800 border border-gray-700 rounded text-white"
          >
            <option value={""}>Select Category</option>
            {productCategory.map((el) => (
              <option value={el.value} key={el.value}>
                {el.label}
              </option>
            ))}
          </select>

          {/* Stock */}
          <label htmlFor="stock" className="mt-3">
            Stock :
          </label>
          <input
            type="number"
            id="stock"
            value={data.stock}
            name="stock"
            onChange={handleOnChange}
            className="p-2 bg-gray-800 border border-gray-700 rounded text-white"
            required
            min={0}
          />

          {/* Product Images */}
          <label htmlFor="productImage" className="mt-3">
            Product Images :
          </label>
          <label htmlFor="uploadImageInput">
            <div className="p-2 bg-gray-800 border border-gray-700 rounded h-32 w-full flex justify-center items-center cursor-pointer">
              <div className="text-gray-400 flex justify-center items-center flex-col gap-2">
                <span className="text-4xl">
                  <FaCloudUploadAlt />
                </span>
                <p className="text-sm">Upload Product Images</p>
                <input
                  type="file"
                  id="uploadImageInput"
                  className="hidden"
                  onChange={handleUploadProduct}
                  multiple
                />
              </div>
            </div>
          </label>

          {/* Display Images */}
          <div className="flex items-center gap-2 mt-2">
            {data.productImage.map((el, index) => (
              <div key={index} className="relative group">
                <img
                  src={el}
                  alt={el}
                  width={80}
                  height={80}
                  className="bg-gray-800 border border-gray-700 cursor-pointer rounded"
                  onClick={() => {
                    setOpenFullScreenImage(true);
                    setFullScreenImage(el);
                  }}
                />
                <div
                  className="absolute bottom-0 right-0 p-1 text-white bg-red-600 rounded-full hidden group-hover:block cursor-pointer"
                  onClick={() => handleDeleteProductImage(index)}
                >
                  <MdDelete />
                </div>
              </div>
            ))}
          </div>

          {/* Price */}
          <label htmlFor="price" className="mt-3">
            Price :
          </label>
          <input
            type="number"
            id="price"
            value={data.price}
            name="price"
            onChange={handleOnChange}
            className="p-2 bg-gray-800 border border-gray-700 rounded text-white"
            required
          />

          {/* Selling Price */}
          <label htmlFor="sellingPrice" className="mt-3">
            Selling Price :
          </label>
          <input
            type="number"
            id="sellingPrice"
            value={data.sellingPrice}
            name="sellingPrice"
            onChange={handleOnChange}
            className="p-2 bg-gray-800 border border-gray-700 rounded text-white"
            required
          />

          {/* Description */}
          <label htmlFor="description" className="mt-3">
            Description :
          </label>
          <textarea
            className="h-28 bg-gray-800 border border-gray-700 resize-none p-2 text-white rounded"
            placeholder="Enter product description"
            rows={3}
            onChange={handleOnChange}
            name="description"
            value={data.description}
          ></textarea>

          <button className="px-3 py-2 bg-red-600 text-white mb-10 hover:bg-red-700 rounded">
            Update Product
          </button>
        </form>
      </div>

      {openFullScreenImage && (
        <DisplayImage
          onClose={() => setOpenFullScreenImage(false)}
          imgUrl={fullScreenImage}
        />
      )}
    </div>
  );
};

export default AdminEditProduct;
