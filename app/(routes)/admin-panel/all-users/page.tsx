"use client";

import React, { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import moment from 'moment';
import { MdModeEdit } from "react-icons/md";

type User = {
  id: string;
  name: string;
  email: string;
  role: string;
  createdAt: string;
};

const ROLES = ["admin", "general"];
const USERS_PER_PAGE = 10;

const AllUsers = () => {
  const [allUser, setAllUsers] = useState<User[]>([]);
  const [openUpdateRole, setOpenUpdateRole] = useState(false);
  const [updateUserDetails, setUpdateUserDetails] = useState<User>({
    email: "",
    name: "",
    role: "",
    id: "",
    createdAt: ""
  });
  const [newRole, setNewRole] = useState("");
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  const fetchAllUsers = async () => {
    try {
      const res = await fetch('/api/users', { method: 'GET', credentials: 'include' });
      const dataResponse = await res.json();

      if (dataResponse.success) {
        setAllUsers(dataResponse.data);
      } else {
        toast.error(dataResponse.message || "Failed to load users");
      }
    } catch (error) {
      toast.error("Error fetching users");
    }
  };

  useEffect(() => {
    fetchAllUsers();
  }, []);

  // Pagination
  const totalPages = Math.ceil(allUser.length / USERS_PER_PAGE);
  const paginatedUsers = allUser.slice(
    (currentPage - 1) * USERS_PER_PAGE,
    currentPage * USERS_PER_PAGE
  );

  const changePage = (page: number) => {
    if (page >= 1 && page <= totalPages) setCurrentPage(page);
  };

  // Handle save role
  const handleSaveRole = async () => {
    if (!newRole) return toast.error("Please select a role");
    setLoading(true);
    try {
      const res = await fetch(`/api/users/${updateUserDetails.id}/role`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: newRole }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success("Role updated successfully");
        fetchAllUsers();
        setOpenUpdateRole(false);
      } else {
        toast.error(data.message || "Failed to update role");
      }
    } catch (error) {
      toast.error("Error updating role");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-md shadow-md p-4 overflow-x-auto">
      <h2 className="text-xl font-semibold mb-4 text-gray-800">👥 All Users</h2>

      <table className="w-full min-w-[700px] text-sm text-left border-collapse">
        <thead>
          <tr className="bg-gray-900 text-white text-sm">
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
              <td colSpan={6} className="text-center py-6 text-gray-500">No users found</td>
            </tr>
          ) : (
            paginatedUsers.map((el, index) => (
              <tr key={el.id} className="hover:bg-gray-100 transition duration-150">
                <td className="py-2 px-3">{(currentPage - 1) * USERS_PER_PAGE + index + 1}</td>
                <td className="py-2 px-3 capitalize">{el?.name}</td>
                <td className="py-2 px-3 break-words">{el?.email}</td>
                <td className="py-2 px-3 uppercase font-semibold">{el?.role}</td>
                <td className="py-2 px-3">{moment(el?.createdAt).format('LL')}</td>
                <td className="py-2 px-3">
                  <button
                    className="p-2 rounded-full text-green-600 hover:bg-green-500 hover:text-white transition"
                    onClick={() => {
                      setUpdateUserDetails(el);
                      setNewRole(el.role);
                      setOpenUpdateRole(true);
                    }}
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
            className="px-3 py-1 border rounded hover:bg-gray-200 disabled:opacity-50"
          >
            Prev
          </button>
          {[...Array(totalPages)].map((_, idx) => (
            <button
              key={idx}
              onClick={() => changePage(idx + 1)}
              className={`px-3 py-1 border rounded hover:bg-gray-200 ${
                currentPage === idx + 1 ? 'bg-black text-white' : ''
              }`}
            >
              {idx + 1}
            </button>
          ))}
          <button
            onClick={() => changePage(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="px-3 py-1 border rounded hover:bg-gray-200 disabled:opacity-50"
          >
            Next
          </button>
        </div>
      )}

      {/* Inline Modal for Role Change */}
      {openUpdateRole && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-6">
            <h2 className="text-lg font-semibold mb-4">Change Role</h2>
            <p className="mb-2 text-sm text-gray-600">
              <strong>{updateUserDetails.name}</strong> <br /> <span>{updateUserDetails.email}</span>
            </p>

            <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
            <select
              className="w-full border rounded p-2 mb-4"
              value={newRole}
              onChange={(e) => setNewRole(e.target.value)}
            >
              {ROLES.map((r) => (
                <option key={r} value={r}>{r}</option>
              ))}
            </select>

            <div className="flex justify-end gap-3">
              <button onClick={() => setOpenUpdateRole(false)} className="px-4 py-2 rounded border hover:bg-gray-100">
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
