'use client'

import React from 'react'
import scrollTop from '../helpers/scrollTop'
import displayKESCurrency from '../helpers/displayCurrency'
import Link from 'next/link'
import { Product } from '@/helpers/product-types'
import { useCartStore } from '@/store/cart-store'

interface VerticalCardProps {
  data: Product[]
  loading: boolean
}

const VerticalCard: React.FC<VerticalCardProps> = ({ loading, data }) => {
  const loadingList = new Array(13).fill(null)

  // Get cart functions from cart store
  const fetchCart = useCartStore((state) => state.fetchCart)
  const addToCart = useCartStore((state) => state.addToCart)

  const handleAddToCart = async (e: React.MouseEvent, id: string) => {
    e.preventDefault()
    await addToCart(id)
    await fetchCart() // refresh cart count from backend
  }

  // 📱 Auto-fitting grid: as many columns as fit, each at least a readable width, and every column
  // stretches to share the leftover space. 4 cols on phones (Jumia-style), up to 8+ on big monitors, no breakpoints to maintain.
  const gridCols =
    'grid-cols-4 ' +
    'sm:grid-cols-[repeat(auto-fill,minmax(130px,1fr))] ' +
    'md:grid-cols-[repeat(auto-fill,minmax(150px,1fr))] ' +
    'xl:grid-cols-[repeat(auto-fill,minmax(170px,1fr))]'

  return (
    <div className="rounded-lg bg-gradient-to-b from-[#00C2D1] via-[#4B3F72] to-[#7B2CBF] p-1.5 sm:p-3 md:p-4 lg:p-5">
      <div className={`grid ${gridCols} gap-1.5 sm:gap-3 md:gap-4 xl:gap-5`}>
        {loading
          ? loadingList.map((_, index) => (
              <div
                key={index}
                className="animate-pulse overflow-hidden rounded-lg border border-gray-200 bg-white shadow-md sm:rounded-xl"
              >
                <div className="aspect-[5/4] rounded-t-lg bg-gray-300 sm:aspect-square" />
                <div className="grid gap-1.5 p-1.5 sm:gap-2 sm:p-2.5 md:gap-2.5 md:p-3">
                  <div className="h-3 rounded bg-gray-300 sm:h-4 md:h-5" />
                  <div className="h-2.5 rounded bg-gray-300 sm:h-3 md:h-4" />
                  <div className="flex gap-1.5 sm:gap-2 md:gap-3">
                    <div className="h-2.5 w-1/2 rounded bg-gray-300 sm:h-3 md:h-4" />
                    <div className="h-2.5 w-1/2 rounded bg-gray-300 sm:h-3 md:h-4" />
                  </div>
                  <div className="h-7 rounded bg-gray-300 sm:h-8 md:h-9" />
                </div>
              </div>
            ))
          : data.map((product) => (
              <div
                key={product._id}
                className="flex flex-col overflow-hidden rounded-lg border border-gray-200 bg-white shadow-md transition-all duration-300 hover:border-[#7B2CBF] hover:shadow-lg sm:rounded-xl"
              >
                <Link
                  href={`/product-details/${product.slug}`}
                  onClick={scrollTop}
                  className="relative flex aspect-[5/4] items-center justify-center overflow-hidden rounded-t-lg bg-gray-50 p-1 sm:aspect-square sm:p-2 md:p-2.5 lg:p-3"
                >
                  <img
                    src={product.productImage[0]}
                    loading="lazy"
                    decoding="async"
                    alt={product.productName}
                    className="h-full max-w-full object-contain transition-transform duration-300 hover:scale-105"
                  />
                  {product.stock === 0 && (
                    <span className="absolute left-1 top-1 rounded bg-red-600 px-1 py-0.5 text-[8px] text-white sm:left-2 sm:top-2 sm:px-2 sm:py-1 sm:text-[10px] md:text-xs">
                      Out
                    </span>
                  )}
                </Link>
                <div className="flex flex-1 flex-col justify-between p-1.5 sm:p-2 md:p-2.5 lg:p-3">
                  <div>
                    <Link
                      href={`/product-details/${product.slug}`}
                      onClick={scrollTop}
                      className="line-clamp-2 text-[11px] font-semibold leading-tight text-gray-900 transition hover:text-[#7B2CBF] sm:text-xs md:text-sm lg:text-[15px] xl:text-base"
                    >
                      {product.productName}
                    </Link>
                    <p className="hidden line-clamp-1 text-[9px] capitalize text-gray-500 sm:block sm:text-[11px] md:text-xs">
                      {product.category}
                    </p>
                    <div className="mt-0.5 flex flex-wrap items-baseline gap-1 sm:mt-1 sm:gap-1.5 md:mt-1.5 md:gap-2">
                      <p className="text-xs font-bold text-[#7B2CBF] sm:text-sm md:text-base">
                        {displayKESCurrency(product.sellingPrice)}
                      </p>
                      <p className="text-[9px] text-gray-400 line-through sm:text-[11px] md:text-xs">
                        {displayKESCurrency(product.price)}
                      </p>
                    </div>
                  </div>
                  {/* 👆 Add button is always full width and thumb-sized; Details wraps under it on tight cards */}
                  <div className="mt-1.5 flex flex-wrap items-center gap-1 sm:mt-2 sm:gap-1.5 md:mt-3 md:gap-2">
                    <button
                      className={`min-h-6 w-full whitespace-nowrap rounded-md px-1 py-0.5 text-[9px] sm:min-h-8 font-semibold shadow sm:px-2 sm:py-1.5 sm:text-[11px] md:px-3 md:py-1.5 md:text-xs ${
                        product.stock === 0
                          ? 'cursor-not-allowed bg-gray-400 text-white'
                          : 'bg-gradient-to-r from-[#00C2D1] to-[#7B2CBF] text-white transition hover:opacity-90 active:scale-95'
                      }`}
                      onClick={(e) => product.stock > 0 && handleAddToCart(e, product._id)}
                      disabled={product.stock === 0}
                    >
                      {product.stock === 0 ? 'Sold Out' : 'Add To Cart'}
                    </button>
                    <Link
                      href={`/product-details/${product.slug}`}
                      onClick={scrollTop}
                      className="hidden w-full py-0.5 text-center text-[10px] text-[#7B2CBF] hover:underline sm:block sm:text-[11px] md:text-xs"
                    >
                      Details
                    </Link>
                  </div>
                </div>
              </div>
            ))}
      </div>
    </div>
  )
}

export default VerticalCard