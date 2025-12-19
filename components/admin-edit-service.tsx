"use client";

import React, { useState } from "react";
import { CgClose } from "react-icons/cg";
import { FaCloudUploadAlt } from "react-icons/fa";
import { MdDelete } from "react-icons/md";
import { toast } from "react-toastify";
import DisplayImage from "./display-image";
import uploadImage from "@/helpers/uploadImage";
import { useAuthStore } from "@/store/auth-store";

interface AdminEditServiceProps {
  onClose: () => void;
  serviceData: {
    _id: string;
    serviceName: string;
    category: string;
    description?: string;
    price?: number;
    serviceImage: string[];
  };
  fetchData: () => void;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL;

const AdminEditService: React.FC<AdminEditServiceProps> = ({
  onClose,
  serviceData,
  fetchData,
}) => {
  const [data, setData] = useState({
    ...serviceData,
    serviceName: serviceData.serviceName || "",
    category: serviceData.category || "",
    description: serviceData.description || "",
    price: serviceData.price ?? "",
    serviceImage: serviceData.serviceImage || [],
  });

  const [openFullScreenImage, setOpenFullScreenImage] = useState(false);
  const [fullScreenImage, setFullScreenImage] = useState("");

  const { fetchWithAuth } = useAuthStore();

  const handleOnChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    setData((prev) => ({
      ...prev,
      [name]: type === "number" ? Number(value) : value,
    }));
  };

  const handleUploadServiceImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    try {
      const uploadedUrls = await Promise.all(
        Array.from(files).map((file) =>
          uploadImage(file, (progress) => {
            console.log(`Upload progress for ${file.name}: ${progress}%`);
          })
        )
      );

      setData((prev) => ({
        ...prev,
        serviceImage: [...prev.serviceImage, ...uploadedUrls],
      }));
    } catch {
      toast.error("Failed to upload one or more images");
    }
  };

  const handleDeleteServiceImage = (index: number) => {
    setData((prev) => ({
      ...prev,
      serviceImage: prev.serviceImage.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!data.serviceName || !data.category) {
      toast.error("Service name and category are required.");
      return;
    }

    try {
      const response = await fetchWithAuth(`${API_URL}/api/services/${data._id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const responseData = await response.json();

      if (response.ok && responseData.success) {
        toast.success("Service updated successfully!");
        fetchData();
        onClose();
      } else {
        toast.error(responseData.message || "Failed to update service");
      }
    } catch (error: any) {
      console.error("Error updating service:", error);
      toast.error(error?.message || "Something went wrong while updating the service");
    }
  };

  return (
    <div className="fixed inset-0 flex justify-center items-center bg-black bg-opacity-50 z-50 mt-14">
      <div className="bg-gray-900 text-white p-4 rounded-lg w-full max-w-2xl mt-14 max-h-[90%] overflow-y-auto">
        <div className="flex justify-between items-center pb-3 border-b border-gray-700">
          <h2 className="font-bold text-xl">Edit Service</h2>
          <CgClose className="cursor-pointer text-2xl" onClick={onClose} />
        </div>

        <form className="grid gap-3 mt-4" onSubmit={handleSubmit}>
          <label>Service Name</label>
          <input
            type="text"
            name="serviceName"
            value={data.serviceName}
            onChange={handleOnChange}
            className="p-2 bg-gray-800 border border-gray-700 rounded"
            required
          />

          <label>Category</label>
          <input
            type="text"
            name="category"
            value={data.category}
            onChange={handleOnChange}
            className="p-2 bg-gray-800 border border-gray-700 rounded"
            required
          />

          <label>Service Images</label>
          <label htmlFor="uploadServiceImage">
            <div className="p-2 bg-gray-800 border border-gray-700 rounded h-32 w-full flex justify-center items-center cursor-pointer">
              <div className="flex flex-col items-center text-gray-400">
                <FaCloudUploadAlt className="text-4xl" />
                <span className="text-sm mt-1">Upload Images</span>
                <input
                  type="file"
                  id="uploadServiceImage"
                  className="hidden"
                  onChange={handleUploadServiceImage}
                  multiple
                />
              </div>
            </div>
          </label>

          {/* Display images */}
          <div className="flex gap-2 flex-wrap mt-2">
            {data.serviceImage.map((img, index) => (
              <div key={index} className="relative group">
                <img
                  src={img}
                  alt={img}
                  className="w-20 h-20 object-cover rounded cursor-pointer"
                  onClick={() => {
                    setFullScreenImage(img);
                    setOpenFullScreenImage(true);
                  }}
                />
                <div
                  className="absolute top-0 right-0 bg-red-600 text-white p-1 rounded-full cursor-pointer"
                  onClick={() => handleDeleteServiceImage(index)}
                >
                  <MdDelete />
                </div>
              </div>
            ))}
          </div>

          <label>Description</label>
          <textarea
            name="description"
            value={data.description}
            onChange={handleOnChange}
            className="p-2 bg-gray-800 border rounded"
            rows={3}
          />

          <label>Price</label>
          <input
            type="number"
            name="price"
            value={data.price}
            onChange={handleOnChange}
            className="p-2 bg-gray-800 border border-gray-700 rounded"
          />

          <button className="mt-3 bg-blue-600 hover:bg-blue-700 py-2 rounded">
            Update Service
          </button>
        </form>
      </div>

      {openFullScreenImage && (
        <DisplayImage imgUrl={fullScreenImage} onClose={() => setOpenFullScreenImage(false)} />
      )}
    </div>
  );
};

export default AdminEditService;
