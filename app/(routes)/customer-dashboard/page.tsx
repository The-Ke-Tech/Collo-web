"use client";

import { useEffect, useState } from "react";

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

  if (loading) return <p className="p-6 text-center text-gray-300">Loading...</p>;
  if (!data) return <p className="p-6 text-center text-red-400">Failed to load dashboard.</p>;

  const { user, stats, orders, activeOrders } = data;

  const totalPages = Math.ceil(orders.length / itemsPerPage);
  const paginatedOrders = orders.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handlePrev = () => setCurrentPage((p) => Math.max(p - 1, 1));
  const handleNext = () => setCurrentPage((p) => Math.min(p + 1, totalPages));

  return (
    <div className="max-w-5xl mx-auto py-8 px-4 bg-gradient-to-b from-cyan-950 via-gray-900 to-purple-950 text-gray-100 rounded-lg shadow-lg">
      {/* Profile Info */}
      <div className="bg-gradient-to-r from-cyan-800 to-purple-800 p-6 rounded-lg shadow mb-8 border border-purple-700">
        <h2 className="text-2xl font-semibold mb-4 text-white">
          Welcome, {user.name || "Customer"}
        </h2>
        <p className="text-gray-200">Email: {user.email}</p>
        <p className="text-gray-300">
          Member since: {new Date(user.createdAt).toLocaleDateString()}
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
        <div className="bg-gradient-to-r from-cyan-600 to-cyan-800 p-4 rounded shadow">
          <p className="text-xl font-bold text-white">
            KES {stats.totalSpent.toLocaleString()}
          </p>
          <p className="text-cyan-100">Total Spent</p>
        </div>
        <div className="bg-gradient-to-r from-purple-600 to-purple-800 p-4 rounded shadow">
          <p className="text-xl font-bold text-white">{stats.totalOrders}</p>
          <p className="text-purple-100">Confirmed Orders</p>
        </div>
        <div className="bg-gradient-to-r from-pink-600 to-purple-700 p-4 rounded shadow">
          <p className="text-xl font-bold text-white">{stats.activeOrders}</p>
          <p className="text-pink-100">Active Orders</p>
        </div>
      </div>

      {/* Active Orders */}
      {activeOrders.length > 0 && (
        <div className="bg-gradient-to-r from-cyan-900 to-purple-900 p-6 rounded-lg shadow mb-8 border border-purple-700">
          <h3 className="text-xl font-semibold mb-4 text-white">Active Orders</h3>
          <ul className="space-y-4">
            {activeOrders.map((order) => (
              <li key={order.id} className="border border-gray-700 p-4 rounded bg-gray-800">
                <p className="font-semibold text-gray-200">Order ID: {order.id}</p>
                <p className="text-sm text-gray-400">
                  Stage:{" "}
                  <span
                    className={`px-2 py-1 rounded text-xs font-medium
                      ${order.shippingStage === "PACKING"
                        ? "bg-yellow-500 text-gray-900"
                        : order.shippingStage === "SHIPPED"
                        ? "bg-blue-500 text-white"
                        : order.shippingStage === "IN_TRANSIT"
                        ? "bg-purple-500 text-white"
                        : order.shippingStage === "PENDING"
                        ? "bg-gray-500 text-white"
                        : "bg-green-500 text-gray-900"
                      }`}
                  >
                    {order.shippingStage}
                  </span>
                </p>
                <ul className="list-disc list-inside mt-2 text-sm text-gray-300">
                  {order.items.map((item, idx) => (
                    <li key={idx}>{item.name} × {item.qty}</li>
                  ))}
                </ul>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Orders Table */}
      <div className="bg-gradient-to-r from-cyan-900 to-purple-900 p-6 rounded-lg shadow overflow-x-auto border border-purple-700">
        <h3 className="text-xl font-semibold mb-4 text-white">Order History</h3>
        {orders.length === 0 ? (
          <p className="text-gray-400">You have no orders yet.</p>
        ) : (
          <>
            <table className="min-w-full border border-gray-700 rounded-lg">
              <thead className="bg-gray-800">
                <tr>
                  <th className="px-4 py-2 text-left text-sm font-medium text-gray-300">Order ID</th>
                  <th className="px-4 py-2 text-left text-sm font-medium text-gray-300">Date</th>
                  <th className="px-4 py-2 text-left text-sm font-medium text-gray-300">Products</th>
                  <th className="px-4 py-2 text-left text-sm font-medium text-gray-300">Amount</th>
                  <th className="px-4 py-2 text-left text-sm font-medium text-gray-300">Status</th>
                  <th className="px-4 py-2 text-right text-sm font-medium text-gray-300">Action</th>
                </tr>
              </thead>
              <tbody>
                {paginatedOrders.map((order) => (
                  <tr key={order.id} className="border-t border-gray-700 hover:bg-gray-800">
                    <td className="px-4 py-2 text-sm font-mono text-gray-200">{order.id}</td>
                    <td className="px-4 py-2 text-sm text-gray-300">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-2 text-sm text-gray-300">
                      <ul className="list-disc list-inside space-y-1">
                        {order.productDetails.map((p) => (
                          <li key={p.id}>{p.product.productName} × {p.quantity}</li>
                        ))}
                      </ul>
                    </td>
                    <td className="px-4 py-2 text-sm font-semibold text-gray-100">
                      KES {order.totalAmount.toLocaleString()}
                    </td>
                    <td className="px-4 py-2 text-sm">
                      <span
                        className={`px-2 py-1 rounded text-xs font-medium 
                          ${order.paymentStatus === "CONFIRMED"
                            ? "bg-green-500 text-gray-900"
                            : order.paymentStatus === "FAILED"
                              ? "bg-red-500 text-white"
                              : "bg-yellow-500 text-gray-900"
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
                        className="text-cyan-400 text-sm hover:underline"
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
                className={`px-4 py-2 rounded border border-gray-600 text-gray-300 ${currentPage === 1 ? "opacity-50 cursor-not-allowed" : "hover:bg-gray-800"}`}
              >
                Prev
              </button>
              <p className="text-sm text-gray-400">
                Page {currentPage} of {totalPages}
              </p>
              <button
                onClick={handleNext}
                disabled={currentPage === totalPages}
                className={`px-4 py-2 rounded border border-gray-600 text-gray-300 ${currentPage === totalPages ? "opacity-50 cursor-not-allowed" : "hover:bg-gray-800"}`}
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
