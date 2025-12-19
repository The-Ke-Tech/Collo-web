'use client';

import { useEffect, useState } from 'react';
import { ToastContainer } from 'react-toastify';
import Header from './Header';
import Footer from './Footer';
import Preloader from './pre-loader';
import { useCartStore } from '@/store/cart-store';
import { useAuthStore } from '@/store/auth-store';
import Chatbot from './chatbot';

export function ClientLayout({ children }: { children: React.ReactNode }) {
  const fetchCart = useCartStore((s) => s.fetchCart);
  const token = useAuthStore((s) => s.token);

  const [chatOpen, setChatOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!token) {
      setIsLoading(false);
      return;
    }

    const init = async () => {
      await fetchCart();
      setIsLoading(false);
    };

    init();
  }, [token, fetchCart]);

  if (isLoading) return <Preloader />;

  return (
    <>
      <ToastContainer position="top-center" />
      <Header />

      <main className="min-h-[calc(100vh-120px)] bg-gray-900 pt-28 lg:pt-16 relative">
        {children}

        {/* Floating Chat Button */}
        {/* Floating Chat Button */}
        {!chatOpen && (
          <button
            onClick={() => setChatOpen(true)}
            className="fixed bottom-12 right-6 w-14 h-14 rounded-full bg-cyan-500 text-black text-3xl flex items-center justify-center shadow-lg z-50
               animate-pulse-spike hover:scale-110 active:scale-95 transition-transform duration-200"
          >
            💬
          </button>
        )}


        {/* Chatbot Modal */}
        {chatOpen && (
          <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
            <div className="relative w-full max-w-md h-[600px] bg-gray-900 rounded-xl shadow-2xl">
              <Chatbot onClose={() => setChatOpen(false)} />

              {/* Close Button */}
              <button
                onClick={() => setChatOpen(false)}
                className="absolute top-4 right-4 text-white text-2xl font-bold"
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
