"use client";

import React, { useState } from 'react';
import Image from 'next/image';
import loginIcons from '@/public/signin.gif';
import { FaEye, FaEyeSlash } from "react-icons/fa";
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { toast } from 'react-toastify';
import imageTobase64 from '@/helpers/imageTobase64';

const SignUp = () => {
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [data, setData] = useState({
    email: "",
    password: "",
    name: "",
    confirmPassword: "",
    profilePic: "",
  })

  const router = useRouter()

  const handleOnChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setData((prev) => ({
      ...prev,
      [name]: value
    }))
  }

  const handleUploadPic = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files && e.target.files[0]
    if (!file) return;
    const imagePic = await imageTobase64(file)
    setData((prev) => ({
      ...prev,
      profilePic: imagePic as string
    }))
  }

  const isValidEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    const { name, email, password, confirmPassword } = data

    if (!name || !email || !password || !confirmPassword) return toast.error("All fields are required");
    if (!isValidEmail(email)) return toast.error("Invalid email format");
    if (password.length < 8) return toast.error("Password must be at least 8 characters long");
    if (!/[A-Z]/.test(password)) return toast.error("Password must include at least one uppercase letter");
    if (!/[a-z]/.test(password)) return toast.error("Password must include at least one lowercase letter");
    if (!/[0-9]/.test(password)) return toast.error("Password must include at least one number");
    if (!/[\W_]/.test(password)) return toast.error("Password must include at least one special character (e.g. @, #, $, !)");
    if (password !== confirmPassword) return toast.error("Passwords do not match");

    try {
      const response = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
      });

      const resData = await response.json();

      if (resData.success) {
        toast.success(resData.message);
        router.push("/login");
      } else {
        toast.error(resData.message || "Signup failed");
      }
    } catch (error: unknown) {
      const err = error as { message?: string };
      toast.error(err.message || 'An error occurred');
    }
  }

  return (
    <section id='signup' className="min-h-screen flex items-center justify-center bg-gradient-to-b from-black via-gray-900 to-gray-800 text-gray-200">
      <div className='mx-auto container p-4'>
        <div className='bg-gray-900 p-6 rounded-2xl w-full max-w-sm mx-auto shadow-lg'>
          <div className='w-20 h-20 mx-auto relative overflow-hidden rounded-full border-4 border-gray-700'>
            {data.profilePic ? (
              <img src={data.profilePic} alt="Uploaded profile" className='w-full h-full object-cover' />
            ) : (
              <Image src={loginIcons} alt='login icon' className='w-full h-full object-cover' />
            )}
            <form>
              <label>
                <div className='text-xs bg-gray-800 text-gray-300 pb-4 pt-2 cursor-pointer text-center absolute bottom-0 w-full'>
                  Upload Photo
                </div>
                <input type='file' className='hidden' onChange={handleUploadPic} />
              </label>
            </form>
          </div>

          <form className='pt-6 flex flex-col gap-3' onSubmit={handleSubmit}>
            <div className='grid'>
              <label className="mb-1 text-gray-300">Name :</label>
              <div className='bg-gray-800 p-2 rounded'>
                <input
                  type='text'
                  placeholder='Enter your name'
                  name='name'
                  value={data.name}
                  onChange={handleOnChange}
                  required
                  className='w-full h-full outline-none bg-transparent text-gray-100'
                />
              </div>
            </div>

            <div className='grid'>
              <label className="mb-1 text-gray-300">Email :</label>
              <div className='bg-gray-800 p-2 rounded'>
                <input
                  type='email'
                  placeholder='Enter email'
                  name='email'
                  value={data.email}
                  onChange={handleOnChange}
                  required
                  className='w-full h-full outline-none bg-transparent text-gray-100'
                />
              </div>
            </div>

            <div>
              <label className="mb-1 text-gray-300">Password :</label>
              <div className='bg-gray-800 p-2 flex rounded'>
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder='Enter password'
                  name='password'
                  value={data.password}
                  onChange={handleOnChange}
                  required
                  className='w-full h-full outline-none bg-transparent text-gray-100'
                />
                <div className='cursor-pointer text-xl text-gray-400 hover:text-gray-200' onClick={() => setShowPassword(!showPassword)}>
                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                </div>
              </div>
            </div>

            <div>
              <label className="mb-1 text-gray-300">Confirm Password :</label>
              <div className='bg-gray-800 p-2 flex rounded'>
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder='Confirm password'
                  name='confirmPassword'
                  value={data.confirmPassword}
                  onChange={handleOnChange}
                  required
                  className='w-full h-full outline-none bg-transparent text-gray-100'
                />
                <div className='cursor-pointer text-xl text-gray-400 hover:text-gray-200' onClick={() => setShowConfirmPassword(!showConfirmPassword)}>
                  {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                </div>
              </div>
            </div>

            <button className='bg-red-600 hover:bg-red-700 text-white px-6 py-2 w-full max-w-[150px] rounded-full hover:scale-105 transition-all mx-auto block mt-6'>
              Sign Up
            </button>
          </form>

          <p className='my-5 text-center text-gray-400'>
            Already have an account?
            <Link href="/login" className='text-red-500 hover:text-red-400 hover:underline ml-1'>
              Login
            </Link>
          </p>
        </div>
      </div>
    </section>
  )
}

export default SignUp;
