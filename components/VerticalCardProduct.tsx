'use client'

import React, { useEffect, useRef, useState } from 'react'
import fetchCategoryWiseProduct from '../helpers/fetchCategoryWiseProduct'
import displayKESCurrency from '../helpers/displayCurrency'
import { FaAngleLeft, FaAngleRight } from 'react-icons/fa6'
import Link from 'next/link'
import { useCartStore } from '@/store/cart-store'

interface VerticalCardProductProps {
  category: string
  heading: string
}

interface Product {
  _id: string
  slug: string
  productName: string
  category: string
  productImage: string[]
  sellingPrice: number
  price: number
  stock: number
}

const VerticalCardProduct = ({ category, heading }: VerticalCardProductProps) => {
  const [data, setData] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const loadingList = new Array(13).fill(null)
  const scrollElement = useRef<HTMLDivElement>(null)

  // Access cart functions from cart store
  const fetchCart = useCartStore((state) => state.fetchCart)
  const addToCart = useCartStore((state) => state.addToCart)

  const handleAddToCart = async (e: React.MouseEvent<HTMLButtonElement>, id: string) => {
    e.preventDefault()
    await addToCart(id)
    await fetchCart()
  }

  const fetchData = async () => {
    setLoading(true)
    const categoryProduct = await fetchCategoryWiseProduct(category)
    setData(categoryProduct?.data || [])
    setLoading(false)
  }

  useEffect(() => {
    fetchData()
  }, [category])

  const scrollRight = () => scrollElement.current && (scrollElement.current.scrollLeft += 300)
  const scrollLeft = () => scrollElement.current && (scrollElement.current.scrollLeft -= 300)

  return (
    <div className='bg-gradient-to-b from-[#00C2D1] via-[#4B3F72] to-[#7B2CBF] py-8 px-4 my-6 rounded-lg shadow-inner relative'>
      <h2 className='text-2xl font-bold py-4 text-white'>{heading}</h2>

      {/* Scrollable Container */}
      <div
        className='flex items-center gap-4 md:gap-6 overflow-x-scroll scrollbar-none transition-all relative'
        ref={scrollElement}
      >
        {/* Scroll Buttons */}
        <button
          className='bg-gradient-to-r from-[#00C2D1] to-[#7B2CBF] text-white shadow-md rounded-full p-2 absolute left-0 text-lg hidden md:block hover:opacity-90 transition'
          onClick={scrollLeft}
        >
          <FaAngleLeft />
        </button>
        <button
          className='bg-gradient-to-r from-[#00C2D1] to-[#7B2CBF] text-white shadow-md rounded-full p-2 absolute right-0 text-lg hidden md:block hover:opacity-90 transition'
          onClick={scrollRight}
        >
          <FaAngleRight />
        </button>

        {/* Product Cards */}
        {loading
          ? loadingList.map((_, index) => (
              <div
                key={index}
                className='w-full min-w-[280px] md:min-w-[320px] max-w-[280px] md:max-w-[320px] bg-white rounded-md shadow'
              >
                <div className='bg-gray-300 h-48 p-4 flex justify-center items-center animate-pulse rounded-t-md'></div>
                <div className='p-4 grid gap-3'>
                  <div className='h-6 bg-gray-300 rounded-full animate-pulse'></div>
                  <div className='h-4 bg-gray-300 rounded-full animate-pulse'></div>
                  <div className='flex gap-3'>
                    <div className='h-4 w-full bg-gray-300 rounded-full animate-pulse'></div>
                    <div className='h-4 w-full bg-gray-300 rounded-full animate-pulse'></div>
                  </div>
                  <div className='h-8 bg-gray-300 rounded-full animate-pulse'></div>
                </div>
              </div>
            ))
          : data.map((product) => (
              <div
                key={product._id}
                className='w-full min-w-[280px] md:min-w-[320px] max-w-[280px] md:max-w-[320px] bg-white rounded-md shadow hover:shadow-lg hover:border-[#7B2CBF] border border-gray-300 transition'
              >
                <Link
                  href={`/product-details/${product.slug}`}
                  className='bg-gray-50 h-48 p-4 flex justify-center items-center relative rounded-t-md'
                >
                  <img
                    src={product.productImage[0]}
                    className='object-scale-down h-full hover:scale-105 transition-transform duration-300'
                    alt={product?.productName}
                  />
                  {product.stock === 0 && (
                    <span className='absolute top-2 left-2 bg-red-600 text-white text-xs px-2 py-1 rounded'>
                      Out of Stock
                    </span>
                  )}
                </Link>

                <div className='p-4 grid gap-3'>
                  <Link
                    href={`/product-details/${product.slug}`}
                    className='font-semibold text-base md:text-lg text-gray-900 line-clamp-1 hover:text-[#7B2CBF] transition'
                  >
                    {product?.productName}
                  </Link>
                  <p className='capitalize text-gray-500 text-sm'>{product?.category}</p>
                  <div className='flex gap-3'>
                    <p className='text-[#7B2CBF] font-bold text-base'>
                      {displayKESCurrency(product?.sellingPrice)}
                    </p>
                    <p className='text-gray-400 line-through text-sm'>
                      {displayKESCurrency(product?.price)}
                    </p>
                  </div>

                  <div className='flex gap-2'>
                    <button
                      className={`text-sm px-3 py-1 rounded-full font-medium shadow ${
                        product.stock === 0
                          ? 'bg-gray-400 text-white cursor-not-allowed'
                          : 'bg-gradient-to-r from-[#00C2D1] to-[#7B2CBF] hover:opacity-90 text-white transition cursor-pointer'
                      }`}
                      onClick={(e) => product.stock > 0 && handleAddToCart(e, product._id)}
                      disabled={product.stock === 0}
                    >
                      {product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
                    </button>
                    <Link
                      href={`/product-details/${product.slug}`}
                      className='text-sm text-[#7B2CBF] hover:underline px-3 py-1'
                    >
                      See Details
                    </Link>
                  </div>
                </div>
              </div>
            ))}
      </div>
    </div>
  )
}

export default VerticalCardProduct
