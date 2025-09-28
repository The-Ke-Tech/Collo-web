"use client"

import React, { useEffect, useState } from "react"
import Image from "next/image"

const CLOUDINARY_URL = "https://api.cloudinary.com/v1_1/dqtmsllzn/image/upload"
const UPLOAD_PRESET = "coltec"

type Banner = {
  id: string
  imageUrl: string
  position: "left" | "right"
  createdAt: string
}

// ✅ Upload image to Cloudinary
const uploadImage = async (file: File): Promise<string> => {
  const formData = new FormData()
  formData.append("file", file)
  formData.append("upload_preset", UPLOAD_PRESET)

  const res = await fetch(CLOUDINARY_URL, { method: "POST", body: formData })
  const data = await res.json()
  return data.secure_url
}

export default function BannerPage() {
  const [leftBanners, setLeftBanners] = useState<Banner[]>([])
  const [rightBanners, setRightBanners] = useState<Banner[]>([])
  const [loadingLeft, setLoadingLeft] = useState(false)
  const [loadingRight, setLoadingRight] = useState(false)

  // ✅ Fetch banners from DB
  const fetchBanners = async () => {
    try {
      const res = await fetch("/api/banners")
      const data = await res.json()
      if (data.success) {
        setLeftBanners(data.data.filter((b: Banner) => b.position === "left"))
        setRightBanners(data.data.filter((b: Banner) => b.position === "right"))
      }
    } catch (error) {
      console.error("🔥 Error fetching banners:", error)
    }
  }

  useEffect(() => {
    fetchBanners()
  }, [])

  // ✅ Upload + Save in DB
  const handleUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
    side: "left" | "right"
  ) => {
    if (!e.target.files?.length) return
    const file = e.target.files[0]

    if (side === "left") setLoadingLeft(true)
    if (side === "right") setLoadingRight(true)

    try {
      const url = await uploadImage(file)

      await fetch("/api/banners", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageUrl: url, position: side }),
      })

      fetchBanners()
    } catch (error) {
      console.error("🔥 Error uploading banner:", error)
    } finally {
      if (side === "left") setLoadingLeft(false)
      if (side === "right") setLoadingRight(false)
    }
  }

  // ✅ Delete banner
  const handleDelete = async (id: string) => {
    try {
      await fetch(`/api/banners/${id}`, { method: "DELETE" })
      fetchBanners()
    } catch (error) {
      console.error("🔥 Error deleting banner:", error)
    }
  }

  return (
    <div className="w-full mt-6 space-y-8">
      {/* LEFT BANNERS (Top Grid with Scroll) */}
      <div className="w-full h-80 overflow-y-auto rounded-2xl shadow-lg border p-4">
        <h2 className="text-lg font-semibold mb-3">Left Banners</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {/* Upload Box */}
          <label className="cursor-pointer flex items-center justify-center border-2 border-dashed border-gray-400 rounded-lg h-48 hover:bg-gray-100 transition">
            {loadingLeft ? (
              "Uploading..."
            ) : (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="48"
                height="48"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="text-gray-500"
              >
                <line x1="12" y1="5" x2="12" y2="19" />
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
            )}
            <input
              type="file"
              accept="image/*"
              hidden
              onChange={(e) => handleUpload(e, "left")}
            />
          </label>

          {leftBanners.map((banner) => (
            <div
              key={banner.id}
              className="relative w-full h-48 rounded-lg overflow-hidden shadow"
            >
              <Image
                src={banner.imageUrl}
                alt="Left Banner"
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
      </div>

      {/* RIGHT BANNERS (Bottom Grid with Scroll) */}
      <div className="w-full h-80 overflow-y-auto rounded-2xl shadow-lg border p-4">
        <h2 className="text-lg font-semibold mb-3">Right Banners</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {/* Upload Box */}
          <label className="cursor-pointer flex items-center justify-center border-2 border-dashed border-gray-400 rounded-lg h-48 hover:bg-gray-100 transition">
            {loadingRight ? (
              "Uploading..."
            ) : (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="48"
                height="48"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="text-gray-500"
              >
                <line x1="12" y1="5" x2="12" y2="19" />
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
            )}
            <input
              type="file"
              accept="image/*"
              hidden
              onChange={(e) => handleUpload(e, "right")}
            />
          </label>

          {rightBanners.map((banner) => (
            <div
              key={banner.id}
              className="relative w-full h-48 rounded-lg overflow-hidden shadow"
            >
              <Image
                src={banner.imageUrl}
                alt="Right Banner"
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
      </div>
    </div>
  )
}
