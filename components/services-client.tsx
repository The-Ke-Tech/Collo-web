'use client'

import React from 'react'
import Link from 'next/link'
import displayKESCurrency from '@/helpers/displayCurrency'

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

interface ServiceCardProps {
  service: Service
}

const ServiceCard: React.FC<ServiceCardProps> = ({ service }) => {
  return (
    // h-full + w-full so every card in a row has the same height and fills its slide
    <div className="flex h-full w-full flex-col overflow-hidden rounded-md bg-white shadow-sm transition hover:shadow-md sm:rounded-lg">
      {service.serviceImage && service.serviceImage.length > 0 ? (
        <div className="aspect-[4/3] w-full overflow-hidden bg-gray-100">
          <img
            src={service.serviceImage[0]}
            alt={service.serviceName}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-300 hover:scale-105"
          />
        </div>
      ) : (
        <div className="flex aspect-[4/3] w-full items-center justify-center bg-gray-200 text-[10px] text-gray-400 sm:text-xs">
          No Image
        </div>
      )}

      <div className="flex flex-1 flex-col justify-between gap-1 p-1 sm:p-2 md:p-2.5">
        <div>
          <h3 className="line-clamp-2 text-[10px] font-bold leading-tight text-gray-900 sm:text-xs md:text-[13px] lg:text-sm">
            {service.serviceName}
          </h3>
          <p className="mt-0.5 line-clamp-1 text-[8px] capitalize text-gray-500 sm:text-[10px] md:text-xs">
            {service.category}
          </p>
        </div>

        <div className="flex flex-col gap-1 sm:gap-1.5">
          <span className="text-[10px] font-bold leading-tight text-[#7B2CBF] sm:text-xs md:text-[13px] lg:text-sm">
            {service.startingFrom ? 'From ' : ''}
            {displayKESCurrency(service.price)}
            {service.unitLabel ? ` / ${service.unitLabel}` : ''}
          </span>

          {/* 👆 Full-width, thumb-sized View button so it stays easy to tap on any screen */}
          <Link
            href={`/service-details/${service.slug}`}
            className="flex min-h-7 w-full items-center justify-center rounded-md bg-gradient-to-r from-[#00C2D1] to-[#7B2CBF] px-1 py-1 text-[9px] font-semibold text-white transition hover:opacity-90 active:scale-95 sm:min-h-8 sm:text-xs md:text-[13px]"
          >
            View
          </Link>
        </div>
      </div>
    </div>
  )
}

export default ServiceCard