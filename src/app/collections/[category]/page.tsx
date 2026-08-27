"use client";

import { useState, useEffect, use, useMemo, useRef } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Cart from "@/components/Cart";
import Footer from "@/components/Footer";
import { allProducts, Product } from "@/data/products";
import { getProductsForSlug } from "@/lib/get-products-for-slug";
import { useStore } from "@/context/StoreContext";
import { toast as notify } from "react-hot-toast";

// 1. Group Definitions
const BRAND_LIST = [
  { id: "nike", name: "Nike" },
  { id: "jordan", name: "Jordan" },
  { id: "adidas", name: "Adidas" },
  { id: "new-balance", name: "New Balance" },
  { id: "vans", name: "Vans" },
  { id: "yeezy", name: "Yeezy" },
  { id: "puma", name: "Puma" },
  { id: "asics", name: "Asics" },
  { id: "balenciaga", name: "Balenciaga" },
];

const PERFORMANCE_LIST = [
  { id: "basketball", name: "Basketball" },
  { id: "football", name: "Football"},
  { id: "running", name: "Running" },
  { id: "skateboarding", name: "Skateboarding" },
  { id: "training", name: "Training & Gym" },
  { id: "outdoor", name: "Outdoor & Trail" },
];

const STREETWEAR_LIST = [
  { id: "streetwear", name: "Streetwear & Grails" },
  { id: "retro", name: "Retro Classics" },
  { id: "luxury", name: "Luxury Collabs" },
  { id: "slides", name: "Slides & Foam" },
  { id: "apparel", name: "Apparel & Accessories" },
];

// Helper to calculate dynamic discount
const getDiscountPercent = (id: string) => {
  const hash = id.split("").reduce((sum, char) => sum + char.charCodeAt(0), 0);
  const rates = [10, 15, 20, 25, 30];
  return rates[hash % rates.length];
};

// Reusable Heart Icon Component
const HeartIcon = ({ filled }: { filled: boolean }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill={filled ? "#ef4444" : "none"}
    stroke={filled ? "#ef4444" : "#111827"}
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="w-4 h-4 transition-all"
  >
    <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
  </svg>
);

