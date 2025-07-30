import BannerProduct from '@/components/BannerProduct'
import CategoryList from '@/components/CategoryList'
import HorizontalCardProduct from '@/components/HorizontalCardProduct'
import VerticalCardProduct from '@/components/VerticalCardProduct'
import React from 'react'

export default function page() {
  return (
    <div>
      <CategoryList />
      <BannerProduct />

      <HorizontalCardProduct category="phone-accessories" heading="Top Phone Accessories" />
      <HorizontalCardProduct category="computer-accessories" heading="Best Computer Accessories" />

      <VerticalCardProduct category="stationery" heading="Stationery" />
      <VerticalCardProduct category="electronics" heading="Electronics & Gadgets" />
      <VerticalCardProduct category="internet-accessories" heading="Internet Accessories" />
    </div>
  )
}
