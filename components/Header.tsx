'use client';
import React, { useState, useEffect, Suspense } from 'react';
import { GrSearch } from "react-icons/gr";
import { FaRegCircleUser, FaPrint, FaPlaystation } from "react-icons/fa6";
import type { IconType } from "react-icons";
import {
  FaShoppingCart,
  FaMobileAlt,
  FaLaptop,
  FaCopy,
  FaGamepad,
  FaHeadphones,
  FaKeyboard,
  FaPenFancy,
  FaBook,
  FaWifi,
  FaCamera,
  FaTv,
  FaTshirt,
  FaPalette,
  FaShoppingBag,
  FaMouse,
  FaUsb,
  FaDesktop,
  FaFax,
  FaBoxOpen,
} from "react-icons/fa";
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { createPortal } from 'react-dom';
import { Logo } from './Logo';
import { useAuthStore } from '@/store/auth-store';
import { useCartStore } from '@/store/cart-store';
const API_URL = process.env.NEXT_PUBLIC_API_URL;
interface SearchItem {
  _id: string;
  name: string;
  category?: string;
  slug: string;
  type: "product" | "service";
}
// Links to the new homepage sections (work from any page)
const NAV_LINKS: { label: string; short: string; href: string; icon: IconType; variant: 'print' | 'game' }[] = [
  { label: 'Cyber Services', short: 'Print', href: '/#cyber-services', icon: FaPrint, variant: 'print' },
  { label: 'Gaming', short: 'Play', href: '/#gaming-zone', icon: FaPlaystation, variant: 'game' },
];
// Products & services that scroll across the header background (left -> right, like pitch-side LED adverts)
const MARQUEE_ITEMS: { label: string; icon: IconType; color: string }[] = [
  { label: 'Phones', icon: FaMobileAlt, color: '#00C2D1' },
  { label: 'Laptops', icon: FaLaptop, color: '#7B2CBF' },
  { label: 'Printing', icon: FaPrint, color: '#FF3D9A' },
  { label: 'Photocopying', icon: FaCopy, color: '#FFB020' },
  { label: 'PS5 FIFA', icon: FaPlaystation, color: '#3A86FF' },
  { label: 'Headphones', icon: FaHeadphones, color: '#10B981' },
  { label: 'Stationery', icon: FaPenFancy, color: '#FF3D9A' },
  { label: 'Internet', icon: FaWifi, color: '#00C2D1' },
  { label: 'Cameras', icon: FaCamera, color: '#7B2CBF' },
  { label: 'TVs', icon: FaTv, color: '#3A86FF' },
  { label: 'Branding', icon: FaPalette, color: '#FFB020' },
  { label: 'Keyboards', icon: FaKeyboard, color: '#10B981' },
  { label: 'Gaming', icon: FaGamepad, color: '#FF3D9A' },
  { label: 'Books', icon: FaBook, color: '#00C2D1' },
  { label: 'T-Shirt Print', icon: FaTshirt, color: '#7B2CBF' },
  { label: 'Accessories', icon: FaMouse, color: '#FFB020' },
  { label: 'Flash Disks', icon: FaUsb, color: '#3A86FF' },
  { label: 'Computers', icon: FaDesktop, color: '#10B981' },
  { label: 'Scan & Fax', icon: FaFax, color: '#FF3D9A' },
  { label: 'Shop Online', icon: FaShoppingBag, color: '#00C2D1' },
  { label: 'Deals', icon: FaBoxOpen, color: '#FFB020' },
];
// Second row uses the same items in a different order so the two rows never line up
const MARQUEE_ROW_2 = [...MARQUEE_ITEMS.slice(10), ...MARQUEE_ITEMS.slice(0, 10)];
// Phrases that get "typed" into the search box
const SEARCH_HINTS = [
  'Search phones & laptops...',
  'Try "photocopying"...',
  'Find printing services...',
  'Book a PS5 FIFA session...',
  'Look for stationery...',
  'Search headphones & gadgets...',
];
// Self-contained header effects (no dependency on globals.css)
const HEADER_CSS = `
@keyframes hdr-beam {
  0%   { transform: translateX(-150%) skewX(-20deg); }
  55%, 100% { transform: translateX(520%) skewX(-20deg); }
}
@keyframes hdr-pan {
  0%   { background-position: 0% 50%; }
  50%  { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
}
@keyframes hdr-glow-print {
  0%, 100% { box-shadow: 0 0 8px 1px #FF3D9A, 0 0 20px 3px rgba(255,61,154,.45); }
  33%      { box-shadow: 0 0 8px 1px #FFB020, 0 0 20px 3px rgba(255,176,32,.45); }
  66%      { box-shadow: 0 0 8px 1px #7B2CBF, 0 0 20px 3px rgba(123,44,191,.5); }
}
@keyframes hdr-glow-game {
  0%, 100% { box-shadow: 0 0 8px 1px #00C2D1, 0 0 20px 3px rgba(0,194,209,.45); }
  33%      { box-shadow: 0 0 8px 1px #3DFFA2, 0 0 20px 3px rgba(61,255,162,.4); }
  66%      { box-shadow: 0 0 8px 1px #3A86FF, 0 0 20px 3px rgba(58,134,255,.5); }
}
@keyframes hdr-flicker {
  0%, 18%, 22%, 25%, 53%, 57%, 100% { opacity: 1; transform: scale(1); }
  20%, 24%, 55% { opacity: .5; transform: scale(.92); }
  75% { transform: scale(1.15); }
}
@keyframes hdr-twinkle {
  0%, 100% { transform: scale(0) rotate(0deg); opacity: 0; }
  50%      { transform: scale(1) rotate(90deg); opacity: 1; }
}
/* Marquee: track holds the list twice, sliding by half its width = seamless loop, moving left -> right */
@keyframes hdr-marquee-ltr {
  from { transform: translateX(-50%); }
  to   { transform: translateX(0); }
}
@keyframes hdr-bob {
  0%, 100% { transform: translateY(0); }
  50%      { transform: translateY(-2px); }
}
@keyframes hdr-search-ring {
  0%   { background-position: 0% 50%; }
  100% { background-position: 200% 50%; }
}
@keyframes hdr-search-pulse {
  0%, 100% { transform: scale(1); }
  50%      { transform: scale(1.15); }
}
@keyframes hdr-caret {
  0%, 49% { opacity: 1; }
  50%, 100% { opacity: 0; }
}
.hdr-beam {
  background: linear-gradient(100deg, transparent 0%, rgba(255,255,255,.85) 40%, rgba(0,194,209,.35) 50%, rgba(255,61,154,.3) 60%, transparent 100%);
  animation: hdr-beam 6s ease-in-out infinite;
}
.hdr-line { background-size: 200% 100%; animation: hdr-pan 6s linear infinite; }
.hdr-promo-print {
  background: linear-gradient(110deg, #FF3D9A, #7B2CBF, #FFB020, #FF3D9A);
  background-size: 300% 300%;
  animation: hdr-pan 5s ease infinite, hdr-glow-print 3s linear infinite;
}
.hdr-promo-game {
  background: linear-gradient(110deg, #00C2D1, #3A86FF, #10B981, #00C2D1);
  background-size: 300% 300%;
  animation: hdr-pan 5s ease infinite, hdr-glow-game 3s linear infinite;
}
.hdr-flicker { animation: hdr-flicker 2.6s infinite; }
.hdr-star {
  position: absolute;
  pointer-events: none;
  clip-path: polygon(50% 0, 62% 38%, 100% 50%, 62% 62%, 50% 100%, 38% 62%, 0 50%, 38% 38%);
  animation: hdr-twinkle 2.2s ease-in-out infinite;
}
.hdr-marquee {
  -webkit-mask-image: linear-gradient(90deg, transparent 0%, #000 8%, #000 92%, transparent 100%);
          mask-image: linear-gradient(90deg, transparent 0%, #000 8%, #000 92%, transparent 100%);
}
.hdr-marquee-track {
  display: flex;
  width: max-content;
  animation: hdr-marquee-ltr 55s linear infinite;
  will-change: transform;
}
.hdr-marquee-track.hdr-slow { animation-duration: 80s; }
.hdr-marquee-item { animation: hdr-bob 3s ease-in-out infinite; }
.hdr-search-ring {
  background: linear-gradient(90deg, #00C2D1, #7B2CBF, #FF3D9A, #FFB020, #00C2D1);
  background-size: 200% 100%;
  animation: hdr-search-ring 3s linear infinite;
}
.hdr-search-pulse { animation: hdr-search-pulse 2.4s ease-in-out infinite; }
.hdr-caret { animation: hdr-caret 1s steps(1) infinite; }
@media (prefers-reduced-motion: reduce) {
  .hdr-beam, .hdr-line, .hdr-promo-print, .hdr-promo-game, .hdr-flicker,
  .hdr-marquee-track, .hdr-marquee-item, .hdr-search-ring, .hdr-search-pulse, .hdr-caret { animation: none; }
  .hdr-star { display: none; }
}
`;
const STAR_COLORS = ['#FFE14D', '#FF3D9A', '#3DFFA2', '#00C2D1', '#FFFFFF', '#FFB020'];
const STARS = [
  { top: '-7px',  left: '12%',  size: 11, delay: '0s' },
  { top: '-5px',  left: '68%',  size: 9,  delay: '0.5s' },
  { top: '45%',   left: '-8px', size: 10, delay: '1s' },
  { top: '55%',   left: '97%',  size: 11, delay: '1.4s' },
  { top: '92%',   left: '34%',  size: 9,  delay: '0.8s' },
  { top: '88%',   left: '80%',  size: 10, delay: '1.8s' },
];
// Types the hints into the search placeholder, one letter at a time (typewriter effect)
function useTypewriter(phrases: string[], paused: boolean) {
  const [text, setText] = useState('');
  useEffect(() => {
    if (paused) return;
    let phraseIdx = 0;
    let charIdx = 0;
    let deleting = false;
    let timer: ReturnType<typeof setTimeout>;
    const tick = () => {
      const phrase = phrases[phraseIdx];
      if (!deleting) {
        charIdx++;
        setText(phrase.slice(0, charIdx));
        if (charIdx === phrase.length) {
          deleting = true;
          timer = setTimeout(tick, 1600); // hold the full phrase
          return;
        }
        timer = setTimeout(tick, 70);
      } else {
        charIdx--;
        setText(phrase.slice(0, charIdx));
        if (charIdx === 0) {
          deleting = false;
          phraseIdx = (phraseIdx + 1) % phrases.length;
          timer = setTimeout(tick, 350);
          return;
        }
        timer = setTimeout(tick, 35);
      }
    };
    timer = setTimeout(tick, 500);
    return () => clearTimeout(timer);
  }, [phrases, paused]);
  return text;
}
// One scrolling row of product/service icons
function MarqueeRow({
  items,
  slow,
}: {
  items: { label: string; icon: IconType; color: string }[];
  slow?: boolean;
}) {
  // The list is rendered twice so the loop is seamless
  const doubled = [...items, ...items];
  return (
    <div className="hdr-marquee overflow-hidden">
      <div className={`hdr-marquee-track ${slow ? 'hdr-slow' : ''}`}>
        {doubled.map((it, i) => {
          const Icon = it.icon;
          return (
            <span
              key={i}
              className="hdr-marquee-item mx-5 inline-flex shrink-0 items-center gap-1.5 whitespace-nowrap"
              style={{ color: it.color, animationDelay: `${(i % 7) * 0.35}s` }}
            >
              <Icon className="text-xl" />
              <span className="text-[11px] font-semibold tracking-wide">{it.label}</span>
            </span>
          );
        })}
      </div>
    </div>
  );
}
// Colourful animated button with splashing multi-colour stars
function PromoLink({
  href,
  label,
  short,
  icon: Icon,
  variant,
  compact,
}: {
  href: string;
  label: string;
  short: string;
  icon: IconType;
  variant: 'print' | 'game';
  compact?: boolean;
}) {
  const offset = variant === 'print' ? 0 : 3; // each button gets a different star colour order
  return (
    <Link
      href={href}
      aria-label={label}
      className={`relative inline-flex shrink-0 items-center justify-center gap-2 rounded-full font-bold text-white transition-transform duration-200 hover:scale-105 active:scale-95 [text-shadow:0_1px_2px_rgba(0,0,0,.45)] ${
        variant === 'print' ? 'hdr-promo-print' : 'hdr-promo-game'
      } ${compact ? 'h-11 w-11 sm:w-auto sm:px-4' : 'px-4 py-2 text-sm'}`}
    >
      {STARS.map((s, i) => (
        <span
          key={i}
          aria-hidden
          className="hdr-star"
          style={{
            top: s.top,
            left: s.left,
            width: s.size,
            height: s.size,
            background: STAR_COLORS[(i + offset) % STAR_COLORS.length],
            animationDelay: s.delay,
          }}
        />
      ))}
      <Icon className={`hdr-flicker relative ${compact ? 'text-2xl' : 'text-xl'}`} />
      <span className={compact ? 'relative hidden text-sm sm:inline' : 'relative'}>
        {compact ? short : label}
      </span>
    </Link>
  );
}
// One dropdown used by both the desktop and mobile search boxes
function SearchResults({
  loading,
  results,
  onPick,
}: {
  loading: boolean;
  results: SearchItem[];
  onPick: () => void;
}) {
  return (
    <div className="absolute left-0 top-full z-50 mt-2 max-h-80 w-full overflow-y-auto rounded-2xl border border-gray-200 bg-white py-1 shadow-2xl">
      {loading ? (
        <p className="p-3 text-gray-500">Searching...</p>
      ) : results.length ? (
        results.map((item) => (
          <Link
            key={item._id}
            href={item.type === "service" ? `/service-details/${item.slug}` : `/product-details/${item.slug}`}
            className="flex items-center justify-between gap-3 px-4 py-2 text-gray-800 transition hover:bg-gray-100"
            onClick={onPick}
          >
            <span className="font-medium">{item.name}</span>
            <span
              className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-medium ${
                item.type === 'service' ? 'bg-[#7B2CBF]/10 text-[#7B2CBF]' : 'bg-[#00C2D1]/10 text-[#0099a6]'
              }`}
            >
              {item.type}{item.category ? `, ${item.category}` : ''}
            </span>
          </Link>
        ))
      ) : (
        <p className="p-3 text-gray-500">No results found</p>
      )}
    </div>
  );
}
// Modern search box: animated gradient ring on focus, typewriter placeholder, pulsing icon, clear button.
// Used by both the desktop and mobile layouts.
function SearchBox({
  wrapperClass,
  search,
  setSearch,
  loading,
  results,
}: {
  wrapperClass: string;
  search: string;
  setSearch: (v: string) => void;
  loading: boolean;
  results: SearchItem[];
}) {
  const [focused, setFocused] = useState(false);
  const typed = useTypewriter(SEARCH_HINTS, focused || !!search);
  return (
    <div className={`group ${wrapperClass}`}>
      {/* Animated rainbow ring, shown while the box is focused */}
      <span
        aria-hidden
        className="hdr-search-ring pointer-events-none absolute -inset-[2px] rounded-full opacity-0 blur-[1px] transition-opacity duration-300 group-focus-within:opacity-100"
      />
      <input
        type="text"
        aria-label="Search products or services"
        placeholder={focused ? 'Search products or services...' : `${typed}\u200B`}
        className="relative w-full rounded-full border border-gray-300 bg-gray-50 py-2 pl-10 pr-10 text-gray-800 shadow-inner outline-none transition placeholder:text-gray-400 focus:border-transparent focus:bg-white"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
      />
      {/* Left icon */}
      <GrSearch
        className={`pointer-events-none absolute left-3.5 top-2.5 text-lg text-[#7B2CBF] ${
          search ? '' : 'hdr-search-pulse'
        }`}
      />
      {/* Right: clear button when typing, blinking caret hint when idle */}
      {search ? (
        <button
          type="button"
          aria-label="Clear search"
          onClick={() => setSearch('')}
          className="absolute right-3 top-1/2 flex h-6 w-6 -translate-y-1/2 items-center justify-center rounded-full bg-gray-200 text-xs text-gray-600 transition hover:bg-[#FF3D9A] hover:text-white"
        >
          ✕
        </button>
      ) : (
        <span
          aria-hidden
          className="hdr-caret pointer-events-none absolute right-4 top-1/2 h-4 w-0.5 -translate-y-1/2 rounded bg-gradient-to-b from-[#00C2D1] to-[#FF3D9A]"
        />
      )}
      {search && <SearchResults loading={loading} results={results} onPick={() => setSearch('')} />}
    </div>
  );
}
// Inner Header logic that utilizes search params wrapped inside Suspense
const HeaderContent = () => {
  // Select only what we need so the header doesn't re-render on every auth/cart store change
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const cartProductCount = useCartStore((s) => s.count);
  const fetchCart = useCartStore((s) => s.fetchCart);
  const clearCart = useCartStore((s) => s.clearCart);
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialSearch = searchParams?.get("q") || "";
  const [search, setSearch] = useState(initialSearch);
  const [results, setResults] = useState<SearchItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [accountMenuOpen, setAccountMenuOpen] = useState(false);
  // Logout confirmation dialog
  const [logoutConfirmOpen, setLogoutConfirmOpen] = useState(false);
  useEffect(() => {
    if (!logoutConfirmOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setLogoutConfirmOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [logoutConfirmOpen]);
  useEffect(() => {
    if (user?.id) fetchCart({ dedupe: true });
    // Logged out (or never logged in): make sure no old cart count is left in the badge
    else clearCart();
  }, [user?.id, fetchCart, clearCart]);
  // Debounced search
  useEffect(() => {
    const handler = setTimeout(() => {
      if (search.trim()) performSearch(search.trim());
      else setResults([]);
    }, 300);
    return () => clearTimeout(handler);
  }, [search]);
  const performSearch = async (query: string) => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/search?q=${encodeURIComponent(query)}`);
      const json = await res.json();
      if (json.success) setResults(json.data);
      else setResults([]);
    } catch (err) {
      console.error(err);
      setResults([]);
    } finally {
      setLoading(false);
    }
  };
  const handleLogout = () => {
    logout();
    clearCart(); // cart badge disappears immediately
    router.push('/');
  };
  const gradientBtn =
    "px-3 sm:px-4 py-1.5 text-sm rounded-full text-white bg-gradient-to-r from-[#00C2D1] to-[#7B2CBF] hover:opacity-90 hover:shadow-lg hover:shadow-[#7B2CBF]/30 transition shadow cursor-pointer";
  return (
    <header className="fixed z-40 w-full bg-white/90 shadow-md backdrop-blur-md">
      <style>{HEADER_CSS}</style>
      {/* Product & service marquee: icons keep scrolling left to right behind the header content */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 flex select-none flex-col justify-evenly overflow-hidden opacity-[0.28]"
      >
        <MarqueeRow items={MARQUEE_ITEMS} />
        <MarqueeRow items={MARQUEE_ROW_2} slow />
      </div>
      {/* Light passing across the whole header, left to right */}
      <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="hdr-beam absolute inset-y-0 left-0 w-1/5" />
      </div>
      <div className="container relative z-10 mx-auto flex min-h-16 items-center justify-between gap-2 px-3 py-2 sm:gap-4 sm:px-4 lg:gap-5">
        <Link href="/" className="shrink-0"><Logo width={55} height={55} /></Link>
        {/* Section links (desktop) */}
        <nav className="hidden items-center gap-4 lg:flex" aria-label="Sections">
          {NAV_LINKS.map((l) => (
            <PromoLink key={l.label} {...l} />
          ))}
        </nav>
        {/* Search */}
        <SearchBox
          wrapperClass="relative hidden w-full max-w-md rounded-full lg:block"
          search={search}
          setSearch={setSearch}
          loading={loading}
          results={results}
        />
        {/* Right Section — responsive shopping and account controls */}
        <div className="flex shrink-0 items-center gap-1 sm:gap-2 lg:gap-3">
          {user?.id ? (
            <>
              {/* Keep the dashboard available on larger screens */}
              <Link
                href="/customer-dashboard"
                className="hidden rounded-full bg-gradient-to-r from-[#00C2D1] to-[#7B2CBF] px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:scale-105 hover:shadow-md active:scale-95 sm:inline-flex"
              >
                Dashboard
              </Link>
              {/* Cart */}
              <Link
                href="/cart"
                className="group relative flex min-w-[46px] shrink-0 flex-col items-center justify-center gap-0.5 rounded-xl px-2 py-1 transition hover:bg-purple-50 active:scale-95 sm:min-w-[56px]"
                aria-label={`Cart${cartProductCount > 0 ? `, ${cartProductCount} items` : ''}`}
              >
                <span className="relative">
                  <FaShoppingCart className="text-xl text-gray-700 transition group-hover:text-[#7B2CBF] sm:text-2xl" />
                  {cartProductCount > 0 && (
                    <span className="absolute -right-2.5 -top-2 flex h-4 min-w-4 items-center justify-center rounded-full bg-[#F68B1E] px-1 text-[10px] font-bold leading-none text-white ring-2 ring-white sm:h-5 sm:min-w-5">
                      {cartProductCount > 99 ? '99+' : cartProductCount}
                    </span>
                  )}
                </span>
                <span className="text-[10px] font-medium leading-none text-gray-600 transition group-hover:text-[#7B2CBF] sm:text-xs">Cart</span>
              </Link>
              {/* Account menu: logout is available here, not as a permanent header button */}
              <div className="relative shrink-0">
                <button
                  type="button"
                  aria-label="Open account menu"
                  aria-expanded={accountMenuOpen}
                  onClick={() => setAccountMenuOpen((open) => !open)}
                  className={`group flex min-w-[52px] shrink-0 flex-col items-center justify-center gap-0.5 rounded-xl px-2 py-1 text-gray-600 transition hover:bg-purple-50 hover:text-[#7B2CBF] active:scale-95 sm:min-w-[60px] ${accountMenuOpen ? 'bg-purple-50 text-[#7B2CBF]' : ''}`}
                >
                  <FaRegCircleUser className="text-xl text-[#7B2CBF] sm:text-2xl" />
                  <span className="flex items-center gap-0.5">
                    <span className="text-[10px] font-medium leading-none sm:text-xs">Account</span>
                    <svg
                      aria-hidden="true"
                      className={`hidden h-3 w-3 transition-transform md:block ${accountMenuOpen ? 'rotate-180' : ''}`}
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path fillRule="evenodd" d="M5.22 7.22a.75.75 0 011.06 0L10 10.94l3.72-3.72a.75.75 0 111.06 1.06l-4.25 4.25a.75.75 0 01-1.06 0L5.22 8.28a.75.75 0 010-1.06z" clipRule="evenodd" />
                    </svg>
                  </span>
                </button>
                {accountMenuOpen && (
                  <>
                    <button
                      type="button"
                      aria-label="Close account menu"
                      className="fixed inset-0 z-40 cursor-default"
                      onClick={() => setAccountMenuOpen(false)}
                    />
                    <div className="absolute right-0 top-full z-50 mt-3 w-60 overflow-hidden rounded-xl border border-gray-100 bg-white shadow-xl sm:w-64">
                      <div className="border-b border-gray-100 bg-gray-50 px-4 py-3">
                        <p className="text-sm font-bold text-gray-900">My Account</p>
                        <p className="mt-0.5 text-xs text-gray-500">Manage your shopping account</p>
                      </div>
                      <div className="p-2">
                        <Link
                          href="/customer-dashboard"
                          onClick={() => setAccountMenuOpen(false)}
                          className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-gray-700 transition hover:bg-purple-50 hover:text-[#7B2CBF]"
                        >
                          <span aria-hidden="true">▦</span> My Dashboard
                        </Link>
                        <Link
                          href="/profile"
                          onClick={() => setAccountMenuOpen(false)}
                          className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-gray-700 transition hover:bg-purple-50 hover:text-[#7B2CBF]"
                        >
                          <FaRegCircleUser /> My Profile
                        </Link>
                        <Link
                          href="/cart"
                          onClick={() => setAccountMenuOpen(false)}
                          className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-gray-700 transition hover:bg-purple-50 hover:text-[#7B2CBF]"
                        >
                          <FaShoppingCart /> My Cart
                        </Link>
                        <button
                          type="button"
                          onClick={() => {
                            setAccountMenuOpen(false);
                            setLogoutConfirmOpen(true); // ask first; handleLogout() runs on confirm
                          }}
                          className="mt-1 flex w-full items-center gap-3 rounded-lg border-t border-gray-100 px-3 py-3 text-left text-sm font-semibold text-red-600 transition hover:bg-red-50"
                        >
                          <svg aria-hidden="true" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" />
                            <path d="M16 17l5-5-5-5" />
                            <path d="M21 12H9" />
                          </svg>
                          Logout
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </>
          ) : (
            <>
              {/* Cart remains available to guests too */}
              <Link
                href="/cart"
                aria-label="Shopping cart"
                className="group relative flex min-w-[46px] shrink-0 flex-col items-center justify-center gap-0.5 rounded-xl px-2 py-1 transition hover:bg-purple-50 active:scale-95 sm:min-w-[56px]"
              >
                <span className="relative">
                  <FaShoppingCart className="text-xl text-gray-700 transition group-hover:text-[#7B2CBF] sm:text-2xl" />
                  {cartProductCount > 0 && (
                    <span className="absolute -right-2.5 -top-2 flex h-4 min-w-4 items-center justify-center rounded-full bg-[#F68B1E] px-1 text-[10px] font-bold leading-none text-white ring-2 ring-white sm:h-5 sm:min-w-5">
                      {cartProductCount > 99 ? '99+' : cartProductCount}
                    </span>
                  )}
                </span>
                <span className="text-[10px] font-medium leading-none text-gray-600 transition group-hover:text-[#7B2CBF] sm:text-xs">Cart</span>
              </Link>
              <Link
                href="/login"
                className="rounded-full bg-[#F68B1E] px-3 py-2 text-sm font-bold text-white shadow-sm transition hover:bg-orange-600 hover:shadow-md sm:px-4"
              >
                Login
              </Link>
            </>
          )}
        </div>
      </div>
      {/* Mobile: search + quick links to the new sections */}
      <div className="relative z-10 flex items-center gap-2 px-3 pb-3 sm:gap-3 sm:px-4 lg:hidden">
        <SearchBox
          wrapperClass="relative flex-1"
          search={search}
          setSearch={setSearch}
          loading={loading}
          results={results}
        />
        {NAV_LINKS.map((l) => (
          <PromoLink key={l.label} {...l} compact />
        ))}
      </div>
      {/* Brand accent line */}
      <div className="hdr-line h-0.5 bg-gradient-to-r from-[#00C2D1] via-[#7B2CBF] via-[#FF3D9A] via-[#FFB020] to-[#00C2D1]" />
      {/* Logout confirmation dialog */}
      {logoutConfirmOpen &&
        typeof document !== 'undefined' &&
        createPortal(
          <div
            className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
            onClick={() => setLogoutConfirmOpen(false)}
          >
            <div
              role="dialog"
              aria-modal="true"
              aria-labelledby="header-logout-title"
              aria-describedby="header-logout-desc"
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-sm overflow-hidden rounded-2xl border border-white/10 bg-gray-800 shadow-2xl shadow-black/50"
            >
              <div className="h-1 bg-gradient-to-r from-[#00C2D1] via-[#7B2CBF] to-[#FF3D9A]" />
              <div className="p-5 text-center sm:p-6">
                <h3 id="header-logout-title" className="text-lg font-bold text-white sm:text-xl">
                  Log out of your account?
                </h3>
                <p id="header-logout-desc" className="mt-2 text-sm text-gray-300">
                  You&apos;ll need to log in again to see your orders, cart and profile.
                </p>

                <div className="mt-5 grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    autoFocus
                    onClick={() => setLogoutConfirmOpen(false)}
                    className="rounded-full border border-gray-600 px-4 py-2.5 text-sm font-semibold text-gray-200 transition hover:border-[#00C2D1] hover:bg-gray-700"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setLogoutConfirmOpen(false);
                      handleLogout();
                    }}
                    className="rounded-full bg-red-600 px-4 py-2.5 text-sm font-semibold text-white shadow-md shadow-red-900/40 transition hover:bg-red-700 active:scale-95"
                  >
                    Log out
                  </button>
                </div>
              </div>
            </div>
          </div>,
          document.body
        )}
    </header>
  );
};
// Main default export wrapped in a Suspense container boundary
const Header = () => {
  return (
    <Suspense fallback={<header className="fixed z-40 h-16 w-full border-b border-gray-200 bg-white shadow-md" />}>
      <HeaderContent />
    </Suspense>
  );
};
export default Header;