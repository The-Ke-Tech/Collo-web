"use client";

import React, { useMemo, useState } from "react";
import { CgClose } from "react-icons/cg";
import { FaCloudUploadAlt } from "react-icons/fa";
import { MdDelete } from "react-icons/md";
import { toast } from "react-toastify";
import uploadImage from "@/helpers/uploadImage";
import DisplayImage from "./display-image";
import { useAuthStore } from "@/store/auth-store";
import { serviceNames } from "@/helpers/productCategory";

interface UploadServiceProps {
  onClose: () => void;
  fetchData: () => void;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || "";

const UploadService: React.FC<UploadServiceProps> = ({ onClose, fetchData }) => {
  const { user, fetchWithAuth } = useAuthStore();

  const [data, setData] = useState({
    serviceName: "",
    category: "services",
    serviceImage: [] as string[],
    description: "",
    price: "",
    startingFrom: true,
  });

  const [uploadProgress, setUploadProgress] = useState<{ [key: string]: number }>({});
  const [openFullScreenImage, setOpenFullScreenImage] = useState(false);
  const [fullScreenImage, setFullScreenImage] = useState("");

  const selectedService = useMemo(
    () => serviceNames.find((s) => s.value === data.serviceName),
    [data.serviceName]
  );

  const handleOnChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    if (type === "checkbox") {
      setData((prev) => ({ ...prev, [name]: (e.target as HTMLInputElement).checked }));
      return;
    }
    setData((prev) => ({ ...prev, [name]: value }));
  };

  const handleUploadImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    try {
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
        serviceImage: [...prev.serviceImage, ...uploadedUrls],
      }));
    } catch {
      toast.error("Failed to upload one or more images");
    }
  };

  const handleDeleteImage = (index: number) => {
    setData((prev) => ({
      ...prev,
      serviceImage: prev.serviceImage.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!user) return toast.error("You must be logged in");
    if (!selectedService) return toast.error("Select a service");

    const payload = {
      serviceName: data.serviceName,
      category: "services",
      description: data.description,
      serviceImage: data.serviceImage,
      price: Number(data.price),
      startingFrom: data.startingFrom,
      pricingType: selectedService.pricingType,
      unitLabel: selectedService.unitLabel,
      createdBy: user.id,
    };

    try {
      const res = await fetchWithAuth(`${API_URL}/api/services`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const resData = await res.json();

      if (res.ok && resData.success) {
        toast.success("Service uploaded successfully!");
        onClose();
        fetchData();
      } else {
        toast.error(resData.message || "Failed to upload service");
      }
    } catch (err) {
      console.error(err);
      toast.error("Something went wrong");
    }
  };

  return (
    <div className="fixed inset-0 flex justify-center items-center bg-black/70 backdrop-blur-sm z-50">
      <div className="bg-gradient-to-b from-[#00C2D1] via-[#4B3F72] to-[#7B2CBF] text-white p-5 rounded-xl w-full max-w-2xl h-full max-h-[90%] overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="flex justify-between items-center pb-3 border-b border-white/20">
          <h2 className="font-bold text-xl">Upload Service</h2>
          <div
            className="text-2xl hover:text-gray-300 cursor-pointer"
            onClick={onClose}
          >
            <CgClose />
          </div>
        </div>

        {/* Form */}
        <form className="grid gap-3 p-4 overflow-y-scroll h-full pb-6" onSubmit={handleSubmit}>
          <label className="font-medium">Service Name:</label>
          <select
            name="serviceName"
            value={data.serviceName}
            onChange={handleOnChange}
            className="p-2 bg-white/10 border border-white/20 rounded text-black"
            required
          >
            <option value="">Select Service</option>
            {serviceNames.map((ser) => (
              <option key={ser.id} value={ser.value}>{ser.label}</option>
            ))}
          </select>

          <label className="font-medium">Category:</label>
          <input
            value="Services"
            disabled
            className="p-2 bg-white/10 border border-white/20 rounded text-white cursor-not-allowed"
          />

          <label className="font-medium">Service Image (optional):</label>
          <label htmlFor="uploadServiceImage">
            <div className="p-3 bg-white/10 border border-white/20 rounded flex flex-col items-center justify-center cursor-pointer">
              <FaCloudUploadAlt className="text-3xl text-[#00C2D1]" />
              <span className="text-sm mt-1">Upload Image</span>
              <input
                type="file"
                id="uploadServiceImage"
                className="hidden"
                onChange={handleUploadImage}
                accept="image/*"
                multiple
              />
            </div>
          </label>

          {/* Uploaded Images Preview */}
          <div className="flex flex-wrap gap-2">
            {data.serviceImage.map((img, i) => (
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
                  onClick={() => handleDeleteImage(i)}
                  className="absolute top-0 right-0 bg-red-600 text-white p-1 rounded-full hidden group-hover:block cursor-pointer"
                >
                  <MdDelete />
                </div>
              </div>
            ))}

            {/* Upload progress */}
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

          <label className="font-medium">Description:</label>
          <textarea
            name="description"
            value={data.description}
            onChange={handleOnChange}
            className="h-28 bg-white/10 border border-white/20 resize-none p-2 rounded text-white"
            placeholder="Enter service description"
            required
          />

          {selectedService && (
            <>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  name="startingFrom"
                  checked={data.startingFrom}
                  onChange={handleOnChange}
                />
                <span className="text-sm text-white">Price is “Starting From”</span>
              </div>

              <label>
                {data.startingFrom ? "Starting From Price" : "Price"}{" "}
                <span className="text-sm text-white">({selectedService.unitLabel})</span>
              </label>

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
            </>
          )}

          <button className="mt-4 px-3 py-2 bg-gradient-to-r from-[#00C2D1] to-[#7B2CBF] text-white hover:opacity-90 rounded">
            Upload Service
          </button>
        </form>
      </div>

      {openFullScreenImage && (
        <DisplayImage imgUrl={fullScreenImage} onClose={() => setOpenFullScreenImage(false)} />
      )}
    </div>
  );
};

export default UploadService;
