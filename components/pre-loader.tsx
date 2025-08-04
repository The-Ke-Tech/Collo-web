// components/Preloader.tsx
'use client';
import { motion } from 'framer-motion';
import Image from 'next/image';
import logo from '@/public/logo.png'; 

export default function Preloader() {
  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center bg-gradient-to-b from-[#00C2D1] via-[#4B3F72] to-[#7B2CBF] z-50">
      {/* Spinner with Logo in Center */}
      <div className="relative w-32 h-32 mb-6">
        {/* Static background ring */}
        <div className="absolute inset-0 border-4 border-white/20 rounded-full"></div>

        {/* Rotating top ring */}
        <motion.div
          className="absolute inset-0 border-4 border-t-transparent border-b-transparent border-white rounded-full"
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1.2, ease: "linear" }}
        />

        {/* Static Logo in the center */}
        <div className="absolute inset-0 flex items-center justify-center">
          <Image
            src={logo}
            alt="Company Logo"
            width={70}
            height={80}
            className="object-contain rounded-full border-2 border-white/40 shadow-lg bg-black"
          />
        </div>
      </div>

      {/* Company Name */}
      <motion.h1
        className="text-3xl font-extrabold text-white tracking-wide drop-shadow-md text-center justify-center items-center"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        Colltech, Your Trusted Hub For Smart Technology
      </motion.h1>

      {/* Tagline / Loading Text */}
      <motion.p
        className="text-sm text-white/80 mt-2"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
      >
        Loading, please wait...
      </motion.p>
    </div>
  );
}
