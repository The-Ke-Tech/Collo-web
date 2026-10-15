"use client";

import { useAuthStore } from "@/store/auth-store";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "";

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

// ---------- UI HELPERS (new) ----------
type Tab = "overview" | "active" | "history";

const SHIPPING_STAGES: ActiveOrder["shippingStage"][] = [
  "PENDING",
  "PACKING",
  "SHIPPED",
  "IN_TRANSIT",
  "DELIVERED",
];

const paymentBadge = (status: Order["paymentStatus"]) => {
  switch (status) {
    case "CONFIRMED":
      return "bg-emerald-600/80 text-white";
    case "FAILED":
      return "bg-red-600/80 text-white";
    default:
      return "bg-gray-600 text-white";
  }
};

export default function CustomerDashboard() {
  const { token, logout } = useAuthStore();
  const [data, setData] = useState<CustomerDashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [activeTab, setActiveTab] = useState<Tab>("overview");
  const itemsPerPage = 5;
  // Logout confirmation dialog
  const [logoutConfirmOpen, setLogoutConfirmOpen] = useState(false);

  // Close the dialog with the Escape key
  useEffect(() => {
    if (!logoutConfirmOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setLogoutConfirmOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [logoutConfirmOpen]);

  // Runs only after the user confirms (the cart badge is cleared automatically by the cart store on logout)
  const handleLogout = () => {
    logout();
    window.location.href = "/login";
  };

  useEffect(() => {
    const fetchDashboard = async () => {
      if (!token) {
        window.location.href = "/login";
        return;
      }

      try {
        const res = await fetch(`${API_URL}/api/dashboard/customer`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (res.status === 401) {
          logout();
          window.location.href = "/login";
          return;
        }

        const json: CustomerDashboardData = await res.json();
        if (res.ok) {
          setData(json);
        }
      } catch (err) {
        console.error("Failed to fetch dashboard:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, [token, logout]);

  if (loading)
    return <p className="p-6 text-center text-gray-300">Loading...</p>;

  if (!data)
    return (
      <p className="p-6 text-center text-red-400">
        Failed to load dashboard.
      </p>
    );

  const { user, stats, orders, activeOrders } = data;
  const totalPages = Math.ceil(orders.length / itemsPerPage);
  const paginatedOrders = orders.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // On small screens only the selected tab is shown (so nothing needs
  // scrolling); from md upwards every section is visible together.
  const show = (tab: Tab) =>
    activeTab === tab ? "block" : "hidden md:block";

  const tabs: { id: Tab; label: string; count?: number }[] = [
    { id: "overview", label: "Overview" },
    { id: "active", label: "Active", count: activeOrders.length },
    { id: "history", label: "History", count: orders.length },
  ];

  return (
    <div className="max-w-5xl mx-auto min-h-[calc(100dvh-var(--header-h,132px))] md:min-h-0 py-3 sm:py-6 md:py-8 px-3 sm:px-4 bg-gradient-to-b from-cyan-950 via-gray-900 to-purple-950 text-gray-100 md:rounded-lg shadow-lg">
      {/* Profile Info */}
      <div
        className={`${show(
          "overview"
        )} bg-gradient-to-r from-cyan-800 to-purple-800 p-4 sm:p-6 rounded-lg shadow mb-3 sm:mb-6 border border-purple-700`}
      >
        <div className="flex items-center gap-3 sm:gap-4">
          {/* Avatar */}
          <div className="shrink-0 h-12 w-12 sm:h-14 sm:w-14 rounded-full bg-gradient-to-br from-cyan-500 to-purple-600 flex items-center justify-center text-lg sm:text-xl font-bold text-white ring-2 ring-white/20">
            {(user.name || user.email || "C").charAt(0).toUpperCase()}
          </div>

          <div className="min-w-0 flex-1">
            <h2 className="text-lg sm:text-2xl font-semibold text-white truncate">
              Welcome, {user.name || "Customer"}
            </h2>
            <p className="text-sm text-gray-200 truncate">
              Email: {user.email}
            </p>
            <p className="text-xs sm:text-sm text-gray-300">
              Member since: {new Date(user.createdAt).toLocaleDateString()}
            </p>
          </div>

          <button
            onClick={() => setLogoutConfirmOpen(true)}
            className="shrink-0 px-3 py-1.5 rounded-full border border-white/30 text-xs sm:text-sm text-white hover:bg-white/10 transition-colors"
          >
            Logout
          </button>
        </div>
      </div>

      {/* Stats */}
      <div
        className={`${show(
          "overview"
        )} grid grid-cols-3 gap-2 sm:gap-4 md:gap-6 mb-3 sm:mb-6`}
      >
        <div className="bg-gradient-to-r from-cyan-600 to-cyan-800 p-3 sm:p-4 rounded-lg shadow">
          <p className="text-sm sm:text-xl font-bold text-white break-words leading-tight">
            KES {stats.totalSpent.toLocaleString()}
          </p>
          <p className="text-[11px] sm:text-sm text-cyan-100 mt-1">
            Total Spent
          </p>
        </div>
        <div className="bg-gradient-to-r from-purple-600 to-purple-800 p-3 sm:p-4 rounded-lg shadow">
          <p className="text-sm sm:text-xl font-bold text-white leading-tight">
            {stats.totalOrders}
          </p>
          <p className="text-[11px] sm:text-sm text-purple-100 mt-1">
            Confirmed Orders
          </p>
        </div>
        <div className="bg-gradient-to-r from-pink-600 to-purple-700 p-3 sm:p-4 rounded-lg shadow">
          <p className="text-sm sm:text-xl font-bold text-white leading-tight">
            {stats.activeOrders}
          </p>
          <p className="text-[11px] sm:text-sm text-pink-100 mt-1">
            Active Orders
          </p>
        </div>
      </div>

      {/* Mobile tab bar (hidden on md+) */}
      <div className="md:hidden sticky top-[var(--header-h,132px)] z-10 -mx-3 px-3 py-2 mb-3 bg-gray-900/90 backdrop-blur border-b border-purple-800">
        <div className="grid grid-cols-3 gap-1 p-1 rounded-full bg-gray-800 border border-gray-700">
          {tabs.map((t) => (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id)}
              className={`py-2 rounded-full text-sm font-medium transition-colors ${
                activeTab === t.id
                  ? "bg-gradient-to-r from-cyan-600 to-purple-700 text-white shadow"
                  : "text-gray-300"
              }`}
            >
              {t.label}
              {t.count !== undefined && t.count > 0 && (
                <span className="ml-1 text-[10px] px-1.5 py-0.5 rounded-full bg-white/20">
                  {t.count}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Active Orders */}
      {activeOrders.length > 0 && (
        <div
          className={`${show(
            "active"
          )} bg-gradient-to-r from-cyan-900 to-purple-900 p-4 sm:p-6 rounded-lg shadow mb-3 sm:mb-6 border border-purple-700`}
        >
          <h3 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4 text-white">
            Active Orders
          </h3>
          <ul className="space-y-3 sm:space-y-4 md:grid md:grid-cols-2 md:gap-4 md:space-y-0">
            {activeOrders.map((order) => {
              const stageIndex = SHIPPING_STAGES.indexOf(order.shippingStage);
              return (
                <li
                  key={order.id}
                  className="border border-gray-700 p-3 sm:p-4 rounded-lg bg-gray-800"
                >
                  <div className="flex items-start justify-between gap-2">
                    <p
                      className="font-semibold text-sm sm:text-base text-gray-200 truncate"
                      title={order.id}
                    >
                      Order ID: {order.id}
                    </p>
                    <span className="shrink-0 px-2 py-1 rounded text-[10px] sm:text-xs font-medium bg-gray-600 text-white">
                      {order.shippingStage}
                    </span>
                  </div>

                  {/* Tracking progress */}
                  <div className="mt-3" aria-label="Delivery progress">
                    <div className="flex gap-1">
                      {SHIPPING_STAGES.map((stage, i) => (
                        <div
                          key={stage}
                          className={`h-1.5 flex-1 rounded-full ${
                            i <= stageIndex
                              ? "bg-gradient-to-r from-cyan-400 to-purple-500"
                              : "bg-gray-600"
                          }`}
                        />
                      ))}
                    </div>
                    <p className="text-xs text-gray-400 mt-1">
                      Stage:{" "}
                      <span className="text-cyan-200">
                        {order.shippingStage}
                      </span>
                    </p>
                  </div>

                  <ul className="list-disc list-inside mt-2 text-xs sm:text-sm text-gray-300">
                    {order.items.map((item, idx) => (
                      <li key={idx}>
                        {item.name} × {item.qty}
                      </li>
                    ))}
                  </ul>
                </li>
              );
            })}
          </ul>
        </div>
      )}

      {/* Empty state for Active tab on mobile */}
      {activeOrders.length === 0 && activeTab === "active" && (
        <div className="md:hidden bg-gray-800/60 border border-purple-700 rounded-lg p-6 text-center">
          <p className="text-gray-300 text-sm">You have no active orders.</p>
        </div>
      )}

      {/* Orders Table */}
      <div
        className={`${show(
          "history"
        )} bg-gradient-to-r from-cyan-900 to-purple-900 p-4 sm:p-6 rounded-lg shadow overflow-x-auto border border-purple-700`}
      >
        <h3 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4 text-white">
          Order History
        </h3>

        {orders.length === 0 ? (
          <p className="text-gray-400">You have no orders yet.</p>
        ) : (
          <>
            {/* Mobile: compact order cards (no sideways scrolling) */}
            <ul className="md:hidden space-y-2">
              {paginatedOrders.map((order) => (
                <li
                  key={order.id}
                  className="rounded-lg border border-gray-700 bg-gray-800 p-3"
                >
                  <div className="flex items-center justify-between gap-2">
                    <p
                      className="text-xs font-mono text-gray-200 truncate"
                      title={order.id}
                    >
                      #{order.id}
                    </p>
                    <span
                      className={`shrink-0 px-2 py-0.5 rounded text-[10px] font-medium ${paymentBadge(
                        order.paymentStatus
                      )}`}
                    >
                      {order.paymentStatus}
                    </span>
                  </div>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {new Date(order.createdAt).toLocaleDateString()}
                  </p>
                  <p className="text-xs text-gray-300 mt-1 truncate">
                    {order.productDetails
                      .map((p) => `${p.product.productName} × ${p.quantity}`)
                      .join(", ")}
                  </p>
                  <p className="text-sm font-semibold text-gray-100 mt-1">
                    KES {order.totalAmount.toLocaleString()}
                  </p>
                </li>
              ))}
            </ul>

            {/* Desktop / tablet: full table */}
            <table className="hidden md:table min-w-full border border-gray-700 rounded-lg">
              <thead className="bg-gray-800">
                <tr>
                  <th className="px-4 py-2 text-left text-sm text-gray-300">
                    Order ID
                  </th>
                  <th className="px-4 py-2 text-left text-sm text-gray-300">
                    Date
                  </th>
                  <th className="px-4 py-2 text-left text-sm text-gray-300">
                    Products
                  </th>
                  <th className="px-4 py-2 text-left text-sm text-gray-300">
                    Amount
                  </th>
                  <th className="px-4 py-2 text-left text-sm text-gray-300">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody>
                {paginatedOrders.map((order) => (
                  <tr
                    key={order.id}
                    className="border-t border-gray-700 hover:bg-gray-800"
                  >
                    <td className="px-4 py-2 text-sm font-mono text-gray-200">
                      {order.id}
                    </td>
                    <td className="px-4 py-2 text-sm text-gray-300">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-2 text-sm text-gray-300">
                      <ul className="list-disc list-inside space-y-1">
                        {order.productDetails.map((p) => (
                          <li key={p.id}>
                            {p.product.productName} × {p.quantity}
                          </li>
                        ))}
                      </ul>
                    </td>
                    <td className="px-4 py-2 text-sm font-semibold text-gray-100">
                      KES {order.totalAmount.toLocaleString()}
                    </td>
                    <td className="px-4 py-2 text-sm">
                      <span
                        className={`px-2 py-1 rounded text-xs font-medium ${paymentBadge(
                          order.paymentStatus
                        )}`}
                      >
                        {order.paymentStatus}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Pagination */}
            <div className="flex justify-between items-center mt-3 sm:mt-4">
              <button
                onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                disabled={currentPage === 1}
                className="px-3 sm:px-4 py-1.5 sm:py-2 rounded-full border border-gray-600 text-sm text-gray-300 disabled:opacity-50"
              >
                Prev
              </button>
              <p className="text-xs sm:text-sm text-gray-400">
                Page {currentPage} of {totalPages}
              </p>
              <button
                onClick={() =>
                  setCurrentPage((p) => Math.min(p + 1, totalPages))
                }
                disabled={currentPage === totalPages}
                className="px-3 sm:px-4 py-1.5 sm:py-2 rounded-full border border-gray-600 text-sm text-gray-300 disabled:opacity-50"
              >
                Next
              </button>
            </div>
          </>
        )}
      </div>

      {/* Logout confirmation dialog */}
      {logoutConfirmOpen &&
        typeof document !== "undefined" &&
        createPortal(
          <div
            className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
            onClick={() => setLogoutConfirmOpen(false)}
          >
            <div
              role="dialog"
              aria-modal="true"
              aria-labelledby="dashboard-logout-title"
              aria-describedby="dashboard-logout-desc"
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-sm overflow-hidden rounded-2xl border border-white/10 bg-gray-800 shadow-2xl shadow-black/50"
            >
              <div className="h-1 bg-gradient-to-r from-[#00C2D1] via-[#7B2CBF] to-[#FF3D9A]" />
              <div className="p-5 text-center sm:p-6">
                <h3
                  id="dashboard-logout-title"
                  className="text-lg font-bold text-white sm:text-xl"
                >
                  Log out of your account?
                </h3>
                <p id="dashboard-logout-desc" className="mt-2 text-sm text-gray-300">
                  You&apos;ll need to log in again to see your orders, cart and profile.
                </p>

                <div className="mt-5 grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    autoFocus
                    onClick={() => setLogoutConfirmOpen(false)}
                    className="rounded-full border border-gray-600 px-4 py-2.5 text-sm font-semibold text-gray-200 transition hover:border-[#00C2D1] hover:bg-gray-700"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setLogoutConfirmOpen(false);
                      handleLogout();
                    }}
                    className="rounded-full bg-red-600 px-4 py-2.5 text-sm font-semibold text-white shadow-md shadow-red-900/40 transition hover:bg-red-700 active:scale-95"
                  >
                    Log out
                  </button>
                </div>
              </div>
            </div>
          </div>,
          document.body
        )}
    </div>
  );
}