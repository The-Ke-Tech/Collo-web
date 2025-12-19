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
    <div className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition flex flex-col overflow-hidden">
      
      {/* Service Image */}
      {service.serviceImage && service.serviceImage.length > 0 ? (
        <div className="w-full h-35 md:h-55 bg-gray-100 overflow-hidden">
          <img
            src={service.serviceImage[0]}
            alt={service.serviceName}
            className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
          />
        </div>
      ) : (
        <div className="w-full h-56 md:h-64 bg-gray-200 flex items-center justify-center text-gray-400">
          No Image
        </div>
      )}

      {/* Service Details */}
      <div className="p-2 md:p-3 flex flex-col flex-1 justify-between">
        <div>
          <h3 className="text-lg md:text-xl font-bold text-gray-900 line-clamp-2">{service.serviceName}</h3>
          <p className="text-sm text-gray-500 capitalize mt-1">{service.category}</p>
        </div>

        <div className="mt-4 flex items-center justify-between flex-wrap gap-2">
          <span className="text-[#7B2CBF] font-bold text-lg">
            {service.startingFrom ? 'From ' : ''}
            {displayKESCurrency(service.price)}
            {service.unitLabel ? ` / ${service.unitLabel}` : ''}
          </span>

          <Link
            href={`/service-details/${service.slug}`}
            className="bg-gradient-to-r from-[#00C2D1] to-[#7B2CBF] text-white px-4 py-2 rounded-full text-sm font-medium hover:opacity-90 transition"
          >
            View Service
          </Link>
        </div>
      </div>
    </div>
  )
}

export default ServiceCard
