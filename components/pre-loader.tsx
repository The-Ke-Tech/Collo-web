// components/Preloader.tsx
'use client';
import { motion } from 'framer-motion';

export default function Preloader() {
  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center bg-white dark:bg-gray-900 z-50">
      {/* Spinner */}
      <div className="relative w-20 h-20 mb-6">
        <div className="absolute inset-0 border-4 border-gray-300 dark:border-gray-700 rounded-full"></div>
        <motion.div
          className="absolute inset-0 border-4 border-blue-600 rounded-full border-t-transparent"
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
        />
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
