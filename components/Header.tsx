'use client'
import React, { useContext, useState } from 'react';
import { GrSearch } from "react-icons/gr";
import { FaRegCircleUser } from "react-icons/fa6";
import { FaShoppingCart } from "react-icons/fa";
import Link from 'next/link';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { setUserDetails } from '../store/userSlice';
import ROLE from '../common/role';
import Context from '../context';
import { useRouter, useSearchParams } from 'next/navigation';
import { Logo } from './Logo';

const Header = () => {
  interface RootState {
    user: {
      user: {
        id?: string;
        name?: string;
        profilePic?: string;
        role?: string;
      } | null;
    };
  }
  const user = useSelector((state: RootState) => state.user.user);
  const dispatch = useDispatch();
  const [menuDisplay, setMenuDisplay] = useState(false);
  const context = useContext(Context);
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialSearch = searchParams?.get("q") || "";
  const [search, setSearch] = useState(initialSearch);

  const handleLogout = async () => {
    try {
      const fetchData = await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "include",
      });
      const data = await fetchData.json();

      if (data.success) {
        toast.success(data.message);
        dispatch(setUserDetails(null));
        router.push('/');
      } else {
        toast.error(data.message || "Logout failed");
      }
    } catch (error: unknown) {
      const err = error as { message?: string };
      toast.error(err.message || 'An error occurred');
    }
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearch(value);
    if (value) {
      router.push(`/search-product?q=${value}`);
    } else {
      router.push('/search-product');
    }
  };

  return (
    <header className='shadow-md bg-gradient-to-r from-black via-gray-900 to-gray-800 text-gray-300 fixed w-full z-40 border-b border-gray-700'>
      {/* Top Row: Logo + Search (desktop) + Actions */}
      <div className='container mx-auto flex items-center justify-between px-4 h-16'>
        {/* Logo */}
        <Link href="/">
          <Logo width={55} height={55} />
        </Link>

        {/* Search Bar (desktop only) */}
        <div className='hidden lg:flex items-center w-full max-w-md border border-gray-700 rounded-full focus-within:shadow-lg bg-gray-100 pl-3'>
          <input
            type='text'
            placeholder='Search for products...'
            className='w-full outline-none text-gray-700 placeholder-gray-500'
            onChange={handleSearch}
            value={search}
          />
          <div className='text-lg min-w-[50px] h-9 bg-blue-600 flex items-center justify-center rounded-r-full text-white hover:bg-blue-700 transition'>
            <GrSearch />
          </div>
        </div>

        {/* Right Section: Dashboard + Cart + User + Auth */}
        <div className='flex items-center gap-5'>
          {user?.id && (
            <Link
              href="/customer-dashboard"
              className="text-sm font-medium text-blue-400 hover:text-blue-500 transition"
            >
              Dashboard
            </Link>
          )}

          {user?.id && (
            <Link href="/cart" className='text-2xl relative'>
              <span><FaShoppingCart className="text-gray-300 hover:text-blue-500 transition" /></span>
              <div className='bg-red-600 text-white w-5 h-5 rounded-full p-1 flex items-center justify-center absolute -top-2 -right-3 text-xs'>
                {context?.cartProductCount}
              </div>
            </Link>
          )}

          <div className='relative flex justify-center'>
            {user?.id && (
              <div className='text-3xl cursor-pointer relative flex justify-center' onClick={() => setMenuDisplay(prev => !prev)}>
                {user?.profilePic ? (
                  <img src={user?.profilePic} className='w-10 h-10 rounded-full border-2 border-gray-700' alt={user?.name} />
                ) : (
                  <FaRegCircleUser className="text-gray-300 hover:text-blue-500 transition" />
                )}
              </div>
            )}
            {menuDisplay && (
              <div className="absolute bg-gray-900 top-11 right-0 h-fit p-2 shadow-lg rounded-md w-40 border border-gray-700">
                <nav className="flex flex-col space-y-2">
                  {user?.role === ROLE.ADMIN && (
                    <Link
                      href="/admin-panel"
                      className="block px-4 py-2 rounded text-gray-300 hover:bg-blue-600 hover:text-white"
                      onClick={() => setMenuDisplay(prev => !prev)}
                    >
                      Admin Panel
                    </Link>
                  )}
                </nav>
              </div>
            )}
          </div>

          <div>
            {user?.id ? (
              <button onClick={handleLogout} className='px-4 py-1.5 rounded-full text-white bg-blue-600 hover:bg-blue-700 transition shadow'>
                Logout
              </button>
            ) : (
              <Link href="/login" className='px-4 py-1.5 rounded-full text-white bg-blue-600 hover:bg-blue-700 transition shadow'>
                Login
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Search Bar (Mobile only) */}
      <div className='px-4 pb-3 lg:hidden'>
        <div className='flex items-center w-full border border-gray-700 rounded-full focus-within:shadow-lg bg-gray-100 pl-3'>
          <input
            type='text'
            placeholder='Search for products...'
            className='w-full outline-none p-2 text-gray-700 placeholder-gray-500'
            onChange={handleSearch}
            value={search}
          />
          <div className='text-lg min-w-[50px] h-10 bg-blue-600 flex items-center justify-center rounded-r-full text-white hover:bg-blue-700 transition'>
            <GrSearch />
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
