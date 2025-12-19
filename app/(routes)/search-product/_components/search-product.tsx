"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import VerticalCard from "@/components/vertical-card";
import { Product } from "@/helpers/product-types";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export default function SearchProductClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [query] = useState(searchParams.get("q") || "");
  const [results, setResults] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const handler = setTimeout(() => {
      const fetchProducts = async () => {
        if (!query.trim()) return setResults([]);

        setLoading(true);

        try {
          const res = await fetch(
            `${API_URL}/api/products/search?q=${encodeURIComponent(query)}`,
            { cache: "no-store" }
          );
          const data = await res.json();

          // FIX: Map `_id` instead of `id`
          const products: Product[] = (Array.isArray(data) ? data : []).map((p: any) => ({
            _id: p._id ?? p.id ?? "",
            slug: p.slug,
            productName: p.productName,
            productImage: p.productImage,
            category: p.category,
            price: p.price,
            sellingPrice: p.sellingPrice,
            stock: p.stock,
            brandName: p.brandName ?? "",
            description: p.description ?? "",
            createdBy: p.createdBy ?? "",
            createdAt: p.createdAt ?? new Date().toISOString(),
            updatedAt: p.updatedAt ?? new Date().toISOString(),
          }));

          setResults(products);
        } catch (error) {
          console.error("Search failed:", error);
          setResults([]);
        } finally {
          setLoading(false);
        }
      };

      fetchProducts();

      router.replace(`/search-product?q=${encodeURIComponent(query)}`);
    }, 400);

    return () => clearTimeout(handler);
  }, [query, router]);

  return (
    <div className="max-w-5xl mx-auto py-10 px-6 bg-gradient-to-b from-black via-gray-900 to-gray-800 rounded-lg shadow-lg text-gray-200">
      <h1 className="text-2xl font-semibold mb-4 text-white">
        {query
          ? `Found ${results.length} result${results.length !== 1 ? "s" : ""} for "${query}"`
          : "Search Products at COLLTECH"}
      </h1>

      {loading && <p className="text-gray-400 mb-4">Searching...</p>}
      {!loading && results.length === 0 && query && (
        <p className="text-gray-500">No results found for "{query}".</p>
      )}

      <VerticalCard loading={loading} data={results} />
    </div>
  );
}
