'use client';

import { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { setUserDetails } from '@/store/userSlice';
import Header from './Header';
import Footer from './Footer';
import Context from '@/context';
import Preloader from './pre-loader';

export function ClientLayout({ children }: { children: React.ReactNode }) {
  const dispatch = useDispatch();
  const [cartProductCount, setCartProductCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  const fetchUserDetails = async () => {
    try {
      const res = await fetch('/api/current-user', { method: 'GET', credentials: 'include' });
      const data = await res.json();
      if (data.success) dispatch(setUserDetails(data.data));
    } catch (error) {
      console.error('Error fetching user:', error);
    }
  };

  const fetchUserAddToCart = async () => {
    try {
      const res = await fetch('/api/cart/count', { method: 'GET', credentials: 'include' });
      const data = await res.json();
      setCartProductCount(data?.data?.count || 0);
    } catch (error) {
      console.error('Error fetching cart count:', error);
    }
  };

  useEffect(() => {
    const init = async () => {
      await fetchUserDetails();
      await fetchUserAddToCart();
      setTimeout(() => setIsLoading(false), 400); 
    };
    init();
  }, []);

  if (isLoading) return <Preloader />;

  return (
    <Context.Provider value={{ fetchUserDetails, cartProductCount, fetchUserAddToCart }}>
      <ToastContainer position="top-center" />
      <Header />
      <main className="min-h-[calc(100vh-120px)] pt-28 lg:pt-16">
  {children}
</main>
      <Footer />
    </Context.Provider>
  );
}
