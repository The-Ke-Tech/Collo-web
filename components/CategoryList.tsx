'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { FaPrint, FaPlaystation, FaAngleLeft, FaAngleRight } from 'react-icons/fa6';

interface CategoryItem {
  category: string;
  image: string[];
  type: "product" | "service";
}

const API_URL = process.env.NEXT_PUBLIC_API_URL;

// Pinned shortcuts to the new homepage sections
const FEATURED = [
  { label: 'Print & Cyber', href: '/#cyber-services', icon: FaPrint, from: '#FF3D9A', to: '#7B2CBF', iconSize: 'text-3xl md:text-4xl' },
  { label: 'Gaming', href: '/#gaming-zone', icon: FaPlaystation, from: '#3DFFA2', to: '#00C2D1', iconSize: 'text-3xl md:text-4xl' },
];

// Self-contained effects (no dependency on globals.css)
const CATEGORY_CSS = `
@keyframes cat-pan {
  0%   { background-position: 0% 50%; }
  50%  { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
}
@keyframes cat-bounce {
  0%, 100% { transform: translateY(0) scale(1, 1); }
  35%      { transform: translateY(-11px) scale(.97, 1.04); }
  60%      { transform: translateY(0) scale(1.05, .95); }
  75%      { transform: translateY(-3px) scale(1, 1); }
}
@keyframes cat-float {
  0%, 100% { transform: translateY(0) rotate(-4deg); }
  50%      { transform: translateY(-9px) rotate(4deg); }
}
@keyframes cat-spin { to { transform: rotate(360deg); } }
@keyframes cat-hue  { to { filter: hue-rotate(360deg); } }
@keyframes cat-wiggle {
  0%, 100% { transform: rotate(0); }
  20% { transform: rotate(-12deg) scale(1.08); }
  40% { transform: rotate(10deg) scale(1.08); }
  60% { transform: rotate(-8deg) scale(1.08); }
  80% { transform: rotate(6deg) scale(1.08); }
}
@keyframes cat-label {
  0%, 100% { color: #0e7490; }
  33%      { color: #7B2CBF; }
  66%      { color: #be185d; }
}
@keyframes cat-blob-a {
  0%, 100% { transform: translate(0, 0) scale(1); }
  50%      { transform: translate(60px, 30px) scale(1.25); }
}
@keyframes cat-blob-b {
  0%, 100% { transform: translate(0, 0) scale(1.1); }
  50%      { transform: translate(-70px, -20px) scale(.9); }
}
@keyframes cat-blob-c {
  0%, 100% { transform: translate(0, 0) scale(1); }
  50%      { transform: translate(-40px, 35px) scale(1.3); }
}
@keyframes cat-twinkle {
  0%, 100% { transform: scale(0) rotate(0deg); opacity: 0; }
  50%      { transform: scale(1) rotate(90deg); opacity: 1; }
}
@keyframes cat-pulse {
  0%, 100% { transform: scale(1); }
  50%      { transform: scale(1.12); }
}

.cat-panel {
  background: linear-gradient(120deg, #ffffff, #e0f7fa, #f3e8ff, #ffe4f1, #fff4d6, #ffffff);
  background-size: 300% 300%;
  animation: cat-pan 16s ease infinite;
}
.cat-blob { position: absolute; border-radius: 9999px; filter: blur(48px); pointer-events: none; }
.cat-blob-a { background: rgba(0,194,209,.40);  animation: cat-blob-a 11s ease-in-out infinite; }
.cat-blob-b { background: rgba(123,44,191,.28); animation: cat-blob-b 13s ease-in-out infinite; }
.cat-blob-c { background: rgba(255,61,154,.28); animation: cat-blob-c 15s ease-in-out infinite; }
.cat-blob-d { background: rgba(255,176,32,.30); animation: cat-blob-a 17s ease-in-out infinite reverse; }

.cat-title {
  background: linear-gradient(90deg, #0e7490, #7B2CBF, #be185d, #d97706, #0e7490);
  background-size: 300% 100%;
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
  animation: cat-pan 8s linear infinite;
}
.cat-bar { background: linear-gradient(to bottom, #00C2D1, #FF3D9A); animation: cat-hue 6s linear infinite; }

.cat-b1 { animation: cat-bounce 2.4s ease-in-out infinite; }
.cat-b2 { animation: cat-float 3.2s ease-in-out infinite; }
.cat-b3 { animation: cat-bounce 2.9s ease-in-out infinite; }

.cat-ring {
  background: conic-gradient(from 0deg, #00C2D1, #3A86FF, #7B2CBF, #FF3D9A, #FFB020, #00C2D1);
  box-shadow: 0 0 14px rgba(123,44,191,.35);
  animation: cat-spin 6s linear infinite, cat-hue 8s linear infinite;
}
.cat-item:hover .cat-inner { animation: cat-wiggle .7s ease-in-out; }
.cat-label { animation: cat-label 6s ease-in-out infinite; }
.cat-icon  { animation: cat-float 2.6s ease-in-out infinite; }
.cat-glow  { animation: cat-pan 5s ease infinite, cat-pulse 2.4s ease-in-out infinite; background-size: 250% 250%; }
.cat-new   { animation: cat-pulse 1.6s ease-in-out infinite; }

.cat-star {
  position: absolute;
  pointer-events: none;
  clip-path: polygon(50% 0, 62% 38%, 100% 50%, 62% 62%, 50% 100%, 38% 62%, 0 50%, 38% 38%);
  animation: cat-twinkle 2.4s ease-in-out infinite;
}

@keyframes cat-nudge {
  0%, 100% { transform: translateX(0); }
  50%      { transform: translateX(6px); }
}
@keyframes cat-ping {
  0%   { box-shadow: 0 0 0 0 rgba(123,44,191,.55); }
  100% { box-shadow: 0 0 0 14px rgba(123,44,191,0); }
}
@keyframes cat-burst-spin { to { transform: rotate(360deg); } }
@keyframes cat-glow-1 {
  0%, 100% { filter: drop-shadow(0 0 4px #FF3D9A) drop-shadow(0 0 10px #FF3D9A); }
  33%      { filter: drop-shadow(0 0 5px #FFB020) drop-shadow(0 0 13px #FFB020); }
  66%      { filter: drop-shadow(0 0 5px #7B2CBF) drop-shadow(0 0 13px #7B2CBF); }
}
@keyframes cat-glow-2 {
  0%, 100% { filter: drop-shadow(0 0 4px #3DFFA2) drop-shadow(0 0 10px #3DFFA2); }
  33%      { filter: drop-shadow(0 0 5px #00C2D1) drop-shadow(0 0 13px #00C2D1); }
  66%      { filter: drop-shadow(0 0 5px #3A86FF) drop-shadow(0 0 13px #3A86FF); }
}

/* "New" starburst badge: star spins and glows behind steady text */
.cat-newbadge {
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  height: 2.75rem;
  width: 2.75rem;
  margin-top: -2px;
}
.cat-newbadge-1 { animation: cat-glow-1 3s linear infinite; }
.cat-newbadge-2 { animation: cat-glow-2 3s linear infinite; }
.cat-burst {
  position: absolute;
  inset: 0;
  clip-path: polygon(50.0% 0.0%, 60.1% 12.3%, 75.0% 6.7%, 77.6% 22.4%, 93.3% 25.0%, 87.7% 39.9%, 100.0% 50.0%, 87.7% 60.1%, 93.3% 75.0%, 77.6% 77.6%, 75.0% 93.3%, 60.1% 87.7%, 50.0% 100.0%, 39.9% 87.7%, 25.0% 93.3%, 22.4% 77.6%, 6.7% 75.0%, 12.3% 60.1%, 0.0% 50.0%, 12.3% 39.9%, 6.7% 25.0%, 22.4% 22.4%, 25.0% 6.7%, 39.9% 12.3%);
  background-size: 300% 300%;
}
.cat-burst-1 {
  background-image: linear-gradient(135deg, #FF3D9A, #FFB020, #7B2CBF, #FF3D9A);
  animation: cat-burst-spin 7s linear infinite, cat-pan 4s ease infinite;
}
.cat-burst-2 {
  background-image: linear-gradient(135deg, #10B981, #00C2D1, #3A86FF, #10B981);
  animation: cat-burst-spin 9s linear infinite reverse, cat-pan 4s ease infinite;
}
.cat-newtext {
  position: relative;
  font-size: 11px;
  font-weight: 800;
  letter-spacing: .02em;
  color: #fff;
  text-shadow: 0 1px 3px rgba(0,0,0,.55);
  animation: cat-pulse 1.6s ease-in-out infinite;
}

/* Layout stability: every tile has the same fixed box, so nothing can change height */
.cat-scroller {
  scroll-snap-type: x proximity;
  overscroll-behavior-x: contain;
  -webkit-overflow-scrolling: touch;
  overflow-y: hidden;               /* bounce animations can never create a vertical scrollbar */
  scrollbar-width: none;
}
.cat-scroller::-webkit-scrollbar { display: none; }
.cat-tile { scroll-snap-align: start; contain: layout; -webkit-tap-highlight-color: transparent; }
.cat-tile:focus-visible { outline: 2px solid #7B2CBF; outline-offset: 4px; border-radius: 1rem; }
.cat-clamp {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  overflow-wrap: anywhere;
}
.cat-chip { box-shadow: inset 0 0 0 1px rgba(255,255,255,.7); }
.cat-circle { transition: transform .25s ease, box-shadow .25s ease; }
.cat-tile:hover .cat-circle { transform: translateY(-2px); }

/* Scroll-right hint */
.cat-nudge { animation: cat-nudge 1.1s ease-in-out infinite; }
.cat-arrow {
  background: linear-gradient(135deg, #00C2D1, #7B2CBF, #FF3D9A);
  background-size: 250% 250%;
  animation: cat-ping 1.8s ease-out infinite, cat-pan 5s ease infinite;
}

@keyframes cat-pop {
  0%   { opacity: 0; transform: translateY(14px) scale(.7); }
  100% { opacity: 1; transform: none; }
}
@keyframes cat-shine {
  0%   { transform: translateX(-160%) rotate(25deg); }
  55%, 100% { transform: translateX(300%) rotate(25deg); }
}
.cat-pop { animation: cat-pop .55s cubic-bezier(.34, 1.56, .64, 1) both; }
.cat-sheen { position: absolute; inset: 0; overflow: hidden; border-radius: 9999px; pointer-events: none; }
.cat-sheen::after {
  content: '';
  position: absolute; top: -20%; bottom: -20%; left: 0; width: 38%;
  background: linear-gradient(90deg, transparent, rgba(255,255,255,.8), transparent);
  animation: cat-shine 3.4s ease-in-out infinite;
}

@media (prefers-reduced-motion: reduce) {
  .cat-pop, .cat-sheen::after { animation: none; }
}

@media (prefers-reduced-motion: reduce) {
  .cat-newbadge-1, .cat-newbadge-2, .cat-burst, .cat-newtext, .cat-nudge, .cat-arrow { animation: none; }
  .cat-panel, .cat-blob, .cat-title, .cat-bar, .cat-b1, .cat-b2, .cat-b3,
  .cat-ring, .cat-label, .cat-icon, .cat-glow, .cat-new { animation: none; }
  .cat-item:hover .cat-inner { animation: none; }
  .cat-star { display: none; }
}
`;

