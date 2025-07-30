"use client";

import React, { useState } from "react";
import { CgClose } from "react-icons/cg";
import productCategory from "../helpers/productCategory";
import { FaCloudUploadAlt } from "react-icons/fa";
import uploadImage from "../helpers/uploadImage";
import { MdDelete } from "react-icons/md";
import { toast } from "react-toastify";
import DisplayImage from "./display-image";

interface UploadProductProps {
  onClose: () => void;
  fetchData: () => void;
}

const UploadProduct: React.FC<UploadProductProps> = ({ onClose, fetchData }) => {
  interface ProductData {
    productName: string;
    brandName: string;
    category: string;
    productImage: string[];
    description: string;
    price: string;
    sellingPrice: string;
    stock: string;  // <-- Added
  }

  const [data, setData] = useState<ProductData>({
    productName: "",
    brandName: "",
    category: "",
    productImage: [],
    description: "",
    price: "",
    sellingPrice: "",
    stock: "", // <-- Added
  });

  const [openFullScreenImage, setOpenFullScreenImage] = useState(false);
  const [fullScreenImage, setFullScreenImage] = useState("");

  const handleOnChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setData((prev) => ({ ...prev, [name]: value }));
  };

  const handleUploadProduct = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const imageUrl = await uploadImage(file);
      setData((prev) => ({
        ...prev,
        productImage: [...prev.productImage, imageUrl],
      }));
    } catch (error) {
      toast.error("Failed to upload image");
    }
  };

  const handleDeleteProductImage = (index: number) => {
    const newImages = [...data.productImage];
    newImages.splice(index, 1);
    setData((prev) => ({ ...prev, productImage: newImages }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    try {
      const response = await fetch("/api/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...data,
          price: parseFloat(data.price),
          sellingPrice: parseFloat(data.sellingPrice),
          stock: parseInt(data.stock, 10), // <-- Added
        }),
      });

      const responseData = await response.json();

      if (response.ok && responseData.success) {
        toast.success("Product uploaded successfully!");
        onClose();
        fetchData();
      } else {
        toast.error(responseData.message || "Failed to upload product");
      }
    } catch (error) {
      console.error("Error uploading product:", error);
      toast.error("Something went wrong while uploading product");
    }
  };

  return (
    <div className="fixed w-full h-full bg-black/70 backdrop-blur-sm top-0 left-0 right-0 bottom-0 flex justify-center items-center z-50">
      <div className="bg-gradient-to-b from-black via-gray-900 to-gray-800 text-gray-300 p-4 rounded-xl w-full max-w-2xl h-full max-h-[90%] overflow-hidden shadow-2xl border border-gray-700">
        {/* Header */}
        <div className="flex justify-between items-center pb-3 border-b border-gray-700">
          <h2 className="font-bold text-lg text-white">Upload Product</h2>
          <div
            className="text-2xl text-gray-300 hover:text-white cursor-pointer transition"
            onClick={onClose}
          >
            <CgClose />
          </div>
        </div>

        {/* Form */}
        <form
          className="grid gap-2 p-4 overflow-y-scroll h-full pb-5"
          onSubmit={handleSubmit}
        >
          <label className="text-gray-200 font-medium">Product Name:</label>
          <input
            type="text"
            name="productName"
            value={data.productName}
            onChange={handleOnChange}
            className="p-2 bg-gray-800 border border-gray-600 rounded text-gray-100 focus:border-blue-500 focus:ring focus:ring-blue-700"
            required
          />

          <label className="text-gray-200 font-medium">Brand Name:</label>
          <input
            type="text"
            name="brandName"
            value={data.brandName}
            onChange={handleOnChange}
            className="p-2 bg-gray-800 border border-gray-600 rounded text-gray-100 focus:border-blue-500 focus:ring focus:ring-blue-700"
            required
          />

          <label className="text-gray-200 font-medium">Category:</label>
          <select
            name="category"
            value={data.category}
            onChange={handleOnChange}
            className="p-2 bg-gray-800 border border-gray-600 rounded text-gray-100 focus:border-blue-500 focus:ring focus:ring-blue-700"
            required
          >
            <option value="">Select Category</option>
            {productCategory.map((cat, i) => (
              <option key={cat.value + i} value={cat.value}>
                {cat.label}
              </option>
            ))}
          </select>

          <label className="text-gray-200 font-medium">Product Image:</label>
          <label htmlFor="uploadImageInput">
            <div className="p-2 bg-gray-800 border border-gray-600 rounded h-32 flex justify-center items-center cursor-pointer">
              <div className="text-blue-400 flex flex-col items-center gap-2">
                <FaCloudUploadAlt className="text-4xl" />
                <p className="text-sm">Upload Product Image</p>
                <input
                  type="file"
                  id="uploadImageInput"
                  className="hidden"
                  onChange={handleUploadProduct}
                  accept="image/*"
                />
              </div>
            </div>
          </label>

          {data.productImage.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {data.productImage.map((img, i) => (
                <div key={i} className="relative group w-fit">
                  <img
                    src={img}
                    alt="Uploaded"
                    className="w-20 h-20 object-cover border border-gray-600 rounded cursor-pointer"
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
            </div>
          ) : (
            <p className="text-gray-400 text-xs">
              *Please upload at least one image
            </p>
          )}

          <label className="text-gray-200 font-medium">Price:</label>
          <input
            type="number"
            name="price"
            value={data.price}
            onChange={handleOnChange}
            className="p-2 bg-gray-800 border border-gray-600 rounded text-gray-100 focus:border-blue-500 focus:ring focus:ring-blue-700"
            required
          />

          <label className="text-gray-200 font-medium">Selling Price:</label>
          <input
            type="number"
            name="sellingPrice"
            value={data.sellingPrice}
            onChange={handleOnChange}
            className="p-2 bg-gray-800 border border-gray-600 rounded text-gray-100 focus:border-blue-500 focus:ring focus:ring-blue-700"
            required
          />

          {/* Stock Input */}
          <label className="text-gray-200 font-medium">Stock:</label>
          <input
            type="number"
            name="stock"
            value={data.stock}
            onChange={handleOnChange}
            min={0}
            className="p-2 bg-gray-800 border border-gray-600 rounded text-gray-100 focus:border-blue-500 focus:ring focus:ring-blue-700"
            required
          />

          <label className="text-gray-200 font-medium">Description:</label>
          <textarea
            name="description"
            value={data.description}
            onChange={handleOnChange}
            className="h-28 bg-gray-800 border border-gray-600 resize-none p-1 rounded text-gray-100 focus:border-blue-500 focus:ring focus:ring-blue-700"
            placeholder="Enter product description"
            required
          />

          <button className="mt-4 px-3 py-2 bg-blue-600 text-white hover:bg-blue-700 rounded transition">
            Upload Product
          </button>
        </form>
      </div>

      {openFullScreenImage && (
        <DisplayImage
          imgUrl={fullScreenImage}
          onClose={() => setOpenFullScreenImage(false)}
        />
      )}
    </div>
  );
};

export default UploadProduct;
