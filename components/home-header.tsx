"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";

const rotatingHeadings = [
  "COLLTECH & Services",
  "Phones • Computers • Office",
  "Stationery & Electronics",
  "Printing • Internet • Design",
  "Photocopying • Printing • Branding",
  "PS5 FIFA Gaming Lounge"
];

export default function AnimatedHeading() {
  const [index, setIndex] = useState(0);
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % rotatingHeadings.length);
    }, 4000); // change every 4 seconds
    return () => clearInterval(timer);
  }, []);

  return (
    // 📐 Reduced margins and vertical padding from py-8/py-12 to py-5/py-8
    <div className="relative my-2 overflow-hidden rounded-3xl border border-white/10 px-4 py-5 text-center md:py-8">
      {/* Colour glows behind the headline - scaled down dimensions to match new tight height */}
      <div aria-hidden className="pointer-events-none absolute -left-20 -top-20 h-48 w-48 rounded-full bg-[#00C2D1]/25 blur-3xl" />
      <div aria-hidden className="pointer-events-none absolute -bottom-24 -right-16 h-56 w-56 rounded-full bg-[#7B2CBF]/30 blur-3xl" />
      <div aria-hidden className="pointer-events-none absolute left-1/2 top-0 h-36 w-36 -translate-x-1/2 rounded-full bg-[#FF3D9A]/15 blur-3xl" />

      <div className="relative">
        {/*
          Rotating headline (the page's real <h1> lives in page.tsx for SEO).
          All headings are stacked in ONE grid cell, so the box is always as tall as the
          longest heading (even when it wraps to 2 lines on a phone). Only opacity changes,
          so nothing below ever jumps up or down.
        */}
        <div className="grid place-items-center">
          {rotatingHeadings.map((text, i) => {
            const active = i === index;
            return (
              <motion.p
                key={text}
                aria-hidden={!active}
                // 📐 Reduced text scales slightly for a more compact structural appearance
                className="col-start-1 row-start-1 w-full text-balance bg-gradient-to-r from-cyan-400 via-blue-400 via-60% to-pink-400 bg-clip-text pb-1 text-xl font-extrabold leading-tight tracking-tight text-transparent sm:text-3xl md:text-4xl"
                initial={false}
                animate={{ opacity: active ? 1 : 0, y: active || reduceMotion ? 0 : 12 }}
                transition={{ duration: 0.6 }}
              >
                {text}
              </motion.p>
            );
          })}
        </div>

        {/* 📐 Reduced margin top from mt-3 to mt-2, text font size from text-sm to text-xs on small screens */}
        <p className="mx-auto mt-2 max-w-xl text-xs text-gray-300 sm:text-sm md:text-base">
          Gadgets, office supplies, printing and branding, and a PS5 gaming lounge, all under one roof.
        </p>

        {/* Quick actions - 📱 Changed to flex-row flex-nowrap to guarantee horizontal layout on mobile */}
        <div className="mt-4 flex flex-row flex-nowrap items-center justify-center gap-2 overflow-x-auto px-1 pb-1">
          <Link
            href="/#cyber-services"
            // 📐 Scaled down padding slightly (px-4 py-2 instead of px-5 py-2.5) to optimize tight rows
            className="whitespace-nowrap rounded-full bg-gradient-to-r from-[#00C2D1] to-[#7B2CBF] px-4 py-2 text-xs font-semibold text-white shadow-lg shadow-[#7B2CBF]/30 transition hover:scale-105 sm:text-sm"
          >
            Print & cyber services
          </Link>
          <Link
            href="/#gaming-zone"
            className="whitespace-nowrap rounded-full bg-gradient-to-r from-[#FF3D9A] to-[#7B2CBF] px-4 py-2 text-xs font-semibold text-white shadow-lg shadow-[#FF3D9A]/30 transition hover:scale-105 sm:text-sm"
          >
            Play FIFA on PS5
          </Link>
        </div>

        {/* Progress dots - 📐 Reduced spacing margins from mt-6 to mt-4 */}
        <div className="mt-4 flex justify-center gap-2" role="tablist" aria-label="Headline">
          {rotatingHeadings.map((text, i) => (
            <button
              key={text}
              type="button"
              role="tab"
              aria-selected={i === index}
              aria-label={text}
              onClick={() => setIndex(i)}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                i === index ? "w-5 bg-gradient-to-r from-[#00C2D1] to-[#FF3D9A]" : "w-1.5 bg-white/30 hover:bg-white/50"
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
