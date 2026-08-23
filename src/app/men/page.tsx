// src/app/men/page.tsx
"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Cart from "@/components/Cart";
import ProductModal from "@/components/ProductModal";
import Link from "next/link";
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

export default function MenPage() {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [wishlist, setWishlist] = useState<string[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [activeSizeTab, setActiveSizeTab] = useState<"nike" | "jordan" | "yeezy" | "adidas">("nike");

  // Infinite Scroll States
  const ITEMS_PER_PAGE = 12;
  const [visibleCount, setVisibleCount] = useState<number>(ITEMS_PER_PAGE);
  const [isLoadingMore, setIsLoadingMore] = useState<boolean>(false);
  const observerTarget = useRef<HTMLDivElement>(null);

  // Load Saved Wishlist & Cart from localStorage
  useEffect(() => {
    const savedWishlist = localStorage.getItem("sneaker_wishlist");
    if (savedWishlist) {
      try {
        setWishlist(JSON.parse(savedWishlist));
      } catch (e) {
        console.error(e);
      }
    }

    const savedCart = localStorage.getItem("sneaker_cart");
    if (savedCart) {
      try {
        setCart(JSON.parse(savedCart));
      } catch (e) {
        console.error(e);
      }
    }
  }, []);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2500);
  };

  const toggleWishlist = (productId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();

    let updated: string[];
    if (wishlist.includes(productId)) {
      updated = wishlist.filter((id) => id !== productId);
      showToast("Removed from Wishlist");
    } else {
      updated = [...wishlist, productId];
      showToast("Saved to Wishlist");
    }
    setWishlist(updated);
    localStorage.setItem("sneaker_wishlist", JSON.stringify(updated));
  };

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

  const updateQuantity = (id: string, delta: number) => {
    setCart((prev) => {
      const updated = prev
        .map((item) => {
          if (item.id === id) {
            const newQty = item.quantity + delta;
            return newQty > 0 ? { ...item, quantity: newQty } : null;
          }
          return item;
        })
        .filter(Boolean) as CartItem[];

      localStorage.setItem("sneaker_cart", JSON.stringify(updated));
      return updated;
    });
  };

  // Filter for Men's products using useMemo
  const menProducts = useMemo(() => {
    return allProducts.filter(
      (p) => p.gender?.toLowerCase() === "men" || p.gender?.toLowerCase() === "unisex"
    );
  }, []);

  // Top picks derived from men's products (first 5 or high-demand items)
  const topPicks = useMemo(() => {
    return menProducts.slice(0, 5);
  }, [menProducts]);

  // Slice list based on visible count
  const displayedProducts = useMemo(() => {
    return menProducts.slice(0, visibleCount);
  }, [menProducts, visibleCount]);

  const hasMore = visibleCount < menProducts.length;

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
          wishlistCount={wishlist.length}
          toggleCart={() => setIsCartOpen(!isCartOpen)}
          activeFilter="Men"
          onFilterChange={() => {}}
        />

        <Cart
          isOpen={isCartOpen}
          onClose={() => setIsCartOpen(false)}
          items={cart}
          onUpdateQuantity={updateQuantity}
        />

        <main className="max-w-7xl mx-auto px-3 sm:px-4 py-8">
          {/* HERO BANNER */}
          <div className="bg-black text-white rounded-3xl p-6 sm:p-8 mb-8 sm:mb-10 flex flex-col justify-end h-56 sm:h-64 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-black via-black/70 to-transparent z-10 p-6 sm:p-8 flex flex-col justify-center">
              <span className="text-orange-500 font-extrabold text-xs uppercase tracking-widest mb-2">
                Men&apos;s Collection ({menProducts.length})
              </span>
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-black">MEN&apos;S FOOTWEAR & GEAR</h1>
              <p className="text-gray-400 text-xs sm:text-sm mt-2 max-w-md">
                Performance specs meets high-street utility. Built for motion.
              </p>
            </div>
            <img
              src="https://images.unsplash.com/photo-1512374382149-233c42b6a83b?w=1200&auto=format&fit=crop"
              alt="Men Banner"
              className="absolute inset-0 w-full h-full object-cover opacity-40"
            />
          </div>

          {/* SECTION 1: SUB-CATEGORY CARDS */}
