// types/service.ts

export interface Service {
  _id: string;
  serviceName: string;
  slug: string;
  category?: string;

  serviceImage: string[];
  description?: string;

  price?: number;
  startingFrom?: boolean;
  pricingType?: string;
  unitLabel?: string;

  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export default Service;
