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

  if (loading) return <p className="p-6 text-gray-500">Loading orders...</p>;

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <h2 className="text-xl font-semibold mb-4 text-blue-700">All Orders</h2>
      {orders.length === 0 ? (
        <p className="text-gray-500">No orders found.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full border text-sm">
            <thead className="bg-blue-50">
              <tr>
                <th className="px-3 py-2 text-left text-blue-700">Order ID</th>
                <th className="px-3 py-2 text-blue-700">Customer</th>
                <th className="px-3 py-2 text-blue-700">Total</th>
                <th className="px-3 py-2 text-blue-700">Status</th>
                <th className="px-3 py-2 text-blue-700">Created</th>
                <th className="px-3 py-2 text-blue-700">Action</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <React.Fragment key={order.id}>
                  <tr
                    className="border-b hover:bg-blue-50 cursor-pointer"
                    onClick={() =>
                      setExpanded(expanded === order.id ? null : order.id)
                    }
                  >
                    <td className="px-3 py-2 font-mono">{order.id}</td>
                    <td className="px-3 py-2">{order.fullName || "Guest"}</td>
                    <td className="px-3 py-2 font-semibold text-blue-700">
                      KES {order.totalAmount.toFixed(2)}
                    </td>
                    <td className="px-3 py-2">
                      <span
                        className={`px-2 py-1 text-xs rounded-full ${
                          order.shippingStage === "DELIVERED"
                            ? "bg-green-100 text-green-700"
                            : order.shippingStage === "CANCELLED"
                            ? "bg-red-100 text-red-700"
                            : "bg-blue-100 text-blue-700"
                        }`}
                      >
                        {order.shippingStage}
                      </span>
                    </td>
                    <td className="px-3 py-2">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-3 py-2">
                      <select
                        value={order.shippingStage}
                        disabled={updating === order.id}
                        onChange={(e) =>
                          updateShippingStage(order.id, e.target.value as ShippingStage)
                        }
                        className="border rounded p-1 text-xs focus:ring focus:ring-blue-200 focus:border-blue-400"
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
                    <tr className="bg-blue-50">
                      <td colSpan={6} className="px-3 py-3">
                        <div>
                          <h4 className="font-medium text-blue-700">Products:</h4>
                          <ul className="mt-2 space-y-1">
                            {order.productDetails.map((op) => (
                              <li
                                key={op.id}
                                className="flex items-center justify-between border-b py-1"
                              >
                                <div className="flex items-center gap-2">
                                  <img
                                    src={op.product.productImage[0]}
                                    className="w-12 h-12 object-cover rounded"
                                    alt={op.product.productName}
                                  />
                                  <div>
                                    <p className="font-medium text-blue-700">
                                      {op.product.productName}
                                    </p>
                                    <p className="text-sm text-gray-500">
                                      Qty: {op.quantity}
                                    </p>
                                  </div>
                                </div>
                                <p className="font-semibold text-blue-700">
                                  KES {op.product.sellingPrice?.toFixed(2)}
                                </p>
                              </li>
                            ))}
                          </ul>
                          <div className="mt-3">
                            <p className="text-sm text-gray-600">
                              Address: {order.address}, {order.city}, {order.county}
                            </p>
                            <p className="text-sm text-gray-600">Phone: {order.phone}</p>
                            <p className="text-sm text-gray-600">
                              Payment: {order.paymentMethod.join(", ")} ({order.paymentStatus})
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
