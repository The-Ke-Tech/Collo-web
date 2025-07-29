"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

// ---------- TYPES ----------
interface User {
  id: string;
  name: string | null;
  email: string;
  createdAt: string;
}

interface DashboardStats {
  totalSpent: number;
  totalOrders: number;
  activeOrders: number;
}

interface OrderItem {
  id: string;
  product: {
    id: string;
    productName: string;
  };
  quantity: number;
}

interface ActiveOrder {
  id: string;
  shippingStage: "PENDING" | "PACKING" | "SHIPPED" | "IN_TRANSIT" | "DELIVERED";
  items: { name: string; qty: number }[];
}

interface Order {
  id: string;
  createdAt: string;
  totalAmount: number;
  paymentStatus: "PENDING" | "CONFIRMED" | "FAILED";
  productDetails: OrderItem[];
}

interface CustomerDashboardData {
  user: User;
  stats: DashboardStats;
  orders: Order[];
  activeOrders: ActiveOrder[];
}

export default function CustomerDashboard() {
  const [data, setData] = useState<CustomerDashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const res = await fetch("/api/dashboard/customer", { credentials: "include" });

        if (res.status === 401) {
          // Redirect to login if not authenticated
          window.location.href = "/login";
          return;
        }

        const json: CustomerDashboardData = await res.json();
        if (res.ok) setData(json);
      } catch (err) {
        console.error("Failed to load dashboard", err);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  if (loading) return <p className="p-6 text-center">Loading...</p>;
  if (!data) return <p className="p-6 text-center text-red-500">Failed to load dashboard.</p>;

  const { user, stats, orders, activeOrders } = data;

  // Pagination Logic
  const totalPages = Math.ceil(orders.length / itemsPerPage);
  const paginatedOrders = orders.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handlePrev = () => setCurrentPage((p) => Math.max(p - 1, 1));
  const handleNext = () => setCurrentPage((p) => Math.min(p + 1, totalPages));

  return (
    <div className="max-w-5xl mx-auto py-8 px-4">
      {/* Profile Info */}
      <div className="bg-white p-6 shadow rounded mb-8">
        <h2 className="text-2xl font-semibold mb-4">Welcome, {user.name || "Customer"}</h2>
        <p>Email: {user.email}</p>
        <p>Member since: {new Date(user.createdAt).toLocaleDateString()}</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
        <div className="bg-green-100 p-4 rounded shadow">
          <p className="text-xl font-bold">KES {stats.totalSpent.toLocaleString()}</p>
          <p className="text-gray-600">Total Spent</p>
        </div>
        <div className="bg-blue-100 p-4 rounded shadow">
          <p className="text-xl font-bold">{stats.totalOrders}</p>
          <p className="text-gray-600">Confirmed Orders</p>
        </div>
        <div className="bg-yellow-100 p-4 rounded shadow">
          <p className="text-xl font-bold">{stats.activeOrders}</p>
          <p className="text-gray-600">Active Orders</p>
        </div>
      </div>

      {/* Active Orders */}
      {activeOrders.length > 0 && (
        <div className="bg-white p-6 shadow rounded mb-8">
          <h3 className="text-xl font-semibold mb-4">Active Orders</h3>
          <ul className="space-y-4">
            {activeOrders.map((order) => (
              <li key={order.id} className="border p-4 rounded">
                <p className="font-semibold">Order ID: {order.id}</p>
                <p className="text-sm">
                  Stage:{" "}
                  <span
                    className={`px-2 py-1 rounded text-xs font-medium
                      ${order.shippingStage === "PACKING"
                        ? "bg-yellow-100 text-yellow-700"
                        : order.shippingStage === "SHIPPED"
                        ? "bg-blue-100 text-blue-700"
                        : order.shippingStage === "IN_TRANSIT"
                        ? "bg-purple-100 text-purple-700"
                        : order.shippingStage === "PENDING"
                        ? "bg-gray-100 text-gray-700"
                        : "bg-green-100 text-green-700"
                      }`}
                  >
                    {order.shippingStage}
                  </span>
                </p>
                <ul className="list-disc list-inside mt-2 text-sm text-gray-800">
                  {order.items.map((item, idx) => (
                    <li key={idx}>{item.name} × {item.qty}</li>
                  ))}
                </ul>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Orders Table with Pagination */}
      <div className="bg-white p-6 shadow rounded overflow-x-auto">
        <h3 className="text-xl font-semibold mb-4">Order History</h3>
        {orders.length === 0 ? (
          <p>You have no orders yet.</p>
        ) : (
          <>
            <table className="min-w-full border border-gray-200 rounded-lg">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Order ID</th>
                  <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Date</th>
                  <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Products</th>
                  <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Amount</th>
                  <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Status</th>
                  <th className="px-4 py-2 text-right text-sm font-medium text-gray-700">Action</th>
                </tr>
              </thead>
              <tbody>
                {paginatedOrders.map((order) => (
                  <tr key={order.id} className="border-t hover:bg-gray-50">
                    <td className="px-4 py-2 text-sm font-mono">{order.id}</td>
                    <td className="px-4 py-2 text-sm">{new Date(order.createdAt).toLocaleDateString()}</td>
                    <td className="px-4 py-2 text-sm">
                      <ul className="list-disc list-inside space-y-1">
                        {order.productDetails.map((p) => (
                          <li key={p.id}>{p.product.productName} × {p.quantity}</li>
                        ))}
                      </ul>
                    </td>
                    <td className="px-4 py-2 text-sm font-semibold">KES {order.totalAmount.toLocaleString()}</td>
                    <td className="px-4 py-2 text-sm">
                      <span
                        className={`px-2 py-1 rounded text-xs font-medium 
                          ${order.paymentStatus === "CONFIRMED"
                            ? "bg-green-100 text-green-700"
                            : order.paymentStatus === "FAILED"
                              ? "bg-red-100 text-red-700"
                              : "bg-yellow-100 text-yellow-700"
                          }`}
                      >
                        {order.paymentStatus}
                      </span>
                    </td>
                    <td className="px-4 py-2 text-right">
                      <button
                        onClick={async () => {
                          try {
                            const res = await fetch(`/api/order/${order.id}/receipt`);
                            if (!res.ok) throw new Error("Failed to download receipt");
                            const blob = await res.blob();
                            const url = window.URL.createObjectURL(blob);
                            const link = document.createElement("a");
                            link.href = url;
                            link.download = `receipt-${order.id}.pdf`;
                            document.body.appendChild(link);
                            link.click();
                            link.remove();
                            window.URL.revokeObjectURL(url);
                          } catch (err) {
                            console.error(err);
                            alert("Could not download receipt.");
                          }
                        }}
                        className="text-blue-600 text-sm hover:underline"
                      >
                        Download Receipt
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Pagination Controls */}
            <div className="flex justify-between items-center mt-4">
              <button
                onClick={handlePrev}
                disabled={currentPage === 1}
                className={`px-4 py-2 rounded border ${currentPage === 1 ? "opacity-50 cursor-not-allowed" : "hover:bg-gray-100"}`}
              >
                Prev
              </button>
              <p className="text-sm text-gray-600">
                Page {currentPage} of {totalPages}
              </p>
              <button
                onClick={handleNext}
                disabled={currentPage === totalPages}
                className={`px-4 py-2 rounded border ${currentPage === totalPages ? "opacity-50 cursor-not-allowed" : "hover:bg-gray-100"}`}
              >
                Next
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
