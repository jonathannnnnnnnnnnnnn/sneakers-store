"use client";

import Link from "next/link";
import { useState, useEffect, useRef } from "react";
import Navbar from "@/components/Navbar";
import Cart from "@/components/Cart";
import ProductModal from "@/components/ProductModal";
import Footer from "@/components/Footer";
import { allProducts, Product } from "@/data/products";
import { useStore } from "@/context/StoreContext";

const getDiscountPercent = (id: string) => {
  const hash = id.split("").reduce((sum, char) => sum + char.charCodeAt(0), 0);
  const rates = [10, 15, 20, 25, 30];
  return rates[hash % rates.length];
};

// SVG Heart Icons
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

export default function Home() {
  const { cart, wishlistIds, addToCart, toggleWishlist, updateQuantity } = useStore();
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedBrand, setSelectedBrand] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");

  const [isCartOpen, setIsCartOpen] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  const [heroIndex, setHeroIndex] = useState(0);
  const heroProducts =
    allProducts.filter((p) => p.isTrending).length > 0
      ? allProducts.filter((p) => p.isTrending).slice(0, 4)
      : allProducts.slice(0, 4);

  const kicksRowRef = useRef<HTMLDivElement>(null);
  const techRowRef = useRef<HTMLDivElement>(null);

  // Drop Radar Mock Countdown Timer
  const [timeLeft, setTimeLeft] = useState({ hours: 14, minutes: 32, seconds: 45 });

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev.seconds > 0) return { ...prev, seconds: prev.seconds - 1 };
        if (prev.minutes > 0) return { ...prev, minutes: 59, seconds: 59 };
        if (prev.hours > 0) return { hours: prev.hours - 1, minutes: 59, seconds: 59 };
        return prev;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (heroProducts.length === 0) return;
    const timer = setInterval(() => {
      setHeroIndex((prev) => (prev + 1) % heroProducts.length);
    }, 4000);
    return () => clearInterval(timer);
  }, [heroProducts]);

  useEffect(() => {
    setCurrentPage(1);
  }, [selectedCategory, selectedBrand, searchQuery]);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2500);
  };

  const scrollRow = (
    ref: React.RefObject<HTMLDivElement | null>,
    direction: "left" | "right"
  ) => {
    if (ref.current) {
      const scrollAmount = direction === "left" ? -320 : 320;
      ref.current.scrollBy({ left: scrollAmount, behavior: "smooth" });
    }
  };

  const filteredProducts = allProducts.filter((product) => {
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

  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
  const paginatedProducts = filteredProducts.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const trendingKicks = allProducts.filter(
    (p) => p.category === "Basketball" || p.category === "Retro"
  );
  const streetwearTech = allProducts.filter(
    (p) => p.category === "Streetwear" || p.category === "Running"
  );

  const brandList = [
    "NIKE",
    "ADIDAS",
    "JORDAN",
    "PUMA",
    "VANS",
    "NEW BALANCE",
    "YEEZY",
    "ASICS",
    "BALENCIAGA",
  ];

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 flex flex-col justify-between overflow-x-hidden">
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

        <main className="max-w-7xl mx-auto pt-10 px-4 py-6 space-y-14">
          {/* Hero Banner Carousel */}
          {heroProducts.length > 0 && (
            <div className="relative w-full h-80 sm:h-96 md:h-[620px] rounded-3xl overflow-hidden bg-black text-white shadow-xl">
              <img
                src={heroProducts[heroIndex]?.image_url}
                alt="Featured Drop"
                className="w-full h-full object-cover opacity-60 transition-all duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent p-6 md:p-12 flex flex-col justify-end">
                <span className="bg-orange-500 text-white font-extrabold text-xs tracking-wider px-3 py-1 rounded-full w-max mb-3 uppercase">
                  Featured Drop 🔥
                </span>
                <h1 className="text-3xl md:text-5xl font-black max-w-xl">
                  {heroProducts[heroIndex]?.name}
                </h1>
                <p className="text-gray-300 text-sm md:text-base mt-2 max-w-lg line-clamp-2">
                  {heroProducts[heroIndex]?.description}
                </p>
                <div className="mt-4 flex items-center gap-4">
                  <Link
                    href={`/products/${heroProducts[heroIndex]?.id}`}
                    className="bg-white text-black font-extrabold px-6 py-3 rounded-xl hover:bg-orange-500 hover:text-white transition-colors"
                  >
                    Shop Drop - ${heroProducts[heroIndex]?.price}
                  </Link>
                </div>
              </div>

              <div className="absolute bottom-4 right-6 flex gap-2">
                {heroProducts.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setHeroIndex(idx)}
                    className={`h-2 rounded-full transition-all ${
                      heroIndex === idx ? "w-8 bg-orange-500" : "w-2 bg-white/50"
                    }`}
                  />
                ))}
              </div>
            </div>
          )}

          {/* SHOP BY BRAND CAROUSEL (MOBILE) / GRID (DESKTOP) */}
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-orange-500 font-extrabold text-[10px] uppercase tracking-widest block">
                  Direct Gateways
                </span>
                <h2 className="text-xl sm:text-2xl font-black text-gray-900 tracking-tight">
                  SHOP BY BRAND
                </h2>
              </div>
              <Link
                href="/collections#brands"
                className="text-xs font-bold text-gray-500 hover:text-black transition-colors flex items-center gap-1"
              >
                <span>All Brands</span>
                <span>→</span>
              </Link>
            </div>

            <div className="flex sm:grid sm:grid-cols-5 gap-3 sm:gap-4 overflow-x-auto pb-4 sm:pb-0 scrollbar-none snap-x snap-mandatory -mx-4 px-4 sm:mx-0 sm:px-0">
              {[
                {
                  name: "Nike",
                  tag: "Swoosh Vault",
                  logo: "NIKE",
                  slug: "nike",
                  bg: "from-zinc-900 to-black text-white",
                },
                {
                  name: "Jordan",
                  tag: "Flight Club Retros",
                  logo: "JORDAN",
                  slug: "jordan",
                  bg: "from-red-950/40 to-black text-white",
                },
                {
                  name: "Adidas",
                  tag: "3-Stripes & YZY",
                  logo: "ADIDAS",
                  slug: "adidas",
                  bg: "from-zinc-900 to-black text-white",
                },
                {
                  name: "New Balance",
                  tag: "Crafted Cushioning",
                  logo: "NB 99X",
                  slug: "new-balance",
                  bg: "from-stone-900 to-black text-white",
                },
                {
                  name: "Asics",
                  tag: "Gel-Kayano Series",
                  logo: "ASICS",
                  slug: "asics",
                  bg: "from-blue-950/40 to-black text-white",
                },
              ].map((brand, idx) => (
                <Link
                  key={idx}
                  href={`/collections?brand=${brand.slug}`}
                  className="min-w-[75vw] sm:min-w-0 flex-shrink-0 sm:flex-1 snap-center"
                >
                  <div
                    className={`h-36 rounded-2xl p-4 bg-gradient-to-b ${brand.bg} border border-zinc-800 shadow-md hover:border-orange-500/50 hover:scale-[1.02] transition-all group flex flex-col justify-between cursor-pointer relative overflow-hidden`}
                  >
                    <div className="flex justify-between items-start">
                      <span className="font-black tracking-tighter text-2xl text-gray-200 group-hover:text-orange-400 transition-colors">
                        {brand.logo}
                      </span>
                      <span className="text-xs text-gray-500 group-hover:translate-x-1 transition-transform">
                        ↗
                      </span>
                    </div>

                    <div>
                      <h3 className="font-black text-base text-white">{brand.name}</h3>
                      <p className="text-xs text-gray-400 font-medium truncate mt-0.5">
                        {brand.tag}
                      </p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </section>

          {/* DROP RADAR / LIMITED RELEASE COUNTDOWN */}
          <section className="bg-zinc-950 border border-zinc-800 rounded-3xl p-6 sm:p-8 text-white shadow-2xl relative overflow-hidden">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6 relative z-10">
              <div className="space-y-2 max-w-lg text-center md:text-left">
                <span className="bg-orange-500/10 border border-orange-500/30 text-orange-400 text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full inline-block">
                  ⚡ Drop Radar Exclusive
                </span>
                <h2 className="text-2xl sm:text-4xl font-black tracking-tight">
                  AIR JORDAN 4 RETRO "BRED REIMAGINED"
                </h2>
                <p className="text-gray-400 text-xs sm:text-sm">
                  Supplies are extremely limited. Lock in your notification alert to jump the queue at drop time.
                </p>

                {/* Countdown Timer */}
                <div className="flex justify-center md:justify-start gap-3 pt-3">
                  {[
                    { label: "HRS", val: String(timeLeft.hours).padStart(2, "0") },
                    { label: "MINS", val: String(timeLeft.minutes).padStart(2, "0") },
                    { label: "SECS", val: String(timeLeft.seconds).padStart(2, "0") },
                  ].map((unit, idx) => (
                    <div key={idx} className="bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-center min-w-[60px]">
                      <span className="text-xl font-black font-mono text-orange-400 block">{unit.val}</span>
                      <span className="text-[9px] font-extrabold text-gray-500 uppercase">{unit.label}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-center gap-4 w-full md:w-auto">
                <img
                  src="https://images.unsplash.com/photo-1607522370275-f14206abe5d3?w=600&auto=format&fit=crop"
                  alt="Drop Teaser"
                  className="w-44 h-32 object-cover rounded-2xl border border-zinc-800 shadow-md"
                />
                <button
                  onClick={() => showToast("Added to Drop Radar alerts!")}
                  className="w-full sm:w-auto bg-orange-500 hover:bg-orange-600 text-white font-extrabold px-6 py-4 rounded-2xl text-xs sm:text-sm transition-all shadow-lg active:scale-95 whitespace-nowrap"
                >
                  Notify Me At Drop 🔔
                </button>
              </div>
            </div>
          </section>

          {/* Horizontal Scroll Row 1 - Trending Kicks */}
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl md:text-3xl font-black tracking-tight">
                  TRENDING KICKS 🔥
                </h2>
                <p className="text-gray-500 text-xs sm:text-sm">
                  Swipe or scroll through our top footwear selections
                </p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => scrollRow(kicksRowRef, "left")}
                  className="p-2.5 bg-white border border-gray-200 rounded-full shadow-sm hover:bg-gray-100 transition-colors font-bold"
                >
                  ←
                </button>
                <button
                  onClick={() => scrollRow(kicksRowRef, "right")}
                  className="p-2.5 bg-white border border-gray-200 rounded-full shadow-sm hover:bg-gray-100 transition-colors font-bold"
                >
                  →
                </button>
              </div>
            </div>

            <div
              ref={kicksRowRef}
              className="flex gap-4 overflow-x-auto scrollbar-hide scroll-smooth pb-4"
            >
              {trendingKicks.map((product) => {
                const isLiked = wishlistIds.map(String).includes(String(product.id));
                const discount = getDiscountPercent(product.id);
                const originalPrice = product.price * (1 + discount / 100);

                return (
                  <div
                    key={product.id}
                    className="min-w-[240px] max-w-[240px] bg-white rounded-2xl p-3 sm:p-4 border border-gray-200 shadow-sm flex-shrink-0 group flex flex-col justify-between relative"
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
                      className="absolute top-3 right-3 bg-white/90 p-2 rounded-full shadow-md z-10 hover:scale-110 transition-transform"
                    >
                      <HeartIcon filled={isLiked} />
                    </button>

                    <div>
                      <Link href={`/products/${product.id}`} className="block">
                        <div className="w-full h-40 relative rounded-xl overflow-hidden bg-gray-100 mb-2 mt-4">
                          <img
                            src={product.image_url}
                            alt={product.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                          />
                        </div>
                        <div className="flex items-center justify-between mb-0.5">
                          <span className="text-[10px] font-extrabold text-orange-500 uppercase">
                            {product.company || product.category}
                          </span>
                          <span className="text-[9px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded">
                            In Stock
                          </span>
                        </div>
                        <h3 className="font-bold text-sm text-gray-900 line-clamp-1">
                          {product.name}
                        </h3>
                      </Link>
                    </div>

                    <div className="flex items-center justify-between mt-3 pt-2 border-t border-gray-100">
                      <div>
                        <span className="text-[10px] text-gray-400 line-through font-bold block leading-none mb-0.5">
                          ${originalPrice.toFixed(2)}
                        </span>
                        <p className="text-black font-black text-sm leading-none">
                          ${product.price.toFixed(2)}
                        </p>
                      </div>
                      <button
                        onClick={() => {
                          addToCart(product);
                          showToast(`Added "${product.name}" to cart!`);
                        }}
                        className="bg-orange-500 hover:bg-orange-600 text-white font-bold px-2.5 py-1.5 rounded-xl text-xs transition-colors flex items-center gap-1"
                      >
                        <span>🛒</span>
                        <span className="hidden sm:inline">Add</span>
                        <span className="sm:hidden">Add</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          {/* Horizontal Scroll Row 2 - Streetwear Tech */}
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl md:text-3xl font-black tracking-tight">
                  STREETWEAR TECH 🎧
                </h2>
                <p className="text-gray-500 text-xs sm:text-sm">
                  Cyberpunk headphones, smartwear, and gear
                </p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => scrollRow(techRowRef, "left")}
                  className="p-2.5 bg-white border border-gray-200 rounded-full shadow-sm hover:bg-gray-100 transition-colors font-bold"
                >
                  ←
                </button>
                <button
                  onClick={() => scrollRow(techRowRef, "right")}
                  className="p-2.5 bg-white border border-gray-200 rounded-full shadow-sm hover:bg-gray-100 transition-colors font-bold"
                >
                  →
                </button>
              </div>
            </div>

            <div
              ref={techRowRef}
              className="flex gap-4 overflow-x-auto scrollbar-hide scroll-smooth pb-4"
            >
              {streetwearTech.map((product) => {
                const isLiked = wishlistIds.map(String).includes(String(product.id));
                const discount = getDiscountPercent(product.id);
                const originalPrice = product.price * (1 + discount / 100);

                return (
                  <div
                    key={product.id}
                    className="min-w-[240px] max-w-[240px] bg-white rounded-2xl p-3 sm:p-4 border border-gray-200 shadow-sm flex-shrink-0 group flex flex-col justify-between relative"
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
                      className="absolute top-3 right-3 bg-white/90 p-2 rounded-full shadow-md z-10 hover:scale-110 transition-transform"
                    >
                      <HeartIcon filled={isLiked} />
                    </button>

                    <div>
                      <Link href={`/products/${product.id}`} className="block">
                        <div className="w-full h-40 relative rounded-xl overflow-hidden bg-gray-100 mb-2 mt-4">
                          <img
                            src={product.image_url}
                            alt={product.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                          />
                        </div>
                        <div className="flex items-center justify-between mb-0.5">
                          <span className="text-[10px] font-extrabold text-orange-500 uppercase">
                            {product.company || product.category}
                          </span>
                          <span className="text-[9px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded">
                            In Stock
                          </span>
                        </div>
                        <h3 className="font-bold text-sm text-gray-900 line-clamp-1">
                          {product.name}
                        </h3>
                      </Link>
                    </div>

                    <div className="flex items-center justify-between mt-3 pt-2 border-t border-gray-100">
                      <div>
                        <span className="text-[10px] text-gray-400 line-through font-bold block leading-none mb-0.5">
                          ${originalPrice.toFixed(2)}
                        </span>
                        <p className="text-black font-black text-sm leading-none">
                          ${product.price.toFixed(2)}
                        </p>
                      </div>
                      <button
                        onClick={() => {
                          addToCart(product);
                          showToast(`Added "${product.name}" to cart!`);
                        }}
                        className="bg-orange-500 hover:bg-orange-600 text-white font-bold px-2.5 py-1.5 rounded-xl text-xs transition-colors flex items-center gap-1"
                      >
                        <span>🛒</span>
                        <span className="hidden sm:inline">Add</span>
                        <span className="sm:hidden">Add</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          {/* COMMUNITY / STYLED ON INSTAGRAM GALLERY */}
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-orange-500 font-extrabold text-[10px] uppercase tracking-widest block">
                  #SOLEVAULT
                </span>
                <h2 className="text-xl sm:text-2xl font-black text-gray-900 tracking-tight">
                  STYLED ON INSTAGRAM
                </h2>
              </div>
              <span className="text-xs font-bold text-gray-400">Tag us to get featured</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
              {[
                {
                  tag: "@kicks_by_alex",
                  shoe: "Dunk Low Panda",
                  img: "https://images.unsplash.com/photo-1512374382149-233c42b6a83b?w=600&auto=format&fit=crop",
                },
                {
                  tag: "@sole_fits",
                  shoe: "Yeezy 350 V2",
                  img: "https://images.unsplash.com/photo-1584735935682-2f2b69dff9d2?w=600&auto=format&fit=crop",
                },
                {
                  tag: "@drip_daily",
                  shoe: "Jordan 1 Retro High",
                  img: "https://images.unsplash.com/photo-1552346154-21d32810aba3?w=600&auto=format&fit=crop",
                },
                {
                  tag: "@street_culture",
                  shoe: "New Balance 9060",
                  img: "https://images.unsplash.com/photo-1539185441755-769473a23570?w=600&auto=format&fit=crop",
                },
              ].map((item, idx) => (
                <div
                  key={idx}
                  className="relative rounded-2xl overflow-hidden h-48 sm:h-64 group cursor-pointer border border-gray-200 shadow-sm"
                >
                  <img
                    src={item.img}
                    alt={item.tag}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent p-3 flex flex-col justify-end opacity-90 group-hover:opacity-100 transition-opacity">
                    <span className="text-white font-extrabold text-xs">{item.tag}</span>
                    <span className="text-orange-400 text-[10px] font-bold">{item.shoe}</span>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Main Catalog Section with See All Button */}
          <section className="space-y-6 pt-6 border-t border-gray-200">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div className="flex items-center justify-between w-full md:w-auto">
                <div>
                  <h2 className="text-2xl md:text-3xl font-black">FULL CATALOG</h2>
                  <p className="text-gray-500 text-sm">
                    Showing <span className="font-bold text-black">{filteredProducts.length}</span> items
                  </p>
                </div>

                <Link
                  href="/catalog"
                  className="md:hidden bg-orange-500 hover:bg-orange-600 text-white text-xs font-black px-4 py-2 rounded-xl transition-all shadow-sm flex items-center gap-1"
                >
                  See All 190 →
                </Link>
              </div>

              <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
                <input
                  type="text"
                  placeholder="Search catalog..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-orange-500 w-full md:w-auto"
                />

                <select
                  value={selectedBrand}
                  onChange={(e) => setSelectedBrand(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-xl text-sm font-medium bg-white w-full md:w-auto"
                >
                  <option value="All">All Brands</option>
                  <option value="Nike">Nike</option>
                  <option value="Adidas">Adidas</option>
                  <option value="Jordan">Jordan</option>
                  <option value="Puma">Puma</option>
                  <option value="New Balance">New Balance</option>
                  <option value="Vans">Vans</option>
                  <option value="Yeezy">Yeezy</option>
                  <option value="Asics">Asics</option>
                  <option value="Balenciaga">Balenciaga</option>
                </select>

                <Link
                  href="/catalog"
                  className="hidden md:inline-flex bg-orange-500 hover:bg-orange-600 text-white font-extrabold px-5 py-2 rounded-xl text-sm transition-all shadow-sm items-center gap-1.5 whitespace-nowrap"
                >
                  <span>See All (190 Items)</span>
                  <span>→</span>
                </Link>
              </div>
            </div>

            {/* Main Product Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
              {paginatedProducts.map((product) => {
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
                          showToast(`Added "${product.name}" to cart!`);
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

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-1 sm:gap-2 pt-8 max-w-full overflow-x-auto py-2">
                <button
                  onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-1.5 sm:px-4 sm:py-2 bg-white border border-gray-300 rounded-xl text-xs sm:text-sm font-bold disabled:opacity-40 hover:bg-gray-100 transition-colors shrink-0"
                >
                  ← Prev
                </button>

                <div className="flex items-center gap-1 shrink-0">
                  {Array.from({ length: totalPages }, (_, i) => i + 1)
                    .filter((page) => {
                      return (
                        page === 1 ||
                        page === totalPages ||
                        Math.abs(page - currentPage) <= 1
                      );
                    })
                    .map((page, index, array) => {
                      const prevPage = array[index - 1];
                      const showEllipsis = prevPage && page - prevPage > 1;

                      return (
                        <div key={page} className="flex items-center gap-1 shrink-0">
                          {showEllipsis && (
                            <span className="text-gray-400 font-bold px-1 text-xs">...</span>
                          )}
                          <button
                            onClick={() => setCurrentPage(page)}
                            className={`w-8 h-8 sm:w-9 sm:h-9 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                              currentPage === page
                                ? "bg-orange-500 text-white shadow-md scale-105"
                                : "bg-white border border-gray-200 text-gray-700 hover:border-black"
                            }`}
                          >
                            {page}
                          </button>
                        </div>
                      );
                    })}
                </div>

                <button
                  onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="px-3 py-1.5 sm:px-4 sm:py-2 bg-white border border-gray-300 rounded-xl text-xs sm:text-sm font-bold disabled:opacity-40 hover:bg-gray-100 transition-colors shrink-0"
                >
                  Next →
                </button>
              </div>
            )}
          </section>
        </main>
      </div>

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

      {/* Responsive Limited Time Flash Drop Banner */}
      <section className="max-w-7xl mx-auto px-4 w-full">
        <div className="bg-gradient-to-r from-orange-600 via-orange-500 to-amber-500 rounded-3xl p-6 sm:p-8 md:p-12 text-white shadow-xl flex flex-col md:flex-row items-center justify-between gap-6 md:gap-8 my-6 sm:my-12">
          <div className="space-y-3 max-w-xl text-center md:text-left">
            <span className="bg-black/30 backdrop-blur-md text-[10px] sm:text-xs font-black uppercase px-3 py-1 rounded-full border border-white/20 inline-block">
              ⚡ Limited Time Offer
            </span>
            <h2 className="text-2xl sm:text-3xl md:text-5xl font-black leading-tight">
              GET 20% OFF YOUR FIRST KICKS ORDER
            </h2>
            <p className="text-white/90 text-xs sm:text-sm">
              Sign up for inner circle drops or use code{" "}
              <span className="font-mono font-bold bg-black/40 px-2 py-0.5 rounded text-orange-200">
                STREET20
              </span>{" "}
              at checkout.
            </p>
          </div>
          <button className="w-full sm:w-auto bg-black text-white hover:bg-white hover:text-black font-extrabold px-6 sm:px-8 py-3.5 sm:py-4 rounded-2xl transition-all shadow-2xl flex-shrink-0 active:scale-95 text-xs sm:text-sm">
            Claim Discount →
          </button>
        </div>
      </section>

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