'use client'

import React, { useEffect, useState, useRef } from 'react'
import ServiceCard from './services-client' // path to your ServiceCard component

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

export default function ServicesSection() {
  const [services, setServices] = useState<Service[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const fetchServices = async () => {
      try {
        setLoading(true)
        const res = await fetch(`${API_URL}/api/services`)
        if (!res.ok) throw new Error('Failed to fetch services')
        const data = await res.json()
        if (data.success) setServices(data.data)
        else throw new Error(data.message || 'Unknown error')
      } catch (err: any) {
        console.error(err)
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchServices()
  }, [])

  const scrollLeft = () => {
    if (scrollRef.current) scrollRef.current.scrollLeft -= 300
  }

  const scrollRight = () => {
    if (scrollRef.current) scrollRef.current.scrollLeft += 300
  }

  if (loading)
    return <p className="text-white text-center mt-4">Loading services...</p>

  if (error)
    return <p className="text-red-500 text-center mt-4">{error}</p>

  if (services.length === 0)
    return <p className="text-white text-center mt-4">No services available.</p>

  return (
    <section className="container mx-auto px-4 mt-10 relative">
      <h2 className="text-2xl font-semibold text-white mb-6 text-center">
        Book Our Services Now!
      </h2>

      {/* Scroll buttons */}
      <button
        onClick={scrollLeft}
        className="hidden md:flex absolute left-0 top-1/2 transform -translate-y-1/2 z-10 bg-[#7B2CBF] text-white rounded-full p-2 hover:opacity-90"
      >
        &#10094;
      </button>
      <button
        onClick={scrollRight}
        className="hidden md:flex absolute right-0 top-1/2 transform -translate-y-1/2 z-10 bg-[#7B2CBF] text-white rounded-full p-2 hover:opacity-90"
      >
        &#10095;
      </button>

      {/* Horizontal scroll container */}
      <div
        ref={scrollRef}
        className="flex gap-4 overflow-x-auto scrollbar-none scroll-smooth py-2"
      >
        {services.map(service => (
          <div className="flex-shrink-0 w-64 md:w-72 lg:w-80" key={service._id}>
            <ServiceCard service={service} />
          </div>
        ))}
      </div>
    </section>
  )
}
