'use client' 

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import CANCELIMAGE from '@/public/cancel.gif'; 

const Cancel = () => {
  return (
    <div className='bg-slate-200 w-full max-w-md mx-auto flex justify-center items-center flex-col p-4 m-2 rounded'>
      <Image
        src={CANCELIMAGE}
        width={150}
        height={150}
        alt='Cancel'
        className='mix-blend-multiply'
      />
      <p className='text-red-600 font-bold text-xl'>Payment Cancelled</p>
      <Link
        href="/cart"
        className='p-2 px-3 mt-5 border-2 border-red-600 rounded font-semibold text-red-600 hover:bg-red-600 hover:text-white'
      >
        Go To Cart
      </Link>
    </div>
  );
};

export default Cancel;
