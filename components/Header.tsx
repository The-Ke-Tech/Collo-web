'use client';

import React, { useState, useEffect } from 'react';
import { GrSearch } from "react-icons/gr";
import { FaRegCircleUser } from "react-icons/fa6";
import { FaShoppingCart } from "react-icons/fa";
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
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

const Header = () => {
  const { user, logout } = useAuthStore();
  const { count: cartProductCount, fetchCart } = useCartStore();
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialSearch = searchParams?.get("q") || "";
  const [search, setSearch] = useState(initialSearch);
  const [results, setResults] = useState<SearchItem[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user?.id) fetchCart();
  }, [user?.id, fetchCart]);

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
    router.push('/');
  };

  return (
    <header className="shadow-md bg-white fixed w-full z-40 border-b border-gray-200">
      <div className="container mx-auto flex items-center justify-between px-4 h-16">
        <Link href="/"><Logo width={55} height={55} /></Link>

        {/* Search */}
        <div className="relative w-full max-w-md hidden lg:block rounded-full">
          <input
            type="text"
            placeholder="Search products or services..."
            className="w-full rounded-full pl-4 pr-10 py-2 text-amber-900 border border-gray-300 outline-none focus:ring-2 focus:ring-[#00C2D1]"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <GrSearch className="absolute right-3 top-2 text-gray-500 text-lg" />

          {/* Dropdown */}
          {search && (
            <div className="absolute top-full left-0 w-full bg-white shadow-lg rounded-b-md max-h-80 overflow-y-auto z-50">
              {loading ? (
                <p className="p-3 text-gray-500">Searching...</p>
              ) : results.length ? (
                results.map(item => (
                  <Link
                    key={item._id}
                    href={item.type === "service" ? `/service-details/${item.slug}` : `/product/${item.slug}`}
                    className="block px-4 py-2 hover:bg-gray-100 text-gray-800"
                    onClick={() => setSearch('')}
                  >
                    <span className="font-medium">{item.name}</span> <span className="text-sm text-gray-500">({item.type}{item.category ? `, ${item.category}` : ''})</span>
                  </Link>
                ))
              ) : (
                <p className="p-3 text-gray-500">No results found</p>
              )}
            </div>
          )}
        </div>

        {/* Right Section */}
        <div className="flex items-center gap-5">
          {user?.id ? (
            <>
              <Link href="/customer-dashboard" className="text-sm font-medium text-[#00C2D1] hover:text-[#7B2CBF] transition">Dashboard</Link>
              <Link href="/cart" className="text-2xl relative">
                <FaShoppingCart className="text-gray-600 hover:text-[#7B2CBF] transition" />
                {cartProductCount > 0 && (
                  <div className="bg-[#7B2CBF] text-white w-5 h-5 rounded-full p-1 flex items-center justify-center absolute -top-2 -right-3 text-xs">
                    {cartProductCount}
                  </div>
                )}
              </Link>
              <Link href="/profile" className="text-gray-600 hover:text-[#7B2CBF] transition text-3xl cursor-pointer">
                <FaRegCircleUser />
              </Link>
              <button onClick={handleLogout} className="px-4 py-1.5 rounded-full text-white bg-gradient-to-r from-[#00C2D1] to-[#7B2CBF] hover:opacity-90 transition shadow cursor-pointer">Logout</button>
            </>
          ) : (
            <Link href="/login" className="px-4 py-1.5 rounded-full text-white bg-gradient-to-r from-[#00C2D1] to-[#7B2CBF] hover:opacity-90 transition shadow cursor-pointer">Login</Link>
          )}
        </div>
      </div>

      {/* Mobile Search */}
      <div className="px-4 pb-3 lg:hidden relative text-[#00C2D1]">
        <input
          type="text"
          placeholder="Search products or services..."
          className="w-full rounded-full pl-4 pr-10 py-2 border border-gray-300 outline-none focus:ring-2 focus:ring-[#00C2D1]"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <GrSearch className="absolute right-3 top-2 text-gray-500 text-lg" />

        {search && (
          <div className="absolute top-full left-0 w-full bg-white shadow-lg rounded-b-md max-h-80 overflow-y-auto z-50">
            {loading ? (
              <p className="p-3 text-gray-500">Searching...</p>
            ) : results.length ? (
              results.map(item => (
                <Link
                  key={item._id}
                  href={item.type === "service" ? `/service-details/${item.slug}` : `/product-details/${item.slug}`}
                  className="block px-4 py-2 hover:bg-gray-100 text-gray-800"
                  onClick={() => setSearch('')}
                >
                  <span className="font-medium">{item.name}</span> <span className="text-sm text-gray-500">({item.type}{item.category ? `, ${item.category}` : ''})</span>
                </Link>
              ))
            ) : (
              <p className="p-3 text-gray-500">No results found</p>
            )}
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
