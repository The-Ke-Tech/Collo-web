'use client'

import React, { useContext, useEffect, useRef, useState } from 'react'
import fetchCategoryWiseProduct from '../helpers/fetchCategoryWiseProduct'
import { FaAngleLeft, FaAngleRight } from 'react-icons/fa6'
import Link from 'next/link'
import addToCart from '../helpers/addToCart'
import Context from '../context'
import displayKESCurrency from '@/helpers/displayCurrency'

interface HorizontalCardProductProps {
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
  stock: number;
}

const HorizontalCardProduct = ({ category, heading }: HorizontalCardProductProps) => {
  const [data, setData] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const loadingList = new Array(13).fill(null)
  const scrollElement = useRef<HTMLDivElement>(null)

  const { fetchUserAddToCart } = useContext(Context)!

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
    if (scrollElement.current) (scrollElement.current as HTMLElement).scrollLeft += 300
  }

  const scrollLeft = () => {
    if (scrollElement.current) (scrollElement.current as HTMLElement).scrollLeft -= 300
  }

  return (
    <div className='container mx-auto px-4 my-6 relative'>
      {/* Heading Section with Gradient */}
      <div className="bg-gradient-to-r from-black via-gray-900 to-gray-800 rounded-t-md px-4 py-3 shadow">
        <h2 className='text-2xl font-bold text-white'>{heading}</h2>
      </div>

      {/* Product List */}
      <div
        className='flex items-center gap-4 md:gap-6 overflow-scroll scrollbar-none transition-all bg-gradient-to-b from-gray-700 via-gray-500 to-gray-700 p-4 rounded-b-md'
        ref={scrollElement}
      >
        {/* Scroll Buttons */}
        <button className='bg-gray-800 shadow-md rounded-full p-2 absolute left-2 text-lg hidden md:block hover:bg-blue-600 transition' onClick={scrollLeft}>
          <FaAngleLeft className="text-white" />
        </button>
        <button className='bg-gray-800 shadow-md rounded-full p-2 absolute right-2 text-lg hidden md:block hover:bg-blue-600 transition' onClick={scrollRight}>
          <FaAngleRight className="text-white" />
        </button>

        {loading
          ? loadingList.map((_, index) => (
              <div key={index} className='w-full min-w-[280px] md:min-w-[320px] max-w-[280px] md:max-w-[320px] h-36 bg-white rounded-md shadow flex'>
                <div className='bg-gray-500 h-full p-4 min-w-[120px] md:min-w-[145px] animate-pulse rounded-l-md' />
                <div className='p-4 grid w-full gap-2'>
                  <div className='h-5 bg-gray-500 animate-pulse rounded-full' />
                  <div className='h-4 bg-gray-500 animate-pulse rounded-full w-1/2' />
                  <div className='flex gap-3 w-full'>
                    <div className='h-4 bg-gray-500 animate-pulse rounded-full w-full' />
                    <div className='h-4 bg-gray-500 animate-pulse rounded-full w-full' />
                  </div>
                  <div className='h-6 bg-gray-500 animate-pulse rounded-full w-full' />
                </div>
              </div>
            ))
          : 
          data.map((product) => (
            <div
              key={product?.id}
              className='w-full min-w-[280px] md:min-w-[320px] max-w-[280px] md:max-w-[320px] h-36 bg-white rounded-md shadow hover:shadow-xl hover:border-blue-500 border border-gray-300 transition flex relative'
            >
              <Link
                href={`/product-details?id=${product.id}`}
                className='bg-gray-50 h-full p-4 min-w-[120px] md:min-w-[145px] relative rounded-l-md'
              >
                <img
                  src={product.productImage[0]}
                  className='object-scale-down h-full hover:scale-105 transition-transform duration-300'
                  alt={product.productName}
                />
                {product.stock === 0 && (
                  <span className="absolute top-2 left-2 bg-red-600 text-white text-xs px-2 py-1 rounded">
                    Out of Stock
                  </span>
                )}
              </Link>

              <div className='p-4 grid'>
                <Link
                  href={`/product-details?id=${product.id}`}
                  className='font-semibold text-base md:text-lg text-gray-900 hover:text-blue-600 transition line-clamp-1'
                >
                  {product?.productName}
                </Link>
                <p className='capitalize text-gray-500 text-sm'>{product?.category}</p>
                <div className='flex gap-3'>
                  <p className='text-blue-700 text-sm font-bold'>{displayKESCurrency(product?.sellingPrice)}</p>
                  <p className='text-gray-400 text-sm line-through'>{displayKESCurrency(product?.price)}</p>
                </div>
                <div className='flex gap-1 mt-1'>
                  <button
                    className={`text-xs px-3 py-0.5 rounded-md ${
                      product.stock === 0
                        ? 'bg-gray-400 text-white cursor-not-allowed'
                        : 'bg-blue-700 hover:bg-blue-800 text-white transition'
                    }`}
                    onClick={(e) => product.stock > 0 && handleAddToCart(e, product?.id)}
                    type='button'
                    disabled={product.stock === 0}
                  >
                    {product.stock === 0 ? 'Unavailable' : 'Add to Cart'}
                  </button>
                  <Link
                    href={`/product-details?id=${product.id}`}
                    className='text-sm text-blue-700 hover:underline px-2 py-0.5'
                  >
                    Details
                  </Link>
                </div>
              </div>
            </div>
          ))
        }
      </div>
    </div>
  )
}

export default HorizontalCardProduct
