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
  slug: string;
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
      {/* Heading Section */}
      <div className="bg-gradient-to-r from-[#00C2D1] to-[#7B2CBF] rounded-t-md px-4 py-3 shadow">
        <h2 className='text-2xl font-bold text-white'>{heading}</h2>
      </div>

      {/* Product List */}
      <div
        className='flex items-start gap-4 md:gap-6 overflow-x-auto scrollbar-none transition-all bg-white p-4 rounded-b-md border border-gray-200'
        ref={scrollElement}
      >
        {/* Scroll Buttons */}
        <button className='bg-gradient-to-r from-[#00C2D1] to-[#7B2CBF] shadow-md rounded-full p-2 absolute left-2 text-lg hidden md:block hover:opacity-90 transition' onClick={scrollLeft}>
          <FaAngleLeft className="text-white" />
        </button>
        <button className='bg-gradient-to-r from-[#00C2D1] to-[#7B2CBF] shadow-md rounded-full p-2 absolute right-2 text-lg hidden md:block hover:opacity-90 transition' onClick={scrollRight}>
          <FaAngleRight className="text-white" />
        </button>

        {loading
          ? loadingList.map((_, index) => (
              <div key={index} className='w-full min-w-[250px] md:min-w-[300px] max-w-[320px] h-40 bg-gray-100 rounded-md shadow flex flex-col'>
                <div className='bg-gray-300 h-24 w-full animate-pulse rounded-t-md' />
                <div className='p-3 space-y-2'>
                  <div className='h-5 bg-gray-300 animate-pulse rounded-full' />
                  <div className='h-4 bg-gray-300 animate-pulse rounded-full w-1/2' />
                  <div className='h-4 bg-gray-300 animate-pulse rounded-full w-1/3' />
                </div>
              </div>
            ))
          : 
          data.map((product) => (
            <div
              key={product?.id}
              className='w-full min-w-[250px] md:min-w-[300px] max-w-[320px] bg-white rounded-md shadow hover:shadow-lg hover:border-[#7B2CBF] border border-gray-300 transition flex flex-col relative'
            >
              {/* Image */}
              <Link
                href={`/product-details/${product?.slug}`}
                className='flex-shrink-0 w-full h-40 md:h-48 overflow-hidden flex items-center justify-center bg-gray-50'
              >
                <img
                  src={product.productImage[0]}
                  className='object-contain h-full w-full hover:scale-105 transition-transform duration-300'
                  alt={product.productName}
                />
                {product.stock === 0 && (
                  <span className="absolute top-2 left-2 bg-red-600 text-white text-xs px-2 py-1 rounded">
                    Out of Stock
                  </span>
                )}
              </Link>

              {/* Content */}
              <div className='p-3 md:p-4 flex flex-col justify-between flex-1'>
                <div>
                  <Link
                    href={`/product-details/${product?.slug}`}
                    className='font-semibold text-sm md:text-base text-gray-800 hover:text-[#7B2CBF] transition block break-words'
                  >
                    {product?.productName}
                  </Link>
                  <p className='capitalize text-gray-500 text-xs md:text-sm mt-1'>{product?.category}</p>
                  <div className='flex gap-3 mt-2 flex-wrap'>
                    <p className='text-[#7B2CBF] text-sm font-bold'>{displayKESCurrency(product?.sellingPrice)}</p>
                    <p className='text-gray-400 text-xs md:text-sm line-through'>{displayKESCurrency(product?.price)}</p>
                  </div>
                </div>

                {/* Actions */}
                <div className='flex gap-2 mt-3 flex-wrap'>
                  <button
                    className={`text-xs md:text-sm px-3 py-1 rounded-md ${
                      product.stock === 0
                        ? 'bg-gray-400 text-white cursor-not-allowed'
                        : 'bg-gradient-to-r from-[#00C2D1] to-[#7B2CBF] hover:opacity-90 text-white transition cursor-pointer'
                    }`}
                    onClick={(e) => product.stock > 0 && handleAddToCart(e, product?.id)}
                    type='button'
                    disabled={product.stock === 0}
                  >
                    {product.stock === 0 ? 'Unavailable' : 'Add to Cart'}
                  </button>
                  <Link
                    href={`/product-details/${product?.slug}`}
                    className='text-xs md:text-sm text-[#7B2CBF] hover:underline px-2 py-1'
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
