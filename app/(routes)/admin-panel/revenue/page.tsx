"use client";

import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { LineChart, Line, BarChart, Bar, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

const RANGE_OPTIONS = ["daily", "weekly", "monthly", "all"] as const;
type RangeOption = (typeof RANGE_OPTIONS)[number];

type ShippingStage = "PENDING" | "PACKING" | "SHIPPED" | "IN_TRANSIT" | "DELIVERED" | "CANCELLED";

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

export default function RevenuePage() {
  const [data, setData] = useState<RevenueData>({ totalRevenue: 0, orders: [], chartData: [] });
  const [range, setRange] = useState<RangeOption>("all");
  const [chartType, setChartType] = useState<"line" | "bar">("line");
  const [loading, setLoading] = useState(true);

  const fetchRevenue = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/revenue?range=${range}`);
      const json = await res.json();
      if (json.success) setData(json);
      else toast.error(json.message || "Failed to load revenue data");
    } catch (e) {
      toast.error("Error fetching revenue data");
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
    <div className="bg-white rounded-md shadow-md p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-semibold">💰 Revenue Dashboard</h2>
        <div className="flex gap-2">
          <button
            onClick={exportPDF}
            className="px-4 py-2 bg-green-600 text-white rounded shadow hover:bg-green-700"
          >
            Export PDF
          </button>
          <button
            onClick={() => setChartType(chartType === "line" ? "bar" : "line")}
            className="px-4 py-2 bg-gray-600 text-white rounded shadow hover:bg-gray-700"
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
              range === opt ? "bg-black text-white" : "bg-gray-100"
            }`}
          >
            {opt.toUpperCase()}
          </button>
        ))}
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="p-4 bg-green-100 rounded shadow">
          <h3 className="text-lg font-medium">Total Revenue</h3>
          <p className="text-2xl font-bold text-green-700">KES {data.totalRevenue.toFixed(2)}</p>
        </div>
        <div className="p-4 bg-blue-100 rounded shadow">
          <h3 className="text-lg font-medium">Total Orders</h3>
          <p className="text-2xl font-bold text-blue-700">{data.orders.length}</p>
        </div>
      </div>

      {/* Revenue Chart */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold mb-3">Revenue Over Time</h3>
        <ResponsiveContainer width="100%" height={300}>
          {chartType === "line" ? (
            <LineChart data={data.chartData}>
              <Line type="monotone" dataKey="revenue" stroke="#4f46e5" strokeWidth={3} />
              <CartesianGrid stroke="#e5e7eb" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
            </LineChart>
          ) : (
            <BarChart data={data.chartData}>
              <Bar dataKey="revenue" fill="#4f46e5" />
              <CartesianGrid stroke="#e5e7eb" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
            </BarChart>
          )}
        </ResponsiveContainer>
      </div>

      {/* Orders Table */}
      <h3 className="text-lg font-semibold mb-3">Recent Orders</h3>
      <div className="overflow-x-auto">
        <table className="w-full border text-sm">
          <thead className="bg-gray-100">
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
              <tr key={order.id} className="border-b hover:bg-gray-50">
                <td className="px-3 py-2 font-mono">{order.id}</td>
                <td className="px-3 py-2">{order.fullName || "Guest"}</td>
                <td className="px-3 py-2 font-semibold">KES {order.totalAmount.toFixed(2)}</td>
                <td className="px-3 py-2">{order.paymentMethod.join(", ")}</td>
                <td className="px-3 py-2">
                  <span
                    className={`px-2 py-1 text-xs rounded-full ${
                      order.shippingStage === "DELIVERED"
                        ? "bg-green-100 text-green-700"
                        : order.shippingStage === "CANCELLED"
                        ? "bg-red-100 text-red-700"
                        : "bg-yellow-100 text-yellow-700"
                    }`}
                  >
                    {order.shippingStage}
                  </span>
                </td>
                <td className="px-3 py-2">{new Date(order.createdAt).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
