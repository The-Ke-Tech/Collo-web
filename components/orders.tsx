"use client";

import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";

const SHIPPING_STAGES = [
  "PENDING",
  "PACKING",
  "SHIPPED",
  "IN_TRANSIT",
  "DELIVERED",
  "CANCELLED",
] as const;

type ShippingStage = typeof SHIPPING_STAGES[number];

interface Product {
  id: string;
  productName: string;
  productImage: string[];
  sellingPrice: number;
}

interface OrderProductDetail {
  id: string;
  quantity: number;
  product: Product;
}

interface Order {
  id: string;
  fullName: string | null;
  totalAmount: number;
  shippingStage: ShippingStage;
  createdAt: string;
  address?: string;
  city?: string;
  county?: string;
  phone?: string;
  paymentMethod: string[];
  paymentStatus: string;
  productDetails: OrderProductDetail[];
}

export default function Orders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);
  const [expanded, setExpanded] = useState<string | null>(null);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/orders");
      const data: unknown = await res.json();
      setOrders(Array.isArray(data) ? (data as Order[]) : []);
    } catch (err) {
      console.error("Error fetching orders:", err);
      toast.error("Failed to fetch orders");
    } finally {
      setLoading(false);
    }
  };

  const updateShippingStage = async (orderId: string, stage: ShippingStage) => {
    setUpdating(orderId);
    try {
      const res = await fetch(`/api/admin/orders/${orderId}/shipping`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ shippingStage: stage }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success("Shipping stage updated!");
        fetchOrders();
      } else {
        toast.error(data.message || "Update failed");
      }
    } catch {
      toast.error("Update failed");
    } finally {
      setUpdating(null);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  if (loading) return <p className="p-6 text-gray-400 animate-pulse">Loading orders...</p>;

  return (
    <div className="bg-gradient-to-b from-black via-gray-900 to-gray-800 text-gray-300 shadow-lg rounded-xl p-6 border border-gray-700">
      <h2 className="text-2xl font-bold mb-6 text-white">All Orders</h2>
      {orders.length === 0 ? (
        <p className="text-gray-400 text-center">No orders found.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full border border-gray-700 text-sm rounded-lg overflow-hidden">
            <thead className="bg-gray-800">
              <tr>
                {["Order ID", "Customer", "Total", "Status", "Created", "Action"].map((head) => (
                  <th key={head} className="px-4 py-3 text-left font-semibold text-gray-300 border-b border-gray-700">
                    {head}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <React.Fragment key={order.id}>
                  <tr
                    className="border-b border-gray-700 hover:bg-gray-800/70 transition cursor-pointer"
                    onClick={() => setExpanded(expanded === order.id ? null : order.id)}
                  >
                    <td className="px-4 py-3 font-mono text-gray-200">{order.id}</td>
                    <td className="px-4 py-3">{order.fullName || "Guest"}</td>
                    <td className="px-4 py-3 font-semibold text-blue-400">
                      KES {order.totalAmount.toFixed(2)}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`px-3 py-1 text-xs rounded-full ${
                          order.shippingStage === "DELIVERED"
                            ? "bg-green-700/30 text-green-300"
                            : order.shippingStage === "CANCELLED"
                            ? "bg-red-700/30 text-red-300"
                            : "bg-blue-700/30 text-blue-300"
                        }`}
                      >
                        {order.shippingStage}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-400">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3">
                      <select
                        value={order.shippingStage}
                        disabled={updating === order.id}
                        onChange={(e) => updateShippingStage(order.id, e.target.value as ShippingStage)}
                        className="border border-gray-600 bg-gray-800 text-gray-200 rounded px-2 py-1 text-xs focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      >
                        {SHIPPING_STAGES.map((stage) => (
                          <option key={stage} value={stage}>
                            {stage}
                          </option>
                        ))}
                      </select>
                    </td>
                  </tr>

                  {expanded === order.id && (
                    <tr className="bg-gray-800/50">
                      <td colSpan={6} className="px-4 py-4">
                        <div>
                          <h4 className="font-semibold text-white mb-3">Products:</h4>
                          <ul className="mt-2 divide-y divide-gray-700">
                            {order.productDetails.map((op) => (
                              <li key={op.id} className="flex items-center justify-between py-2">
                                <div className="flex items-center gap-3">
                                  <img
                                    src={op.product.productImage[0]}
                                    className="w-14 h-14 object-cover rounded-lg shadow"
                                    alt={op.product.productName}
                                  />
                                  <div>
                                    <p className="font-medium text-gray-200">{op.product.productName}</p>
                                    <p className="text-sm text-gray-400">Qty: {op.quantity}</p>
                                  </div>
                                </div>
                                <p className="font-semibold text-blue-400">
                                  KES {op.product.sellingPrice?.toFixed(2)}
                                </p>
                              </li>
                            ))}
                          </ul>
                          <div className="mt-4 text-sm text-gray-400 space-y-1">
                            <p>
                              <strong className="text-gray-200">Address:</strong> {order.address}, {order.city}, {order.county}
                            </p>
                            <p>
                              <strong className="text-gray-200">Phone:</strong> {order.phone}
                            </p>
                            <p>
                              <strong className="text-gray-200">Payment:</strong> {order.paymentMethod.join(", ")} ({order.paymentStatus})
                            </p>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
