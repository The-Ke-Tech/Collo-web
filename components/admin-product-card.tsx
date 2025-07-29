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
        brandName: string;      // added
        category: string;       // added
        description: string;    // added
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
        <div className='bg-white p-4 rounded'>
            <div className='w-40'>
                <div className='w-32 h-32 flex justify-center items-center'>
                    <img src={data?.productImage[0]} className='mx-auto object-fill h-full' />
                </div>
                <h1 className='text-ellipsis line-clamp-2'>{data.productName}</h1>

                <p className='font-semibold'>
                    {displayKESCurrency(data.sellingPrice)}
                </p>

                <div className='flex gap-2 mt-2'>
                    {/* Edit Button */}
                    <div
                        className='p-2 bg-green-100 hover:bg-green-600 rounded-full hover:text-white cursor-pointer'
                        onClick={() => setEditProduct(true)}
                    >
                        <MdModeEditOutline />
                    </div>

                    {/* Delete Button */}
                    <div
                        className='p-2 bg-red-100 hover:bg-red-600 rounded-full hover:text-white cursor-pointer'
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
