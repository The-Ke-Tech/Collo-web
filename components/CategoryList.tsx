'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

interface CategoryItem {
  category: string;
  image: string[];
  type: "product" | "service";
}

const API_URL = process.env.NEXT_PUBLIC_API_URL;

const CategoryList = () => {
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [loading, setLoading] = useState(false);

  const categoryLoading = new Array(13).fill(null);

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const [productRes, serviceRes] = await Promise.all([
        fetch(`${API_URL}/api/category-product`),
        fetch(`${API_URL}/api/category-service`)
      ]);

      const productData = await productRes.json();
      const serviceData = await serviceRes.json();

      const productCategories: CategoryItem[] =
        Array.isArray(productData?.data)
          ? productData.data.map((item: any) => ({
              category: item.category,
              image: item.productImage || [],
              type: "product",
            }))
          : [];

      const serviceCategories: CategoryItem[] =
        Array.isArray(serviceData?.data)
          ? serviceData.data.map((item: any) => ({
              category: item.category,
              image: item.serviceImage || [],
              type: "service",
            }))
          : [];

      setCategories([...productCategories, ...serviceCategories]);
    } catch (error) {
      console.error("Error fetching categories:", error);
      setCategories([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  return (
    <div className="bg-white py-6 px-4 rounded-lg shadow-md border border-gray-200">
      <h2 className="text-xl font-bold text-gray-800 mb-4">
        Shop & Services by Category
      </h2>

      <div
        className={`
          grid grid-flow-col auto-cols-[minmax(5rem,1fr)] gap-6
          overflow-x-auto scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-100
          ${categories.length <= 4 ? 'justify-evenly' : ''}
        `}
      >
        {loading
          ? categoryLoading.map((_, index) => (
              <div
                key={index}
                className="h-16 w-16 md:w-20 md:h-20 rounded-full bg-gray-200 animate-pulse flex-shrink-0"
              />
            ))
          : categories.length > 0
          ? categories.map((item) => {
              const href =
                item.type === "product"
                  ? `/category-product?category=${encodeURIComponent(item.category)}`
                  : `/category-service?category=${encodeURIComponent(item.category)}`;

              return (
                <Link
                  key={`${item.type}-${item.category}`}
                  href={href}
                  className="cursor-pointer text-center group flex-shrink-0"
                >
                  <div className="w-16 h-16 md:w-20 md:h-20 rounded-full overflow-hidden p-3 bg-gray-50 flex items-center justify-center shadow-sm border border-gray-300 group-hover:border-transparent group-hover:shadow-lg group-hover:bg-gradient-to-r group-hover:from-[#00C2D1] group-hover:to-[#7B2CBF] transition mx-auto">
                    <img
                      src={item.image?.[0] || '/placeholder.png'}
                      alt={item.category}
                      className="h-full object-scale-down mix-blend-multiply group-hover:scale-125 transition-transform duration-300"
                    />
                  </div>
                  <p className="text-sm md:text-base capitalize mt-2 text-gray-700 group-hover:text-[#7B2CBF] transition">
                    {item.category}
                  </p>
                  <span className="text-xs text-gray-400 capitalize">
                    {item.type}
                  </span>
                </Link>
              );
            })
          : (
            <p className="text-gray-500 italic text-center w-full">
              No categories found.
            </p>
          )}
      </div>
    </div>
  );
};

export default CategoryList;
