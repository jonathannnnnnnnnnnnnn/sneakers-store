"use client";

import { useState, useEffect, use, useMemo } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Cart from "@/components/Cart";
import Footer from "@/components/Footer";
import { allProducts, Product } from "@/data/products";

interface CartItem {
  id: string;
  name: string;
  price: number;
  image_url: string;
  quantity: number;
}

// Helper function to calculate a realistic dynamic discount per product ID
const getDiscountPercent = (id: string) => {
  const hash = id.split("").reduce((sum, char) => sum + char.charCodeAt(0), 0);
  const rates = [10, 15, 20, 25, 30];
  return rates[hash % rates.length];
};

export default function CategoryPage({ params }: { params: Promise<{ category: string }> }) {
  const resolvedParams = use(params);
  const categorySlug = decodeURIComponent(resolvedParams.category);

  const [cart, setCart] = useState<CartItem[]>([]);
  const [wishlistIds, setWishlistIds] = useState<string[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  // Filter & Sort States
  const [selectedBrand, setSelectedBrand] = useState<string>("All");
  const [maxPrice, setMaxPrice] = useState<number>(1000);
  const [sortBy, setSortBy] = useState<string>("default");

  useEffect(() => {
    const savedWishlist = localStorage.getItem("sneaker_wishlist");
    if (savedWishlist) {
      try {
        const parsed = JSON.parse(savedWishlist);
        if (Array.isArray(parsed)) setWishlistIds(parsed);
      } catch (e) {}
    }

    const savedCart = localStorage.getItem("sneaker_cart");
    if (savedCart) {
      try {
        const parsed = JSON.parse(savedCart);
        if (Array.isArray(parsed)) setCart(parsed);
      } catch (e) {}
    }
  }, []);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2500);
  };

  // Base Category Filter
  const categoryProducts = useMemo(() => {
    return allProducts.filter(
      (p) =>
        (p.company && p.company.toLowerCase() === categorySlug.toLowerCase()) ||
        ((p as any).brand && (p as any).brand.toLowerCase() === categorySlug.toLowerCase()) ||
        (p.category && p.category.toLowerCase() === categorySlug.toLowerCase()) ||
        categorySlug.toLowerCase() === "all"
    );
  }, [categorySlug]);

  const categoryTitle =
    categoryProducts[0]?.company || categoryProducts[0]?.category || categorySlug.toUpperCase();

  // Get Brand/Company list & item counts for Sidebar
  const brandCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    categoryProducts.forEach((p) => {
      const brandName = p.company || (p as any).brand || "General";
      counts[brandName] = (counts[brandName] || 0) + 1;
    });
    return counts;
  }, [categoryProducts]);

  // Apply Sidebar Filters + Sort
  const processedProducts = useMemo(() => {
    let result = [...categoryProducts];

    // Brand filter
    if (selectedBrand !== "All") {
      result = result.filter(
        (p) => (p.company || (p as any).brand) === selectedBrand
      );
    }

    // Price Filter
    result = result.filter((p) => p.price <= maxPrice);

    // Sorting
    if (sortBy === "price-low") {
      result.sort((a, b) => a.price - b.price);
    } else if (sortBy === "price-high") {
      result.sort((a, b) => b.price - a.price);
    } else if (sortBy === "name") {
      result.sort((a, b) => a.name.localeCompare(b.name));
    }

    return result;
  }, [categoryProducts, selectedBrand, maxPrice, sortBy]);

  const addToCart = (product: Product) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.id === product.id);
      let updated: CartItem[];
      if (existing) {
        updated = prev.map((item) =>
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      } else {
        updated = [
          ...prev,
          {
            id: product.id,
            name: product.name,
            price: product.price,
            image_url: product.image_url,
            quantity: 1,
          },
        ];
      }
      localStorage.setItem("sneaker_cart", JSON.stringify(updated));
      return updated;
    });
    showToast(`Added "${product.name}" to cart! 🛒`);
  };

  const toggleWishlist = (id: string) => {
    let updated: string[];
    if (wishlistIds.includes(id)) {
      updated = wishlistIds.filter((favId) => favId !== id);
      showToast("Removed from wishlist");
    } else {
      updated = [...wishlistIds, id];
      showToast("Added to wishlist ❤️");
    }
    setWishlistIds(updated);
    localStorage.setItem("sneaker_wishlist", JSON.stringify(updated));
  };

  const updateQuantity = (id: string, delta: number) => {
    setCart((prev) => {
      const updated = prev
        .map((item) => (item.id === id ? { ...item, quantity: item.quantity + delta } : item))
        .filter((item) => item.quantity > 0);
      localStorage.setItem("sneaker_cart", JSON.stringify(updated));
      return updated;
    });
  };

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
            <span className="text-gray-800 font-bold capitalize">{categoryTitle}</span>
          </div>

          {/* Header Banner */}
          <div className="bg-white border border-gray-200 rounded-3xl p-6 mb-8 shadow-sm">
            <span className="text-[10px] sm:text-xs font-black uppercase tracking-widest text-orange-500">
              Collection Overview
            </span>
            <h1 className="text-2xl sm:text-4xl font-black text-gray-900 uppercase mt-0.5">
              {categoryTitle}
            </h1>
            <p className="text-gray-500 text-xs sm:text-sm mt-1">
              Discover our full collection of {categoryProducts.length} items curated just for you.
            </p>
          </div>

          {/* Main Layout Grid: Sidebar + Product Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            
            {/* 1. FILTER SIDEBAR */}
            <aside className="lg:col-span-1 space-y-6">
              <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm space-y-6">
                <div className="flex items-center justify-between border-b pb-3 border-gray-100">
                  <h2 className="font-extrabold text-sm uppercase tracking-wider text-gray-900">
                    Filters
                  </h2>
                  <button 
                    onClick={() => { setSelectedBrand("All"); setMaxPrice(1000); }}
                    className="text-[11px] font-bold text-orange-500 hover:underline"
                  >
                    Reset All
                  </button>
                </div>

                {/* Sub-Brand / Category Filter */}
                <div>
                  <h3 className="text-xs font-black uppercase text-gray-400 tracking-wider mb-3">
                    Brands & Categories
                  </h3>
                  <div className="space-y-1.5 max-h-60 overflow-y-auto pr-1">
                    <button
                      onClick={() => setSelectedBrand("All")}
                      className={`w-full text-left text-xs px-3 py-2 rounded-xl flex items-center justify-between transition-colors ${
                        selectedBrand === "All"
                          ? "bg-orange-50 text-orange-600 font-extrabold"
                          : "text-gray-600 hover:bg-gray-50 font-medium"
                      }`}
                    >
                      <span>All Items</span>
                      <span className="text-[10px] bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full font-bold">
                        {categoryProducts.length}
                      </span>
                    </button>

                    {Object.entries(brandCounts).map(([brand, count]) => (
                      <button
                        key={brand}
                        onClick={() => setSelectedBrand(brand)}
                        className={`w-full text-left text-xs px-3 py-2 rounded-xl flex items-center justify-between transition-colors ${
                          selectedBrand === brand
                            ? "bg-orange-50 text-orange-600 font-extrabold"
                            : "text-gray-600 hover:bg-gray-50 font-medium"
                        }`}
                      >
                        <span className="truncate">{brand}</span>
                        <span className="text-[10px] bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full font-bold">
                          {count}
                        </span>
                      </button>
                    ))}
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
                    max="1000"
                    step="10"
                    value={maxPrice}
                    onChange={(e) => setMaxPrice(Number(e.target.value))}
                    className="w-full accent-orange-500 cursor-pointer h-1.5 bg-gray-200 rounded-lg"
                  />
                  <div className="flex justify-between text-[10px] text-gray-400 font-bold mt-1">
                    <span>$20</span>
                    <span>$1000</span>
                  </div>
                </div>
              </div>
            </aside>

            {/* 2. PRODUCT CATALOG GRID */}
            <section className="lg:col-span-3">
              
              {/* Utility Control Bar */}
              <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-sm mb-6 flex flex-col sm:flex-row items-center justify-between gap-4">
                <p className="text-xs font-bold text-gray-500">
                  Showing <span className="text-gray-900 font-black">{processedProducts.length}</span> of {categoryProducts.length} items
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
                    onClick={() => { setSelectedBrand("All"); setMaxPrice(1000); }}
                    className="mt-4 inline-block bg-orange-500 text-white font-bold px-6 py-2.5 rounded-xl text-xs"
                  >
                    Clear Filters
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-5">
                  {processedProducts.map((product) => {
                    const isLiked = wishlistIds.includes(product.id);
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
                          onClick={() => toggleWishlist(product.id)}
                          className="absolute top-3 right-3 bg-white/90 p-1.5 sm:p-2 rounded-full shadow-md z-10 hover:scale-110 transition-transform text-xs sm:text-sm"
                        >
                          {isLiked ? "❤️" : "🤍"}
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
                                {product.company || product.category}
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
                            onClick={() => addToCart(product)}
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

      <Footer />
    </div>
  );
}