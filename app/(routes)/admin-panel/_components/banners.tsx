"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import { useAuthStore } from "@/store/auth-store";

/* =======================
   Constants
======================= */

const CLOUDINARY_URL =
  "https://api.cloudinary.com/v1_1/dqtmsllzn/image/upload";
const UPLOAD_PRESET = "coltec";
const API_URL = process.env.NEXT_PUBLIC_API_URL;

/* =======================
   Types
======================= */

type Banner = {
  id: string;
  imageUrl: string;
  position: "left" | "right";
  createdAt: string;
};

/* =======================
   Cloudinary Upload
======================= */

const uploadImage = async (file: File): Promise<string> => {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", UPLOAD_PRESET);

  const res = await fetch(CLOUDINARY_URL, {
    method: "POST",
    body: formData,
  });

  if (!res.ok) {
    throw new Error("Cloudinary upload failed");
  }

  const data = await res.json();
  return data.secure_url;
};

/* =======================
   Component
======================= */

export default function BannerPage() {
  const [leftBanners, setLeftBanners] = useState<Banner[]>([]);
  const [rightBanners, setRightBanners] = useState<Banner[]>([]);
  const [loadingLeft, setLoadingLeft] = useState(false);
  const [loadingRight, setLoadingRight] = useState(false);

  const fetchWithAuth = useAuthStore((s) => s.fetchWithAuth);
  const isAdmin = useAuthStore((s) => s.isAdmin());

  /* ---------- Fetch banners ---------- */

  const fetchBanners = async () => {
    try {
      const res = await fetch(`${API_URL}/api/banners`);
      const data = await res.json();

      if (data?.success) {
        setLeftBanners(data.data.filter((b: Banner) => b.position === "left"));
        setRightBanners(data.data.filter((b: Banner) => b.position === "right"));
      }
    } catch (err) {
      console.error("🔥 Failed to fetch banners:", err);
    }
  };

  useEffect(() => {
    fetchBanners();
  }, []);

  /* ---------- Upload ---------- */

  const handleUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
    side: "left" | "right"
  ) => {
    if (!e.target.files?.length) return;

    side === "left" ? setLoadingLeft(true) : setLoadingRight(true);

    try {
      const imageUrl = await uploadImage(e.target.files[0]);

      await fetchWithAuth(`${API_URL}/api/banners`, {
        method: "POST",
        body: JSON.stringify({
          imageUrl,
          position: side,
        }),
      });

      await fetchBanners();
    } catch (err) {
      console.error("🔥 Upload failed:", err);
    } finally {
      side === "left" ? setLoadingLeft(false) : setLoadingRight(false);
    }
  };

  /* ---------- Delete ---------- */

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this banner?")) return;

    try {
      await fetchWithAuth(`${API_URL}/api/banners/${id}`, {
        method: "DELETE",
      });

      await fetchBanners();
    } catch (err) {
      console.error("🔥 Delete failed:", err);
    }
  };

  /* ---------- Guard ---------- */

  if (!isAdmin) {
    return (
      <div className="p-6 text-red-500 font-semibold">
        Unauthorized — Admin access only
      </div>
    );
  }

  /* =======================
     UI
  ======================= */

  return (
    <div className="w-full mt-6 space-y-10">
      {/* LEFT BANNERS */}
      <section className="rounded-2xl border p-4 shadow">
        <h2 className="text-lg font-semibold mb-4">Left Banners</h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {/* Upload */}
          <label className="cursor-pointer flex items-center justify-center border-2 border-dashed border-gray-400 rounded-lg h-48 hover:bg-gray-100 transition">
            {loadingLeft ? "Uploading..." : "+"}
            <input
              type="file"
              accept="image/*"
              hidden
              onChange={(e) => handleUpload(e, "left")}
            />
          </label>

          {/* Existing */}
          {leftBanners.map((banner) => (
            <div
              key={banner.id}
              className="relative w-full h-48 rounded-lg overflow-hidden shadow"
            >
              <Image
                src={banner.imageUrl}
                alt="Left banner"
                fill
                className="object-cover"
              />
              <button
                onClick={() => handleDelete(banner.id)}
                className="absolute top-2 right-2 bg-red-600 text-white px-2 py-1 rounded"
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* RIGHT BANNERS */}
      <section className="rounded-2xl border p-4 shadow">
        <h2 className="text-lg font-semibold mb-4">Right Banners</h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {/* Upload */}
          <label className="cursor-pointer flex items-center justify-center border-2 border-dashed border-gray-400 rounded-lg h-48 hover:bg-gray-100 transition">
            {loadingRight ? "Uploading..." : "+"}
            <input
              type="file"
              accept="image/*"
              hidden
              onChange={(e) => handleUpload(e, "right")}
            />
          </label>

          {/* Existing */}
          {rightBanners.map((banner) => (
            <div
              key={banner.id}
              className="relative w-full h-48 rounded-lg overflow-hidden shadow"
            >
              <Image
                src={banner.imageUrl}
                alt="Right banner"
                fill
                className="object-cover"
              />
              <button
                onClick={() => handleDelete(banner.id)}
                className="absolute top-2 right-2 bg-red-600 text-white px-2 py-1 rounded"
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
