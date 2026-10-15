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
  const pausedRef = useRef(false)

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

  useEffect(() => {
    if (loading || data.length < 2) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    const id = setInterval(() => {
      const el = scrollElement.current
      if (!el || pausedRef.current) return
      const atEnd = el.scrollLeft + el.clientWidth >= el.scrollWidth - 8
      if (atEnd) el.scrollTo({ left: 0, behavior: 'smooth' })
      else el.scrollBy({ left: Math.max(160, el.clientWidth * 0.9), behavior: 'smooth' })
    }, 4000)

    return () => clearInterval(id)
  }, [loading, data.length])

  const scrollRight = () => {
    const el = scrollElement.current
    el?.scrollBy({ left: Math.max(160, el.clientWidth * 0.9), behavior: 'smooth' })
  }
  const scrollLeft = () => {
    const el = scrollElement.current
    el?.scrollBy({ left: -Math.max(160, el.clientWidth * 0.9), behavior: 'smooth' })
  }

  const pause = () => { pausedRef.current = true }
  const resume = () => { pausedRef.current = false }
  const resumeLater = () => { setTimeout(resume, 4000) }

  // 📱 Fluid card widths (share of the row): Jumia-style density: 4 cards + a peek of the 5th on phones,
  // scaling up to ~11 on very wide monitors, so cards grow with the screen instead of staying tiny.
  const cardSize =
    'basis-[22.5%] min-w-[72px] ' +
    'sm:basis-[18%] ' +
    'md:basis-[14.5%] ' +
    'lg:basis-[12%] ' +
    'xl:basis-[10.5%] ' +
    '2xl:basis-[9%]'
  // Slightly wide image box on phones (keeps cards short), square from 640px up
  const imgSize = 'aspect-[5/4] w-full sm:aspect-square'

  return (
    // 📐 Collapsed vertical spaces down to my-0.5 and py-0.5 on small screens to remove blank gaps entirely
    <section className='relative my-0.5 w-full overflow-hidden rounded-md bg-gradient-to-b from-[#00C2D1] via-[#4B3F72] to-[#7B2CBF] px-1 py-1 shadow-sm sm:my-1 sm:rounded-lg sm:px-2 sm:py-1.5 md:px-3'>
      <div aria-hidden className='pointer-events-none absolute -right-16 -top-16 h-40 w-40 rounded-full bg-[#FF3D9A]/25 blur-3xl' />
      <div aria-hidden className='pointer-events-none absolute -bottom-20 -left-10 h-40 w-40 rounded-full bg-[#3A86FF]/25 blur-3xl' />

      {/* Title block */}
      <div className='relative flex items-center justify-between px-0.5 py-1 sm:py-1.5'>
        <h2 className='text-xs font-bold text-white sm:text-sm md:text-base lg:text-lg'>{heading}</h2>
        {!loading && data.length > 0 && (
          <span className='rounded-full bg-white/20 px-1.5 py-px text-[9px] font-medium text-white backdrop-blur sm:px-2 sm:text-[10px] md:text-xs'>
            {data.length} items
          </span>
        )}
      </div>

      <div
        className='relative'
        onMouseEnter={pause}
        onMouseLeave={resume}
        onFocus={pause}
        onBlur={resume}
        onTouchStart={pause}
        onTouchEnd={resumeLater}
      >
        {/* Navigation arrow adjustments */}
        <button
          type='button'
          aria-label='Scroll left'
          className='absolute left-0 top-1/2 z-10 hidden -translate-y-1/2 rounded-full bg-white p-2 text-sm text-[#7B2CBF] shadow-lg transition hover:scale-105 md:block lg:p-2.5'
          onClick={scrollLeft}
        >
          <FaAngleLeft />
        </button>
        <button
          type='button'
          aria-label='Scroll right'
          className='absolute right-0 top-1/2 z-10 hidden -translate-y-1/2 rounded-full bg-white p-2 text-sm text-[#7B2CBF] shadow-lg transition hover:scale-105 md:block lg:p-2.5'
          onClick={scrollRight}
        >
          <FaAngleRight />
        </button>

        <div
          className='flex snap-x snap-mandatory items-stretch gap-1 overflow-x-auto scrollbar-none py-1 sm:gap-1.5 sm:py-1.5 md:gap-2 lg:gap-2.5'
          ref={scrollElement}
        >
          {loading
            ? loadingList.map((_, index) => (
                <div
                  key={index}
                  className={`${cardSize} shrink-0 overflow-hidden rounded bg-white`}
                >
                  <div className={`animate-pulse bg-gray-100 ${imgSize}`} />
                  <div className='grid gap-1 p-1.5'>
                    <div className='h-2.5 animate-pulse rounded-full bg-gray-100' />
                    <div className='h-2.5 w-2/3 animate-pulse rounded-full bg-gray-100' />
                  </div>
                </div>
              ))
            : data.map((product) => {
                const discount =
                  product.price > product.sellingPrice
                    ? Math.round((1 - product.sellingPrice / product.price) * 100)
                    : 0

                return (
                  <div
                    key={product._id}
                    className={`group flex flex-col ${cardSize} shrink-0 snap-start overflow-hidden rounded-md border border-white/10 bg-white shadow-2xs transition duration-200 hover:border-[#FF3D9A] hover:shadow-md`}
                  >
                    <Link
                      href={`/product-details/${product.slug}`}
                      className={`relative flex items-center justify-center bg-gradient-to-b from-gray-50 to-gray-100 p-1 ${imgSize}`}
                    >
                      <img
                        src={product.productImage[0]}
                        loading='lazy'
                        decoding='async'
                        className='h-full w-full object-contain transition-transform duration-200 group-hover:scale-105'
                        alt={product?.productName}
                      />
                      {product.stock === 0 && (
                        <span className='absolute left-1 top-1 rounded bg-red-600 px-1 py-px text-[8px] text-white sm:text-[9px] md:text-[10px]'>
                          Out
                        </span>
                      )}
                      {product.stock > 0 && discount > 0 && (
                        <span className='absolute right-1 top-1 rounded-full bg-gradient-to-r from-[#FF3D9A] to-[#7B2CBF] px-1 py-px text-[8px] font-bold text-white shadow sm:text-[9px] md:text-[10px]'>
                          -{discount}%
                        </span>
                      )}
                    </Link>

                    <div className='flex flex-1 flex-col justify-between gap-1 p-1 sm:p-2'>
                      <div className='grid gap-0.5'>
                        <Link
                          href={`/product-details/${product.slug}`}
                          className='line-clamp-2 text-[10px] font-semibold leading-tight text-gray-900 transition hover:text-[#7B2CBF] sm:text-xs md:text-[13px] lg:text-sm'
                        >
                          {product?.productName}
                        </Link>
                        <p className='mt-0 hidden line-clamp-1 text-[8px] capitalize text-gray-400 sm:block sm:text-[10px] md:text-xs'>
                          {product?.category}
                        </p>
                        <div className='flex flex-wrap items-baseline gap-x-1'>
                          <p className='text-[11px] font-bold text-[#7B2CBF] sm:text-sm md:text-[15px] lg:text-base'>
                            {displayKESCurrency(product?.sellingPrice)}
                          </p>
                          {discount > 0 && (
                            <p className='text-[8px] text-gray-400 line-through sm:text-[10px] md:text-xs'>
                              {displayKESCurrency(product?.price)}
                            </p>
                          )}
                        </div>
                      </div>

                      {/* 👆 Thumb-sized actions: full-width Add button + readable Details link */}
                      <div className='grid gap-1'>
                        <button
                          type='button'
                          className={`min-h-6 w-full whitespace-nowrap rounded-md px-1 py-0.5 text-[9px] font-semibold sm:min-h-8 sm:px-1.5 sm:py-1 sm:text-xs md:text-[13px] ${
                            product.stock === 0
                              ? 'cursor-not-allowed bg-gray-300 text-white'
                              : 'cursor-pointer bg-gradient-to-r from-[#00C2D1] to-[#7B2CBF] text-white transition hover:opacity-90 active:scale-95'
                          }`}
                          onClick={(e) => product.stock > 0 && handleAddToCart(e, product._id)}
                          disabled={product.stock === 0}
                        >
                          {product.stock === 0 ? 'Sold Out' : 'Add To Cart'}
                        </button>
                        <Link
                          href={`/product-details/${product.slug}`}
                          className='hidden py-0.5 text-center text-[9px] font-medium text-[#7B2CBF] hover:underline sm:block sm:text-[11px] md:text-xs'
                        >
                          Details
                        </Link>
                      </div>
                    </div>
                  </div>
                )
              })}
        </div>
      </div>
    </section>
  )
}

export default VerticalCardProduct