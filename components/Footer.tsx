'use client';

import React, { useState } from 'react';
import { FaFacebookF, FaTwitter, FaInstagram, FaYoutube } from 'react-icons/fa';
import {
  FaPrint,
  FaPlaystation,
  FaArrowUp,
  FaPaperPlane,
  FaShieldHalved,
  FaTruckFast,
  FaHeadset,
  FaCircleCheck,
} from 'react-icons/fa6';
import Link from 'next/link';

// Self-contained footer effects (no dependency on globals.css). Transform/opacity/background only = cheap.
const FOOTER_CSS = `
@keyframes ft-pan {
  0%   { background-position: 0% 50%; }
  100% { background-position: 200% 50%; }
}
@keyframes ft-blob {
  0%, 100% { transform: translate(0, 0) scale(1); }
  50%      { transform: translate(40px, -20px) scale(1.2); }
}
@keyframes ft-float {
  0%, 100% { transform: translateY(0); }
  50%      { transform: translateY(-4px); }
}
.ft-line  { background-size: 200% 100%; animation: ft-pan 6s linear infinite; }
.ft-blob  { position: absolute; border-radius: 9999px; filter: blur(70px); pointer-events: none; animation: ft-blob 14s ease-in-out infinite; }
.ft-cta   { background-size: 200% 200%; animation: ft-pan 8s linear infinite; }
.ft-float { animation: ft-float 3s ease-in-out infinite; }
.ft-glass {
  background: linear-gradient(135deg, rgba(255,255,255,.85), rgba(255,255,255,.55));
  border: 1px solid rgba(255,255,255,.9);
  box-shadow: 0 8px 30px rgba(123,44,191,.10), inset 0 1px 0 rgba(255,255,255,.95);
  backdrop-filter: blur(10px);
}
.ft-link { position: relative; display: inline-block; }
.ft-link::after {
  content: '';
  position: absolute; left: 0; bottom: -2px;
  height: 2px; width: 100%;
  background: linear-gradient(90deg, #00C2D1, #7B2CBF, #FF3D9A);
  transform: scaleX(0); transform-origin: left;
  transition: transform .3s ease;
}
.ft-link:hover::after, .ft-link:focus-visible::after { transform: scaleX(1); }
@media (prefers-reduced-motion: reduce) {
  .ft-line, .ft-blob, .ft-cta, .ft-float { animation: none; }
  .ft-link::after { transition: none; }
}
`;

// Trust points shown above the main footer
const PERKS = [
  { icon: FaCircleCheck, title: 'Quality products', text: 'Tech & office essentials you can trust' },
  { icon: FaTruckFast, title: 'Easy ordering', text: 'Shop online, pick up or get it delivered' },
  { icon: FaShieldHalved, title: 'Secure checkout', text: 'Your details stay protected' },
  { icon: FaHeadset, title: 'Friendly support', text: 'We are one message away' },
];

