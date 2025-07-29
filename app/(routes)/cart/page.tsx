"use client";

import Context from '@/context';
import displayKESCurrency from '@/helpers/displayCurrency';
import axios from 'axios';
import React, { useContext, useEffect, useState } from 'react';
import { MdDelete } from "react-icons/md";

const Cart = () => {
    type CartProduct = {
        _id: string;
        quantity: number;
        productId: {
            productImage: string[];
            productName: string;
            category: string;
            sellingPrice: number;
        };
    };

    const [data, setData] = useState<CartProduct[]>([]);
    const [loading] = useState(false);
    const context = useContext(Context);
    const loadingCart = new Array(4).fill(null);
// Fetch Cart
const fetchData = async () => {
  const response = await fetch('/api/cart', { credentials: 'include' });
  const responseData = await response.json();
  if (responseData.success) setData(responseData.data);
};

// Increase Qty
const increaseQty = async (id: string, qty: number) => {
  const response = await fetch('/api/cart/update', {
    method: 'PATCH',
    credentials: 'include',
    headers: { "content-type": 'application/json' },
    body: JSON.stringify({ _id: id, quantity: qty + 1 })
  });
  if ((await response.json()).success) fetchData();
};

// Decrease Qty
const decraseQty = async (id: string, qty: number) => {
  if (qty >= 2) {
    const response = await fetch('/api/cart/update', {
      method: 'PATCH',
      credentials: 'include',
      headers: { "content-type": 'application/json' },
      body: JSON.stringify({ _id: id, quantity: qty - 1 })
    });
    if ((await response.json()).success) fetchData();
  }
};

// Delete Product
const deleteCartProduct = async (id: string) => {
  const response = await fetch('/api/cart/delete', {
    method: 'DELETE',
    credentials: 'include',
    headers: { "content-type": 'application/json' },
    body: JSON.stringify({ _id: id })
  });
  if ((await response.json()).success) {
    fetchData();
    context?.fetchUserAddToCart();
  }
};

// Payment
const handlePayment = (cartItems: CartProduct[]) => {
  const encodedItems = encodeURIComponent(JSON.stringify(cartItems));
  window.location.href = `/checkout?items=${encodedItems}`;
};


    useEffect(() => {
        fetchData();
    }, []);

    const totalQty = data.reduce((sum, curr) => sum + curr.quantity, 0);
    const totalPrice = data.reduce((sum, curr) => sum + (curr.quantity * curr?.productId?.sellingPrice), 0);

    return (
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center text-lg my-3">
                {data.length === 0 && !loading && <p className="bg-white py-5">No Data</p>}
            </div>

            <div className="flex flex-col lg:flex-row gap-10 lg:justify-between p-4">
                <div className="w-full lg:w-2/3">
                    {loading ? (
                        loadingCart.map((_, index) => (
                            <div key={index} className="w-full bg-slate-200 h-32 my-2 border border-slate-300 animate-pulse rounded"></div>
                        ))
                    ) : (
                        data.map((product) => (
                            <div key={product._id} className="bg-white border border-slate-300 rounded flex flex-col sm:flex-row mb-4 overflow-hidden">
                                <div className="w-full sm:w-32 h-40 sm:h-32 bg-slate-100 flex-shrink-0">
                                    <img
  src={product.productId?.productImage?.[0] || '/placeholder.png'}
  className="w-full h-full object-contain mix-blend-multiply"
  alt={product.productId?.productName || 'Product image'}
/>

                                </div>
                                <div className="flex-1 p-3 relative">
                                    <button
                                        onClick={() => deleteCartProduct(product._id)}
                                        className="absolute top-2 right-2 text-red-600 p-1 hover:bg-red-600 hover:text-white rounded-full"
                                    >
                                        <MdDelete size={20} />
                                    </button>
                                    <h2 className="text-base sm:text-lg font-medium line-clamp-1">
                                        {product.productId.productName}
                                    </h2>
                                    <p className="text-slate-500 text-sm mb-2 capitalize">{product.productId.category}</p>
                                    <div className="flex justify-between text-sm sm:text-base font-medium mb-1">
                                        <p className="text-red-600">{displayKESCurrency(product.productId.sellingPrice)}</p>
                                        <p className="text-slate-700">{displayKESCurrency(product.productId.sellingPrice * product.quantity)}</p>
                                    </div>
                                    <div className="flex items-center gap-2 mt-2">
                                        <button
                                            className="w-7 h-7 text-sm border border-red-600 text-red-600 hover:bg-red-600 hover:text-white rounded"
                                            onClick={() => decraseQty(product._id, product.quantity)}
                                        >
                                            -
                                        </button>
                                        <span>{product.quantity}</span>
                                        <button
                                            className="w-7 h-7 text-sm border border-red-600 text-red-600 hover:bg-red-600 hover:text-white rounded"
                                            onClick={() => increaseQty(product._id, product.quantity)}
                                        >
                                            +
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                <div className="w-full lg:w-1/3">
                    {loading ? (
                        <div className="h-36 bg-slate-200 border border-slate-300 animate-pulse rounded"></div>
                    ) : (
                        <div className="bg-white rounded shadow p-4">
                            <h2 className="text-white bg-red-600 px-4 py-2 rounded-t font-semibold">Summary</h2>
                            <div className="flex justify-between py-2 px-2 text-slate-600 text-sm sm:text-base font-medium">
                                <p>Quantity</p>
                                <p>{totalQty}</p>
                            </div>
                            <div className="flex justify-between py-2 px-2 text-slate-600 text-sm sm:text-base font-medium border-t border-slate-200">
                                <p>Total Price</p>
                                <p>{displayKESCurrency(totalPrice)}</p>
                            </div>
                            <button
                                className="mt-4 bg-blue-600 hover:bg-blue-700 text-white w-full py-2 rounded"
                                onClick={() => handlePayment(data)}
                            >
                                Pay via M-Pesa
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Cart;
