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

    console.log("Category API response:", dataResponse); // 🔍 For debugging

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
    <div className="container mx-auto p-4">
      <div className="flex items-center gap-4 justify-between overflow-scroll scrollbar-none">
        {loading ? (
          categoryLoading.map((_, index) => (
            <div
              className="h-16 w-16 md:w-20 md:h-20 rounded-full overflow-hidden bg-slate-200 animate-pulse"
              key={'categoryLoading' + index}
            />
          ))
        ) : (
          Array.isArray(categoryProduct) && categoryProduct.length > 0 ? (
            categoryProduct.map((product) => (
              <Link
                href={`/category-product?category=${encodeURIComponent(product.category)}`}
                className="cursor-pointer text-center"
                key={product.category}
              >
                <div className="w-16 h-16 md:w-20 md:h-20 rounded-full overflow-hidden p-4 bg-slate-200 flex items-center justify-center">
                  <img
                    src={product.productImage?.[0] || '/placeholder.png'} // fallback image
                    alt={product.category}
                    className="h-full object-scale-down mix-blend-multiply hover:scale-125 transition-all"
                  />
                </div>
                <p className="text-sm md:text-base capitalize">{product.category}</p>
              </Link>
            ))
          ) : (
            <p className="text-gray-500 italic">No categories found.</p>
          )
        )}
      </div>
    </div>
  );
};

export default CategoryList;
