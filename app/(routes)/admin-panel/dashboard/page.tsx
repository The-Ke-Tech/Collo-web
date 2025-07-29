"use client";

import React, { useEffect, useState } from "react";
import CountUp from "react-countup";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { FaUsers, FaShoppingCart, FaMoneyBillWave, FaBoxOpen } from "react-icons/fa";
import moment from "moment";
import { motion } from "framer-motion";

interface Order {
  fullName: string;
  email: string;
  totalAmount: number;
  paymentStatus: "CONFIRMED" | "PENDING" | "FAILED";
  createdAt: string;
}

interface ChartData {
  date: string;
  revenue: number;
}

export default function Dashboard() {
  const [stats, setStats] = useState({ users: 0, orders: 0, revenue: 0, products: 0 });
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);
  const [chartData, setChartData] = useState<ChartData[]>([]);
  const [timeframe, setTimeframe] = useState("week");
  const [chartType, setChartType] = useState("line");
  const [loading, setLoading] = useState(true);

  const fetchDashboardData = async () => {
    setLoading(true);
    const res = await fetch(`/api/admin/summary?timeframe=${timeframe}`);
    const data = await res.json();
    if (data.success) {
      setStats(data.stats);
      setRecentOrders(data.recentOrders);
      setChartData(data.salesData);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchDashboardData();
  }, [timeframe]);

  const cards = [
    { title: "Total Users", value: stats.users, icon: <FaUsers className="text-blue-500" /> },
    { title: "Total Orders", value: stats.orders, icon: <FaShoppingCart className="text-green-500" /> },
    { title: "Total Revenue", value: stats.revenue, isCurrency: true, icon: <FaMoneyBillWave className="text-yellow-500" /> },
    { title: "Products", value: stats.products, icon: <FaBoxOpen className="text-purple-500" /> },
  ];

  return (
    <div className="space-y-6">
      {/* Top Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {cards.map((card, idx) => (
          <motion.div
            key={idx}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.98 }}
            transition={{ type: "spring", stiffness: 300 }}
            className="bg-white p-5 rounded-lg shadow-md flex items-center gap-4 hover:shadow-lg"
          >
            <div className="text-3xl">{card.icon}</div>
            <div>
              <p className="text-sm text-gray-500">{card.title}</p>
              <p className="text-2xl font-semibold">
                <CountUp
                  start={0}
                  end={card.value}
                  duration={1.5}
                  separator=","
                  prefix={card.isCurrency ? "KSh " : ""}
                />
              </p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Chart Section */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold">Overview</h2>
          <div className="flex gap-2">
            {["day", "week", "month"].map((tf) => (
              <button
                key={tf}
                onClick={() => setTimeframe(tf)}
                className={`px-3 py-1 rounded ${timeframe === tf ? "bg-blue-600 text-white" : "bg-gray-100"}`}
              >
                {tf.charAt(0).toUpperCase() + tf.slice(1)}
              </button>
            ))}
            <button
              onClick={() => setChartType(chartType === "line" ? "bar" : "line")}
              className="px-3 py-1 rounded bg-gray-200"
            >
              Switch {chartType === "line" ? "Bar" : "Line"}
            </button>
          </div>
        </div>
        {loading ? (
          <p className="text-center text-gray-500 py-10">Loading chart...</p>
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            {chartType === "line" ? (
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="revenue" stroke="#3b82f6" strokeWidth={2} />
              </LineChart>
            ) : (
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="revenue" fill="#3b82f6" />
              </BarChart>
            )}
          </ResponsiveContainer>
        )}
      </div>

      {/* Recent Orders */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-lg font-semibold mb-4">Recent Orders</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left border">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-3 py-2">Customer</th>
                <th className="px-3 py-2">Email</th>
                <th className="px-3 py-2">Amount</th>
                <th className="px-3 py-2">Status</th>
                <th className="px-3 py-2">Date</th>
              </tr>
            </thead>
            <tbody>
              {recentOrders.map((order, idx) => (
                <tr key={idx} className="border-t hover:bg-gray-50">
                  <td className="px-3 py-2">{order.fullName || "Guest"}</td>
                  <td className="px-3 py-2">{order.email || "-"}</td>
                  <td className="px-3 py-2 font-semibold">KSh {order.totalAmount.toLocaleString()}</td>
                  <td className="px-3 py-2">
                    <span
                      className={`px-2 py-1 text-xs rounded ${
                        order.paymentStatus === "CONFIRMED"
                          ? "bg-green-100 text-green-700"
                          : "bg-yellow-100 text-yellow-700"
                      }`}
                    >
                      {order.paymentStatus}
                    </span>
                  </td>
                  <td className="px-3 py-2">{moment(order.createdAt).format("LL")}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
