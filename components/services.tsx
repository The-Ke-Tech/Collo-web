'use client'

import React, { useEffect, useState, useRef } from 'react'
import { FaAngleLeft, FaAngleRight } from 'react-icons/fa6'
import ServiceCard from './services-client' // path to your ServiceCard component
import { isNetworkError, redirectToNetworkError } from '@/helpers/network'

interface Service {
  _id: string
  slug: string
  serviceName: string
  category: string
  serviceImage?: string[]
  description: string
  price: number
  startingFrom?: boolean
  pricingType?: string
  unitLabel?: string
}

const API_URL = process.env.NEXT_PUBLIC_API_URL

// Friendly messages: visitors never see raw technical errors such as "Failed to fetch"
const NETWORK_MESSAGE =
  "We couldn't connect right now. Please check your internet connection and try again."
const GENERIC_MESSAGE =
  "We couldn't load our services right now. Please try again in a moment."

export default function ServicesSection() {
  const [services, setServices] = useState<Service[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const scrollRef = useRef<HTMLDivElement>(null)
  const pausedRef = useRef(false) // auto-scroll pauses while the user is interacting
  const [reloadKey, setReloadKey] = useState(0) // bump to retry loading the services

  useEffect(() => {
    let cancelled = false // stops late updates/redirects if the visitor already left this page

    const fetchServices = async (attempt = 0): Promise<void> => {
      try {
        setLoading(true)
        setError(null)
        const res = await fetch(`${API_URL}/api/services`)
        if (!res.ok) throw new Error('Failed to fetch services')
        const data = await res.json()
        if (data.success) setServices(data.data)
        else throw new Error(data.message || 'Unknown error')
      } catch (err: any) {
        // Technical details stay in the console only
        console.error(err)
        if (cancelled) return

        if (isNetworkError(err)) {
          // one quiet retry first, so a brief blip doesn't bother the visitor
          if (attempt === 0) {
            await new Promise((resolve) => setTimeout(resolve, 1500))
            if (cancelled) return
            return fetchServices(1)
          }
          setError(NETWORK_MESSAGE)
          redirectToNetworkError() // still unreachable: show the dedicated network page
        } else {
          setError(GENERIC_MESSAGE)
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    fetchServices()
    return () => {
      cancelled = true
    }
  }, [reloadKey])

  // Gentle auto-scroll, loops back to the start
  useEffect(() => {
    if (services.length < 2) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    const id = setInterval(() => {
      const el = scrollRef.current
      if (!el || pausedRef.current) return
      const atEnd = el.scrollLeft + el.clientWidth >= el.scrollWidth - 8
      if (atEnd) el.scrollTo({ left: 0, behavior: 'smooth' })
      else el.scrollBy({ left: Math.max(220, el.clientWidth * 0.85), behavior: 'smooth' })
    }, 4000)

    return () => clearInterval(id)
  }, [services.length])

  const scrollLeft = () => {
    const el = scrollRef.current
    el?.scrollBy({ left: -Math.max(220, el.clientWidth * 0.85), behavior: 'smooth' })
  }
  const scrollRight = () => {
    const el = scrollRef.current
    el?.scrollBy({ left: Math.max(220, el.clientWidth * 0.85), behavior: 'smooth' })
  }

  const pause = () => { pausedRef.current = true }
  const resume = () => { pausedRef.current = false }
  const resumeLater = () => { setTimeout(resume, 4000) }

  // NOTE: the "Book Our Services Now!" heading now lives in app/page.tsx (via <SectionHeading />)
  // so all homepage section headings are managed in one place.

  // 📱 Fluid slide widths (share of the row): 4 + a peek of the 5th on phones, up to ~11 on wide monitors.
  const slideSize =
    'basis-[22.5%] min-w-[72px] ' +
    'sm:basis-[18%] ' +
    'md:basis-[14.5%] ' +
    'lg:basis-[12%] ' +
    'xl:basis-[10.5%] ' +
    '2xl:basis-[9%]'

  // Same edge-to-edge frame as the product rows
  const frame = 'relative mx-auto w-full px-1 md:px-3'
  const panel = 'rounded-md bg-white/5 p-1.5 ring-1 ring-white/10 sm:rounded-lg sm:p-2 md:p-3'

  if (loading)
    return (
      <section className={frame}>
        <div className={panel}>
          <div className="flex gap-1.5 overflow-hidden sm:gap-2 md:gap-3">
            {new Array(9).fill(null).map((_, i) => (
              <div
                key={i}
                className={`aspect-[3/4] shrink-0 animate-pulse rounded-lg bg-white/10 sm:rounded-xl ${slideSize}`}
              />
            ))}
          </div>
        </div>
      </section>
    )

  if (error)
    return (
      <div
        role="alert"
        className="mx-auto mt-2 max-w-md rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-4 text-center"
      >
        <p className="text-sm text-red-300 sm:text-base">{error}</p>
        <button
          type="button"
          onClick={() => setReloadKey((k) => k + 1)}
          className="mt-3 rounded-full bg-gradient-to-r from-[#00C2D1] to-[#7B2CBF] px-5 py-2 text-sm font-semibold text-white transition hover:opacity-90 active:scale-95"
        >
          Try again
        </button>
      </div>
    )

  if (services.length === 0)
    return <p className="mt-4 text-center text-gray-300">No services available.</p>

  return (
    <section className={frame}>
      <div
        className={`relative ${panel}`}
        onMouseEnter={pause}
        onMouseLeave={resume}
        onFocus={pause}
        onBlur={resume}
        onTouchStart={pause}
        onTouchEnd={resumeLater}
      >
        {/* Scroll buttons */}
        <button
          type="button"
          aria-label="Scroll left"
          onClick={scrollLeft}
          className="absolute left-1 top-1/2 z-10 hidden -translate-y-1/2 rounded-full bg-gradient-to-r from-[#00C2D1] to-[#7B2CBF] p-2.5 text-white shadow-lg transition hover:scale-110 md:flex lg:p-3"
        >
          <FaAngleLeft />
        </button>
        <button
          type="button"
          aria-label="Scroll right"
          onClick={scrollRight}
          className="absolute right-1 top-1/2 z-10 hidden -translate-y-1/2 rounded-full bg-gradient-to-r from-[#00C2D1] to-[#7B2CBF] p-2.5 text-white shadow-lg transition hover:scale-110 md:flex lg:p-3"
        >
          <FaAngleRight />
        </button>

        {/* Horizontal scroll container */}
        <div
          ref={scrollRef}
          className="flex snap-x snap-mandatory items-stretch gap-1.5 overflow-x-auto scrollbar-none scroll-smooth sm:gap-2 md:gap-3 xl:gap-4"
        >
          {services.map(service => (
            <div
              className={`${slideSize} flex shrink-0 snap-start transition duration-300 hover:-translate-y-1`}
              key={service._id}
            >
              <ServiceCard service={service} />
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}