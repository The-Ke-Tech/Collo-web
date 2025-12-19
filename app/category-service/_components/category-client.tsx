'use client';

import ServiceCard from "@/components/services-client";
import React, { useEffect, useState } from "react";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

interface Service {
  _id: string;
  slug: string;
  serviceName: string;
  category: string;
  serviceImage?: string[];
  description: string;
  price: number;
  startingFrom?: boolean;
  unitLabel?: string;
  pricingType?: string;
}

export default function CategoryServiceClient() {
  const [data, setData] = useState<Service[]>([]);
  const [loading, setLoading] = useState(false);

  // Filters
  const [selectedPricing, setSelectedPricing] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>("");

  const fetchServices = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/services`);
      const json = await res.json();

      if (json.success) {
        let services: Service[] = json.data.map((s: any) => ({
          _id: s._id,
          slug: s.slug,
          serviceName: s.serviceName,
          category: s.category,
          serviceImage: s.serviceImage,
          description: s.description,
          price: s.price,
          startingFrom: s.startingFrom,
          unitLabel: s.unitLabel,
          pricingType: s.pricingType,
        }));

        // Apply Pricing Type filter
        if (selectedPricing.length) {
          services = services.filter(s => selectedPricing.includes(s.pricingType ?? ""));
        }

        // Apply search filter
        if (searchTerm.trim() !== "") {
          const term = searchTerm.toLowerCase();
          services = services.filter(s => s.serviceName.toLowerCase().includes(term));
        }

        setData(services);
      } else {
        setData([]);
      }
    } catch (err) {
      console.error("Failed to fetch services", err);
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchServices();
  }, [selectedPricing, searchTerm]);

  return (
    <div className="container mx-auto pt-4 px-2 min-h-screen bg-gradient-to-b from-black via-gray-900 to-gray-800 text-gray-200">
      <h1 className="text-2xl font-bold mb-4">Our Services</h1>

      {/* Filters */}
      <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-end md:gap-6">

        {/* Pricing Type */}
        <div className="flex flex-col gap-2">
          <label className="font-medium">Pricing Type</label>
          <div className="flex gap-3">
            {["time", "unit", "fixed"].map(type => (
              <label key={type} className="flex items-center gap-1">
                <input
                  type="checkbox"
                  value={type}
                  checked={selectedPricing.includes(type)}
                  onChange={(e) => {
                    const val = e.target.value;
                    setSelectedPricing(prev =>
                      prev.includes(val) ? prev.filter(p => p !== val) : [...prev, val]
                    );
                  }}
                  className="accent-purple-500"
                />
                {type}
              </label>
            ))}
          </div>
        </div>

        {/* Search Service Names */}
        <div className="flex flex-col gap-2 flex-1">
          <label className="font-medium">Search Services</label>
          <input
            type="text"
            placeholder="Search by service name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="bg-gray-800 p-2 rounded text-gray-200 w-full"
          />
        </div>

      </div>

      <p className="text-lg mb-4">Services Available: {data.length}</p>

      {loading ? (
        <p className="text-center py-10">Loading services...</p>
      ) : data.length ? (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {data.map(service => (
            <ServiceCard key={service._id} service={service} />
          ))}
        </div>
      ) : (
        <p className="text-center py-10">No services found.</p>
      )}
    </div>
  );
}