export default function CategoryPage({ params }: { params: Promise<{ category: string }> }) {
  const resolvedParams = use(params);
  const categorySlug = decodeURIComponent(resolvedParams.category).toLowerCase();

  const { cart, wishlistIds, addToCart, toggleWishlist, updateQuantity } = useStore();
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  // Dynamic Ceiling: Finds highest price in catalog so high-end shoes (> $1000) aren't filtered out
  const highestCatalogPrice = useMemo(() => {
    if (!allProducts.length) return 3000;
    return Math.max(...allProducts.map((p) => p.price)) + 100;
  }, []);

  // Filter & Sort States
  const [maxPrice, setMaxPrice] = useState<number>(highestCatalogPrice);
  const [sortBy, setSortBy] = useState<string>("default");

  // Infinite Scroll States
  const ITEMS_PER_PAGE = 9;
  const [visibleCount, setVisibleCount] = useState<number>(ITEMS_PER_PAGE);
  const [isLoadingMore, setIsLoadingMore] = useState<boolean>(false);
  const observerTarget = useRef<HTMLDivElement>(null);

  // Keep state updated if catalog changes
  useEffect(() => {
    setMaxPrice(highestCatalogPrice);
  }, [highestCatalogPrice]);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2500);
  };

  // Determine active category section
  const activeSectionGroup = useMemo(() => {
    if (BRAND_LIST.some((b) => b.id === categorySlug)) {
      return { title: "BRANDS", items: BRAND_LIST };
    }
    if (PERFORMANCE_LIST.some((p) => p.id === categorySlug)) {
      return { title: "PERFORMANCE & SPORT", items: PERFORMANCE_LIST };
    }
    if (STREETWEAR_LIST.some((s) => s.id === categorySlug)) {
      return { title: "STREETWEAR & CULTURE", items: STREETWEAR_LIST };
    }
    return { title: "BRANDS", items: BRAND_LIST };
  }, [categorySlug]);

  const categoryProducts = useMemo(() => {
    return getProductsForSlug(categorySlug);
  }, [categorySlug]);

  const categoryTitle = useMemo(() => {
    return categorySlug.replace("-", " ").toUpperCase();
  }, [categorySlug]);

  // Apply Price Filters + Sort
  const processedProducts = useMemo(() => {
    let result = [...categoryProducts];

    result = result.filter((p) => p.price <= maxPrice);

    if (sortBy === "price-low") {
      result.sort((a, b) => a.price - b.price);
    } else if (sortBy === "price-high") {
      result.sort((a, b) => b.price - a.price);
    } else if (sortBy === "name") {
      result.sort((a, b) => a.name.localeCompare(b.name));
    }

    return result;
  }, [categoryProducts, maxPrice, sortBy]);

  // Products slice for infinite pagination
  const displayedProducts = useMemo(() => {
    return processedProducts.slice(0, visibleCount);
  }, [processedProducts, visibleCount]);

  const hasMore = visibleCount < processedProducts.length;

  // Reset pagination when category, filter, or sort changes
  useEffect(() => {
    setVisibleCount(ITEMS_PER_PAGE);
  }, [categorySlug, maxPrice, sortBy]);

  // Intersection Observer for Infinite Scroll
  useEffect(() => {
    const target = observerTarget.current;
    if (!target || !hasMore || isLoadingMore) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setIsLoadingMore(true);
          setTimeout(() => {
            setVisibleCount((prev) => prev + ITEMS_PER_PAGE);
            setIsLoadingMore(false);
          }, 400);
        }
      },
      { threshold: 0.1 }
    );

    observer.observe(target);

    return () => {
      if (target) observer.unobserve(target);
    };
  }, [hasMore, isLoadingMore]);

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 flex flex-col justify-between">
      <div>
        <Navbar
          cartCount={cart.reduce((sum, item) => sum + item.quantity, 0)}
          wishlistCount={wishlistIds.length}
          toggleCart={() => setIsCartOpen(!isCartOpen)}
          activeFilter="Collections"
        />

        <Cart
          isOpen={isCartOpen}
          onClose={() => setIsCartOpen(false)}
          items={cart}
          onUpdateQuantity={updateQuantity}
        />

        <main className="max-w-7xl mx-auto px-3 sm:px-4 py-6 sm:py-8">
          {/* Breadcrumb Navigation */}
          <div className="flex items-center gap-2 text-xs text-gray-400 mb-4 sm:mb-6 font-medium">
            <Link href="/" className="hover:text-orange-500">Home</Link>
            <span>/</span>
            <Link href="/collections" className="hover:text-orange-500">Collections</Link>
            <span>/</span>
            <span className="text-gray-800 font-bold uppercase">{categoryTitle}</span>
          </div>

          {/* Header Banner */}
          <div className="bg-white border border-gray-200 rounded-3xl p-6 mb-8 shadow-sm">
            <span className="text-[10px] sm:text-xs font-black uppercase tracking-widest text-orange-500">
              Collection Drop
            </span>
            <h1 className="text-2xl sm:text-4xl font-black text-gray-900 uppercase mt-0.5">
              {categoryTitle}
            </h1>
            <p className="text-gray-500 text-xs sm:text-sm mt-1">
              Explore our curated selection of {categoryProducts.length} items in this drop.
            </p>
          </div>

          {/* Main Layout Grid: Sidebar + Product Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            
            {/* 1. SECTION-BASED SIDEBAR */}
            <aside className="lg:col-span-1 space-y-6">
              <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm space-y-6">
                <div className="flex items-center justify-between border-b pb-3 border-gray-100">
                  <h2 className="font-extrabold text-sm uppercase tracking-wider text-gray-900">
                    Filters
                  </h2>
                  <button 
                    onClick={() => setMaxPrice(highestCatalogPrice)}
                    className="text-[11px] font-bold text-orange-500 hover:underline"
                  >
                    Reset All
                  </button>
                </div>

                {/* Sub-Categories for active Section */}
                <div>
                  <h3 className="text-xs font-black uppercase text-gray-400 tracking-wider mb-3">
                    {activeSectionGroup.title}
                  </h3>
                  <div className="space-y-1.5 max-h-60 overflow-y-auto pr-1">
                    {activeSectionGroup.items.map((item) => {
                      const count = getProductsForSlug(item.id).length;
                      const isActive = categorySlug === item.id;

                      return (
                        <Link
                          key={item.id}
                          href={`/collections/${item.id}`}
                          className={`w-full text-left text-xs px-3 py-2 rounded-xl flex items-center justify-between transition-colors ${
                            isActive
                              ? "bg-orange-50 text-orange-600 font-extrabold"
                              : "text-gray-600 hover:bg-gray-50 font-medium"
                          }`}
                        >
                          <span className="truncate">{item.name}</span>
                          <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                            isActive ? "bg-orange-200 text-orange-800" : "bg-gray-100 text-gray-500"
                          }`}>
                            {count}
                          </span>
                        </Link>
                      );
                    })}
                  </div>
                </div>

                {/* Price Filter Slider */}
                <div className="border-t border-gray-100 pt-4">
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="text-xs font-black uppercase text-gray-400 tracking-wider">
                      Max Price
                    </h3>
                    <span className="text-xs font-extrabold text-gray-900">${maxPrice}</span>
                  </div>
                  <input
                    type="range"
                    min="20"
                    max={highestCatalogPrice}
                    step="10"
                    value={maxPrice}
                    onChange={(e) => setMaxPrice(Number(e.target.value))}
                    className="w-full accent-orange-500 cursor-pointer h-1.5 bg-gray-200 rounded-lg"
                  />
                  <div className="flex justify-between text-[10px] text-gray-400 font-bold mt-1">
                    <span>$20</span>
                    <span>${highestCatalogPrice}</span>
                  </div>
                </div>
              </div>
            </aside>

            {/* 2. PRODUCT CATALOG GRID */}
            <section className="lg:col-span-3">
              
              {/* Utility Control Bar */}
              <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-sm mb-6 flex flex-col sm:flex-row items-center justify-between gap-4">
                <p className="text-xs font-bold text-gray-500">
                  Showing <span className="text-gray-900 font-black">{displayedProducts.length}</span> of {processedProducts.length} items
                </p>

                <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                  <label htmlFor="sort" className="text-xs font-bold text-gray-400 uppercase tracking-wider whitespace-nowrap">
                    Sort By:
                  </label>
                  <select
                    id="sort"
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="text-xs font-bold text-gray-800 bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 outline-none focus:ring-2 focus:ring-orange-500"
                  >
                    <option value="default">Default</option>
                    <option value="price-low">Price: Low to High</option>
                    <option value="price-high">Price: High to Low</option>
                    <option value="name">Name (A-Z)</option>
                  </select>
                </div>
              </div>

              {/* Products Display */}
              {processedProducts.length === 0 ? (
                <div className="text-center py-20 bg-white rounded-3xl border border-gray-200">
                  <p className="text-gray-500 font-medium text-sm">No items match your filter criteria.</p>
                  <button
                    onClick={() => setMaxPrice(highestCatalogPrice)}
                    className="mt-4 inline-block bg-orange-500 text-white font-bold px-6 py-2.5 rounded-xl text-xs"
                  >
                    Clear Filters
                  </button>
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-5">
                    {displayedProducts.map((product) => {
                      const isLiked = wishlistIds.map(String).includes(String(product.id));
                      const discountPercent = getDiscountPercent(product.id);
                      const originalPrice = product.price * (1 + discountPercent / 100);

                      return (
                        <div
                          key={product.id}
                          className="bg-white rounded-2xl p-3 sm:p-4 border border-gray-200 shadow-sm hover:shadow-lg transition-all relative group flex flex-col justify-between"
                        >
                          {/* Dynamic Discount Badge */}
                          <div className="absolute top-3 left-3 bg-red-500 text-white text-[9px] font-black px-2 py-0.5 rounded-md uppercase tracking-wider z-10 shadow-sm">
                            -{discountPercent}% OFF
                          </div>

                          {/* Wishlist Button */}
<button
  onClick={(e) => {
    e.stopPropagation();
    e.preventDefault();
    toggleWishlist(product.id);
  }}
  className="absolute top-3 right-3 bg-white/90 p-2 rounded-full shadow-md z-10 hover:scale-110 transition-transform"
>
  <HeartIcon filled={isLiked} />
  </button>

                          <div>
                            <Link href={`/products/${product.id}`}>
                              <div className="w-full h-36 sm:h-48 relative rounded-xl overflow-hidden bg-gray-100 mb-3 mt-4">
                                <img
                                  src={product.image_url}
                                  alt={product.name}
                                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                />
                              </div>
                              <div className="flex items-center justify-between mb-1">
                                <span className="text-[9px] sm:text-[10px] font-extrabold text-orange-500 uppercase tracking-wider block">
                                  {product.company || (product as any).brand || product.category}
                                </span>
                                <span className="text-[9px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded">
                                  In Stock
                                </span>
                              </div>

                              <h3 className="font-bold text-gray-900 text-xs sm:text-sm line-clamp-1">
                                {product.name}
                              </h3>
                            </Link>
                          </div>

                          {/* Side-by-Side Price and Add to Cart Section */}
                          <div className="mt-3 pt-2 sm:pt-3 border-t border-gray-100 flex items-center justify-between gap-1.5">
                            <div>
                              <span className="text-[10px] text-gray-400 line-through font-bold block leading-none mb-0.5">
                                ${originalPrice.toFixed(2)}
                              </span>
                              <p className="text-black font-black text-sm sm:text-base leading-none">
                                ${product.price.toFixed(2)}
                              </p>
                            </div>

                            <button
                              onClick={() => {
                                addToCart(product);
                                notify.success("Added to Cart! 🛒");
                              }}
                              className="bg-orange-500 hover:bg-orange-600 text-white font-extrabold py-2 px-3 rounded-xl text-[10px] sm:text-xs transition-all shadow-sm active:scale-95 flex items-center gap-1.5 whitespace-nowrap"
                            >
                              <span>🛒</span>
                              <span className="hidden sm:inline">Add to Cart</span>
                              <span className="sm:hidden">Add</span>
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* INFINITE SCROLL TRIGGER / LOADER */}
                  <div ref={observerTarget} className="py-10 flex justify-center items-center">
                    {isLoadingMore && (
                      <div className="flex items-center gap-2.5 text-orange-500 text-xs font-bold bg-white px-5 py-2.5 rounded-full border border-gray-200 shadow-sm">
                        <span className="w-4 h-4 border-2 border-orange-200 border-t-orange-500 rounded-full animate-spin" />
                        <span>Loading more products...</span>
                      </div>
                    )}

                    {!hasMore && processedProducts.length > ITEMS_PER_PAGE && (
                      <p className="text-xs font-extrabold tracking-widest text-gray-400 uppercase">
                        You&apos;ve reached the end of the vault
                      </p>
                    )}
                  </div>
                </>
              )}
            </section>
          </div>
        </main>
      </div>

      {toast && (
        <div className="fixed bottom-6 right-6 z-50 bg-gray-900 text-white px-5 py-3 rounded-xl shadow-2xl flex items-center gap-3 border border-gray-700">
          <span className="text-orange-400 font-bold">✓</span>
          <span className="text-sm font-semibold">{toast}</span>
        </div>
      )}

      <br /><br />

      {/* Value Proposition Grid */}
      <section className="max-w-7xl mx-auto px-4 w-full">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 my-6 sm:my-12">
          {[
            { icon: "✈️", title: "Free Worldwide Shipping", desc: "On all orders over $150" },
            { icon: "🛡️", title: "100% Verified Authentic", desc: "Every item hand-checked by experts" },
            { icon: "🔄", title: "30-Day Easy Returns", desc: "Hassle-free exchanges & refunds" },
            { icon: "🔒", title: "Encrypted Checkout", desc: "Bank-level secure payments" },
          ].map((feature, idx) => (
            <div
              key={idx}
              className="bg-white p-5 sm:p-6 rounded-2xl border border-gray-200 shadow-sm flex items-start gap-4"
            >
              <span className="text-2xl sm:text-3xl">{feature.icon}</span>
              <div>
                <h4 className="font-bold text-gray-900 text-xs sm:text-sm">{feature.title}</h4>
                <p className="text-gray-500 text-[11px] sm:text-xs mt-1">{feature.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <Footer />
    </div>
  );
}