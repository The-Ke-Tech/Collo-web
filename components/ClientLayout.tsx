'use client';

import { useEffect, useRef, useState } from 'react';
import { ToastContainer } from 'react-toastify';
import Header from './Header';
import Footer from './Footer';
import Preloader from './pre-loader';
import { useCartStore } from '@/store/cart-store';
import { useAuthStore } from '@/store/auth-store';
import Chatbot from './chatbot';
import NetworkGuard from './network-guard';
import ServiceWorkerRegister from './service-worker-register';


export function ClientLayout({ children }: { children: React.ReactNode }) {
  const fetchCart = useCartStore((s) => s.fetchCart);
  const token = useAuthStore((s) => s.token);

  const [chatOpen, setChatOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // 📏 Wrapper around the fixed header so we can measure its real height
  const headerWrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!token) {
      setIsLoading(false);
      return;
    }

    // ⚡ Show the site straight away; the cart loads in the background instead of blocking the whole page
    setIsLoading(false);
    const init = async () => {
      try {
        await fetchCart();
      } catch {
        // cart errors should never block the storefront
      }
    };

    init();
  }, [token, fetchCart]);

  // 📏 Publishes the header's real height as --header-h (used for page padding,
  // sticky bars and anchor scrolling). The header is taller on phones (logo row +
  // search row) than on desktop, so a fixed number of pixels never fits both.
  useEffect(() => {
    const wrap = headerWrapRef.current;
    if (!wrap) return;

    let ro: ResizeObserver | null = null;

    const apply = () => {
      const el = wrap.firstElementChild as HTMLElement | null;
      if (!el) return;
      const h = el.offsetHeight;
      // ignore the tiny Suspense placeholder (64px) shown before the real header mounts
      if (h <= 64) return;
      document.documentElement.style.setProperty('--header-h', `${h}px`);
    };

    const attach = () => {
      ro?.disconnect();
      const el = wrap.firstElementChild;
      if (el) {
        ro = new ResizeObserver(apply);
        ro.observe(el);
      }
      apply();
    };

    attach();
    // the Suspense placeholder gets swapped for the real header, so re-attach when that happens
    const mo = new MutationObserver(attach);
    mo.observe(wrap, { childList: true });

    return () => {
      ro?.disconnect();
      mo.disconnect();
    };
  }, [isLoading]);

  if (isLoading) return <Preloader />;

  return (
    <>
      <ToastContainer position="top-center" />
      {/* Sends visitors to /network-error when they go offline or a request fails unhandled */}
      <NetworkGuard />
      {/* Lets the browser show our branded offline screen when there is no internet (production only) */}
      <ServiceWorkerRegister />
      <div ref={headerWrapRef}>
        <Header />
      </div>

      {/* 📐 Compressed layout vertical safe buffers from pt-32 down to modern compact parameters */}
      {/* 🧭 Padding now follows the header's measured height (+12px breathing room) on every screen size.
          Fallbacks (used before measuring): ~132px on phones/tablets, ~76px on desktop.
          Previously: pt-24 lg:pt-[56px] — too short for the two-row mobile header. */}
      <main className="relative min-h-[calc(100vh-120px)] overflow-x-hidden bg-gray-900 pt-[calc(var(--header-h,132px)_+_12px)] lg:pt-[calc(var(--header-h,76px)_+_12px)]">
        {children}

        {/* Floating Chat Button */}
        {!chatOpen && (
          <button
            onClick={() => setChatOpen(true)}
            aria-label="Open chat"
            className="fixed bottom-12 right-4 z-50 flex h-12 w-12 items-center justify-center rounded-full
               bg-gradient-to-br from-[#00C2D1] to-[#7B2CBF] text-2xl text-white shadow-lg shadow-[#7B2CBF]/40
               animate-pulse-spike transition-transform duration-200 hover:scale-110 active:scale-95
               sm:right-6 sm:h-14 sm:w-14 sm:text-3xl"
          >
            💬
          </button>
        )}

        {/* Chatbot Modal */}
        {chatOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-2 backdrop-blur-sm sm:p-4">
            <div className="relative h-[600px] max-h-full w-full max-w-md overflow-hidden rounded-2xl border border-white/10 bg-gray-900 shadow-2xl">
              <Chatbot onClose={() => setChatOpen(false)} />

              {/* Close Button */}
              <button
                onClick={() => setChatOpen(false)}
                aria-label="Close chat"
                className="absolute right-4 top-4 text-2xl font-bold text-white transition hover:scale-110"
              >
                ✕
              </button>
            </div>
          </div>
        )}
      </main>

      <Footer />
    </>
  );
}