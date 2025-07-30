// app/admin-panel/AdminPanel.tsx
"use client";

import React, { useState } from 'react';
import { FaRegCircleUser } from "react-icons/fa6";
import { GiHamburgerMenu } from "react-icons/gi";
import { IoClose } from "react-icons/io5";
import { motion, AnimatePresence } from "framer-motion";
import AllUsers from './all-users/page';
import AllProducts from './all-products/page';
import Orders from './orders/page';
import Revenue from './revenue/page';
import Dashboard from './dashboard/page';

interface AdminPanelProps {
  user: {
    name?: string;
    role?: string;
    profilePic?: string;
  };
}

const AdminPanel = ({ user }: AdminPanelProps) => {
  const [activeSection, setActiveSection] = useState("dashboard");
  const [menuOpen, setMenuOpen] = useState(false);

  const navItems = [
    { key: "dashboard", label: "Dashboard" },
    { key: "all-users", label: "All Users" },
    { key: "all-products", label: "All Products" },
    { key: "orders", label: "Orders" },
    { key: "revenue", label: "Revenue" },
  ];

  const renderSection = () => {
    switch (activeSection) {
      case "dashboard": return <Dashboard />;
      case "all-users": return <AllUsers />;
      case "all-products": return <AllProducts />;
      case "orders": return <Orders />;
      case "revenue": return <Revenue />;
      default: return <Dashboard />;
    }
  };

  return (
    <div className="flex min-h-screen bg-gradient-to-b from-black via-gray-900 to-gray-800 text-gray-300">
      {/* Sidebar (Mobile) */}
      <AnimatePresence>
        {menuOpen && (
          <motion.aside
            initial={{ x: -250, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -250, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="bg-gray-900 w-64 border-r border-gray-700 fixed md:static z-40 top-0 left-0 h-full shadow-lg"
          >
            <div className="p-6 flex flex-col items-center">
              <div className="text-5xl mb-2">
                {user.profilePic ? (
                  <img src={user.profilePic} alt={user.name} className="w-20 h-20 rounded-full object-cover border-2 border-gray-700" />
                ) : <FaRegCircleUser className="text-gray-400" />}
              </div>
              <p className="capitalize text-lg font-semibold text-white">{user.name}</p>
              <p className="text-sm text-gray-400">{user.role}</p>

              <button
                onClick={() => setMenuOpen(false)}
                className="mt-4 p-2 rounded bg-gray-700 text-white md:hidden"
              >
                <IoClose size={22} />
              </button>
            </div>
            <nav className="mt-4 px-4 space-y-2">
              {navItems.map((item) => (
                <motion.button
                  key={item.key}
                  onClick={() => {
                    setActiveSection(item.key);
                    setMenuOpen(false);
                  }}
                  whileHover={{ x: 5, scale: 1.02 }}
                  transition={{ type: "spring", stiffness: 300 }}
                  className={`block w-full text-left px-3 py-2 rounded text-sm font-medium ${
                    activeSection === item.key
                      ? "bg-blue-600 text-white"
                      : "text-gray-300 hover:bg-gray-700"
                  }`}
                >
                  {item.label}
                </motion.button>
              ))}
            </nav>
          </motion.aside>
        )}
      </AnimatePresence>

      {/* Hamburger */}
      <div className="md:hidden fixed top-4 left-2 z-50">
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="p-2 bg-gray-700 text-white rounded-full"
        >
          <GiHamburgerMenu size={22} />
        </button>
      </div>

      {/* Sidebar (Desktop) */}
      <aside className="hidden md:block bg-gray-900 w-64 border-r border-gray-700 shadow-lg">
        <div className="p-6 flex flex-col items-center">
          <div className="text-5xl mb-2">
            {user.profilePic ? (
              <img src={user.profilePic} alt={user.name} className="w-20 h-20 rounded-full object-cover border-2 border-gray-700" />
            ) : <FaRegCircleUser className="text-gray-400" />}
          </div>
          <p className="capitalize text-lg font-semibold text-white">{user?.name}</p>
          <p className="text-sm text-gray-400">{user.role}</p>
        </div>
        <nav className="mt-4 px-4 space-y-2">
          {navItems.map((item) => (
            <motion.button
              key={item.key}
              onClick={() => setActiveSection(item.key)}
              whileHover={{ x: 5, scale: 1.02 }}
              transition={{ type: "spring", stiffness: 300 }}
              className={`block w-full text-left px-3 py-2 rounded text-sm font-medium ${
                activeSection === item.key
                  ? "bg-blue-600 text-white"
                  : "text-gray-300 hover:bg-gray-700"
              }`}
            >
              {item.label}
            </motion.button>
          ))}
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-6 bg-gray-950 text-gray-200 overflow-y-auto md:ml-0">
        {renderSection()}
      </main>
    </div>
  );
};

export default AdminPanel;
