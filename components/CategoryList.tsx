'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

interface ProductType {
  category: string;
  productImage: string[];
}

const CategoryList = () => {
  const [categoryProduct, setCategoryProduct] = useState<ProductType[]>([]);
  const [loading, setLoading] = useState(false);

  const categoryLoading = new Array(13).fill(null);

  const fetchCategoryProduct = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/category-product', {
        method: 'GET',
        credentials: 'include',
      });
      const dataResponse = await response.json();

      if (dataResponse?.data && Array.isArray(dataResponse.data)) {
        setCategoryProduct(dataResponse.data);
      } else {
        setCategoryProduct([]);
        console.error("Invalid category product response structure:", dataResponse);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
      setCategoryProduct([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategoryProduct();
  }, []);

  return (
    <div className="bg-white py-6 px-4 rounded-lg shadow-md border border-gray-200">
      <h2 className="text-xl font-bold text-gray-800 mb-4">Shop by Category</h2>
      <div className="flex items-center gap-6 justify-start overflow-x-auto scrollbar-none">
        {loading ? (
          categoryLoading.map((_, index) => (
            <div
              className="h-16 w-16 md:w-20 md:h-20 rounded-full overflow-hidden bg-gray-200 animate-pulse"
              key={'categoryLoading' + index}
            />
          ))
        ) : Array.isArray(categoryProduct) && categoryProduct.length > 0 ? (
          categoryProduct.map((product) => (
            <Link
              href={`/category-product?category=${encodeURIComponent(product.category)}`}
              className="cursor-pointer text-center group"
              key={product.category}
            >
              <div className="w-16 h-16 md:w-20 md:h-20 rounded-full overflow-hidden p-3 bg-gray-50 flex items-center justify-center shadow-sm border border-gray-300 group-hover:border-transparent group-hover:shadow-lg group-hover:bg-gradient-to-r group-hover:from-[#00C2D1] group-hover:to-[#7B2CBF] transition">
                <img
                  src={product.productImage?.[0] || '/placeholder.png'}
                  alt={product.category}
                  className="h-full object-scale-down mix-blend-multiply group-hover:scale-125 transition-transform duration-300"
                />
              </div>
              <p className="text-sm md:text-base capitalize mt-2 text-gray-700 group-hover:text-[#7B2CBF] transition">
                {product.category}
              </p>
            </Link>
          ))
        ) : (
          <p className="text-gray-500 italic">No categories found.</p>
        )}
      </div>
    </div>
  );
};

export default CategoryList;
