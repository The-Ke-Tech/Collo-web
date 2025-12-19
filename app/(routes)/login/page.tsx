'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import loginIcons from '@/public/signin.gif';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { toast } from 'react-toastify';
import { useAuthStore } from '@/store/auth-store';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

interface LoginFormData {
  identifier: string; // email or phone
  password: string;
}

const Login: React.FC = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [data, setData] = useState<LoginFormData>({
    identifier: '',
    password: '',
  });

  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectPath = searchParams.get('redirect') ?? '/';

  const { setUser, isLoggedIn } = useAuthStore();

  // If already logged in, redirect immediately
  if (isLoggedIn()) {
    router.push(redirectPath);
    return null;
  }

  const handleOnChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  // Normalize Kenyan phone numbers
  const normalizePhone = (phone: string) => {
    let p = phone.replace(/\D/g, '');
    if (p.startsWith('07')) p = '254' + p.substring(1);
    if (p.startsWith('7') && p.length === 9) p = '254' + p;
    return p;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!data.identifier || !data.password) {
      toast.error('Email/Phone and password are required');
      return;
    }

    let identifierToSend = data.identifier;
    const isPhone = /^[0+]?7\d{8}$|^2547\d{8}$/.test(data.identifier);

    if (isPhone) {
      identifierToSend = normalizePhone(data.identifier);
    }

    try {
      const res = await fetch(`${API_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          emailOrPhone: identifierToSend,
          password: data.password,
        }),
      });

      const result = await res.json();

      if (!res.ok) {
        toast.error(result?.message || 'Login failed');
        return;
      }

      if (result.success && result.user && result.token) {
        toast.success(result.message || 'Login successful');

        // Save user + access token
        setUser(result.user, result.token);

        // Redirect
        router.push(redirectPath);
      } else {
        toast.error(result.message || 'Login failed');
      }
    } catch (error) {
      console.error('[Login] error:', error);
      toast.error('Unable to connect to server. Try again later.');
    }
  };

  return (
    <section className="min-h-screen flex items-center justify-center bg-gray-50 text-gray-800">
      <div className="mx-auto container p-4">
        <div className="bg-white p-6 rounded-2xl w-full max-w-sm mx-auto shadow-lg border border-gray-200">
          <div className="w-20 h-20 mx-auto relative">
            <Image src={loginIcons} alt="login icon" fill className="object-contain" />
          </div>

          <form className="pt-6 flex flex-col gap-3" onSubmit={handleSubmit}>
            <div>
              <label className="mb-1 text-gray-700">Email or Phone</label>
              <div className="bg-gray-100 p-2 rounded border border-gray-300">
                <input
                  type="text"
                  name="identifier"
                  value={data.identifier}
                  onChange={handleOnChange}
                  placeholder="Enter email or phone"
                  className="w-full outline-none bg-transparent"
                  required
                />
              </div>
            </div>

            <div>
              <label className="mb-1 text-gray-700">Password</label>
              <div className="bg-gray-100 p-2 flex items-center rounded border border-gray-300">
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={data.password}
                  onChange={handleOnChange}
                  placeholder="Enter password"
                  className="w-full outline-none bg-transparent"
                  required
                />
                <div
                  className="cursor-pointer text-xl ml-2 text-gray-500"
                  onClick={() => setShowPassword(p => !p)}
                >
                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                </div>
              </div>

              <Link
                href="/forgot-password"
                className="block w-fit ml-auto text-sm mt-1 text-[#7B2CBF] hover:underline"
              >
                Forgot password?
              </Link>
            </div>

            <button
              type="submit"
              className="bg-gradient-to-r from-[#00C2D1] to-[#7B2CBF] text-white px-6 py-2 w-full max-w-[150px] rounded-full mx-auto mt-6 hover:opacity-90 transition"
            >
              Login
            </button>
          </form>

          <p className="my-5 text-center text-gray-600">
            Don&apos;t have an account?{' '}
            <Link href="/sign-up" className="text-[#7B2CBF] hover:underline">
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </section>
  );
};

export default Login;
