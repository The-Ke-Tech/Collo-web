'use client';

import React, { useEffect, useState } from 'react';
import VerticalCard from '@/components/vertical-card';
import productCategory from '@/helpers/productCategory';
import { useSearchParams, useRouter } from 'next/navigation';
import { FiFilter } from 'react-icons/fi';

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
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  const searchParams = useSearchParams();
  const router = useRouter();

  // Initialize categories from URL query
  useEffect(() => {
    const categories = searchParams.getAll('category');
    const categoryObject: Record<string, boolean> = {};
    categories.forEach((cat) => {
      categoryObject[cat] = true;
    });
    setSelectCategory(categoryObject);
    setFilterCategoryList(categories);
  }, [searchParams]);

  // Fetch products from API
  const fetchData = async () => {
    setLoading(true);
    const response = await fetch('/api/products/filter', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ category: filterCategoryList || [] }),
    });

    const dataResponse = await response.json();
    setData(dataResponse?.data || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, [filterCategoryList]);

  // Handle category selection
  const handleSelectCategory = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value, checked } = e.target;
    setSelectCategory((prev) => ({
      ...prev,
      [value]: checked,
    }));
  };

  // Update URL & filter list when category changes
  useEffect(() => {
    const activeCategories = Object.keys(selectCategory).filter((key) => selectCategory[key]);
    setFilterCategoryList(activeCategories);
    const queryString = activeCategories.map((cat) => `category=${cat}`).join('&');
    router.push(`/category-product?${queryString}`);
  }, [selectCategory]);

  // Handle sorting
  const handleOnChangeSortBy = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;
    setSortBy(value);
    const sorted = [...data].sort((a, b) =>
      value === 'asc' ? a.sellingPrice - b.sellingPrice : b.sellingPrice - a.sellingPrice
    );
    setData(sorted);
  };

  const SidebarFilters = (
    <div className="bg-gray-900 p-4 rounded shadow border border-gray-700 h-full overflow-y-auto">
      {/* Sort By */}
      <div>
        <h3 className="text-base uppercase font-medium text-gray-300 border-b pb-1 border-gray-700">
          Sort by
        </h3>
        <form className="text-sm flex flex-col gap-2 py-2 text-gray-200">
          <label className="flex items-center gap-3">
            <input
              type="radio"
              name="sortBy"
              value="asc"
              checked={sortBy === 'asc'}
              onChange={handleOnChangeSortBy}
              className="accent-red-500"
            />
            Price - Low to High
          </label>
          <label className="flex items-center gap-3">
            <input
              type="radio"
              name="sortBy"
              value="dsc"
              checked={sortBy === 'dsc'}
              onChange={handleOnChangeSortBy}
              className="accent-red-500"
            />
            Price - High to Low
          </label>
        </form>
      </div>

      {/* Filter By Category */}
      <div>
        <h3 className="text-base uppercase font-medium text-gray-300 border-b pb-1 border-gray-700">
          Category
        </h3>
        <form className="text-sm flex flex-col gap-2 py-2 text-gray-200">
          {productCategory.map((category, index) => (
            <label className="flex items-center gap-3" key={index}>
              <input
                type="checkbox"
                name="category"
                id={category.value}
                value={category.value}
                checked={!!selectCategory[category.value]}
                onChange={handleSelectCategory}
                className="accent-red-500"
              />
              {category.label}
            </label>
          ))}
        </form>
      </div>
    </div>
  );

  return (
    <div className="container mx-auto p-4 bg-gradient-to-b from-black via-gray-900 to-gray-800 text-gray-200 min-h-screen">
      {/* Mobile filter button */}
      <div className="lg:hidden flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold">Filters</h2>
        <button
          className="p-2 bg-gray-700 rounded-md flex items-center gap-2"
          onClick={() => setMobileFilterOpen(true)}
        >
          <FiFilter /> Open Filters
        </button>
      </div>

      {/* Layout */}
      <div className="grid lg:grid-cols-[200px,1fr] gap-4">
        {/* Sidebar (desktop) */}
        <div className="hidden lg:block">{SidebarFilters}</div>

        {/* Product list */}
        <div className="px-2">
          <p className="font-medium text-gray-100 text-lg my-2">
            Search Results: {data.length}
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
            {loading ? (
              <p className="col-span-full text-center text-gray-400 py-10">
                Loading products...
              </p>
            ) : data.length > 0 ? (
              <VerticalCard data={data} loading={loading} />
            ) : (
              <p className="col-span-full text-center text-gray-400 py-10">
                No products found.
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Mobile filter drawer */}
      {mobileFilterOpen && (
        <div className="fixed inset-0 bg-black/70 z-50 flex">
          <div className="bg-gray-900 w-3/4 max-w-xs p-4 overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Filters</h3>
              <button
                className="text-gray-400 hover:text-white"
                onClick={() => setMobileFilterOpen(false)}
              >
                Close
              </button>
            </div>
            {SidebarFilters}
          </div>
          <div
            className="flex-1"
            onClick={() => setMobileFilterOpen(false)}
          ></div>
        </div>
      )}
    </div>
  );
};

export default CategoryProduct;
