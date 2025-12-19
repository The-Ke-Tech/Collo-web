"use client";

import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";

type Banner = {
  id: string;
  imageUrl: string;
  position: "left" | "right";
  createdAt: string;
};

const API_URL = process.env.NEXT_PUBLIC_API_URL || "";

export default function ClientBanners() {
  const [leftBanners, setLeftBanners] = useState<Banner[]>([]);
  const [rightBanners, setRightBanners] = useState<Banner[]>([]);
  const [leftIndex, setLeftIndex] = useState(0);
  const [rightIndex, setRightIndex] = useState(0);
  const [flipDirection, setFlipDirection] = useState<"x" | "y">("y");

  useEffect(() => {
    const cachedLeft = localStorage.getItem("leftBanners");
    const cachedRight = localStorage.getItem("rightBanners");
    if (cachedLeft) setLeftBanners(JSON.parse(cachedLeft));
    if (cachedRight) setRightBanners(JSON.parse(cachedRight));
  }, []);

  const fetchBanners = async () => {
    try {
      const res = await fetch(`${API_URL}/api/banners`);
      const data = await res.json();
      if (data.success) {
        const left = data.data.filter((b: Banner) => b.position === "left");
        const right = data.data.filter((b: Banner) => b.position === "right");
        setLeftBanners(left);
        setRightBanners(right);
        localStorage.setItem("leftBanners", JSON.stringify(left));
        localStorage.setItem("rightBanners", JSON.stringify(right));
      }
    } catch {
      console.warn("⚠️ Offline mode: using cached banners");
    }
  };

  useEffect(() => {
    fetchBanners();
  }, []);

  useEffect(() => {
    if (!leftBanners.length) return;
    const interval = setInterval(() => {
      setLeftIndex((prev) => (prev + 1) % leftBanners.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [leftBanners]);

  useEffect(() => {
    if (!rightBanners.length) return;
    const interval = setInterval(() => {
      setFlipDirection(Math.random() > 0.5 ? "x" : "y");
      setRightIndex((prev) => (prev + 1) % rightBanners.length);
    }, 3000);
    return () => clearInterval(interval);
  }, [rightBanners]);

  return (
    <div className="w-full mt-4">
      <div className="grid grid-cols-2 gap-2 w-full">
        {/* LEFT BANNERS */}
        <div className="relative w-full h-32 rounded-xl overflow-hidden shadow-md bg-black">
          <AnimatePresence mode="wait">
            {leftBanners.length > 0 && (
              <motion.div
                key={leftIndex}
                initial={{ x: "-100%", opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: "100%", opacity: 0 }}
                transition={{ duration: 0.6 }}
                className="absolute w-full h-full"
              >
                <Image
                  src={leftBanners[leftIndex].imageUrl}
                  alt={`Left Banner ${leftIndex + 1}`}
                  fill
                  className="object-cover"
                  priority
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* RIGHT BANNERS */}
        <div className="relative w-full h-32 perspective-1000">
          <AnimatePresence mode="wait">
            {rightBanners.length > 0 && (
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
                exit={
                  flipDirection === "y"
                    ? { rotateY: -90, opacity: 0 }
                    : { rotateX: -90, opacity: 0 }
                }
                transition={{ duration: 0.6 }}
                className="absolute w-full h-full rounded-xl overflow-hidden shadow-md bg-gray-900"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer" />
                <Image
                  src={rightBanners[rightIndex].imageUrl}
                  alt={`Right Banner ${rightIndex + 1}`}
                  fill
                  className="object-cover"
                  priority
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
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
  );
}
