import React from 'react';

interface SectionHeadingProps {
  title: string;
  subtitle?: string;
}

// One subtle, glowing light that passes across the heading.
const HEADING_CSS = `
@keyframes sh-light-pass {
  0% {
    transform: translateX(-130%) skewX(-18deg);
    opacity: 0;
  }

  15% {
    opacity: 0.65;
  }

  50% {
    opacity: 0.85;
  }

  85% {
    opacity: 0.55;
  }

  100% {
    transform: translateX(430%) skewX(-18deg);
    opacity: 0;
  }
}

.sh-line {
  position: absolute;
  top: 0;
  bottom: 0;
  left: 0;
  width: 35%;
  pointer-events: none;
  background: linear-gradient(
    90deg,
    transparent 0%,
    rgba(0, 194, 209, 0.04) 20%,
    rgba(0, 194, 209, 0.20) 38%,
    rgba(255, 255, 255, 0.72) 50%,
    rgba(58, 134, 255, 0.20) 62%,
    rgba(255, 61, 154, 0.05) 80%,
    transparent 100%
  );
  filter:
    drop-shadow(0 0 4px rgba(0, 194, 209, 0.35))
    drop-shadow(0 0 8px rgba(58, 134, 255, 0.18));
  animation: sh-light-pass 7s ease-in-out infinite;
  will-change: transform, opacity;
}

@media (prefers-reduced-motion: reduce) {
  .sh-line {
    animation: none;
    opacity: 0;
  }
}
`;

/** Shared heading for every homepage section. */
export default function SectionHeading({
  title,
  subtitle,
}: SectionHeadingProps) {
  return (
    // Modern store-style section bar: brand-coloured left edge, readable type on every screen size
    <div className="relative mx-1 mt-2 mb-1 overflow-hidden rounded-lg border border-white/10 border-l-4 border-l-[#00C2D1] bg-gradient-to-r from-white/[0.03] via-white/[0.08] to-white/[0.03] px-3 py-2 text-left sm:mx-2 sm:mt-3 sm:mb-1.5 sm:px-4 sm:py-2.5 md:mx-3 md:mt-4 md:px-5">
      <style>{HEADING_CSS}</style>

      {/* One passing faded glowing line */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 overflow-hidden"
      >
        <span className="sh-line" />
      </div>

      <div className="relative z-10">
        <h2 className="text-sm font-bold tracking-wide text-white sm:text-base md:text-lg lg:text-xl xl:text-2xl">
          {title}
        </h2>

        {subtitle && (
          <p className="mt-0.5 max-w-xl text-[11px] text-gray-400 sm:text-xs md:text-sm">
            {subtitle}
          </p>
        )}

        {/* Original accent line */}
        <span className="mt-1.5 block h-0.5 w-8 rounded-full bg-gradient-to-r from-[#00C2D1] via-[#3A86FF] to-[#FF3D9A] sm:w-12 md:h-1 md:w-16" />
      </div>
    </div>
  );
}