"use client";

import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { useAuthStore } from "@/store/auth-store";

const RANGE_OPTIONS = ["daily", "weekly", "monthly", "all"] as const;
type RangeOption = (typeof RANGE_OPTIONS)[number];

type ShippingStage =
  | "PENDING"
  | "PACKING"
  | "SHIPPED"
  | "IN_TRANSIT"
  | "DELIVERED"
  | "CANCELLED";

interface Order {
  id: string;
  fullName: string;
  totalAmount: number;
  paymentMethod: string[];
  shippingStage: ShippingStage;
  createdAt: string;
}

interface ChartData {
  date: string;
  revenue: number;
}

interface RevenueData {
  totalRevenue: number;
  orders: Order[];
  chartData: ChartData[];
}

// Use environment variable for API URL
const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

export default function RevenuePage() {
  const { fetchWithAuth } = useAuthStore();
  const [data, setData] = useState<RevenueData>({
    totalRevenue: 0,
    orders: [],
    chartData: [],
  });
  const [range, setRange] = useState<RangeOption>("all");
  const [chartType, setChartType] = useState<"line" | "bar">("line");
  const [loading, setLoading] = useState(true);

  const fetchRevenue = async () => {
    setLoading(true);
    try {
      const res = await fetchWithAuth(`${API_URL}/api/admin/revenue?range=${range}`);
      const json = await res.json();
      if (json.success) setData(json);
      else toast.error(json.message || "Failed to load revenue data");
    } catch (e: any) {
      toast.error(e.message || "Error fetching revenue data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRevenue();
  }, [range]);

  const exportPDF = () => {
    const doc = new jsPDF();
    doc.text("Revenue Report", 14, 15);
    doc.setFontSize(11);
    doc.text(`Range: ${range.toUpperCase()}`, 14, 25);
    doc.text(`Total Revenue: KES ${data.totalRevenue.toFixed(2)}`, 14, 32);

    const tableData = data.orders.map((order) => [
      order.id,
      order.fullName || "Guest",
      `KES ${order.totalAmount.toFixed(2)}`,
      order.paymentMethod.join(", "),
      order.shippingStage,
      new Date(order.createdAt).toLocaleDateString(),
    ]);

    autoTable(doc, {
      head: [["Order ID", "Customer", "Amount", "Payment", "Shipping", "Date"]],
      body: tableData,
      startY: 40,
      theme: "grid",
    });

    doc.save(`Revenue_Report_${range}.pdf`);
  };

  return (
    <div className="bg-gradient-to-b from-black via-gray-900 to-gray-800 text-gray-300 rounded-md shadow-md p-6 min-h-screen">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-semibold text-white">💰 Revenue Dashboard</h2>
        <div className="flex gap-2">
          <button
            onClick={exportPDF}
            className="px-4 py-2 bg-green-600 text-white rounded shadow hover:bg-green-700"
          >
            Export PDF
          </button>
          <button
            onClick={() => setChartType(chartType === "line" ? "bar" : "line")}
            className="px-4 py-2 bg-gray-700 text-gray-300 rounded shadow hover:bg-gray-600"
          >
            Switch to {chartType === "line" ? "Bar" : "Line"} Chart
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-3 mb-6">
        {RANGE_OPTIONS.map((opt) => (
          <button
            key={opt}
            onClick={() => setRange(opt)}
            className={`px-4 py-2 rounded-md border text-sm ${
              range === opt
                ? "bg-blue-600 text-white"
                : "bg-gray-700 text-gray-300 hover:bg-gray-600"
            }`}
          >
            {opt.toUpperCase()}
          </button>
        ))}
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="p-4 bg-green-900 rounded shadow">
          <h3 className="text-lg font-medium text-green-200">Total Revenue</h3>
          <p className="text-2xl font-bold text-green-400">
            KES {data.totalRevenue.toFixed(2)}
          </p>
        </div>
        <div className="p-4 bg-blue-900 rounded shadow">
          <h3 className="text-lg font-medium text-blue-200">Total Orders</h3>
          <p className="text-2xl font-bold text-blue-400">{data.orders.length}</p>
        </div>
      </div>

      {/* Revenue Chart */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold mb-3 text-white">Revenue Over Time</h3>
        <ResponsiveContainer width="100%" height={300}>
          {chartType === "line" ? (
            <LineChart data={data.chartData}>
              <Line type="monotone" dataKey="revenue" stroke="#60a5fa" strokeWidth={3} />
              <CartesianGrid stroke="#374151" />
              <XAxis dataKey="date" stroke="#9ca3af" />
              <YAxis stroke="#9ca3af" />
              <Tooltip />
            </LineChart>
          ) : (
            <BarChart data={data.chartData}>
              <Bar dataKey="revenue" fill="#60a5fa" />
              <CartesianGrid stroke="#374151" />
              <XAxis dataKey="date" stroke="#9ca3af" />
              <YAxis stroke="#9ca3af" />
              <Tooltip />
            </BarChart>
          )}
        </ResponsiveContainer>
      </div>

      {/* Orders Table */}
      <h3 className="text-lg font-semibold mb-3 text-white">Recent Orders</h3>
      <div className="overflow-x-auto">
        <table className="w-full border border-gray-700 text-sm text-gray-300">
          <thead className="bg-gray-800 text-gray-300">
            <tr>
              <th className="px-3 py-2 text-left">Order ID</th>
              <th className="px-3 py-2">Customer</th>
              <th className="px-3 py-2">Amount</th>
              <th className="px-3 py-2">Payment</th>
              <th className="px-3 py-2">Shipping</th>
              <th className="px-3 py-2">Date</th>
            </tr>
          </thead>
          <tbody>
            {data.orders.map((order) => (
              <tr key={order.id} className="border-b border-gray-700 hover:bg-gray-700">
                <td className="px-3 py-2 font-mono">{order.id}</td>
                <td className="px-3 py-2">{order.fullName || "Guest"}</td>
                <td className="px-3 py-2 font-semibold text-white">
                  KES {order.totalAmount.toFixed(2)}
                </td>
                <td className="px-3 py-2">{order.paymentMethod.join(", ")}</td>
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
                <td className="px-3 py-2">
                  {new Date(order.createdAt).toLocaleDateString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
