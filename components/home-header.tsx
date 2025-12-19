"use client";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const rotatingHeadings = [
  "COLLTECH & Services",
  "Phones • Computers • Office",
  "Stationery & Electronics",
  "Printing • Internet • Design"
];

export default function AnimatedHeading() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % rotatingHeadings.length);
    }, 4000); // change every 4 seconds
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="text-center my-3">
      <AnimatePresence mode="wait">
        <motion.h1
          key={index}
          className="text-3xl font-bold bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-500 bg-clip-text text-transparent"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -30 }}
          transition={{ duration: 0.7 }}
        >
          {rotatingHeadings[index]}
        </motion.h1>
      </AnimatePresence>
    </div>
  );
}
