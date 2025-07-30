"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function Unauthorized() {
  const router = useRouter();
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const duration = 5000; 
    const interval = 50; 
    let elapsed = 0;

    const timer = setInterval(() => {
      elapsed += interval;
      const newProgress = Math.min((elapsed / duration) * 100, 100);
      setProgress(newProgress);
      if (elapsed >= duration) {
        clearInterval(timer);
        router.push("/"); 
      }
    }, interval);

    return () => clearInterval(timer);
  }, [router]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen text-center px-4 bg-gradient-to-b from-black via-gray-900 to-gray-800 text-gray-200">
      <h1 className="text-4xl font-bold text-red-500">Access Denied</h1>
      <p className="mt-2 text-gray-400">
        You do not have permission to view this page.
      </p>
      <div className="w-full max-w-md mt-6">
        <div className="w-full h-3 bg-gray-700 rounded-full overflow-hidden shadow-inner">
          <div
            className="h-full bg-red-600 transition-all duration-50"
            style={{ width: `${progress}%` }}
          ></div>
        </div>
        <p className="text-sm text-gray-400 mt-2">
          Redirecting to homepage in{" "}
          {Math.ceil((5000 - (progress / 100) * 5000) / 1000)}s...
        </p>
      </div>
    </div>
  );
}
