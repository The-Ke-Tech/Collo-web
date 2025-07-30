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
    { title: "Total Users", value: stats.users, icon: <FaUsers className="text-blue-400" /> },
    { title: "Total Orders", value: stats.orders, icon: <FaShoppingCart className="text-green-400" /> },
    { title: "Total Revenue", value: stats.revenue, isCurrency: true, icon: <FaMoneyBillWave className="text-yellow-400" /> },
    { title: "Products", value: stats.products, icon: <FaBoxOpen className="text-purple-400" /> },
  ];

  return (
    <div className="space-y-6 bg-gradient-to-b from-black via-gray-900 to-gray-800 text-gray-300 min-h-screen p-4 rounded-lg">
      {/* Top Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {cards.map((card, idx) => (
          <motion.div
            key={idx}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.98 }}
            transition={{ type: "spring", stiffness: 300 }}
            className="bg-gray-800 p-5 rounded-lg shadow-md flex items-center gap-4 hover:shadow-lg"
          >
            <div className="text-3xl">{card.icon}</div>
            <div>
              <p className="text-sm text-gray-400">{card.title}</p>
              <p className="text-2xl font-semibold text-white">
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
      <div className="bg-gray-800 p-6 rounded-lg shadow-md">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-white">Overview</h2>
          <div className="flex gap-2">
            {["day", "week", "month"].map((tf) => (
              <button
                key={tf}
                onClick={() => setTimeframe(tf)}
                className={`px-3 py-1 rounded ${
                  timeframe === tf
                    ? "bg-blue-600 text-white"
                    : "bg-gray-700 text-gray-300 hover:bg-gray-600"
                }`}
              >
                {tf.charAt(0).toUpperCase() + tf.slice(1)}
              </button>
            ))}
            <button
              onClick={() => setChartType(chartType === "line" ? "bar" : "line")}
              className="px-3 py-1 rounded bg-gray-700 text-gray-300 hover:bg-gray-600"
            >
              Switch {chartType === "line" ? "Bar" : "Line"}
            </button>
          </div>
        </div>
        {loading ? (
          <p className="text-center text-gray-400 py-10">Loading chart...</p>
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            {chartType === "line" ? (
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#555" />
                <XAxis dataKey="date" stroke="#aaa" />
                <YAxis stroke="#aaa" />
                <Tooltip contentStyle={{ background: "#1f2937", color: "#fff" }} />
                <Line type="monotone" dataKey="revenue" stroke="#3b82f6" strokeWidth={2} />
              </LineChart>
            ) : (
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#555" />
                <XAxis dataKey="date" stroke="#aaa" />
                <YAxis stroke="#aaa" />
                <Tooltip contentStyle={{ background: "#1f2937", color: "#fff" }} />
                <Bar dataKey="revenue" fill="#3b82f6" />
              </BarChart>
            )}
          </ResponsiveContainer>
        )}
      </div>

      {/* Recent Orders */}
      <div className="bg-gray-800 p-6 rounded-lg shadow-md">
        <h2 className="text-lg font-semibold mb-4 text-white">Recent Orders</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left border border-gray-700">
            <thead className="bg-gray-700 text-gray-300">
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
                <tr key={idx} className="border-t border-gray-700 hover:bg-gray-700">
                  <td className="px-3 py-2">{order.fullName || "Guest"}</td>
                  <td className="px-3 py-2">{order.email || "-"}</td>
                  <td className="px-3 py-2 font-semibold text-white">
                    KSh {order.totalAmount.toLocaleString()}
                  </td>
                  <td className="px-3 py-2">
                    <span
                      className={`px-2 py-1 text-xs rounded ${
                        order.paymentStatus === "CONFIRMED"
                          ? "bg-green-700 text-green-200"
                          : "bg-yellow-700 text-yellow-200"
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
