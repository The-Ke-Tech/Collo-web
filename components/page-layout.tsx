'use client';

import React from "react";
import Link from "next/link";

export default function PageLayout({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="relative min-h-[calc(100dvh-var(--header-h,132px))] overflow-hidden bg-gradient-to-b from-black via-gray-900 to-gray-800 px-3 py-6 text-gray-200 sm:px-4 sm:py-10 md:py-12">
      {/* Ambient glows */}
      <div aria-hidden className="pointer-events-none absolute -top-24 left-[-10%] h-80 w-80 rounded-full bg-[#00C2D1]/15 blur-3xl" />
      <div aria-hidden className="pointer-events-none absolute bottom-0 right-[-10%] h-96 w-96 rounded-full bg-[#7B2CBF]/20 blur-3xl" />

      <div className="relative mx-auto w-full max-w-4xl">
        {/* Breadcrumb */}
        <nav aria-label="Breadcrumb" className="mb-3 flex items-center gap-2 px-1 text-xs text-gray-400 sm:mb-4 sm:text-sm">
          <Link href="/" className="transition hover:text-[#00C2D1]">Home</Link>
          <span aria-hidden>/</span>
          <span className="truncate text-gray-200">{title}</span>
        </nav>

        <div className="overflow-hidden rounded-2xl border border-white/10 bg-gray-900/80 shadow-2xl shadow-black/40 backdrop-blur">
          <div className="h-1.5 bg-gradient-to-r from-[#00C2D1] via-[#7B2CBF] to-[#FF3D9A]" />
          <div className="p-5 sm:p-8 md:p-10">
            <h1 className="mb-4 text-2xl font-bold tracking-tight text-white sm:mb-6 sm:text-3xl md:text-4xl">{title}</h1>
            <div className="space-y-5 text-sm leading-relaxed text-gray-300 sm:space-y-6 sm:text-base">{children}</div>
          </div>
        </div>
      </div>
    </div>
  );
}