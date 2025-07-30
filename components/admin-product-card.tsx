import React, { useState } from 'react'
import { MdModeEditOutline, MdDelete } from "react-icons/md";
import displayKESCurrency from '../helpers/displayCurrency';
import AdminEditProduct from './admin-edit-product';
import { toast } from 'react-toastify';
import ConfirmModal from './confirm-modal';

interface AdminProductCardProps {
    data: {
        id: string;
        productImage: string[];
        productName: string;
        brandName: string;
        category: string;
        description: string;
        sellingPrice: number;
        price: number;
        stock: number;
    };
    fetchdata: () => void;
}

const AdminProductCard: React.FC<AdminProductCardProps> = ({
    data,
    fetchdata
}) => {
    const [editProduct, setEditProduct] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);

    const handleDelete = async () => {
        try {
            const res = await fetch(`/api/products/${data.id}`, {
                method: "DELETE",
            });
            const result = await res.json();
            if (result.success) {
                toast.success(result.message || "Product deleted");
                fetchdata();
            } else {
                toast.error(result.message || "Failed to delete");
            }
        } catch (error) {
            console.error("Delete error:", error);
            toast.error("Something went wrong");
        } finally {
            setShowDeleteModal(false);
        }
    };

    return (
        <div className="bg-gradient-to-b from-black via-gray-900 to-gray-800 text-gray-200 p-4 rounded-lg shadow-lg">
            <div className="w-40">
                <div className="w-32 h-32 flex justify-center items-center bg-gray-800 rounded-md overflow-hidden">
                    <img
                        src={data?.productImage[0]}
                        className="mx-auto object-cover h-full w-full"
                        alt={data.productName}
                    />
                </div>
                <h1 className="mt-2 text-sm font-medium text-gray-100 line-clamp-2">{data.productName}</h1>

                <p className="font-semibold text-red-500 mt-1">
                    {displayKESCurrency(data.sellingPrice)}
                </p>

                <div className="flex gap-2 mt-3">
                    {/* Edit Button */}
                    <div
                        className="p-2 bg-green-700 hover:bg-green-600 rounded-full text-white cursor-pointer shadow-md transition-transform transform hover:scale-105"
                        onClick={() => setEditProduct(true)}
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

            {editProduct && (
                <AdminEditProduct
                    productData={data}
                    onClose={() => setEditProduct(false)}
                    fetchdata={fetchdata}
                />
            )}

            {showDeleteModal && (
                <ConfirmModal
                    title="Delete Product"
                    message={`Are you sure you want to delete "${data.productName}"? This action cannot be undone.`}
                    onConfirm={handleDelete}
                    onCancel={() => setShowDeleteModal(false)}
                />
            )}
        </div>
    );
};

export default AdminProductCard;
