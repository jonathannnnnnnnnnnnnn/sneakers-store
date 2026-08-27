// src/app/catalog/page.tsx
"use client";

import Link from "next/link";
import { useState, useEffect, useMemo, useRef } from "react";
import Navbar from "@/components/Navbar";
import Cart from "@/components/Cart";
import Footer from "@/components/Footer";
import { allProducts, Product } from "@/data/products";
import { useStore } from "@/context/StoreContext";
import { toast as notify } from "react-hot-toast";

const brandList = [
  "NIKE",
  "JORDAN",
  "ADIDAS",
  "NEW BALANCE",
  "VANS",
  "YEEZY",
  "PUMA",
  "ASICS",
];

const getDiscountPercent = (id: string) => {
  const hash = id.split("").reduce((sum, char) => sum + char.charCodeAt(0), 0);
  const rates = [10, 15, 20, 25, 30];
  return rates[hash % rates.length];
};

export default function CatalogPage() {
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedBrand, setSelectedBrand] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");

  const { cart, wishlistIds, addToCart, toggleWishlist, updateQuantity } = useStore();
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  // Infinite Scroll States
  const ITEMS_PER_PAGE = 12;
  const [visibleCount, setVisibleCount] = useState<number>(ITEMS_PER_PAGE);
  const [isLoadingMore, setIsLoadingMore] = useState<boolean>(false);
  const observerTarget = useRef<HTMLDivElement>(null);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2500);
  };

  // Filtered master collection
  const filteredProducts = useMemo(() => {
    return allProducts.filter((product) => {
      const matchesCategory =
        selectedCategory === "All" ||
        product.category.toLowerCase() === selectedCategory.toLowerCase();

      const matchesSearch =
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (product.company &&
          product.company.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesBrand =
        selectedBrand === "All" ||
        (product.company &&
          product.company.toLowerCase() === selectedBrand.toLowerCase());

      return matchesCategory && matchesSearch && matchesBrand;
    });
  }, [selectedCategory, searchQuery, selectedBrand]);

  // Paginated slice for smooth infinite scroll
  const displayedProducts = useMemo(() => {
    return filteredProducts.slice(0, visibleCount);
  }, [filteredProducts, visibleCount]);

  const hasMore = visibleCount < filteredProducts.length;

  // Reset pagination count when filters or search change
  useEffect(() => {
    setVisibleCount(ITEMS_PER_PAGE);
  }, [selectedCategory, selectedBrand, searchQuery]);

  // Intersection Observer trigger
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
          activeFilter={selectedCategory}
          onFilterChange={(cat) => setSelectedCategory(cat)}
        />

        <Cart
          isOpen={isCartOpen}
          onClose={() => setIsCartOpen(false)}
          items={cart}
          onUpdateQuantity={updateQuantity}
        />

        <main className="max-w-7xl mx-auto px-4 py-8 space-y-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-6 border-b border-gray-200">
            <div>
              <Link
                href="/"
                className="text-xs font-bold text-gray-500 hover:text-orange-500 mb-2 inline-block transition-colors"
              >
                ← Back to Home
              </Link>
              <h1 className="text-3xl sm:text-4xl font-black tracking-tight uppercase">
                Full Catalog ({filteredProducts.length})
              </h1>
              <p className="text-gray-500 text-sm mt-1">
                Showing all available items in one continuous list
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
              <input
                type="text"
                placeholder="Search catalog..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-orange-500 w-full md:w-auto bg-white"
              />

              <select
                value={selectedBrand}
                onChange={(e) => setSelectedBrand(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-xl text-sm font-medium bg-white w-full md:w-auto cursor-pointer"
              >
                <option value="All">All Brands</option>
                <option value="Nike">Nike</option>
                <option value="Adidas">Adidas</option>
                <option value="Jordan">Jordan</option>
                <option value="Puma">Puma</option>
                <option value="New Balance">New Balance</option>
                <option value="Vans">Vans</option>
                <option value="Yeezy">Yeezy</option>
              </select>
            </div>
          </div>

          {filteredProducts.length > 0 ? (
            <>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 sm:gap-6">
                {displayedProducts.map((product) => {
                  const isLiked = wishlistIds.map(String).includes(String(product.id));
                  const discount = getDiscountPercent(product.id);
                  const originalPrice = product.price * (1 + discount / 100);

                  return (
                    <div
                      key={product.id}
                      className="bg-white rounded-2xl p-3 sm:p-4 border border-gray-200 shadow-sm hover:shadow-lg transition-all relative group flex flex-col justify-between"
                    >
                      <div className="absolute top-3 left-3 bg-red-500 text-white text-[9px] font-black px-2 py-0.5 rounded-md uppercase tracking-wider z-10 shadow-sm">
                        -{discount}% OFF
                      </div>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          e.preventDefault();
                          toggleWishlist(product.id);
                        }}
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
                    <span>Loading more items...</span>
                  </div>
                )}

                {!hasMore && filteredProducts.length > ITEMS_PER_PAGE && (
                  <p className="text-xs font-extrabold tracking-widest text-gray-400 uppercase">
                    You&apos;ve reached the end of the catalog
                  </p>
                )}
              </div>
            </>
          ) : (
            <div className="text-center py-16 bg-white rounded-3xl border border-gray-200">
              <p className="text-4xl mb-2">🔍</p>
              <h3 className="text-xl font-bold text-gray-800">No products found</h3>
              <p className="text-gray-500 text-sm mt-1">Try resetting your search or brand filters</p>
              <button
                onClick={() => {
                  setSearchQuery("");
                  setSelectedBrand("All");
                  setSelectedCategory("All");
                }}
                className="mt-4 bg-orange-500 text-white font-bold text-xs px-4 py-2 rounded-xl"
              >
                Reset Filters
              </button>
            </div>
          )}
        </main>
      </div>

      {toast && (
        <div className="fixed bottom-6 right-6 z-50 bg-gray-900 text-white px-5 py-3 rounded-xl shadow-2xl flex items-center gap-3 border border-gray-700">
          <span className="text-orange-400 font-bold">✓</span>
          <span className="text-sm font-semibold">{toast}</span>
        </div>
      )}

      {/* Moving Marquee Brand Spotlight Row */}
      <section className="py-6 border-y border-gray-200 bg-white overflow-hidden my-12 relative w-full">
        <div className="animate-marquee flex items-center gap-8 md:gap-16 whitespace-nowrap">
          {[...brandList, ...brandList, ...brandList].map((brand, idx) => (
            <span
              key={`${brand}-${idx}`}
              className="text-lg md:text-2xl font-black tracking-widest text-gray-400 hover:text-orange-500 transition-colors cursor-pointer select-none"
            >
              {brand}
            </span>
          ))}
        </div>
      </section>

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