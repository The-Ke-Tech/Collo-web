'use client';

import React from "react";

export default function PageLayout({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-gray-900 to-gray-800 text-gray-200 py-12 px-4">
      <div className="max-w-4xl mx-auto bg-gray-900 rounded-lg shadow-lg p-8">
        <h1 className="text-3xl font-bold text-white mb-6">{title}</h1>
        <div className="space-y-6 text-gray-300">{children}</div>
      </div>
    </div>
  );
}
