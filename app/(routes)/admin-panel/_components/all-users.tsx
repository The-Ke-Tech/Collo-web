"use client";

import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import moment from "moment";
import { MdModeEdit } from "react-icons/md";
import { useAuthStore } from "@/store/auth-store";

// Frontend-only role type
export type UserRole = "user" | "admin" | "super-admin";

interface DisplayUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  createdAt: string;
}

const ROLES: UserRole[] = ["user", "admin", "super-admin"];
const USERS_PER_PAGE = 10;

const AllUsers = () => {
  const { allUsers, fetchAllUsers, updateUserRole } = useAuthStore();
  const [openUpdateRole, setOpenUpdateRole] = useState(false);
  const [updateUserDetails, setUpdateUserDetails] = useState<DisplayUser>({
    id: "",
    name: "",
    email: "",
    role: "user",
    createdAt: "",
  });
  const [newRole, setNewRole] = useState<UserRole>("user");
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    fetchAllUsers().catch(() => toast.error("Failed to fetch users"));
  }, [fetchAllUsers]);

  const totalPages = Math.ceil(allUsers.length / USERS_PER_PAGE);
  const paginatedUsers = allUsers.slice(
    (currentPage - 1) * USERS_PER_PAGE,
    currentPage * USERS_PER_PAGE
  );

  const changePage = (page: number) => {
    if (page >= 1 && page <= totalPages) setCurrentPage(page);
  };

  const handleSaveRole = async () => {
    if (!newRole) return toast.error("Please select a role");
    setLoading(true);
    try {
      await updateUserRole(updateUserDetails.id, newRole);
      toast.success("Role updated successfully");
      setOpenUpdateRole(false);
    } catch (error) {
      toast.error("Failed to update role");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleEditClick = (user: any) => {
    const safeEmail = user.email ?? "";
    const role: UserRole = ROLES.includes(user.role) ? user.role : "user";

    setUpdateUserDetails({
      id: user.id,
      name: user.name,
      email: safeEmail,
      role,
      createdAt: user.createdAt,
    });
    setNewRole(role);
    setOpenUpdateRole(true);
  };

  return (
    <div className="bg-gradient-to-b from-black via-gray-900 to-gray-800 text-gray-300 rounded-md shadow-md p-4 overflow-x-auto min-h-screen">
      <h2 className="text-xl font-semibold mb-4 text-white">👥 All Users</h2>

      <table className="w-full min-w-[700px] text-sm text-left border-collapse">
        <thead>
          <tr className="bg-gray-800 text-gray-200 text-sm">
            <th className="py-2 px-3">#</th>
            <th className="py-2 px-3">Name</th>
            <th className="py-2 px-3">Email</th>
            <th className="py-2 px-3">Role</th>
            <th className="py-2 px-3 whitespace-nowrap">Created Date</th>
            <th className="py-2 px-3">Action</th>
          </tr>
        </thead>
        <tbody>
          {paginatedUsers.length === 0 ? (
            <tr>
              <td colSpan={6} className="text-center py-6 text-gray-500">
                No users found
              </td>
            </tr>
          ) : (
            paginatedUsers.map((user, index) => (
              <tr key={user.id} className="hover:bg-gray-700 transition duration-150">
                <td className="py-2 px-3">{(currentPage - 1) * USERS_PER_PAGE + index + 1}</td>
                <td className="py-2 px-3 capitalize">{user.name}</td>
                <td className="py-2 px-3 break-words">{user.email ?? ""}</td>
                <td className="py-2 px-3 uppercase font-semibold text-blue-400">{user.role}</td>
                <td className="py-2 px-3">{moment(user.createdAt).format("LL")}</td>
                <td className="py-2 px-3">
                  <button
                    className="p-2 rounded-full text-green-400 hover:bg-green-600 hover:text-white transition"
                    onClick={() => handleEditClick(user)}
                  >
                    <MdModeEdit size={18} />
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-6 flex justify-center items-center gap-2 flex-wrap">
          <button
            onClick={() => changePage(currentPage - 1)}
            disabled={currentPage === 1}
            className="px-3 py-1 border border-gray-600 rounded hover:bg-gray-700 disabled:opacity-50 text-gray-300"
          >
            Prev
          </button>
          {[...Array(totalPages)].map((_, idx) => (
            <button
              key={idx}
              onClick={() => changePage(idx + 1)}
              className={`px-3 py-1 border border-gray-600 rounded hover:bg-gray-700 ${
                currentPage === idx + 1 ? "bg-blue-600 text-white" : "text-gray-300"
              }`}
            >
              {idx + 1}
            </button>
          ))}
          <button
            onClick={() => changePage(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="px-3 py-1 border border-gray-600 rounded hover:bg-gray-700 disabled:opacity-50 text-gray-300"
          >
            Next
          </button>
        </div>
      )}

      {/* Inline Modal */}
      {openUpdateRole && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
          <div className="bg-gradient-to-b from-gray-900 via-gray-800 to-gray-700 rounded-lg shadow-lg w-full max-w-md p-6 text-gray-300">
            <h2 className="text-lg font-semibold mb-4 text-white">Change Role</h2>
            <p className="mb-2 text-sm text-gray-400">
              <strong>{updateUserDetails.name}</strong> <br />
              <span>{updateUserDetails.email}</span>
            </p>

            <label className="block text-sm font-medium text-gray-300 mb-1">Role</label>
            <select
              className="w-full border border-gray-600 rounded p-2 mb-4 bg-gray-800 text-gray-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              value={newRole}
              onChange={(e) => setNewRole(e.target.value as UserRole)}
            >
              {ROLES.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setOpenUpdateRole(false)}
                className="px-4 py-2 rounded border border-gray-600 hover:bg-gray-700"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveRole}
                disabled={loading}
                className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50"
              >
                {loading ? "Saving..." : "Save"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AllUsers;
