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
    <section id='signup' className="min-h-screen flex items-center justify-center bg-gray-50 text-gray-800">
      <div className='mx-auto container p-4'>
        <div className='bg-white p-6 rounded-2xl w-full max-w-sm mx-auto shadow-lg border border-gray-200'>
          <div className='w-20 h-20 mx-auto relative overflow-hidden rounded-full border-4 border-[#00C2D1]'>
            {data.profilePic ? (
              <img src={data.profilePic} alt="Uploaded profile" className='w-full h-full object-cover' />
            ) : (
              <Image src={loginIcons} alt='login icon' className='w-full h-full object-cover' />
            )}
            <form>
              <label>
                <div className='text-xs bg-gradient-to-r from-[#00C2D1] to-[#7B2CBF] text-white pb-4 pt-2 cursor-pointer text-center absolute bottom-0 w-full'>
                  Upload Photo
                </div>
                <input type='file' className='hidden' onChange={handleUploadPic} />
              </label>
            </form>
          </div>

          <form className='pt-6 flex flex-col gap-3' onSubmit={handleSubmit}>
            <div className='grid'>
              <label className="mb-1 text-gray-700">Name :</label>
              <div className='bg-gray-100 p-2 rounded border border-gray-300'>
                <input
                  type='text'
                  placeholder='Enter your name'
                  name='name'
                  value={data.name}
                  onChange={handleOnChange}
                  required
                  className='w-full h-full outline-none bg-transparent text-gray-800'
                />
              </div>
            </div>

            <div className='grid'>
              <label className="mb-1 text-gray-700">Email :</label>
              <div className='bg-gray-100 p-2 rounded border border-gray-300'>
                <input
                  type='email'
                  placeholder='Enter email'
                  name='email'
                  value={data.email}
                  onChange={handleOnChange}
                  required
                  className='w-full h-full outline-none bg-transparent text-gray-800'
                />
              </div>
            </div>

            <div>
              <label className="mb-1 text-gray-700">Password :</label>
              <div className='bg-gray-100 p-2 flex rounded border border-gray-300'>
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder='Enter password'
                  name='password'
                  value={data.password}
                  onChange={handleOnChange}
                  required
                  className='w-full h-full outline-none bg-transparent text-gray-800'
                />
                <div className='cursor-pointer text-xl text-gray-500 hover:text-gray-700' onClick={() => setShowPassword(!showPassword)}>
                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                </div>
              </div>
            </div>

            <div>
              <label className="mb-1 text-gray-700">Confirm Password :</label>
              <div className='bg-gray-100 p-2 flex rounded border border-gray-300'>
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder='Confirm password'
                  name='confirmPassword'
                  value={data.confirmPassword}
                  onChange={handleOnChange}
                  required
                  className='w-full h-full outline-none bg-transparent text-gray-800'
                />
                <div className='cursor-pointer text-xl text-gray-500 hover:text-gray-700' onClick={() => setShowConfirmPassword(!showConfirmPassword)}>
                  {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                </div>
              </div>
            </div>

            <button className='bg-gradient-to-r from-[#00C2D1] to-[#7B2CBF] hover:opacity-90 text-white px-6 py-2 w-full max-w-[150px] rounded-full hover:scale-105 transition-all mx-auto block mt-6 shadow-md cursor-pointer'>
              Sign Up
            </button>
          </form>

          <p className='my-5 text-center text-gray-600'>
            Already have an account?
            <Link href="/login" className='text-[#7B2CBF] hover:underline ml-1'>
              Login
            </Link>
          </p>
        </div>
      </div>
    </section>
  )
}

export default SignUp;
