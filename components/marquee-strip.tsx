import React from 'react';

const ITEMS = [
  'Photocopying',
  'Printing',
  'Branding',
  'PS5 FIFA Lounge',
  'Phone Accessories',
  'Routers & Internet',
  'Stationery',
  'Electronics',
];

/** Slim auto-scrolling ribbon that announces everything COLLTECH offers. */
export default function MarqueeStrip() {
  const row = (hidden?: boolean) =>
    ITEMS.map((item) => (
      <span
        key={`${item}-${hidden ? 'b' : 'a'}`}
        aria-hidden={hidden || undefined}
        className="flex items-center gap-2 whitespace-nowrap text-[10px] font-semibold text-white/90 sm:gap-3 sm:text-xs md:text-sm"
      >
        {item}
        <span className="h-1 w-1 rounded-full bg-gradient-to-r from-[#00C2D1] to-[#FF3D9A] sm:h-1.5 sm:w-1.5" />
      </span>
    ));

  return (
    <div
      className="marquee-viewport mt-2 border-y border-white/10 bg-gradient-to-r from-[#00C2D1]/20 via-[#7B2CBF]/30 to-[#FF3D9A]/20 py-1.5 sm:mt-3 sm:py-2"
      role="marquee"
      aria-label="What COLLTECH offers"
    >
      <div className="marquee-track" style={{ '--marquee-duration': '35s', '--marquee-gap': '0.75rem' } as React.CSSProperties}>
        {row()}
        {row(true)}
      </div>
    </div>
  );
}