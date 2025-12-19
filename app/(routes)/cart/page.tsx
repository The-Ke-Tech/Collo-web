'use client';

import React, { useEffect } from "react";
import { MdDelete } from "react-icons/md";
import { useAuthStore } from "@/store/auth-store";
import { useCartStore } from "@/store/cart-store";
import displayKESCurrency from "@/helpers/displayCurrency";

const Cart = () => {
  const { isLoggedIn } = useAuthStore();
  const {
    items,
    loading,
    fetchCart,
    updateQuantity,
    removeFromCart,
    totalCount,
    totalPrice,
  } = useCartStore();

  const loadingCart = new Array(4).fill(null);

  useEffect(() => {
    if (isLoggedIn()) fetchCart();
  }, [isLoggedIn, fetchCart]);

  const increaseQty = (productId: string, qty: number, stock: number) => {
    if (qty >= stock) return;
    updateQuantity(productId, qty + 1);
  };

  const decreaseQty = (productId: string, qty: number) => {
    if (qty <= 1) return;
    updateQuantity(productId, qty - 1);
  };

  const deleteCartProduct = (productId: string) => {
    removeFromCart(productId);
  };

  const handlePayment = () => {
    const encodedItems = encodeURIComponent(JSON.stringify(items));
    window.location.href = `/checkout?items=${encodedItems}`;
  };

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-cyan-950 via-gray-900 to-purple-950 text-gray-100 min-h-screen py-6">
      <div className="text-center text-lg my-3">
        {items.length === 0 && !loading && (
          <p className="bg-gray-800 py-5 rounded shadow">No Data</p>
        )}
      </div>

      <div className="flex flex-col lg:flex-row gap-10 lg:justify-between p-4">
        {/* Cart Items */}
        <div className="w-full lg:w-2/3">
          {loading
            ? loadingCart.map((_, index) => (
                <div
                  key={index}
                  className="w-full bg-gray-700 h-32 my-2 border border-gray-600 animate-pulse rounded"
                />
              ))
            : items.map((product) => (
                <div
                  key={product.productId}
                  className="bg-gradient-to-r from-cyan-900 to-purple-900 border border-purple-700 rounded flex flex-col sm:flex-row mb-4 overflow-hidden shadow"
                >
                  <div className="w-full sm:w-32 h-40 sm:h-32 bg-gray-100 flex-shrink-0">
                    <img
                      src={product.product?.productImage?.[0] || "/placeholder.png"}
                      className="w-full h-full object-contain mix-blend-multiply"
                      alt={product.product?.productName || "Product image"}
                    />
                  </div>
                  <div className="flex-1 p-3 relative">
                    <button
                      onClick={() => deleteCartProduct(product.productId)}
                      className="absolute top-2 right-2 text-pink-400 p-1 hover:bg-pink-600 hover:text-white rounded-full"
                    >
                      <MdDelete size={20} />
                    </button>
                    <h2 className="text-base sm:text-lg font-medium line-clamp-1 text-white">
                      {product.product?.productName}
                    </h2>
                    <p className="text-gray-300 text-sm mb-2 capitalize">
                      {product.product?.category}
                    </p>
                    <div className="flex justify-between text-sm sm:text-base font-medium mb-1">
                      <p className="text-cyan-400">
                        {displayKESCurrency(product.product?.sellingPrice || 0)}
                      </p>
                      <p className="text-gray-100">
                        {displayKESCurrency((product.product?.sellingPrice || 0) * product.quantity)}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 mt-2">
                      <button
                        className="w-7 h-7 text-sm border border-pink-500 text-pink-400 hover:bg-pink-600 hover:text-white rounded"
                        onClick={() => decreaseQty(product.productId, product.quantity)}
                      >
                        -
                      </button>

                      <span className="text-white">{product.quantity}</span>

                      <button
                        className={`w-7 h-7 text-sm border rounded ${
                          product.quantity >= (product.product?.stock || 0)
                            ? "border-gray-500 text-gray-500 cursor-not-allowed"
                            : "border-cyan-500 text-cyan-400 hover:bg-cyan-600 hover:text-white"
                        }`}
                        onClick={() =>
                          increaseQty(product.productId, product.quantity, product.product?.stock || 0)
                        }
                        disabled={product.quantity >= (product.product?.stock || 0)}
                      >
                        +
                      </button>
                    </div>
                    {product.quantity >= (product.product?.stock || 0) && (
                      <p className="text-xs text-pink-400 mt-1">
                        Only {product.product?.stock} in stock
                      </p>
                    )}
                  </div>
                </div>
              ))}
        </div>

        {/* Summary */}
        <div className="w-full lg:w-1/3">
          {loading ? (
            <div className="h-36 bg-gray-700 border border-gray-600 animate-pulse rounded"></div>
          ) : (
            <div className="bg-gradient-to-r from-cyan-900 to-purple-900 rounded shadow border border-purple-700">
              <h2 className="text-white bg-gradient-to-r from-cyan-700 to-purple-700 px-4 py-2 rounded-t font-semibold">
                Summary
              </h2>
              <div className="flex justify-between py-2 px-2 text-gray-200 text-sm sm:text-base font-medium">
                <p>Quantity</p>
                <p>{totalCount()}</p>
              </div>
              <div className="flex justify-between py-2 px-2 text-gray-200 text-sm sm:text-base font-medium border-t border-gray-700">
                <p>Total Price</p>
                <p>{displayKESCurrency(totalPrice())}</p>
              </div>
              <button
                className="mt-4 bg-gradient-to-r from-cyan-600 to-purple-600 hover:from-cyan-700 hover:to-purple-700 text-white w-full py-2 rounded cursor-pointer"
                onClick={handlePayment}
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
