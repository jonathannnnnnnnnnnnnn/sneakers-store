// src/app/women/page.tsx
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

export default function WomenPage() {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [wishlist, setWishlist] = useState<string[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [activeSizeTab, setActiveSizeTab] = useState<"conversion" | "nike" | "yeezy" | "samba">("conversion");

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
        console.error("Failed to load wishlist:", e);
      }
    }

    const savedCart = localStorage.getItem("sneaker_cart");
    if (savedCart) {
      try {
        setCart(JSON.parse(savedCart));
      } catch (e) {
        console.error("Failed to load cart:", e);
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

  // Filter for Women's products using useMemo
  const womenProducts = useMemo(() => {
    return allProducts.filter(
      (p) => p.gender?.toLowerCase() === "women" || p.gender?.toLowerCase() === "unisex"
    );
  }, []);

  // Featured highlights for Women
  const topPicks = useMemo(() => {
    return womenProducts.slice(0, 5);
  }, [womenProducts]);

  // Slice list based on visible count
  const displayedProducts = useMemo(() => {
    return womenProducts.slice(0, visibleCount);
  }, [womenProducts, visibleCount]);

  const hasMore = visibleCount < womenProducts.length;

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
    <div className="min-h-screen bg-rose-50/30 text-gray-900 flex flex-col justify-between">
      <div>
        {/* Navbar */}
        <Navbar
          cartCount={cart.reduce((sum, item) => sum + item.quantity, 0)}
          wishlistCount={wishlist.length}
          toggleCart={() => setIsCartOpen(!isCartOpen)}
          activeFilter="Women"
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
          <div className="bg-zinc-900 text-white rounded-3xl p-6 sm:p-8 mb-8 sm:mb-10 flex flex-col justify-end h-56 sm:h-64 relative overflow-hidden shadow-lg">
            <div className="absolute inset-0 bg-gradient-to-r from-black via-black/70 to-transparent z-10 p-6 sm:p-8 flex flex-col justify-center">
              <span className="text-orange-500 font-extrabold text-xs uppercase tracking-widest mb-2 flex items-center gap-1.5">
                <span>✨</span> Women's Collection ({womenProducts.length})
              </span>
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight">WOMEN'S EDITION</h1>
              <p className="text-gray-400 text-xs sm:text-sm mt-2 max-w-md">
                Clean silhouettes, elevated palettes, and effortlessly cool daily staples.
              </p>
            </div>
            <img
              src="https://images.unsplash.com/photo-1582588678413-dbf45f4823e9?w=1200&auto=format&fit=crop"
              alt="Women Banner"
              className="absolute inset-0 w-full h-full object-cover opacity-40"
            />
          </div>

          {/* CURATED VIBES */}
<section className="mb-12">
  <div className="flex items-center justify-between mb-4">
    <h2 className="text-lg sm:text-xl font-black tracking-tight text-gray-900 flex items-center gap-2">
      CURATED VIBES <span className="text-xs font-bold">🌸</span>
    </h2>
    <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">
      Style Moods
    </span>
  </div>

  {/* Mobile: Horizontal Carousel (flex + overflow-x-auto) | Desktop: 3-Column Grid */}
  <div className="flex sm:grid sm:grid-cols-3 gap-4 overflow-x-auto pb-2 sm:pb-0 scrollbar-none snap-x snap-mandatory">
    {[
      {
        title: "Minimalist Whites",
        tag: "Crisp, Clean & Everyday Versatile",
        img: "https://images.unsplash.com/photo-1549298916-b41d501d3772?w=600&auto=format&fit=crop",
      },
      {
        title: "Chunky Platforms",
        tag: "Extra Height & Statement Soles",
        img: "https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=600&auto=format&fit=crop",
      },
      {
        title: "Pastel Essentials",
        tag: "Soft Tones & Subtle Accent Pop",
        img: "https://images.unsplash.com/photo-1584735935682-2f2b69dff9d2?w=600&auto=format&fit=crop",
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

          {/* TRENDING SPOTLIGHT CAROUSEL */}
          <section className="mb-12 bg-zinc-900 text-white p-6 rounded-3xl relative overflow-hidden shadow-lg border border-zinc-800">
            <div className="flex items-center justify-between mb-6">
              <div>
                <span className="text-orange-500 text-[10px] font-black uppercase tracking-widest block mb-1">
                  Trending Right Now 🔥
                </span>
                <h2 className="text-xl sm:text-2xl font-black">MOST SAVED BY WOMEN</h2>
              </div>
              <span className="text-xs text-gray-400 font-bold hidden sm:inline-block">
                Swipe to discover →
              </span>
            </div>

            <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-none snap-x">
              {topPicks.map((product) => (
                <div
                  key={product.id}
                  className="min-w-[220px] max-w-[240px] bg-zinc-800/90 rounded-2xl p-3 border border-zinc-700/60 flex-shrink-0 snap-start flex flex-col justify-between group"
                >
                  <div>
                    <div className="relative w-full h-36 bg-zinc-900 rounded-xl overflow-hidden mb-3">
                      <span className="absolute top-2 left-2 bg-orange-500 text-white font-black text-[9px] px-2 py-0.5 rounded uppercase z-10 shadow-sm">
                        Popular
                      </span>
                      <img
                        src={product.image_url}
                        alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                    <p className="text-[10px] text-orange-500 font-bold uppercase">{product.company || "Spotlight"}</p>
                    <h3 className="text-xs font-bold line-clamp-1 mt-0.5 text-white">{product.name}</h3>
                  </div>

                  <div className="mt-3 pt-2 border-t border-zinc-700/50 flex items-center justify-between">
                    <span className="font-black text-sm text-white">${product.price.toFixed(2)}</span>
                    <button
                      onClick={() => addToCart(product)}
                      className="bg-white hover:bg-gray-100 text-black font-black text-[10px] px-2.5 py-1.5 rounded-lg transition-colors"
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
            <h2 className="text-lg sm:text-xl font-black text-gray-900 uppercase tracking-tight">
              ALL WOMEN'S SILHOUETTES
            </h2>
            <span className="text-xs font-bold text-gray-500">Showing {displayedProducts.length} of {womenProducts.length}</span>
          </div>

          {/* Product Grid Layout */}
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {displayedProducts.map((product) => {
              const isLiked = wishlist.includes(product.id);
              const discount = getDiscountPercent(product.id);
              const originalPrice = product.price * (1 + discount / 100);

              return (
                <div
                  key={product.id}
                  className="bg-white rounded-2xl p-3 sm:p-4 border border-gray-200 shadow-sm hover:shadow-md transition-all relative group flex flex-col justify-between"
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

          {/* INFINITE SCROLL LOADER */}
          <div ref={observerTarget} className="py-10 flex justify-center items-center">
            {isLoadingMore && (
              <div className="flex items-center gap-2.5 text-orange-500 text-xs font-bold bg-white px-5 py-2.5 rounded-full border border-gray-200 shadow-sm">
                <span className="w-4 h-4 border-2 border-orange-200 border-t-orange-500 rounded-full animate-spin" />
                <span>Loading more items...</span>
              </div>
            )}

            {!hasMore && womenProducts.length > ITEMS_PER_PAGE && (
              <p className="text-xs font-extrabold tracking-widest text-gray-400 uppercase">
                You've reached the end of the Women's collection
              </p>
            )}
          </div>

          {/* WOMEN'S SIZING & CONVERSION GUIDE */}
          <section className="my-10 bg-white border border-gray-200 rounded-3xl p-6 sm:p-8 shadow-sm">
            <div className="max-w-3xl mx-auto text-center">
              <span className="text-orange-500 font-extrabold text-[10px] uppercase tracking-widest flex items-center justify-center gap-1">
                <span>📏</span> Women's Sizing & Conversion
              </span>
              <h2 className="text-2xl font-black text-gray-900 mt-1">SNEAKER FIT & UNISEX SIZING</h2>
              <p className="text-xs text-gray-500 mt-1 mb-6">
                Buying a unisex release or Men's sizing? Here is how to pick your exact fit without guessing.
              </p>

              {/* Tabs */}
              <div className="flex flex-wrap justify-center gap-2 mb-6">
                {[
                  { id: "conversion", label: "Men's ➔ Women's Rule" },
                  { id: "nike", label: "Nike / Jordan" },
                  { id: "yeezy", label: "Yeezy Fits" },
                  { id: "samba", label: "Samba / Gazelle" },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveSizeTab(tab.id as any)}
                    className={`px-4 py-2 rounded-xl text-xs font-black uppercase transition-all ${
                      activeSizeTab === tab.id
                        ? "bg-orange-500 text-white shadow-md"
                        : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* Dynamic Content */}
              <div className="bg-stone-50 p-4 sm:p-6 rounded-2xl text-left border border-gray-200">
                {activeSizeTab === "conversion" && (
                  <div>
                    <h3 className="font-black text-sm text-gray-900 flex items-center gap-2">
                      <span>💡</span> The 1.5 Size Difference Standard
                    </h3>
                    <p className="text-xs text-gray-600 mt-1.5 leading-relaxed">
                      • <strong>Standard Rule</strong>: US Women's size is <strong>1.5 sizes larger</strong> than US Men's size.<br />
                      • <em>Example</em>: If you wear a <strong>Women's US 8.5</strong>, you should purchase a <strong>Men's / Unisex US 7.0</strong>.<br />
                      • <em>Example</em>: If you wear a <strong>Women's US 7.0</strong>, order a <strong>Men's US 5.5</strong>.
                    </p>
                  </div>
                )}
                {activeSizeTab === "nike" && (
                  <div>
                    <h3 className="font-black text-sm text-gray-900">Nike & Jordan Women's Sizing</h3>
                    <p className="text-xs text-gray-600 mt-1.5 leading-relaxed">
                      • <strong>Nike Dunk Low</strong>: Fits True To Size (TTS) in Women's releases.<br />
                      • <strong>Air Jordan 1 High / Mid</strong>: Go true to size. If buying Men's sizing, subtract 1.5 sizes.
                    </p>
                  </div>
                )}
                {activeSizeTab === "yeezy" && (
                  <div>
                    <h3 className="font-black text-sm text-gray-900">Yeezy Fits for Women</h3>
                    <p className="text-xs text-gray-600 mt-1.5 leading-relaxed">
                      • <strong>Yeezy 350 V2</strong>: Most Yeezys come in Men's sizing. Take your Women's size, subtract 1.5, then <strong>add 0.5</strong> for the tight toe box.<br />
                      • <strong>Yeezy Slides</strong>: Order 1 full size up from your usual Women's size.
                    </p>
                  </div>
                )}
                {activeSizeTab === "samba" && (
                  <div>
                    <h3 className="font-black text-sm text-gray-900">Adidas Terrace Shoes (Samba, Gazelle, Handball)</h3>
                    <p className="text-xs text-gray-600 mt-1.5 leading-relaxed">
                      • <strong>Samba & Gazelle</strong>: Narrow fit. If you have wide feet, go 0.5 size up from your normal Women's size.<br />
                      • <strong>Handball Spezial</strong>: True to size with standard arch support.
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