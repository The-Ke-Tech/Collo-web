"use client";

import React, { useState } from "react";
import { CgClose } from "react-icons/cg";
import { FaCloudUploadAlt } from "react-icons/fa";
import { MdDelete } from "react-icons/md";
import { toast } from "react-toastify";
import productCategory from "../helpers/productCategory";
import DisplayImage from "./display-image";
import { useAuthStore } from "@/store/auth-store";
import uploadImage from "../helpers/uploadImage";

interface UploadProductProps {
  onClose: () => void;
  fetchData: () => void;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || "";

const UploadProduct: React.FC<UploadProductProps> = ({ onClose, fetchData }) => {
  interface ProductData {
    productName: string;
    brandName: string;
    category: string;
    productImage: string[];
    description: string;
    price: string;
    sellingPrice: string;
    stock: string;
  }

  const [data, setData] = useState<ProductData>({
    productName: "",
    brandName: "",
    category: "",
    productImage: [],
    description: "",
    price: "",
    sellingPrice: "",
    stock: "",
  });

  const [uploadProgress, setUploadProgress] = useState<{ [key: string]: number }>({});
  const [openFullScreenImage, setOpenFullScreenImage] = useState(false);
  const [fullScreenImage, setFullScreenImage] = useState("");

  const { user, fetchWithAuth, isAdmin } = useAuthStore();

  const handleOnChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setData((prev) => ({ ...prev, [name]: value }));
  };

