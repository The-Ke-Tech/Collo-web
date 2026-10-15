"use client"

import React, { useEffect, useMemo, useState } from "react"
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


/**
 * Quietly downloads the NEXT banner (same size/URL as the real one, so it is a cache hit)
 * while the current one is on screen. This removes the blank gap when slides change.
 */
function Preload({ src, sizes }: { src?: string; sizes: string }) {
  if (!src) return null;
  return (
    <div aria-hidden className="pointer-events-none absolute h-px w-px overflow-hidden opacity-0">
      <Image src={src} alt="" fill sizes={sizes} loading="eager" />
    </div>
  );
}

// Shows the whole image (never cropped) over a blurred copy of itself
function BannerImage({ src, alt, priority, sizes }: { src: string; alt: string; priority?: boolean; sizes: string }) {
  return (
    <>
      <Image src={src} alt="" aria-hidden fill sizes={sizes} className="scale-110 object-cover opacity-60 blur-xl" />
      <Image src={src} alt={alt} fill sizes={sizes} className="object-contain" priority={priority} />
    </>
  )
}

export default function BannerPage() {
  const [leftIndex, setLeftIndex] = useState(0)
  const [rightIndex, setRightIndex] = useState(0)
  const [flipDirection, setFlipDirection] = useState<"x" | "y">("y")
  const [mobileIndex, setMobileIndex] = useState(0)
  const [isDesktop, setIsDesktop] = useState<boolean | null>(null)

  // true from 768px (md) up
  useEffect(() => {
    const mq = window.matchMedia("(min-width: 768px)")
    const update = () => setIsDesktop(mq.matches)
    update()
    mq.addEventListener("change", update)
    return () => mq.removeEventListener("change", update)
  }, [])

  // Small screens: left + right merged into one list
  const mobileImages = useMemo(() => {
    const merged: string[] = []
    const n = Math.max(leftBannerImages.length, rightBannerImages.length)
    for (let i = 0; i < n; i++) {
      if (leftBannerImages[i]) merged.push(leftBannerImages[i])
      if (rightBannerImages[i]) merged.push(rightBannerImages[i])
    }
    return merged
  }, [])

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

  // Auto scroll the single mobile banner every 4s (restarts after a swipe)
  useEffect(() => {
    if (isDesktop !== false) return
    const t = setTimeout(() => setMobileIndex((p) => (p + 1) % mobileImages.length), 4000)
    return () => clearTimeout(t)
  }, [isDesktop, mobileIndex, mobileImages.length])

  const heights = "aspect-[16/9] lg:aspect-[2/1] 2xl:aspect-[5/2]"

  return (
    <div className="mx-auto mt-6 w-full max-w-[2000px]">
      {isDesktop === null && (
        <div className="aspect-[16/9] w-full animate-pulse rounded-xl bg-gradient-to-br from-gray-800 to-gray-900 md:aspect-[32/9]" />
      )}

      {/* 📱 SMALL SCREENS: one banner, auto scrolls, swipe to change */}
      {isDesktop === false && (
        <div className="relative aspect-[16/9] w-full overflow-hidden rounded-xl bg-gradient-to-br from-gray-800 to-gray-900 shadow-lg">
          <AnimatePresence initial={false}>
            <motion.div
              key={mobileIndex}
              initial={{ x: "100%" }}
              animate={{ x: "0%" }}
              exit={{ x: "-100%" }}
              transition={{ duration: 0.45, ease: "easeOut" }}
              drag="x"
              dragConstraints={{ left: 0, right: 0 }}
              dragElastic={0.25}
              onDragEnd={(_, info) => {
                if (info.offset.x < -50) setMobileIndex((p) => (p + 1) % mobileImages.length)
                else if (info.offset.x > 50) setMobileIndex((p) => (p - 1 + mobileImages.length) % mobileImages.length)
              }}
              className="absolute inset-0 touch-pan-y"
            >
              <BannerImage src={mobileImages[mobileIndex]} alt={`Banner ${mobileIndex + 1}`} priority={mobileIndex === 0} sizes="100vw" />
            </motion.div>
          </AnimatePresence>
          <Preload src={mobileImages[(mobileIndex + 1) % mobileImages.length]} sizes="100vw" />
          <div className="absolute bottom-1.5 left-1/2 z-10 flex -translate-x-1/2 gap-1" aria-hidden>
            {mobileImages.map((_, i) => (
              <span key={i} className={`h-1 rounded-full transition-all duration-300 ${i === mobileIndex ? "w-4 bg-white" : "w-1 bg-white/50"}`} />
            ))}
          </div>
        </div>
      )}

      {/* 🖥️ MD and up: left and right side by side, same animations as before */}
      {isDesktop === true && (
        <div className="grid w-full grid-cols-2 gap-4">
          {/* LEFT BANNER - Crossfade/Slide */}
          <div className={`relative w-full ${heights} overflow-hidden rounded-2xl bg-gradient-to-br from-gray-800 to-gray-900 shadow-lg`}>
            <AnimatePresence>
              <motion.div
                key={leftIndex}
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -50 }}
                transition={{ duration: 1 }}
                className="absolute inset-0"
              >
                <BannerImage src={leftBannerImages[leftIndex]} alt={`Banner ${leftIndex + 1}`} priority sizes="50vw" />
              </motion.div>
            </AnimatePresence>
            <Preload src={leftBannerImages[(leftIndex + 1) % leftBannerImages.length]} sizes="50vw" />
          </div>

          {/* RIGHT BANNER - 3D Flip with Shimmer */}
          <div className={`perspective-1000 relative w-full ${heights}`}>
            <motion.div
              key={rightIndex}
              initial={flipDirection === "y" ? { rotateY: 90, opacity: 0 } : { rotateX: 90, opacity: 0 }}
              animate={flipDirection === "y" ? { rotateY: 0, opacity: 1 } : { rotateX: 0, opacity: 1 }}
              transition={{ duration: 1 }}
              className="absolute h-full w-full overflow-hidden rounded-2xl bg-gradient-to-br from-gray-800 to-gray-900 shadow-xl"
            >
              {/* Shimmer Overlay */}
              <div className="animate-shimmer absolute inset-0 z-10 bg-gradient-to-r from-transparent via-white/20 to-transparent" />
              <BannerImage src={rightBannerImages[rightIndex]} alt={`Right Banner ${rightIndex + 1}`} priority sizes="50vw" />
            </motion.div>
          </div>
        </div>
      )}

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