const Footer = () => {
  const socialLinks = [
    { icon: FaFacebookF, url: "https://www.facebook.com/share/1AsYch1TgY/", label: 'Facebook' },
    { icon: FaTwitter, url: "https://x.com/Colltech_?t=jSzzUB5EdP_scsjNpjkSKA&s=08", label: 'X (Twitter)' },
    { icon: FaInstagram, url: "https://www.instagram.com/COLLTECH", label: 'Instagram' },
    { icon: FaYoutube, url: "https://www.tiktok.com/@colltechaccessori?_t=ZM-8yZPmRqhauG&_r=1", label: 'TikTok' }, // Placeholder for TikTok
  ];

  // Newsletter (front-end only for now: connect `handleSubscribe` to your API when ready)
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    // TODO: POST the email to your backend, e.g. fetch(`${API_URL}/api/newsletter`, { method: 'POST', ... })
    setSubscribed(true);
    setEmail('');
  };

  const scrollToTop = () => window.scrollTo({ top: 0, behavior: 'smooth' });

  const linkClass = 'ft-link hover:text-[#7B2CBF] transition break-words';
  const headingClass = 'text-base sm:text-lg font-semibold text-[#00C2D1] mb-3 sm:mb-4 border-b border-gray-200 pb-2';

  return (
    <footer className="relative w-full overflow-hidden bg-gradient-to-b from-white via-gray-50 to-white text-gray-700">
      <style>{FOOTER_CSS}</style>

      {/* Animated brand line on top */}
      <div className="ft-line h-1 bg-gradient-to-r from-[#00C2D1] via-[#7B2CBF] via-[#FF3D9A] via-[#FFB020] to-[#00C2D1]" />

      {/* Soft drifting colour glows */}
      <div aria-hidden className="ft-blob -left-24 top-24 h-56 w-56 sm:h-72 sm:w-72 bg-[#00C2D1]/20" />
      <div aria-hidden className="ft-blob -right-24 bottom-10 h-64 w-64 sm:h-80 sm:w-80 bg-[#7B2CBF]/20" style={{ animationDelay: '-6s' }} />

      <div className="relative z-10">
        {/* Call-to-action band: the two new sections + newsletter */}
        <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 pt-8 sm:pt-12">
          <div className="ft-glass grid gap-6 md:gap-8 rounded-2xl sm:rounded-3xl p-5 sm:p-6 md:p-8 md:grid-cols-2">
            <div className="min-w-0">
              <h2 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-gray-900 leading-tight">
                Shop it. Print it. <span className="text-[#7B2CBF]">Play it.</span>
              </h2>
              <p className="mt-2 max-w-md text-sm text-gray-600">
                Gadgets and office supplies online, cyber services in store, and a PS5 FIFA lounge when you want a break.
              </p>

              {/* Buttons always stay side by side (left / right) on every screen size */}
              <div className="mt-5 flex flex-row flex-nowrap gap-2 sm:gap-3">
                <Link
                  href="/#cyber-services"
                  className="ft-cta flex min-w-0 flex-1 items-center justify-center gap-1.5 sm:gap-2 whitespace-nowrap rounded-full bg-gradient-to-r from-[#FF3D9A] via-[#7B2CBF] to-[#FF3D9A] px-3 sm:px-5 py-2.5 text-xs sm:text-sm font-semibold text-white shadow-lg shadow-[#7B2CBF]/30 transition hover:scale-105 active:scale-95 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#7B2CBF]"
                >
                  <FaPrint className="shrink-0" />
                  <span className="truncate">Print &amp; Cyber</span>
                </Link>
                <Link
                  href="/#gaming-zone"
                  className="ft-cta flex min-w-0 flex-1 items-center justify-center gap-1.5 sm:gap-2 whitespace-nowrap rounded-full bg-gradient-to-r from-[#00C2D1] via-[#3A86FF] to-[#00C2D1] px-3 sm:px-5 py-2.5 text-xs sm:text-sm font-semibold text-white shadow-lg shadow-[#00C2D1]/30 transition hover:scale-105 active:scale-95 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#00C2D1]"
                >
                  <FaPlaystation className="shrink-0" />
                  <span className="truncate">
                    <span className="min-[400px]:hidden">PS5 session</span>
                    <span className="hidden min-[400px]:inline">Book a PS5 session</span>
                  </span>
                </Link>
              </div>
            </div>

            <div className="min-w-0 md:pl-6 md:border-l md:border-gray-200/70">
              <h3 className="text-base sm:text-lg font-semibold text-gray-900">Get offers first</h3>
              <p className="mt-1 text-sm text-gray-600">New arrivals and special deals, straight to your inbox.</p>
              {subscribed ? (
                <p role="status" className="mt-4 flex items-center gap-2 rounded-full bg-[#10B981]/10 px-4 py-3 text-sm font-medium text-[#047857]">
                  <FaCircleCheck className="shrink-0" /> You are on the list. Thank you!
                </p>
              ) : (
                <form onSubmit={handleSubscribe} className="group relative mt-4">
                  <span
                    aria-hidden
                    className="ft-line pointer-events-none absolute -inset-[2px] rounded-full bg-gradient-to-r from-[#00C2D1] via-[#7B2CBF] via-[#FF3D9A] to-[#00C2D1] opacity-0 transition-opacity duration-300 group-focus-within:opacity-100"
                  />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Your email address"
                    aria-label="Email address"
                    className="relative w-full min-w-0 rounded-full border border-gray-300 bg-white py-3 pl-4 sm:pl-5 pr-14 text-sm text-gray-800 outline-none placeholder:text-gray-400 focus:border-transparent"
                  />
                  <button
                    type="submit"
                    aria-label="Subscribe"
                    className="absolute right-1.5 top-1/2 z-10 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-gradient-to-r from-[#00C2D1] to-[#7B2CBF] text-white shadow-md transition hover:scale-110 active:scale-95"
                  >
                    <FaPaperPlane className="text-sm" />
                  </button>
                </form>
              )}
            </div>
          </div>

          {/* Trust strip */}
          <ul className="mt-6 grid grid-cols-1 min-[420px]:grid-cols-2 gap-4 lg:grid-cols-4">
            {PERKS.map(({ icon: Icon, title, text }) => (
              <li key={title} className="flex items-start gap-3 min-w-0">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#00C2D1]/15 to-[#7B2CBF]/15 text-[#7B2CBF]">
                  <Icon />
                </span>
                <span className="min-w-0">
                  <span className="block text-sm font-semibold text-gray-900">{title}</span>
                  <span className="block text-xs text-gray-500">{text}</span>
                </span>
              </li>
            ))}
          </ul>
        </div>

        <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 py-10 sm:py-12 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-6 gap-y-8 sm:gap-10">

          {/* Brand Section */}
          <div className="col-span-2 md:col-span-3 lg:col-span-1 min-w-0">
            <h2 className="bg-gradient-to-r from-[#00C2D1] to-[#7B2CBF] bg-clip-text text-2xl sm:text-3xl font-extrabold text-transparent mb-3 sm:mb-4">COLLTECH</h2>
            <p className="text-sm leading-relaxed text-gray-600 max-w-md">
              Your trusted store for <span className="text-gray-900 font-medium">quality tech & office essentials</span> —
              from earphones & routers to paper reams & Bluetooth speakers.
              Shop smart, shop COLLTECH.
            </p>

            {/* About & Blog Links */}
            <div className="mt-5 sm:mt-6 max-w-md bg-gradient-to-r from-[#00C2D1] via-[#4B3F72] to-[#7B2CBF] p-3 sm:p-4 rounded-xl shadow-md">
              <div className="flex flex-wrap justify-center gap-x-5 sm:gap-x-6 gap-y-2">
                <Link
                  href="/about-us"
                  className="text-sm text-white font-semibold hover:underline hover:text-gray-200 transition"
                >
                  About Us
                </Link>
                <Link
                  href="/blog"
                  className="text-sm text-white font-semibold hover:underline hover:text-gray-200 transition"
                >
                  Blog
                </Link>
                <Link
                  href="/privacy-policy"
                  className="text-sm text-white font-semibold hover:underline hover:text-gray-200 transition"
                >
                  Privacy Policy
                </Link>
              </div>
            </div>

            {/* Social Icons */}
            <div className="flex flex-wrap items-center gap-3 mt-5 sm:mt-6">
              {socialLinks.map(({ icon: Icon, url, label }, i) => (
                <a
                  key={i}
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  className="p-2.5 rounded-full bg-gray-200 text-gray-600 transition relative group hover:-translate-y-1 hover:shadow-lg hover:shadow-[#7B2CBF]/30 focus-visible:outline-2 focus-visible:outline-[#7B2CBF]"
                >
                  <span className="absolute inset-0 rounded-full opacity-0 group-hover:opacity-100 transition duration-300 bg-gradient-to-r from-[#00C2D1] to-[#7B2CBF]"></span>
                  <Icon className="relative z-10 group-hover:text-white transition" />
                </a>
              ))}
            </div>
          </div>

          {/* Shop Links */}
          <div className="min-w-0">
            <h3 className={headingClass}>Shop</h3>
            <ul className="space-y-2 text-sm">
              <li><Link href="/category-product" className={linkClass}>Earphones & AirPods</Link></li>
              <li><Link href="/category-product" className={linkClass}>Bluetooth Speakers</Link></li>
              <li><Link href="/category-product" className={linkClass}>Routers & Modems</Link></li>
              <li><Link href="/category-product" className={linkClass}>Office Supplies</Link></li>
            </ul>
          </div>

          {/* Services (new sections of the site) */}
          <div className="min-w-0">
            <h3 className={headingClass}>Services</h3>
            <ul className="space-y-2 text-sm">
              <li><Link href="/category-service" className={linkClass}>All Services</Link></li>
              <li><Link href="/#cyber-services" className={linkClass}>Printing & Photocopying</Link></li>
              <li>
                <Link href="/#gaming-zone" className={`${linkClass} inline-flex flex-wrap items-center gap-2`}>
                  PS5 FIFA Gaming Lounge
                  <span className="ft-float rounded-full bg-gradient-to-r from-[#FF3D9A] to-[#7B2CBF] px-1.5 py-0.5 text-[10px] font-bold text-white">NEW</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* Customer Care */}
          <div className="col-span-2 md:col-span-1 min-w-0">
            <h3 className={headingClass}>Customer Care</h3>
            <ul className="space-y-2 text-sm grid grid-cols-2 gap-x-6 md:block md:space-y-2">
              <li><Link href="/faq" className={linkClass}>FAQs</Link></li>
              <li><Link href="/support" className={linkClass}>Help & Support</Link></li>
              <li><Link href="/returns" className={linkClass}>Returns & Refunds</Link></li>
              <li><Link href="/contact" className={linkClass}>Contact Us</Link></li>
              <li><Link href="/delete-account" className={linkClass}>Revoke Account</Link></li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-200">
          <div className="mx-auto flex w-full max-w-7xl flex-col items-center justify-between gap-3 px-4 sm:px-6 lg:px-8 py-4 pb-[max(1rem,env(safe-area-inset-bottom))] text-xs sm:text-sm text-gray-500 sm:flex-row">
            <p className="text-center sm:text-left">
              © {new Date().getFullYear()} <span className="text-[#00C2D1] font-medium">COLLTECH</span>. Your Tech & Office Partner. All Rights Reserved.
            </p>
            <button
              type="button"
              onClick={scrollToTop}
              aria-label="Back to top"
              className="group inline-flex shrink-0 items-center gap-2 rounded-full border border-gray-200 bg-white px-4 py-1.5 text-xs font-semibold text-[#7B2CBF] shadow-sm transition hover:border-transparent hover:bg-gradient-to-r hover:from-[#00C2D1] hover:to-[#7B2CBF] hover:text-white hover:shadow-lg"
            >
              Back to top <FaArrowUp className="transition-transform group-hover:-translate-y-0.5" />
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;