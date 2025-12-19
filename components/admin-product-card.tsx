"use client";

import React, { useState } from "react";
import { MdModeEditOutline, MdDelete } from "react-icons/md";
import displayKESCurrency from "../helpers/displayCurrency";
import AdminEditProduct from "./admin-edit-product";
import AdminEditService from "./admin-edit-service";
import { toast } from "react-toastify";
import ConfirmModal from "./confirm-modal";
import { useAuthStore } from "@/store/auth-store";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

interface AdminCardProps {
  data: any; // Product or Service
  fetchdata: () => void;
  isService?: boolean;
}

const AdminCard: React.FC<AdminCardProps> = ({ data, fetchdata, isService = false }) => {
  const [editItem, setEditItem] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const { fetchWithAuth } = useAuthStore();

  const handleDelete = async () => {
    try {
      // ✅ Use fetchWithAuth to include token automatically
      const res = await fetchWithAuth(
        `${API_URL}/api/${isService ? "services" : "products"}/${data._id}`,
        { method: "DELETE" }
      );

      const result = await res.json();

      if (res.ok && result.success) {
        toast.success(result.message || `${isService ? "Service" : "Product"} deleted`);
        fetchdata();
      } else {
        toast.error(result.message || "Failed to delete");
      }
    } catch (err: any) {
      console.error("Delete error:", err);
      toast.error(err?.message || "Something went wrong");
    } finally {
      setShowDeleteModal(false);
    }
  };

  const displayName = isService ? data.serviceName : data.productName;
  const imageUrl = isService ? data.serviceImage[0] : data.productImage[0];
  const price = isService ? data.price : data.sellingPrice;

  return (
    <div className="bg-gradient-to-b from-black via-gray-900 to-gray-800 text-gray-200 p-4 rounded-lg shadow-lg">
      <div className="w-40">
        <div className="w-32 h-32 flex justify-center items-center bg-gray-800 rounded-md overflow-hidden">
          <img src={imageUrl} className="mx-auto object-cover h-full w-full" alt={displayName} />
        </div>

        <h1 className="mt-2 text-sm font-medium text-gray-100 line-clamp-2">{displayName}</h1>
        {price !== undefined && (
          <p className="font-semibold text-red-500 mt-1">{displayKESCurrency(price)}</p>
        )}

        <div className="flex gap-2 mt-3">
          {/* Edit Button */}
          <div
            className="p-2 bg-green-700 hover:bg-green-600 rounded-full text-white cursor-pointer shadow-md transition-transform transform hover:scale-105"
            onClick={() => setEditItem(true)}
          >
            <MdModeEditOutline />
          </div>

          {/* Delete Button */}
          <div
            className="p-2 bg-red-700 hover:bg-red-600 rounded-full text-white cursor-pointer shadow-md transition-transform transform hover:scale-105"
            onClick={() => setShowDeleteModal(true)}
          >
            <MdDelete />
          </div>
        </div>
      </div>

      {editItem &&
        (isService ? (
          <AdminEditService
            serviceData={data}      // 🔹 must match prop name
            onClose={() => setEditItem(false)}
            fetchData={fetchdata}   // 🔹 prop name match
          />

        ) : (
          <AdminEditProduct productData={data} onClose={() => setEditItem(false)} fetchdata={fetchdata} />
        ))}

      {showDeleteModal && (
        <ConfirmModal
          title={`Delete ${isService ? "Service" : "Product"}`}
          message={`Are you sure you want to delete "${displayName}"? This action cannot be undone.`}
          onConfirm={handleDelete}
          onCancel={() => setShowDeleteModal(false)}
        />
      )}
    </div>
  );
};

export default AdminCard;