  const handleUploadProduct = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    try {
      // Parallel uploads with progress tracking
      const uploadPromises = Array.from(files).map(async (file) => {
        const key = `${file.name}-${Date.now()}`;
        setUploadProgress((prev) => ({ ...prev, [key]: 0 }));

        const url = await uploadImage(file, (progress: number) => {
          setUploadProgress((prev) => ({ ...prev, [key]: progress }));
        });

        setUploadProgress((prev) => {
          const newProgress = { ...prev };
          delete newProgress[key];
          return newProgress;
        });

        return url;
      });

      const uploadedUrls = await Promise.all(uploadPromises);

      setData((prev) => ({
        ...prev,
        productImage: [...prev.productImage, ...uploadedUrls],
      }));
    } catch (err) {
      toast.error("Failed to upload one or more images");
    }
  };

  const handleDeleteProductImage = (index: number) => {
    const newImages = [...data.productImage];
    newImages.splice(index, 1);
    setData((prev) => ({ ...prev, productImage: newImages }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!user) {
      toast.error("You must be logged in to upload a product");
      return;
    }

    if (!isAdmin()) {
      toast.error("Only admin users can upload products");
      return;
    }

    try {
      const payload = {
        ...data,
        price: Number(data.price),
        sellingPrice: Number(data.sellingPrice),
        stock: Number(data.stock),
        createdBy: user.id,
      };

      const response = await fetchWithAuth(`${API_URL}/api/products`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const responseData = await response.json();

      if (response.ok && responseData.success) {
        toast.success("Product uploaded successfully!");
        onClose();
        fetchData();
      } else {
        toast.error(responseData.message || "Failed to upload product");
      }
    } catch (err) {
      console.error("Product upload error:", err);
      toast.error("Something went wrong while uploading product");
    }
  };

  return (
    <div className="fixed w-full h-full bg-black/70 backdrop-blur-sm top-0 left-0 right-0 bottom-0 flex justify-center items-center z-50">
      <div className="bg-gradient-to-b from-[#00C2D1] via-[#4B3F72] to-[#7B2CBF] text-gray-100 p-5 rounded-xl w-full max-w-2xl h-full max-h-[90%] overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="flex justify-between items-center pb-3 border-b border-gray-300/30">
          <h2 className="font-bold text-xl text-white">Upload Product</h2>
          <div
            className="text-2xl text-white hover:text-gray-300 cursor-pointer transition"
            onClick={onClose}
          >
            <CgClose />
          </div>
        </div>

        {/* Form */}
        <form className="grid gap-3 p-4 overflow-y-scroll h-full pb-6" onSubmit={handleSubmit}>
          {/* Product Info */}
          <label className="text-white font-medium">Product Name:</label>
          <input
            type="text"
            name="productName"
            value={data.productName}
            onChange={handleOnChange}
            className="p-2 bg-white/10 border border-white/20 rounded text-white placeholder-gray-300"
            required
          />

          <label className="text-white font-medium">Brand Name:</label>
          <input
            type="text"
            name="brandName"
            value={data.brandName}
            onChange={handleOnChange}
            className="p-2 bg-white/10 border border-white/20 rounded text-white placeholder-gray-300"
            required
          />

          <label className="text-white font-medium">Category:</label>
          <select
            name="category"
            value={data.category}
            onChange={handleOnChange}
            className="p-2 bg-white/10 border border-white/20 rounded text-black"
            required
          >
            <option value="">Select Category</option>
            {productCategory.map((cat, i) => (
              <option key={cat.value + i} value={cat.value}>
                {cat.label}
              </option>
            ))}
          </select>

          {/* Image Upload */}
          <label className="text-white font-medium">Product Images:</label>
          <label htmlFor="uploadImageInput">
            <div className="p-2 bg-white/10 border border-white/20 rounded h-32 flex justify-center items-center cursor-pointer">
              <div className="text-[#00C2D1] flex flex-col items-center gap-2">
                <FaCloudUploadAlt className="text-4xl" />
                <p className="text-sm">Upload Product Images</p>
                <input
                  type="file"
                  id="uploadImageInput"
                  className="hidden"
                  onChange={handleUploadProduct}
                  accept="image/*"
                  multiple
                />
              </div>
            </div>
          </label>

          {/* Display Uploaded Images */}
          <div className="flex flex-wrap gap-2">
            {data.productImage.map((img, i) => (
              <div key={i} className="relative group w-fit">
                <img
                  src={img}
                  alt="Uploaded"
                  className="w-20 h-20 object-cover border border-white/20 rounded cursor-pointer"
                  onClick={() => {
                    setFullScreenImage(img);
                    setOpenFullScreenImage(true);
                  }}
                />
                <div
                  onClick={() => handleDeleteProductImage(i)}
                  className="absolute top-0 right-0 bg-red-600 text-white p-1 rounded-full hidden group-hover:block cursor-pointer"
                >
                  <MdDelete />
                </div>
              </div>
            ))}

            {/* Show upload progress for ongoing files */}
            {Object.keys(uploadProgress).map((key) => (
              <div
                key={key}
                className="relative w-20 h-20 border border-white/20 rounded bg-white/20 flex items-center justify-center"
              >
                <div className="text-xs text-white">Uploading...</div>
                <div
                  className="absolute bottom-0 left-0 h-1 bg-green-500"
                  style={{ width: `${uploadProgress[key]}%` }}
                />
              </div>
            ))}
          </div>

          {/* Price & Stock */}
          <label className="text-white font-medium">Price:</label>
          <input
            type="number"
            name="price"
            value={data.price}
            onChange={handleOnChange}
            min={0}
            step="0.01"
            className="p-2 bg-white/10 border border-white/20 rounded text-white"
            required
          />

          <label className="text-white font-medium">Selling Price:</label>
          <input
            type="number"
            name="sellingPrice"
            value={data.sellingPrice}
            onChange={handleOnChange}
            min={0}
            step="0.01"
            className="p-2 bg-white/10 border border-white/20 rounded text-white"
            required
          />

          <label className="text-white font-medium">Stock:</label>
          <input
            type="number"
            name="stock"
            value={data.stock}
            onChange={handleOnChange}
            min={0}
            className="p-2 bg-white/10 border border-white/20 rounded text-white"
            required
          />

          <label className="text-white font-medium">Description:</label>
          <textarea
            name="description"
            value={data.description}
            onChange={handleOnChange}
            className="h-28 bg-white/10 border border-white/20 resize-none p-2 rounded text-white"
            placeholder="Enter product description"
            required
          />

          <button className="mt-4 px-3 py-2 bg-gradient-to-r from-[#00C2D1] to-[#7B2CBF] text-white hover:opacity-90 rounded transition cursor-pointer">
            Upload Product
          </button>
        </form>
      </div>

      {openFullScreenImage && (
        <DisplayImage imgUrl={fullScreenImage} onClose={() => setOpenFullScreenImage(false)} />
      )}
    </div>
  );
};

export default UploadProduct;
