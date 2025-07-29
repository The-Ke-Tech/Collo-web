"use client";

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { FaRegCircleUser } from "react-icons/fa6";
import { GiHamburgerMenu } from "react-icons/gi";
import { IoClose } from "react-icons/io5";
import { motion, AnimatePresence } from "framer-motion";
import ROLE from '@/common/role';
import AllUsers from './all-users/page';
import AllProducts from './all-products/page';
import Orders from './orders/page';
import Revenue from './revenue/page';
import Dashboard from './dashboard/page';

interface AdminPanelProps {
  params: Promise<{
    user: {
      name?: string;
      role?: string;
      profilePic?: string;
    } | null;
  }>;
}

const AdminPanel = ({ params }: AdminPanelProps) => {
  const router = useRouter();
  const [user, setUser] = useState<{
    name?: string;
    role?: string;
    profilePic?: string;
  } | null>(null);
  const [activeSection, setActiveSection] = useState("dashboard");
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const loadUser = async () => {
      const result = await params;
      if (!result?.user || result.user.role !== ROLE.ADMIN) {
        router.push('/');
      } else {
        setUser(result.user);
      }
    };
    loadUser();
  }, [params, router]);

  if (!user) {
    return <div className="p-6">Loading Admin Panel...</div>;
  }

  const navItems = [
    { key: "dashboard", label: "Dashboard" },
    { key: "all-users", label: "All Users" },
    { key: "all-products", label: "All Products" },
    { key: "orders", label: "Orders" },
    { key: "revenue", label: "Revenue" },
  ];

  const renderSection = () => {
    switch (activeSection) {
      case "dashboard":
        return <Dashboard />;
      case "all-users":
        return <AllUsers />;
      case "all-products":
        return <AllProducts />;
      case "orders":
        return <Orders />;
      case "revenue":
        return <Revenue />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <AnimatePresence>
        {menuOpen && (
          <motion.aside
            initial={{ x: -250, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -250, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="bg-white w-64 customShadow border-r border-gray-200 fixed md:static z-40 top-0 left-0 h-full"
          >
            <div className="p-6 flex flex-col items-center">
              <div className="text-5xl mb-2">
                {user?.profilePic ? (
                  <img
                    src={user.profilePic}
                    alt={user.name}
                    className="w-20 h-20 rounded-full object-cover"
                  />
                ) : (
                  <FaRegCircleUser />
                )}
              </div>
              <p className="capitalize text-lg font-semibold">{user.name}</p>
              <p className="text-sm text-gray-500">{user.role}</p>

              <button
                onClick={() => setMenuOpen(false)}
                className="mt-4 p-2 rounded bg-gray-800 text-white md:hidden"
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
                  className={`block w-full text-left px-3 py-2 rounded hover:bg-slate-100 text-sm font-medium ${
                    activeSection === item.key
                      ? "bg-slate-200 font-semibold"
                      : "text-gray-700"
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
      <div className="md:hidden fixed top-30 left-2 z-50">
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="p-2 bg-gray-800 text-white rounded-full"
        >
          <GiHamburgerMenu size={22} />
        </button>
      </div>

      {/* Static Sidebar */}
      <aside className="hidden md:block bg-white w-64 customShadow border-r border-gray-200">
        <div className="p-6 flex flex-col items-center">
          <div className="text-5xl mb-2">
            {user?.profilePic ? (
              <img
                src={user.profilePic}
                alt={user.name}
                className="w-20 h-20 rounded-full object-cover"
              />
            ) : (
              <FaRegCircleUser />
            )}
          </div>
          <p className="capitalize text-lg font-semibold">{user.name}</p>
          <p className="text-sm text-gray-500">{user.role}</p>
        </div>

        <nav className="mt-4 px-4 space-y-2">
          {navItems.map((item) => (
            <motion.button
              key={item.key}
              onClick={() => setActiveSection(item.key)}
              whileHover={{ x: 5, scale: 1.02 }}
              transition={{ type: "spring", stiffness: 300 }}
              className={`block w-full text-left px-3 py-2 rounded hover:bg-slate-100 text-sm font-medium ${
                activeSection === item.key
                  ? "bg-slate-200 font-semibold"
                  : "text-gray-700"
              }`}
            >
              {item.label}
            </motion.button>
          ))}
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-6 bg-gray-50 overflow-y-auto md:ml-0">
        {renderSection()}
      </main>
    </div>
  );
};

export default AdminPanel;
