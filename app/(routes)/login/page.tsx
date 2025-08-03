'use client';
import React, { useContext, useState, useEffect } from 'react';
import Image from 'next/image';
import loginIcons from '@/public/signin.gif';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { toast } from 'react-toastify';
import Context from '@/context';

interface LoginFormData { email: string; password: string; }
interface LoginResponse { success: boolean; message: string; user?: { id: string; name: string; email: string; role?: string }; }

const Login: React.FC = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [data, setData] = useState<LoginFormData>({ email: '', password: '' });
  const router = useRouter();
  const { fetchUserDetails, fetchUserAddToCart } = useContext(Context) as { fetchUserDetails: () => void; fetchUserAddToCart: () => void; };

  const handleOnChange = (e: React.ChangeEvent<HTMLInputElement>) => setData(prev => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!data.email || !data.password) { toast.error('Email and password are required'); return; }

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST', credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      const result: LoginResponse = await response.json();

      if (!response.ok) { toast.error(result.message || 'Login failed'); return; }
      if (result.success) {
        toast.success(result.message);
        fetchUserDetails();
        fetchUserAddToCart();
        router.push('/');
      } else {
        toast.error(result.message || 'Login failed');
      }
    } catch (error) {
      console.error("Login error:", error);
      toast.error('Unable to connect to server. Try again later.');
    }
  };

  useEffect(() => {
    const refreshToken = async () => {
      await fetch('/api/auth/refresh-token', { method: 'POST', credentials: 'include' });
    };
    refreshToken();
  }, []);

  return (
    <section id="login" className="min-h-screen flex items-center justify-center bg-gray-50 text-gray-800">
      <div className="mx-auto container p-4">
        <div className="bg-white p-6 rounded-2xl w-full max-w-sm mx-auto shadow-lg border border-gray-200">
          <div className="w-20 h-20 mx-auto relative">
            <Image src={loginIcons} alt="login icon" fill className="object-contain" />
          </div>
          <form className="pt-6 flex flex-col gap-3" onSubmit={handleSubmit}>
            <div className="grid">
              <label className="mb-1 text-gray-700">Email:</label>
              <div className="bg-gray-100 p-2 rounded border border-gray-300">
                <input type="email" name="email" value={data.email} onChange={handleOnChange} placeholder="Enter email" className="w-full outline-none bg-transparent text-gray-800" required />
              </div>
            </div>
            <div>
              <label className="mb-1 text-gray-700">Password:</label>
              <div className="bg-gray-100 p-2 flex items-center rounded border border-gray-300">
                <input type={showPassword ? 'text' : 'password'} name="password" value={data.password} onChange={handleOnChange} placeholder="Enter password" className="w-full outline-none bg-transparent text-gray-800" required />
                <div className="cursor-pointer text-xl ml-2 text-gray-500 hover:text-gray-700" onClick={() => setShowPassword(p => !p)}>
                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                </div>
              </div>
              <Link href="/forgot-password" className="block w-fit ml-auto text-sm mt-1 text-[#7B2CBF] hover:underline">Forgot password?</Link>
            </div>
            <button 
              type="submit" 
              className="bg-gradient-to-r from-[#00C2D1] to-[#7B2CBF] hover:opacity-90 text-white px-6 py-2 w-full max-w-[150px] rounded-full hover:scale-105 transition-all mx-auto block mt-6 shadow-md cursor-pointer">
              Login
            </button>
          </form>
          <p className="my-5 text-center text-gray-600">
            Don&apos;t have an account? <Link href="/sign-up" className="text-[#7B2CBF] hover:underline">Sign up</Link>
          </p>
        </div>
      </div>
    </section>
  );
};

export default Login;
