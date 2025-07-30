"use client";
import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";

const SHIPPING_STAGES = ["PENDING", "PACKING", "SHIPPED", "IN_TRANSIT", "DELIVERED", "CANCELLED"] as const;
type ShippingStage = (typeof SHIPPING_STAGES)[number];

interface Product {
  id: string;
  productImage: string[];
  productName: string;
  sellingPrice: number;
}

interface OrderProduct {
  id: string;
  product: Product;
  quantity: number;
}

interface Order {
  id: string;
  fullName: string;
  totalAmount: number;
  shippingStage: ShippingStage;
  createdAt: string;
  productDetails: OrderProduct[];
  address: string;
  city: string;
  county: string;
  phone: string;
  paymentMethod: string[];
  paymentStatus: string;
}

export default function Orders() {
  const [tab, setTab] = useState<"confirmed" | "all">("confirmed");
  const [orders, setOrders] = useState<Order[]>([]);
  const [allOrders, setAllOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [search] = useState("");
  const [shippingFilter, setShippingFilter] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/orders?page=${page}&limit=5&q=${search}&shipping=${shippingFilter}`);
      const data = await res.json();
      if (data.success) {
        setOrders(data.confirmedOrders || []);
        setAllOrders(data.allOrders || []);
        setTotalPages(data.totalPages || 1);
      } else {
        toast.error("Failed to fetch orders");
      }
    } catch (err) {
      toast.error("Error fetching orders");
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
    } catch (err) {
      toast.error("Update failed");
    } finally {
      setUpdating(null);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [page, search, shippingFilter]);

  const renderTable = (tableOrders: Order[], withActions: boolean) => (
    <div className="overflow-x-auto">
      <table className="w-full border border-gray-700 text-sm text-gray-300">
        <thead className="bg-gray-800 text-gray-300">
          <tr>
            <th className="px-3 py-2 text-left">Order ID</th>
            <th className="px-3 py-2">Customer</th>
            <th className="px-3 py-2">Total</th>
            <th className="px-3 py-2">Status</th>
            <th className="px-3 py-2">Created</th>
            {withActions && <th className="px-3 py-2">Action</th>}
          </tr>
        </thead>
        <tbody>
          {tableOrders.map((order) => (
            <React.Fragment key={order.id}>
              <tr
                className="border-b border-gray-700 hover:bg-gray-700 cursor-pointer"
                onClick={() => setExpanded(expanded === order.id ? null : order.id)}
              >
                <td className="px-3 py-2 font-mono">{order.id}</td>
                <td className="px-3 py-2">{order.fullName || "Guest"}</td>
                <td className="px-3 py-2 font-semibold text-white">KES {order.totalAmount.toFixed(2)}</td>
                <td className="px-3 py-2">
                  <span
                    className={`px-2 py-1 text-xs rounded-full ${
                      order.shippingStage === "DELIVERED"
                        ? "bg-green-700 text-green-200"
                        : order.shippingStage === "CANCELLED"
                        ? "bg-red-700 text-red-200"
                        : "bg-yellow-700 text-yellow-200"
                    }`}
                  >
                    {order.shippingStage}
                  </span>
                </td>
                <td className="px-3 py-2">{new Date(order.createdAt).toLocaleDateString()}</td>
                {withActions && (
                  <td className="px-3 py-2">
                    <select
                      value={order.shippingStage}
                      disabled={updating === order.id}
                      onChange={(e) => updateShippingStage(order.id, e.target.value as ShippingStage)}
                      className="border border-gray-600 bg-gray-800 text-gray-300 rounded p-1 text-xs"
                    >
                      {SHIPPING_STAGES.map((stage) => (
                        <option key={stage} value={stage}>
                          {stage}
                        </option>
                      ))}
                    </select>
                  </td>
                )}
              </tr>
              {expanded === order.id && (
                <tr className="bg-gray-900">
                  <td colSpan={withActions ? 6 : 5} className="px-3 py-3">
                    <div>
                      <h4 className="font-medium text-gray-200">Products:</h4>
                      <ul className="mt-2 space-y-1">
                        {order.productDetails.map((op) => (
                          <li key={op.id} className="flex items-center justify-between border-b border-gray-700 py-1">
                            <div className="flex items-center gap-2">
                              <img
                                src={op.product.productImage[0]}
                                className="w-12 h-12 object-cover rounded"
                                alt={op.product.productName}
                              />
                              <div>
                                <p className="font-medium text-gray-100">{op.product.productName}</p>
                                <p className="text-sm text-gray-400">Qty: {op.quantity}</p>
                              </div>
                            </div>
                            <p className="font-semibold text-white">KES {op.product.sellingPrice?.toFixed(2)}</p>
                          </li>
                        ))}
                      </ul>
                      <div className="mt-3 text-sm text-gray-400">
                        <p>
                          Address: {order.address}, {order.city}, {order.county}
                        </p>
                        <p>Phone: {order.phone}</p>
                        <p>
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
  );

  return (
    <div className="bg-gradient-to-b from-black via-gray-900 to-gray-800 text-gray-300 shadow rounded-lg p-6 min-h-screen">
      <div className="flex gap-4 mb-4">
        <button
          onClick={() => setTab("confirmed")}
          className={`px-4 py-2 rounded ${tab === "confirmed" ? "bg-blue-600 text-white" : "bg-gray-700 text-gray-300 hover:bg-gray-600"}`}
        >
          Manage Shipping
        </button>
        <button
          onClick={() => setTab("all")}
          className={`px-4 py-2 rounded ${tab === "all" ? "bg-blue-600 text-white" : "bg-gray-700 text-gray-300 hover:bg-gray-600"}`}
        >
          All Orders
        </button>
      </div>

      {tab === "confirmed" && (
        <>
          <div className="flex gap-2 mb-4">
            <select
              className="border border-gray-600 bg-gray-800 text-gray-300 rounded p-2 text-sm"
              value={shippingFilter}
              onChange={(e) => setShippingFilter(e.target.value)}
            >
              <option value="">All Shipping Stages</option>
              {SHIPPING_STAGES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>
          {loading ? <p className="text-gray-400">Loading orders...</p> : renderTable(orders, true)}
          <div className="flex justify-between mt-4">
            <button
              disabled={page === 1}
              onClick={() => setPage((p) => p - 1)}
              className="px-3 py-1 border border-gray-600 bg-gray-800 text-gray-300 rounded disabled:opacity-50"
            >
              Prev
            </button>
            <span>
              Page {page} of {totalPages}
            </span>
            <button
              disabled={page === totalPages}
              onClick={() => setPage((p) => p + 1)}
              className="px-3 py-1 border border-gray-600 bg-gray-800 text-gray-300 rounded disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </>
      )}

      {tab === "all" && (loading ? <p className="text-gray-400">Loading orders...</p> : renderTable(allOrders, false))}
    </div>
  );
}