const CategoryList = () => {
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [loading, setLoading] = useState(false);

  const categoryLoading = new Array(13).fill(null);

  // Scroll hint: show arrows only when there is more to see in that direction
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const updateScrollHints = () => {
    const el = scrollRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 8);
    setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 8);
  };

  const scrollByAmount = (amount: number) => {
    pausedUntilRef.current = Date.now() + 1200; // let the arrow's smooth scroll finish before auto-scroll resumes
    scrollRef.current?.scrollBy({ left: amount, behavior: 'smooth' });
  };

  // ♾️ Endless auto-scroll: the row glides on its own, pauses while you touch/hover it, and loops seamlessly
  const copyRef = useRef<HTMLDivElement>(null);
  const pausedRef = useRef(false);
  const pausedUntilRef = useRef(0);
  const visibleRef = useRef(true);
  const [loopable, setLoopable] = useState(false);
  const TILE_GAP = 'gap-3 pr-3 sm:gap-5 sm:pr-5 md:gap-6 md:pr-6';
  const SCROLL_SPEED = 38; // pixels per second

  useEffect(() => {
    const measure = () => {
      const el = scrollRef.current;
      const copy = copyRef.current;
      if (!el || !copy) return;
      const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      // only loop when one copy of the tiles is wider than the visible area
      setLoopable(!loading && !reduce && copy.offsetWidth > el.clientWidth + 8);
    };
    measure();
    window.addEventListener('resize', measure);
    return () => window.removeEventListener('resize', measure);
  }, [categories, loading]);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el || typeof IntersectionObserver === 'undefined') return;
    const io = new IntersectionObserver(([entry]) => { visibleRef.current = entry.isIntersecting; });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    if (!loopable) return;
    const el = scrollRef.current;
    const copy = copyRef.current;
    if (!el || !copy) return;
    let raf = 0;
    let last = performance.now();
    let pos = el.scrollLeft;
    const step = (t: number) => {
      const dt = Math.min(t - last, 64);
      last = t;
      const w = copy.offsetWidth;
      const paused = pausedRef.current || Date.now() < pausedUntilRef.current || !visibleRef.current;
      if (paused) {
        pos = el.scrollLeft; // follow the user's own scrolling
      } else {
        pos += (SCROLL_SPEED * dt) / 1000;
        if (pos >= w) pos -= w;
        el.scrollLeft = pos;
      }
      if (el.scrollLeft >= w) { el.scrollLeft -= w; pos = el.scrollLeft; } // wrap after manual scrolling too
      raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [loopable]);

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const [productRes, serviceRes] = await Promise.all([
        fetch(`${API_URL}/api/category-product`),
        fetch(`${API_URL}/api/category-service`)
      ]);

      const productData = await productRes.json();
      const serviceData = await serviceRes.json();

      const productCategories: CategoryItem[] =
        Array.isArray(productData?.data)
          ? productData.data.map((item: any) => ({
              category: item.category,
              image: item.productImage || [],
              type: "product",
            }))
          : [];

      const serviceCategories: CategoryItem[] =
        Array.isArray(serviceData?.data)
          ? serviceData.data.map((item: any) => ({
              category: item.category,
              image: item.serviceImage || [],
              type: "service",
            }))
          : [];

      setCategories([...productCategories, ...serviceCategories]);
    } catch (error) {
      console.error("Error fetching categories:", error);
      setCategories([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    updateScrollHints();
    window.addEventListener('resize', updateScrollHints);
    return () => window.removeEventListener('resize', updateScrollHints);
  }, [categories, loading]);

  // Each tile gets its own bounce style and delay so the row ripples instead of moving in lockstep
  const motionClass = (i: number) => ['cat-b1', 'cat-b2', 'cat-b3'][i % 3];
  const motionDelay = (i: number) => ({ animationDelay: `${(i % 8) * 0.18}s` });

  // Tiles are drawn through a function so the same row can be rendered twice (for the endless loop)
  const popDelay = (i: number) => ({ animationDelay: `${Math.min(i, 12) * 0.06}s` });
  const renderTiles = (copy: 0 | 1) => (
    <>
          {/* Pinned shortcuts to new sections */}
          {FEATURED.map(({ label, href, icon: Icon, from, to, iconSize }, idx) => (
            <Link key={`${copy}-${label}`} href={href} tabIndex={copy === 1 ? -1 : undefined} style={popDelay(idx)} className="cat-item cat-tile cat-pop group flex w-[5.25rem] flex-shrink-0 sm:w-24 cursor-pointer flex-col items-center text-center md:w-28">
              <div className={`relative mx-auto h-14 w-14 min-[380px]:h-16 min-[380px]:w-16 md:h-20 md:w-20 xl:h-24 xl:w-24 ${motionClass(idx)}`} style={motionDelay(idx)}>
                <div
                  className="cat-inner cat-circle cat-glow flex h-full w-full items-center justify-center rounded-full text-white shadow-lg ring-2 ring-white/70"
                  style={{ backgroundImage: `linear-gradient(135deg, ${from}, ${to}, ${from})` }}
                >
                  <Icon className={`cat-icon ${iconSize}`} />
                  <span aria-hidden className="cat-sheen" />
                </div>
                {/* "New" badge sits on the circle's corner, so it adds no height to the tile */}
                <span className={`cat-newbadge cat-newbadge-${idx + 1} absolute -right-4 -top-4 scale-75`}>
                  <span aria-hidden className={`cat-burst cat-burst-${idx + 1}`} />
                  <span className="cat-newtext">New</span>
                </span>
              </div>
              <p className="cat-label cat-clamp mt-2 h-10 w-full text-sm font-semibold leading-5 md:text-base xl:text-lg">{label}</p>
              <span className="cat-chip mt-1 h-5 rounded-full bg-[#FFB020]/15 px-2 text-xs leading-5 text-[#b45309]">
                section
              </span>
            </Link>
          ))}

          {loading
            ? categoryLoading.map((_, index) => (
                <div key={`${copy}-${index}`} aria-hidden className="flex w-[5.25rem] flex-shrink-0 sm:w-24 flex-col items-center md:w-28">
                  <div className="h-14 w-14 animate-pulse rounded-full bg-white/70 min-[380px]:h-16 min-[380px]:w-16 md:h-20 md:w-20 xl:h-24 xl:w-24" />
                  <div className="mt-2 flex h-10 w-full flex-col items-center gap-1.5 pt-1">
                    <div className="h-3 w-4/5 animate-pulse rounded-full bg-white/70" />
                    <div className="h-3 w-3/5 animate-pulse rounded-full bg-white/50" />
                  </div>
                  <div className="mt-1 h-5 w-12 animate-pulse rounded-full bg-white/60" />
                </div>
              ))
            : categories.length > 0
            ? categories.map((item, i) => {
                const idx = i + FEATURED.length;
                const href =
                  item.type === "product"
                    ? `/category-product?category=${encodeURIComponent(item.category)}`
                    : `/category-service?category=${encodeURIComponent(item.category)}`;

                return (
                  <Link
                    key={`${copy}-${item.type}-${item.category}`}
                    href={href} tabIndex={copy === 1 ? -1 : undefined} style={popDelay(idx)}
                    className="cat-item cat-tile cat-pop group flex w-[5.25rem] flex-shrink-0 sm:w-24 cursor-pointer flex-col items-center text-center md:w-28"
                  >
                    {/* Bouncing wrapper with a spinning, colour-shifting ring */}
                    <div className={`relative mx-auto h-14 w-14 min-[380px]:h-16 min-[380px]:w-16 md:h-20 md:w-20 xl:h-24 xl:w-24 ${motionClass(idx)}`} style={motionDelay(idx)}>
                      <span aria-hidden className="cat-ring absolute inset-0 rounded-full" />
                      <div className="cat-inner absolute inset-[3px] flex items-center justify-center overflow-hidden rounded-full border border-white bg-gray-50 p-3 shadow-sm transition duration-300 group-hover:border-transparent group-hover:bg-gradient-to-r group-hover:from-[#00C2D1] group-hover:to-[#7B2CBF] group-hover:shadow-xl">
                        <img
                          src={item.image?.[0] || '/placeholder.png'}
                          alt={item.category}
                          loading="lazy"
                          className="h-full object-scale-down mix-blend-multiply transition-transform duration-300 group-hover:scale-125"
                        />
                        <span aria-hidden className="cat-sheen" />
                      </div>
                    </div>
                    <p className="cat-label cat-clamp mt-2 h-10 w-full text-sm font-medium capitalize leading-5 md:text-base xl:text-lg" style={motionDelay(idx)}>
                      {item.category}
                    </p>
                    <span
                      className={`cat-chip mt-1 h-5 rounded-full px-2 text-xs capitalize leading-5 ${
                        item.type === 'service'
                          ? 'bg-[#7B2CBF]/10 text-[#7B2CBF]'
                          : 'bg-[#00C2D1]/10 text-[#0099a6]'
                      }`}
                    >
                      {item.type}
                    </span>
                  </Link>
                );
              })
            : (
              <p className="w-[14rem] self-center text-center italic text-gray-500 sm:w-[20rem]">
                No categories found.
              </p>
            )}
    </>
  );

  return (
    <div className="cat-panel relative mx-1 mt-1 overflow-hidden rounded-xl border border-white/60 px-2.5 py-4 shadow-xl shadow-black/20 sm:mx-2 sm:mt-1.5 sm:rounded-2xl sm:px-4 sm:py-5 md:mx-3 md:px-6 md:py-6">
      <style>{CATEGORY_CSS}</style>

      {/* Drifting colour blobs that blend into the panel */}
      <div aria-hidden className="cat-blob cat-blob-a -left-10 -top-10 h-44 w-44" />
      <div aria-hidden className="cat-blob cat-blob-b right-[-30px] top-6 h-52 w-52" />
      <div aria-hidden className="cat-blob cat-blob-c bottom-[-40px] left-1/3 h-48 w-48" />
      <div aria-hidden className="cat-blob cat-blob-d bottom-[-30px] right-1/4 h-40 w-40" />

      <div className="relative z-10">
        <div className="relative mb-4 flex h-9 items-center gap-2 sm:gap-3 md:mb-5">
          <span className="cat-bar h-6 w-1.5 shrink-0 rounded-full" />
          <h2 className="cat-title min-w-0 truncate text-lg font-bold sm:text-xl md:text-2xl">
            Shop & Services by Category
          </h2>
          {/* Twinkling stars */}
          <span aria-hidden className="cat-star hidden h-3 w-3 bg-[#FFB020] sm:block" style={{ marginLeft: 4 }} />
          <span aria-hidden className="cat-star hidden h-2 w-2 bg-[#FF3D9A] sm:block" style={{ animationDelay: '0.8s' }} />
          <span aria-hidden className="cat-star hidden h-2.5 w-2.5 bg-[#00C2D1] sm:block" style={{ animationDelay: '1.6s' }} />

          {/* Always rendered (only hidden), so showing/hiding it never changes the row height */}
          <span
            aria-hidden={!canScrollRight}
            className={`ml-auto flex shrink-0 items-center gap-1 whitespace-nowrap rounded-full bg-white/70 px-3 py-1 text-xs font-semibold text-[#7B2CBF] shadow-sm backdrop-blur transition-opacity duration-300 ${
              canScrollRight ? 'opacity-100' : 'pointer-events-none opacity-0'
            }`}
          >
            <span className="hidden min-[380px]:inline">Swipe for more</span> <FaAngleRight className="cat-nudge" />
          </span>
        </div>

        <div className="relative">
        {/* Edge fades + arrows tell people there is more to scroll to */}
        {canScrollLeft && (
          <>
            <div aria-hidden className="pointer-events-none absolute inset-y-0 left-0 z-10 w-10 bg-gradient-to-r from-white/90 to-transparent" />
            <button
              type="button"
              aria-label="Scroll categories left"
              onClick={() => scrollByAmount(-260)}
              className="cat-arrow absolute left-0 top-1/2 z-20 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full text-white shadow-lg"
            >
              <FaAngleLeft />
            </button>
          </>
        )}
        {canScrollRight && (
          <>
            <div aria-hidden className="pointer-events-none absolute inset-y-0 right-0 z-10 w-14 bg-gradient-to-l from-white/95 via-white/60 to-transparent" />
            <button
              type="button"
              aria-label="Scroll categories right"
              onClick={() => scrollByAmount(260)}
              className="cat-arrow absolute right-0 top-1/2 z-20 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full text-lg text-white shadow-lg"
            >
              <FaAngleRight className="cat-nudge" />
            </button>
          </>
        )}

        <div
          ref={scrollRef}
          onScroll={updateScrollHints}
          onMouseEnter={() => { pausedRef.current = true; }}
          onMouseLeave={() => { pausedRef.current = false; }}
          onFocus={() => { pausedRef.current = true; }}
          onBlur={() => { pausedRef.current = false; }}
          onTouchStart={() => { pausedRef.current = true; }}
          onTouchEnd={() => { pausedRef.current = false; pausedUntilRef.current = Date.now() + 3000; }}
          className="cat-scroller flex overflow-x-auto scrollbar-none px-2 pb-4 pt-5"
          style={loopable ? { scrollSnapType: 'none' } : { justifyContent: 'safe center' }}
        >
          {/* Copy 1: the real tiles */}
          <div ref={copyRef} className={`flex shrink-0 ${TILE_GAP}`}>
            {renderTiles(0)}
          </div>
          {/* Copy 2: identical, hidden from screen readers/keyboard. Lets the row loop forever without a jump */}
          {loopable && (
            <div aria-hidden className={`flex shrink-0 ${TILE_GAP}`}>
              {renderTiles(1)}
            </div>
          )}
        </div>
        </div>
      </div>
    </div>
  );
};

export default CategoryList;