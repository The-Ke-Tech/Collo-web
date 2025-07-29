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
    <header className='shadow-md bg-white fixed w-full z-40'>
      {/* Top Row: Logo + Search (desktop) + Actions */}
      <div className='container mx-auto flex items-center justify-between px-4 h-16'>
        {/* Logo */}
        <Link href="/">
          <Logo width={50} height={50} />
        </Link>

        {/* Search Bar (visible only on lg and up) */}
        <div className='hidden lg:flex items-center w-full max-w-sm border rounded-full focus-within:shadow pl-2'>
          <input
            type='text'
            placeholder='search product here...'
            className='w-full outline-none'
            onChange={handleSearch}
            value={search}
          />
          <div className='text-lg min-w-[50px] h-8 bg-red-600 flex items-center justify-center rounded-r-full text-white'>
            <GrSearch />
          </div>
        </div>

        {/* Right Section: Dashboard + Cart + User + Auth */}
        <div className='flex items-center gap-5'>
          {user?.id && (
            <Link 
              href="/customer-dashboard" 
              className="text-sm font-medium text-blue-600 hover:underline"
            >
              Dashboard
            </Link>
          )}

          {user?.id && (
            <Link href="/cart" className='text-2xl relative'>
              <span><FaShoppingCart /></span>
              <div className='bg-red-600 text-white w-5 h-5 rounded-full p-1 flex items-center justify-center absolute -top-2 -right-3'>
                <p className='text-sm'>{context?.cartProductCount}</p>
              </div>
            </Link>
          )}

          <div className='relative flex justify-center'>
            {user?.id && (
              <div className='text-3xl cursor-pointer relative flex justify-center' onClick={() => setMenuDisplay(prev => !prev)}>
                {user?.profilePic ? (
                  <img src={user?.profilePic} className='w-10 h-10 rounded-full' alt={user?.name} />
                ) : (
                  <FaRegCircleUser />
                )}
              </div>
            )}
            {menuDisplay && (
              <div className='absolute bg-white bottom-0 top-11 h-fit p-2 shadow-lg rounded'>
                <nav>
                  {user?.role === ROLE.ADMIN && (
                    <Link href="/admin-panel" className='whitespace-nowrap hidden md:block hover:bg-slate-100 p-2' onClick={() => setMenuDisplay(prev => !prev)}>
                      Admin Panel
                    </Link>
                  )}
                </nav>
              </div>
            )}
          </div>

          <div>
            {user?.id ? (
              <button onClick={handleLogout} className='px-3 py-1 rounded-full text-white bg-red-600 hover:bg-red-700'>Logout</button>
            ) : (
              <Link href="/login" className='px-3 py-1 rounded-full text-white bg-red-600 hover:bg-red-700'>Login</Link>
            )}
          </div>
        </div>
      </div>

      {/* Search Bar (Mobile only) */}
      <div className='px-4 pb-3 lg:hidden'>
        <div className='flex items-center w-full border rounded-full focus-within:shadow pl-2'>
          <input
            type='text'
            placeholder='search product here...'
            className='w-full outline-none p-2'
            onChange={handleSearch}
            value={search}
          />
          <div className='text-lg min-w-[50px] h-10 bg-red-600 flex items-center justify-center rounded-r-full text-white'>
            <GrSearch />
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
