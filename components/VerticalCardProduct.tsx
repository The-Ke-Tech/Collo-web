'use client'

import React, { useContext, useEffect, useRef, useState } from 'react'
import fetchCategoryWiseProduct from '../helpers/fetchCategoryWiseProduct'
import displayKESCurrency from '../helpers/displayCurrency'
import { FaAngleLeft, FaAngleRight } from 'react-icons/fa6'
import Link from 'next/link'
import addToCart from '../helpers/addToCart'
import Context from '../context'

interface VerticalCardProductProps {
  category: string;
  heading: string;
}

interface Product {
  id: string;
  productName: string;
  category: string;
  productImage: string[];
  sellingPrice: number;
  price: number;
  stock: number; // Added stock
}

const VerticalCardProduct = ({ category, heading }: VerticalCardProductProps) => {
  const [data, setData] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const loadingList = new Array(13).fill(null)

  const scrollElement = useRef<HTMLDivElement>(null)
  const { fetchUserAddToCart } = useContext(Context)

  const handleAddToCart = async (e: React.MouseEvent<HTMLButtonElement>, id: string) => {
    await addToCart(e, id)
    fetchUserAddToCart()
  }

  const fetchData = async () => {
    setLoading(true)
    const categoryProduct = await fetchCategoryWiseProduct(category)
    setData(categoryProduct?.data || [])
    setLoading(false)
  }

  useEffect(() => {
    fetchData()
  }, [])

  const scrollRight = () => {
    scrollElement.current && (scrollElement.current.scrollLeft += 300)
  }

  const scrollLeft = () => {
    scrollElement.current && (scrollElement.current.scrollLeft -= 300)
  }

  return (
    <div className='container mx-auto px-4 my-6 relative'>
      <h2 className='text-2xl font-semibold py-4'>{heading}</h2>

      <div
        className='flex items-center gap-4 md:gap-6 overflow-x-scroll scrollbar-none transition-all'
        ref={scrollElement}
      >
        <button
          className='bg-white shadow-md rounded-full p-1 absolute left-0 text-lg hidden md:block'
          onClick={scrollLeft}
        >
          <FaAngleLeft />
        </button>
        <button
          className='bg-white shadow-md rounded-full p-1 absolute right-0 text-lg hidden md:block'
          onClick={scrollRight}
        >
          <FaAngleRight />
        </button>

        {loading ? (
          loadingList.map((_, index) => (
            <div
              className='w-full min-w-[280px] md:min-w-[320px] max-w-[280px] md:max-w-[320px] bg-white rounded-sm shadow'
              key={index}
            >
              <div className='bg-slate-200 h-48 p-4 flex justify-center items-center animate-pulse'></div>
              <div className='p-4 grid gap-3'>
                <div className='h-6 bg-slate-200 rounded-full animate-pulse'></div>
                <div className='h-4 bg-slate-200 rounded-full animate-pulse'></div>
                <div className='flex gap-3'>
                  <div className='h-4 w-full bg-slate-200 rounded-full animate-pulse'></div>
                  <div className='h-4 w-full bg-slate-200 rounded-full animate-pulse'></div>
                </div>
                <div className='h-8 bg-slate-200 rounded-full animate-pulse'></div>
              </div>
            </div>
          ))
        ) : (
          data.map((product) => (
            <div
              key={product.id}
              className='w-full min-w-[280px] md:min-w-[320px] max-w-[280px] md:max-w-[320px] bg-white rounded-sm shadow'
            >
              <Link
                href={`/product-details?id=${product.id}`}
                className='bg-slate-200 h-48 p-4 flex justify-center items-center relative'
              >
                <img
                  src={product.productImage[0]}
                  className='object-scale-down h-full hover:scale-110 transition-all mix-blend-multiply'
                  alt={product?.productName}
                />
                {product.stock === 0 && (
                  <span className="absolute top-2 left-2 bg-red-600 text-white text-xs px-2 py-1 rounded">
                    Out of Stock
                  </span>
                )}
              </Link>

              <div className='p-4 grid gap-3'>
                <Link
                  href={`/product-details?id=${product.id}`}
                  className='font-medium text-base md:text-lg text-ellipsis line-clamp-1 text-black hover:underline'
                >
                  {product?.productName}
                </Link>
                <p className='capitalize text-slate-500'>{product?.category}</p>
                <div className='flex gap-3'>
                  <p className='text-red-600 font-medium'>
                    {displayKESCurrency(product?.sellingPrice)}
                  </p>
                  <p className='text-slate-500 line-through'>
                    {displayKESCurrency(product?.price)}
                  </p>
                </div>

                <div className='flex gap-2'>
                  <button
                    className={`text-sm px-3 py-0.5 rounded-full ${
                      product.stock === 0
                        ? 'bg-gray-400 text-white cursor-not-allowed'
                        : 'bg-red-600 hover:bg-red-700 text-white'
                    }`}
                    onClick={(e) => product.stock > 0 && handleAddToCart(e, product.id)}
                    disabled={product.stock === 0}
                  >
                    {product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
                  </button>
                  <Link
                    href={`/product-details?id=${product.id}`}
                    className='text-sm text-blue-600 hover:underline px-3 py-0.5'
                  >
                    See Details
                  </Link>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}

export default VerticalCardProduct
