"use client";
import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import VerticalCard from "@/components/vertical-card";

type Product = {
  id: string;
  productName: string;
  productImage: string[];
  category: string;
  price: number;
  sellingPrice: number;
  stock: number;
};

export default function SearchPage() {
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
          const res = await fetch(`/api/search-product?q=${encodeURIComponent(query)}`);
          const data: unknown = await res.json();
          setResults(Array.isArray(data) ? (data as Product[]) : []);
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
          : "Search Products"}
      </h1>

      {loading && <p className="text-gray-400 mb-4">Searching...</p>}
      {!loading && results.length === 0 && query && (
        <p className="text-gray-500">No results found for "{query}".</p>
      )}

      {/* Search Results */}
      <VerticalCard loading={loading} data={results as Product[]} />
    </div>
  );
}
