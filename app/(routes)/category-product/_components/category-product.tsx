"use client";

// ✅ FIXED VERSION: this file does NOT use router.push / router.replace / useSearchParams.
// If you search your project for "router.push" in this file and find it, you are still running the OLD file.

import React, { useEffect, useMemo, useRef, useState } from "react";
import VerticalCard from "@/components/vertical-card";
import productCategory from "@/helpers/productCategory";
import { FiFilter } from "react-icons/fi";
import { Product } from "@/helpers/product-types";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

// Module-level cache so products are never "lost" if this component is ever re-mounted.
const productCache = new Map<string, Product[]>();
const cacheKey = (cats: string[]) => [...cats].sort().join(",");

// Reads ?category=a&category=b straight from the browser address bar
const readCategoriesFromUrl = (): string[] => {
  if (typeof window === "undefined") return [];
  return new URLSearchParams(window.location.search).getAll("category");
};

// A cheap fingerprint so we only re-render the grid when the products REALLY changed
const fingerprint = (list: Product[]) =>
  list.map((p) => `${p._id}:${p.sellingPrice}:${p.stock}`).join("|");

export default function CategoryProductClient() {
  const [data, setData] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [firstLoadDone, setFirstLoadDone] = useState(false);
  const [sortBy, setSortBy] = useState(""); // "asc" | "dsc"
  const [filterCategoryList, setFilterCategoryList] = useState<string[]>([]);
  const [selectCategory, setSelectCategory] = useState<Record<string, boolean>>({});
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  // `ready` flips to true once, after we've read the URL in the browser (avoids hydration mismatch)
  const [ready, setReady] = useState(false);
  const lastFetchedKey = useRef<string | null>(null);
  const lastFingerprint = useRef<string>("");

  // Apply a list of categories to BOTH pieces of state, only if they actually differ
  const applyCategories = (categories: string[]) => {
    const key = cacheKey(categories);
    setFilterCategoryList((prev) => (cacheKey(prev) === key ? prev : categories));
    setSelectCategory((prev) => {
      const prevKey = cacheKey(Object.keys(prev).filter((k) => prev[k]));
      if (prevKey === key) return prev;
      const obj: Record<string, boolean> = {};
      categories.forEach((cat) => (obj[cat] = true));
      return obj;
    });
  };

  // 1) Read the URL ONCE on mount + react to the browser back/forward buttons.
  // This component no longer subscribes to Next's useSearchParams()/useRouter(), so nothing outside
  // it (header, layout, router refreshes) can ever trigger a re-fetch or a re-render loop here.
  useEffect(() => {
    applyCategories(readCategoriesFromUrl());
    setReady(true);

    const onPopState = () => applyCategories(readCategoriesFromUrl());
    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, []);

  // 2) Fetch products - only when the selected categories really change (never when sorting)
  useEffect(() => {
    if (!ready) return;

    const key = cacheKey(filterCategoryList);
    if (lastFetchedKey.current === key) return; // already fetched this exact selection
    lastFetchedKey.current = key;

    const controller = new AbortController();

    // show cached products immediately (if any) while we refresh in the background
    const cached = productCache.get(key);
    if (cached) {
      lastFingerprint.current = fingerprint(cached);
      setData(cached);
      setFirstLoadDone(true);
    }

    const fetchData = async () => {
      setLoading(true);
      try {
        const response = await fetch(`${API_URL}/api/products/filter`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ category: filterCategoryList }),
          signal: controller.signal,
        });

        const dataResponse = await response.json();

        if (dataResponse.success) {
          // Map backend data to frontend Product type
          const products: Product[] = dataResponse.data.map((p: any) => ({
            id: p._id,
            _id: p._id,
            slug: p.slug || "",              // ensure string
            productName: p.productName || "",
            productImage: p.productImage || [],
            category: p.category || "",
            price: p.price ?? 0,
            sellingPrice: p.sellingPrice ?? 0,
            stock: p.stock ?? 0,
          }));

          productCache.set(key, products);

          // Only touch the grid if something actually changed (prevents image reload / flashing)
          const fp = fingerprint(products);
          if (fp !== lastFingerprint.current) {
            lastFingerprint.current = fp;
            setData(products);
          }
        } else {
          lastFingerprint.current = "";
          setData([]);
        }
      } catch (err: any) {
        if (err?.name === "AbortError") return; // a newer selection replaced this request
        console.error("Error fetching products:", err);
        lastFingerprint.current = "";
        setData([]);
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
          setFirstLoadDone(true);
        }
      }
    };

    fetchData();
    return () => controller.abort();
  }, [filterCategoryList, ready]);

  // Client-side sorting happens instantly on the data we already have (no refetch, no flicker)
  const sortedData = useMemo(() => {
    const products = [...data];
    if (sortBy === "asc") {
      products.sort((a, b) => a.sellingPrice - b.sellingPrice);
    } else if (sortBy === "dsc") {
      products.sort((a, b) => b.sellingPrice - a.sellingPrice);
    }
    return products;
  }, [data, sortBy]);

  // Handle category selection: update state, then update the address bar with the History API
  // (no Next.js navigation, so no server round trip, no loading screen, no re-mount).
  const handleSelectCategory = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value, checked } = e.target;
    const next = { ...selectCategory, [value]: checked };
    setSelectCategory(next);

    const activeCategories = Object.keys(next).filter((key) => next[key]);
    setFilterCategoryList(activeCategories);

    const queryString = activeCategories
      .map((cat) => `category=${encodeURIComponent(cat)}`)
      .join("&");
    const url = queryString ? `/category-product?${queryString}` : "/category-product";
    window.history.replaceState(window.history.state, "", url);
  };

  // Handle sort change
  const handleOnChangeSortBy = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSortBy(e.target.value);
  };

  const SidebarFilters = (
    <div className="bg-gray-900 p-4 rounded shadow border border-gray-700 h-full overflow-y-auto">
      {/* Sort By */}
      <div>
        <h3 className="text-base uppercase font-medium text-gray-300 border-b pb-1 border-gray-700">
          Sort by
        </h3>
        <form className="text-sm flex flex-col gap-2 py-2 text-gray-200" onSubmit={(e) => e.preventDefault()}>
          <label className="flex items-center gap-3">
            <input
              type="radio"
              name="sortBy"
              value="asc"
              checked={sortBy === "asc"}
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
              checked={sortBy === "dsc"}
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
        <form className="text-sm flex flex-col gap-2 py-2 text-gray-200" onSubmit={(e) => e.preventDefault()}>
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
    <div className="container mx-auto pt-4 px-1 bg-gradient-to-b from-black via-gray-900 to-gray-800 text-gray-200 min-h-screen">
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
        <div className="hidden lg:block">{SidebarFilters}</div>
        <div className="px-2">
          <div className="flex items-center justify-between">
            <p className="font-medium text-gray-100 text-lg my-2">
              Search Results: {sortedData.length}
            </p>
            {/* Tiny, non-intrusive refresh indicator (the products themselves never move or dim) */}
            {loading && firstLoadDone && (
              <span className="text-xs text-gray-400" role="status">Updating…</span>
            )}
          </div>

          {/* Fixed minimum height so the page never collapses/jumps while content changes */}
          <div className="min-h-[60vh]">
            {sortedData.length > 0 ? (
              <VerticalCard data={sortedData} loading={false} />
            ) : !firstLoadDone ? (
              <p className="col-span-full text-center text-gray-400 py-10">Loading products...</p>
            ) : (
              <p className="col-span-full text-center text-gray-400 py-10">No products found.</p>
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
          <div className="flex-1" onClick={() => setMobileFilterOpen(false)}></div>
        </div>
      )}
    </div>
  );
}