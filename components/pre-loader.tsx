// components/Preloader.tsx
'use client';
import { motion } from 'framer-motion';
import Image from 'next/image';
import logo from '@/public/logo.png'; // <-- replace with your logo path

export default function Preloader() {
  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center bg-white dark:bg-gray-900 z-50">
      {/* Spinner with Logo in Center */}
      <div className="relative w-28 h-28 mb-6">
        {/* Static background ring */}
        <div className="absolute inset-0 border-4 border-gray-300 dark:border-gray-700 rounded-full"></div>
        {/* Rotating top ring */}
        <motion.div
          className="absolute inset-0 border-4 border-blue-600 rounded-full border-t-transparent"
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
        />
        {/* Static Logo in the center */}
        <div className="absolute inset-0 flex items-center justify-center">
          <Image
            src={logo}
            alt="Company Logo"
            width={60} // increased size
            height={70}
            className="object-cover rounded-full border-2 border-gray-200 shadow-md"
          />
        </div>
      </div>

      {/* Company Name */}
      <motion.h1
        className="text-2xl font-bold text-gray-800 dark:text-gray-100"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        Coltech
      </motion.h1>

      {/* Tagline / Loading Text */}
      <motion.p
        className="text-sm text-gray-500 dark:text-gray-400 mt-2"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
      >
        Loading, please wait...
      </motion.p>
    </div>
  );
}
