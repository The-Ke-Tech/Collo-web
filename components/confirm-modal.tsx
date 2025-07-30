'use client';
import React from "react";

interface ConfirmModalProps {
  title?: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
}

const ConfirmModal: React.FC<ConfirmModalProps> = ({
  title = "Confirm Action",
  message,
  onConfirm,
  onCancel,
}) => {
  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex justify-center items-center z-50 animate-fadeIn">
      <div className="rounded-xl shadow-2xl w-full max-w-sm transform transition-all scale-95 hover:scale-100 
        bg-gradient-to-b from-black via-gray-900 to-gray-800 text-gray-300">
        
        {/* Header */}
        <div className="border-b border-gray-700 px-6 py-4">
          <h2 className="text-lg font-semibold text-white">{title}</h2>
        </div>

        {/* Body */}
        <div className="p-6">
          <p className="text-gray-300 mb-6">{message}</p>
          <div className="flex justify-end gap-3">
            <button
              onClick={onCancel}
              className="px-4 py-2 rounded-lg bg-gray-700 text-gray-300 font-medium hover:bg-gray-600 transition"
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-medium shadow-md transition"
            >
              Confirm
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;
