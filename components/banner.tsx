"use client"

import React, { useEffect, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import Image from "next/image"

const leftBannerImages = [
  "/banners/11.jpeg",
  "/banners/22.jpeg",
  "/banners/33.jpeg",
  "/banners/44.jpeg",
  "/banners/55.jpeg",
]

const rightBannerImages = [
  "/banners/66.jpeg",
  "/banners/111.jpeg",
  "/banners/222.jpeg",
]

export default function BannerPage() {
  const [leftIndex, setLeftIndex] = useState(0)
  const [rightIndex, setRightIndex] = useState(0)
  const [flipDirection, setFlipDirection] = useState<"x" | "y">("y")

  // Auto change left banner every 6s
  useEffect(() => {
    const interval = setInterval(() => {
      setLeftIndex((prev) => (prev + 1) % leftBannerImages.length)
    }, 6000)
    return () => clearInterval(interval)
  }, [])

  // Auto flip right banner every 5s
  useEffect(() => {
    const interval = setInterval(() => {
      setFlipDirection(Math.random() > 0.5 ? "x" : "y")
      setRightIndex((prev) => (prev + 1) % rightBannerImages.length)
    }, 5000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full mt-6">
      {/* LEFT BANNER - Crossfade/Slide */}
      <div className="relative w-full h-72 rounded-2xl overflow-hidden shadow-lg bg-black">
        <AnimatePresence mode="wait">
          <motion.div
            key={leftIndex}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 1 }}
            className="absolute inset-0"
          >
            <Image
              src={leftBannerImages[leftIndex]}
              alt={`Banner ${leftIndex + 1}`}
              fill
              className="object-cover"
              priority
            />
          </motion.div>
        </AnimatePresence>
      </div>

      {/* RIGHT BANNER - 3D Flip with Shimmer */}
      <div className="relative w-full h-72 perspective-1000">
        <motion.div
          key={rightIndex}
          initial={
            flipDirection === "y"
              ? { rotateY: 90, opacity: 0 }
              : { rotateX: 90, opacity: 0 }
          }
          animate={
            flipDirection === "y"
              ? { rotateY: 0, opacity: 1 }
              : { rotateX: 0, opacity: 1 }
          }
          transition={{ duration: 1 }}
          className="absolute w-full h-full rounded-2xl overflow-hidden shadow-xl bg-gradient-to-br from-gray-800 to-gray-900"
        >
          {/* Shimmer Overlay */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer" />
          <Image
            src={rightBannerImages[rightIndex]}
            alt={`Right Banner ${rightIndex + 1}`}
            fill
            className="object-cover"
            priority
          />
        </motion.div>
      </div>

      <style jsx>{`
        .perspective-1000 {
          perspective: 1000px;
        }
        .animate-shimmer {
          background-size: 200% 100%;
          animation: shimmer 3s infinite linear;
        }
        @keyframes shimmer {
          0% {
            background-position: -200% 0;
          }
          100% {
            background-position: 200% 0;
          }
        }
      `}</style>
    </div>
  )
}