<section className="mb-12">
  <div className="flex items-center justify-between mb-4">
    <h2 className="text-lg sm:text-xl font-black tracking-tight text-gray-900">
      EXPLORE CATEGORIES
    </h2>
    <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">
      Visual Shortcuts
    </span>
  </div>

  {/* Mobile: Horizontal Carousel | Desktop: 3-Column Grid */}
  <div className="flex sm:grid sm:grid-cols-3 gap-4 overflow-x-auto pb-2 sm:pb-0 scrollbar-none snap-x snap-mandatory">
    {[
      {
        title: "Retro Runners",
        tag: "90s Vibes & Chunky Soles",
        img: "https://images.unsplash.com/photo-1584735935682-2f2b69dff9d2?w=600&auto=format&fit=crop",
      },
      {
        title: "Court Classics",
        tag: "Low-tops & Hardwood Heritage",
        img: "https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=600&auto=format&fit=crop",
      },
      {
        title: "Street Utility",
        tag: "GORE-TEX & All-Weather Spec",
        img: "https://images.unsplash.com/photo-1539185441755-769473a23570?w=600&auto=format&fit=crop",
      },
    ].map((sub, idx) => (
      <div
        key={idx}
        className="min-w-[82%] sm:min-w-0 relative rounded-2xl overflow-hidden h-40 group cursor-pointer border border-gray-200 shadow-sm flex-shrink-0 snap-center"
      >
        <img
          src={sub.img}
          alt={sub.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent p-4 flex flex-col justify-end">
          <h3 className="text-white font-black text-lg leading-tight">
            {sub.title}
          </h3>
          <p className="text-orange-400 text-xs font-medium mt-0.5">
            {sub.tag}
          </p>
        </div>
      </div>
    ))}
  </div>
</section>

          {/* SECTION 2: TOP PICKS OF THE MONTH CAROUSEL */}
          <section className="mb-12 bg-gray-900 text-white p-6 rounded-3xl relative overflow-hidden">
            <div className="flex items-center justify-between mb-6">
              <div>
                <span className="text-orange-500 text-[10px] font-black uppercase tracking-widest block mb-1">
                  Curated Highlights
                </span>
                <h2 className="text-xl sm:text-2xl font-black">TOP PICKS OF THE MONTH</h2>
              </div>
              <span className="text-xs text-gray-400 font-bold hidden sm:inline-block">
                Swipe to explore →
              </span>
            </div>

            <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-none snap-x">
              {topPicks.map((product) => (
                <div
                  key={product.id}
                  className="min-w-[220px] max-w-[240px] bg-gray-800/80 rounded-2xl p-3 border border-gray-700/60 flex-shrink-0 snap-start flex flex-col justify-between group"
                >
                  <div>
                    <div className="relative w-full h-36 bg-gray-900 rounded-xl overflow-hidden mb-3">
                      <span className="absolute top-2 left-2 bg-orange-500 text-black font-black text-[9px] px-2 py-0.5 rounded uppercase z-10">
                        Top Pick
                      </span>
                      <img
                        src={product.image_url}
                        alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                    <p className="text-[10px] text-orange-400 font-bold uppercase">{product.company || "Featured"}</p>
                    <h3 className="text-xs font-bold line-clamp-1 mt-0.5 text-white">{product.name}</h3>
                  </div>

                  <div className="mt-3 pt-2 border-t border-gray-700/50 flex items-center justify-between">
                    <span className="font-black text-sm text-white">${product.price.toFixed(2)}</span>
                    <button
                      onClick={() => addToCart(product)}
                      className="bg-white text-black hover:bg-orange-500 hover:text-white font-black text-[10px] px-2.5 py-1.5 rounded-lg transition-colors"
                    >
                      Quick Add
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* MAIN CATALOG HEADER */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg sm:text-xl font-black text-gray-900 uppercase">ALL MEN&apos;S RELEASES</h2>
            <span className="text-xs font-bold text-gray-500">Showing {displayedProducts.length} of {menProducts.length}</span>
          </div>

          {/* Grid Layout */}
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {displayedProducts.map((product) => {
              const isLiked = wishlist.includes(product.id);
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
  onClick={(e) => toggleWishlist(product.id, e)}
  className="absolute top-3 right-3 bg-white/90 p-2 rounded-full shadow-md z-10 hover:scale-110 transition-transform"
>
  <HeartIcon filled={wishlist.includes(product.id)} />
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

          {/* INFINITE SCROLL TRIGGER / LOADER */}
          <div ref={observerTarget} className="py-10 flex justify-center items-center">
            {isLoadingMore && (
              <div className="flex items-center gap-2.5 text-orange-500 text-xs font-bold bg-white px-5 py-2.5 rounded-full border border-gray-200 shadow-sm">
                <span className="w-4 h-4 border-2 border-orange-200 border-t-orange-500 rounded-full animate-spin" />
                <span>Loading more items...</span>
              </div>
            )}

            {!hasMore && menProducts.length > ITEMS_PER_PAGE && (
              <p className="text-xs font-extrabold tracking-widest text-gray-400 uppercase">
                You&apos;ve reached the end of the Men&apos;s collection
              </p>
            )}
          </div>

          {/* SECTION 3: SIZING & FIT GUIDE INTERACTIVE BANNER */}
          <section className="my-10 bg-white border border-gray-200 rounded-3xl p-6 sm:p-8 shadow-sm">
            <div className="max-w-3xl mx-auto text-center">
              <span className="text-orange-500 font-extrabold text-[10px] uppercase tracking-widest">
                Fit Advisory
              </span>
              <h2 className="text-2xl font-black text-gray-900 mt-1">FIND YOUR EXACT SIZE</h2>
              <p className="text-xs text-gray-500 mt-1 mb-6">
                Sneaker sizing varies heavily across silhouettes and brands. Select a brand below for quick sizing rules.
              </p>

              {/* Tabs */}
              <div className="flex justify-center gap-2 mb-6">
                {(["nike", "jordan", "yeezy", "adidas"] as const).map((brand) => (
                  <button
                    key={brand}
                    onClick={() => setActiveSizeTab(brand)}
                    className={`px-4 py-2 rounded-xl text-xs font-black uppercase transition-all ${
                      activeSizeTab === brand
                        ? "bg-orange-500 text-white shadow-md"
                        : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                    }`}
                  >
                    {brand}
                  </button>
                ))}
              </div>

              {/* Dynamic Fit Info */}
              <div className="bg-gray-50 p-4 sm:p-6 rounded-2xl text-left border border-gray-100">
                {activeSizeTab === "nike" && (
                  <div>
                    <h3 className="font-black text-sm text-gray-900">Nike Sizing Guide</h3>
                    <p className="text-xs text-gray-600 mt-1">
                      • **Air Force 1s**: Run 0.5 size large. Consider ordering half a size down.<br />
                      • **Dunks & Air Max**: True to size for standard feet; go up 0.5 for wide feet.
                    </p>
                  </div>
                )}
                {activeSizeTab === "jordan" && (
                  <div>
                    <h3 className="font-black text-sm text-gray-900">Jordan Sizing Guide</h3>
                    <p className="text-xs text-gray-600 mt-1">
                      • **Air Jordan 1 & 4**: Fits true to size with snug ankle support.<br />
                      • **Air Jordan 11**: True to size; narrow toe-box might require half size up for wide feet.
                    </p>
                  </div>
                )}
                {activeSizeTab === "yeezy" && (
                  <div>
                    <h3 className="font-black text-sm text-gray-900">Yeezy Sizing Guide</h3>
                    <p className="text-xs text-gray-600 mt-1">
                      • **Yeezy Boost 350 V2**: Always order **0.5 size UP** due to tight knit toe box.<br />
                      • **Yeezy Slides & Foam Runners**: Order 1 full size up from standard size.
                    </p>
                  </div>
                )}
                {activeSizeTab === "adidas" && (
                  <div>
                    <h3 className="font-black text-sm text-gray-900">Adidas Sizing Guide</h3>
                    <p className="text-xs text-gray-600 mt-1">
                      • **Samba & Gazelle**: Narrow fit; stick to true size or go 0.5 size up for comfort.<br />
                      • **Ultraboost**: Primeknit sock upper fits snug; standard true to size recommended.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </section>
        </main>
      </div>

      {/* Toast Notification */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 bg-gray-900 text-white px-5 py-3 rounded-xl shadow-2xl flex items-center gap-3 border border-gray-700">
          <span className="text-orange-400 font-bold">✓</span>
          <span className="text-sm font-semibold">{toast}</span>
        </div>
      )}

      <ProductModal
        product={selectedProduct}
        onClose={() => setSelectedProduct(null)}
        onAddToCart={addToCart}
      />

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