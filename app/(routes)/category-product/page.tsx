'use client';

import SummaryApi from '@/common';
import VerticalCard from '@/components/vertical-card';
import productCategory from '@/helpers/productCategory';
import React, { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';

type Product = {
  id: string;
  productName: string;
  productImage: string[];
  category: string;
  price: number;
  sellingPrice: number;
  stock: number; 
};

const CategoryProduct = () => {
  const [data, setData] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [sortBy, setSortBy] = useState('');
  const [filterCategoryList, setFilterCategoryList] = useState<string[]>([]);
  const [selectCategory, setSelectCategory] = useState<Record<string, boolean>>({});

  const searchParams = useSearchParams();
  const router = useRouter();

  // Extract categories from query params on load
  useEffect(() => {
    const categories = searchParams.getAll('category');
    const categoryObject: Record<string, boolean> = {};

    categories.forEach((cat) => {
      categoryObject[cat] = true;
    });

    setSelectCategory(categoryObject);
    setFilterCategoryList(categories);
  }, [searchParams]);

  // Fetch products when filter list changes
  const fetchData = async () => {
    setLoading(true);
    const response = await fetch(SummaryApi.filterProduct.url, {
      method: SummaryApi.filterProduct.method,
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ category: filterCategoryList }),
    });

    const dataResponse = await response.json();
    setData(dataResponse?.data || []);
    setLoading(false);
  };

  useEffect(() => {
    if (filterCategoryList.length > 0) {
      fetchData();
    }
  }, [filterCategoryList]);

  const handleSelectCategory = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value, checked } = e.target;

    setSelectCategory((prev) => ({
      ...prev,
      [value]: checked,
    }));
  };

  useEffect(() => {
    const activeCategories = Object.keys(selectCategory).filter((key) => selectCategory[key]);
    setFilterCategoryList(activeCategories);

    const queryString = activeCategories.map((cat) => `category=${cat}`).join('&');
    router.push(`/category-product?${queryString}`);
  }, [selectCategory]);

  const handleOnChangeSortBy = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;
    setSortBy(value);

    const sorted = [...data].sort((a, b) =>
      value === 'asc' ? a.sellingPrice - b.sellingPrice : b.sellingPrice - a.sellingPrice
    );
    setData(sorted);
  };

  return (
    <div className='container mx-auto p-4'>
      <div className='hidden lg:grid grid-cols-[200px,1fr]'>
        {/* Left sidebar */}
        <div className='bg-white p-2 min-h-[calc(100vh-120px)] overflow-y-scroll'>
          {/* Sort By */}
          <div>
            <h3 className='text-base uppercase font-medium text-slate-500 border-b pb-1 border-slate-300'>Sort by</h3>
            <form className='text-sm flex flex-col gap-2 py-2'>
              <label className='flex items-center gap-3'>
                <input type='radio' name='sortBy' value='asc' checked={sortBy === 'asc'} onChange={handleOnChangeSortBy} />
                Price - Low to High
              </label>
              <label className='flex items-center gap-3'>
                <input type='radio' name='sortBy' value='dsc' checked={sortBy === 'dsc'} onChange={handleOnChangeSortBy} />
                Price - High to Low
              </label>
            </form>
          </div>

          {/* Filter By Category */}
          <div>
            <h3 className='text-base uppercase font-medium text-slate-500 border-b pb-1 border-slate-300'>Category</h3>
            <form className='text-sm flex flex-col gap-2 py-2'>
              {productCategory.map((category, index) => (
                <label className='flex items-center gap-3' key={index}>
                  <input
                    type='checkbox'
                    name='category'
                    id={category.value}
                    value={category.value}
                    checked={!!selectCategory[category.value]}
                    onChange={handleSelectCategory}
                  />
                  {category.label}
                </label>
              ))}
            </form>
          </div>
        </div>

        {/* Right side product list */}
        <div className='px-4'>
          <p className='font-medium text-slate-800 text-lg my-2'>Search Results: {data.length}</p>
          <div className='min-h-[calc(100vh-120px)] overflow-y-scroll max-h-[calc(100vh-120px)]'>
            {!loading && data.length !== 0 && <VerticalCard data={data} loading={loading} />}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CategoryProduct;
