"use client";

import React, { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";

type Banner = {
  id: string;
  imageUrl: string;
  position: "left" | "right";
  createdAt: string;
};

const API_URL = process.env.NEXT_PUBLIC_API_URL || "";

function Dots({ count, active }: { count: number; active: number }) {
  if (count < 2) return null;
  return (
    <div className="absolute bottom-1 left-1/2 z-10 flex -translate-x-1/2 gap-1 sm:bottom-1.5" aria-hidden>
      {Array.from({ length: count }).map((_, i) => (
        <span
          key={i}
          className={`h-1 rounded-full transition-all duration-300 ${
            i === active ? "w-3 bg-white sm:w-4" : "w-1 bg-white/50"
          }`}
        />
      ))}
    </div>
  );
}

/**
 * Shows the whole banner (object-contain) so nothing is ever cropped, and fills any
 * leftover space with a blurred copy of the same image so it still looks full-bleed.
 */
function BannerImage({
  src,
  alt,
  priority,
  sizes,
}: {
  src: string;
  alt: string;
  priority?: boolean;
  sizes: string;
}) {
  return (
    <>
      <Image
        src={src}
        alt=""
        aria-hidden
        fill
        sizes={sizes}
        className="scale-110 object-cover opacity-60 blur-xl"
      />
      <Image src={src} alt={alt} fill sizes={sizes} className="object-contain" priority={priority} />
    </>
  );
}


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

// true from 768px (Tailwind "md") up; null until we know, so we never mount the wrong layout
function useIsDesktop() {
  const [isDesktop, setIsDesktop] = useState<boolean | null>(null);
  useEffect(() => {
    const mq = window.matchMedia("(min-width: 768px)");
    const update = () => setIsDesktop(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);
  return isDesktop;
}

export default function ClientBanners() {
  const [leftBanners, setLeftBanners] = useState<Banner[]>([]);
  const [rightBanners, setRightBanners] = useState<Banner[]>([]);
  const [leftIndex, setLeftIndex] = useState(0);
  const [rightIndex, setRightIndex] = useState(0);
  const [flipDirection, setFlipDirection] = useState<"x" | "y">("y");
  const [mobileIndex, setMobileIndex] = useState(0);
  const [slideDir, setSlideDir] = useState<1 | -1>(1);
  const isDesktop = useIsDesktop();

  useEffect(() => {
    try {
      const cachedLeft = localStorage.getItem("leftBanners");
      const cachedRight = localStorage.getItem("rightBanners");
      if (cachedLeft) setLeftBanners(JSON.parse(cachedLeft));
      if (cachedRight) setRightBanners(JSON.parse(cachedRight));
    } catch {
      // ignore corrupted cache, fresh data is fetched below
    }
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

  // 📱 Small screens: left + right banners are merged into ONE list (left, right, left, right...)
  const mobileBanners = useMemo(() => {
    const merged: Banner[] = [];
    const n = Math.max(leftBanners.length, rightBanners.length);
    for (let i = 0; i < n; i++) {
      if (leftBanners[i]) merged.push(leftBanners[i]);
      if (rightBanners[i]) merged.push(rightBanners[i]);
    }
    return merged;
  }, [leftBanners, rightBanners]);

  const mobileCount = mobileBanners.length;
  const activeMobile = mobileCount ? mobileIndex % mobileCount : 0;

  const goNext = () => {
    setSlideDir(1);
    setMobileIndex((prev) => (prev + 1) % Math.max(mobileCount, 1));
  };
  const goPrev = () => {
    setSlideDir(-1);
    setMobileIndex((prev) => (prev - 1 + Math.max(mobileCount, 1)) % Math.max(mobileCount, 1));
  };

  // Auto-scroll the single mobile banner (timer restarts after a swipe, so it never jumps right after you swipe)
  useEffect(() => {
    if (isDesktop !== false || mobileCount < 2) return;
    const t = setTimeout(goNext, 4000);
    return () => clearTimeout(t);
  }, [isDesktop, mobileCount, activeMobile]);

  // 📐 Aspect ratios instead of fixed heights: the box grows with its width, so the banner
  // keeps its shape on every screen (and is never cut off).
  const heights = "aspect-[16/9] lg:aspect-[2/1] 2xl:aspect-[5/2]";

  return (
    <div className="mx-auto w-full max-w-[2000px] px-1">
      {/* ⏳ Placeholder until we know the screen size (avoids a layout jump) */}
      {isDesktop === null && (
        <div className="aspect-[16/9] w-full animate-pulse rounded-xl bg-gradient-to-br from-gray-800 to-gray-900 md:aspect-[32/9]" />
      )}

      {/* 📱 SMALL SCREENS: one banner at a time, auto-scrolls, swipe left/right to change */}
      {isDesktop === false && (
        <div className="relative aspect-[16/9] w-full overflow-hidden rounded-xl bg-gradient-to-br from-gray-800 to-gray-900 shadow-sm ring-1 ring-white/5">
          {mobileCount === 0 && (
            <div className="absolute inset-0 animate-pulse bg-gradient-to-br from-gray-800 to-gray-900" />
          )}
          <AnimatePresence initial={false} custom={slideDir}>
            {mobileCount > 0 && (
              <motion.div
                key={mobileBanners[activeMobile].id + "-" + activeMobile}
                custom={slideDir}
                variants={{
                  enter: (d: number) => ({ x: d * 100 + "%" }),
                  center: { x: "0%" },
                  exit: (d: number) => ({ x: d * -100 + "%" }),
                }}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.45, ease: "easeOut" }}
                drag="x"
                dragConstraints={{ left: 0, right: 0 }}
                dragElastic={0.25}
                onDragEnd={(_, info) => {
                  if (info.offset.x < -50) goNext();
                  else if (info.offset.x > 50) goPrev();
                }}
                className="absolute h-full w-full touch-pan-y"
              >
                <BannerImage
                  src={mobileBanners[activeMobile].imageUrl}
                  alt={`Banner ${activeMobile + 1}`}
                  priority={activeMobile === 0}
                  sizes="100vw"
                />
              </motion.div>
            )}
          </AnimatePresence>
          {mobileCount > 1 && (
            <Preload src={mobileBanners[(activeMobile + 1) % mobileCount].imageUrl} sizes="100vw" />
          )}
          <div aria-hidden className="pointer-events-none absolute inset-x-0 bottom-0 h-1/5 bg-gradient-to-t from-black/30 to-transparent" />
          <Dots count={mobileCount} active={activeMobile} />
        </div>
      )}

      {/* 🖥️ TABLETS / LAPTOPS / DESKTOPS: left and right banners side by side (unchanged behaviour) */}
      {isDesktop === true && (
        <div className="grid w-full grid-cols-2 gap-3">
          {/* LEFT BANNERS */}
          <div className={`relative w-full ${heights} overflow-hidden rounded-lg bg-gradient-to-br from-gray-800 to-gray-900 shadow-sm ring-1 ring-white/5`}>
            {leftBanners.length === 0 && (
              <div className="absolute inset-0 animate-pulse bg-gradient-to-br from-gray-800 to-gray-900" />
            )}
            <AnimatePresence>
              {leftBanners.length > 0 && (
                <motion.div
                  key={leftIndex}
                  initial={{ x: "-100%", opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  exit={{ x: "100%", opacity: 0 }}
                  transition={{ duration: 0.6 }}
                  className="absolute h-full w-full"
                >
                  <BannerImage
                    src={leftBanners[leftIndex].imageUrl}
                    alt={`Left Banner ${leftIndex + 1}`}
                    priority={leftIndex === 0}
                    sizes="50vw"
                  />
                </motion.div>
              )}
            </AnimatePresence>
            {leftBanners.length > 1 && (
              <Preload src={leftBanners[(leftIndex + 1) % leftBanners.length].imageUrl} sizes="50vw" />
            )}
            <div aria-hidden className="pointer-events-none absolute inset-x-0 bottom-0 h-1/5 bg-gradient-to-t from-black/30 to-transparent" />
            <Dots count={leftBanners.length} active={leftIndex} />
          </div>

          {/* RIGHT BANNERS */}
          <div className={`perspective-1000 relative w-full ${heights}`}>
            {rightBanners.length === 0 && (
              <div className="absolute inset-0 animate-pulse rounded-lg bg-gradient-to-br from-gray-800 to-gray-900" />
            )}
            <AnimatePresence>
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
                  className="absolute h-full w-full overflow-hidden rounded-lg bg-gray-900 shadow-sm ring-1 ring-white/5"
                >
                  <div className="animate-shimmer absolute inset-0 z-10 bg-gradient-to-r from-transparent via-white/10 to-transparent" />
                  <BannerImage
                    src={rightBanners[rightIndex].imageUrl}
                    alt={`Right Banner ${rightIndex + 1}`}
                    priority={rightIndex === 0}
                    sizes="50vw"
                  />
                  <div aria-hidden className="pointer-events-none absolute inset-x-0 bottom-0 h-1/5 bg-gradient-to-t from-black/30 to-transparent" />
                  <Dots count={rightBanners.length} active={rightIndex} />
                </motion.div>
              )}
            </AnimatePresence>
            {rightBanners.length > 1 && (
              <Preload src={rightBanners[(rightIndex + 1) % rightBanners.length].imageUrl} sizes="50vw" />
            )}
          </div>
        </div>
      )}

      <style jsx>{`
        .perspective-1000 { perspective: 1000px; }
        .animate-shimmer {
          background-size: 200% 100%;
          animation: shimmer 3s infinite linear;
        }
        @keyframes shimmer {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
        @media (prefers-reduced-motion: reduce) {
          .animate-shimmer { animation: none; }
        }
      `}</style>
    </div>
  );
}