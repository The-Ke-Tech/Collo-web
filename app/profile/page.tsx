'use client';

import React from 'react';
import { useAuthStore } from '@/store/auth-store';
import { FaUserCircle, FaUserShield, FaSignOutAlt } from 'react-icons/fa';
import Link from 'next/link';

const ProfilePage: React.FC = () => {
  const { user, logout, isAdmin } = useAuthStore();

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col">
      {/* Top Bar */}
      <header className="w-full bg-gray-800 border-b border-gray-700 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <FaUserCircle className="text-3xl text-gray-400" />
          <div>
            <p className="font-semibold">{user.name}</p>
            <p className="text-sm text-gray-300">{user.email || 'N/A'}</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {isAdmin() && (
            <Link
              href="/admin-panel"
              className="flex items-center gap-2 px-3 py-2 rounded bg-purple-600 hover:bg-purple-700 transition"
            >
              <FaUserShield />
              <span className="hidden sm:inline">Admin</span>
            </Link>
          )}

          <button
            onClick={logout}
            className="flex items-center gap-2 px-3 py-2 rounded bg-red-600 hover:bg-red-700 transition"
          >
            <FaSignOutAlt />
            <span className="hidden sm:inline">Logout</span>
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 p-6 md:p-10">
        <h1 className="text-3xl font-bold mb-4">Profile</h1>
        <p className="text-gray-300 mb-6">
          View your account information.
        </p>

        <div className="bg-gray-800 shadow-md rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Personal Information</h2>

          <div className="space-y-2 text-gray-200">
            <p><strong>Name:</strong> {user.name}</p>
            <p><strong>Email:</strong> {user.email || 'N/A'}</p>
            <p><strong>Phone:</strong> {user.phone || 'N/A'}</p>
            <p><strong>Role:</strong> {user.role}</p>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ProfilePage;
