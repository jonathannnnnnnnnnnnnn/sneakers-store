"use client";

import Link from "next/link";
import { useState, useEffect, useRef } from "react";
import Navbar from "@/components/Navbar";
import Cart from "@/components/Cart";
import ProductModal from "@/components/ProductModal";
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

export default function Home() {
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedBrand, setSelectedBrand] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [maxPrice, setMaxPrice] = useState(300);

  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [wishlist, setWishlist] = useState<string[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  // Pagination State for Main Grid
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // Carousel State for Hero Section
  const [heroIndex, setHeroIndex] = useState(0);
  const heroProducts = allProducts.filter((p) => p.isTrending).length > 0
    ? allProducts.filter((p) => p.isTrending).slice(0, 4)
    : allProducts.slice(0, 4);

  // Horizontal Scroll Refs for Swipeable Rows
  const kicksRowRef = useRef<HTMLDivElement>(null);
  const techRowRef = useRef<HTMLDivElement>(null);

  // Auto-slide Hero Carousel
  useEffect(() => {
    if (heroProducts.length === 0) return;
    const timer = setInterval(() => {
      setHeroIndex((prev) => (prev + 1) % heroProducts.length);
    }, 4000);
    return () => clearInterval(timer);
  }, [heroProducts]);

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedCategory, selectedBrand, searchQuery, maxPrice]);

  // Load Saved Wishlist & Cart
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
      showToast("Saved to Wishlist ❤️");
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
    showToast(`Added "${product.name}" to cart!`);
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

  const scrollRow = (ref: React.RefObject<HTMLDivElement | null>, direction: "left" | "right") => {
    if (ref.current) {
      const scrollAmount = direction === "left" ? -320 : 320;
      ref.current.scrollBy({ left: scrollAmount, behavior: "smooth" });
    }
  };

  // Filtering Logic
  const filteredProducts = allProducts.filter((product) => {
    const matchesCategory =
      selectedCategory === "All" ||
      product.category.toLowerCase() === selectedCategory.toLowerCase();

    const matchesSearch =
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (product.company && product.company.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesBrand =
      selectedBrand === "All" ||
      (product.company && product.company.toLowerCase() === selectedBrand.toLowerCase());

    const matchesPrice = product.price <= maxPrice;

    return matchesCategory && matchesSearch && matchesBrand && matchesPrice;
  });

  // Pagination Logic
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
  const paginatedProducts = filteredProducts.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Category Rows
  const trendingKicks = allProducts.filter((p) => p.category === "Basketball" || p.category === "Retro");
  const streetwearTech = allProducts.filter((p) => p.category === "Streetwear" || p.category === "Running");

  const brandList = ["NIKE", "ADIDAS", "JORDAN", "PUMA", "NOTHING TECH", "OAKLEY", "YEEZY", "SUPREME"];

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 flex flex-col justify-between overflow-x-hidden">
      <div>
        <Navbar
          cartCount={cart.reduce((sum, item) => sum + item.quantity, 0)}
          wishlistCount={wishlist.length}
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

        <main className="max-w-7xl mx-auto px-4 py-6 space-y-12">
          
          {/* Hero Banner Carousel */}
          {heroProducts.length > 0 && (
            <div className="relative w-full h-80 sm:h-96 md:h-[420px] rounded-3xl overflow-hidden bg-black text-white shadow-xl">
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

              {/* Carousel Indicators */}
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

          {/* Horizontal Scroll Row 1 - Trending Kicks */}
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl md:text-3xl font-black tracking-tight">TRENDING KICKS 🔥</h2>
                <p className="text-gray-500 text-xs sm:text-sm">Swipe or scroll through our top footwear selections</p>
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
                const isLiked = wishlist.includes(product.id);
                const discount = getDiscountPercent(product.id);
                const originalPrice = product.price * (1 + discount / 100);

                return (
                  <div
                    key={product.id}
                    className="min-w-[240px] max-w-[240px] bg-white rounded-2xl p-3 sm:p-4 border border-gray-200 shadow-sm flex-shrink-0 group flex flex-col justify-between relative"
                  >
                    {/* Dynamic Discount Tag */}
                    <div className="absolute top-3 left-3 bg-red-500 text-white text-[9px] font-black px-2 py-0.5 rounded-md uppercase tracking-wider z-10 shadow-sm">
                      -{discount}% OFF
                    </div>

                    {/* Wishlist Button */}
                    <button
                      onClick={(e) => toggleWishlist(product.id, e)}
                      className="absolute top-3 right-3 bg-white/90 p-1.5 rounded-full shadow-md z-10 hover:scale-110 transition-transform text-xs"
                    >
                      {isLiked ? "❤️" : "🤍"}
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
                        <h3 className="font-bold text-sm text-gray-900 line-clamp-1">{product.name}</h3>
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
                        onClick={() => addToCart(product)}
                        className="bg-orange-500 hover:bg-orange-600 text-white font-bold px-2.5 py-1.5 rounded-xl text-xs transition-colors flex items-center gap-1"
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
          </section>

          {/* Horizontal Scroll Row 2 - Streetwear Tech */}
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl md:text-3xl font-black tracking-tight">STREETWEAR TECH 🎧</h2>
                <p className="text-gray-500 text-xs sm:text-sm">Cyberpunk headphones, smartwear, and gear</p>
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
                const isLiked = wishlist.includes(product.id);
                const discount = getDiscountPercent(product.id);
                const originalPrice = product.price * (1 + discount / 100);

                return (
                  <div
                    key={product.id}
                    className="min-w-[240px] max-w-[240px] bg-white rounded-2xl p-3 sm:p-4 border border-gray-200 shadow-sm flex-shrink-0 group flex flex-col justify-between relative"
                  >
                    {/* Dynamic Discount Tag */}
                    <div className="absolute top-3 left-3 bg-red-500 text-white text-[9px] font-black px-2 py-0.5 rounded-md uppercase tracking-wider z-10 shadow-sm">
                      -{discount}% OFF
                    </div>

                    {/* Wishlist Button */}
                    <button
                      onClick={(e) => toggleWishlist(product.id, e)}
                      className="absolute top-3 right-3 bg-white/90 p-1.5 rounded-full shadow-md z-10 hover:scale-110 transition-transform text-xs"
                    >
                      {isLiked ? "❤️" : "🤍"}
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
                        <h3 className="font-bold text-sm text-gray-900 line-clamp-1">{product.name}</h3>
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
                        onClick={() => addToCart(product)}
                        className="bg-orange-500 hover:bg-orange-600 text-white font-bold px-2.5 py-1.5 rounded-xl text-xs transition-colors flex items-center gap-1"
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
          </section>

          {/* Main Catalog Section */}
          <section className="space-y-6 pt-6 border-t border-gray-200">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <h2 className="text-2xl md:text-3xl font-black">FULL CATALOG</h2>
                <p className="text-gray-500 text-sm">
                  Showing <span className="font-bold text-black">{filteredProducts.length}</span> total items
                </p>
              </div>

              {/* Filter controls */}
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
                </select>
              </div>
            </div>

            {/* Main Product Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
              {paginatedProducts.map((product) => {
                const isLiked = wishlist.includes(product.id);
                const discount = getDiscountPercent(product.id);
                const originalPrice = product.price * (1 + discount / 100);

                return (
                  <div
                    key={product.id}
                    className="bg-white rounded-2xl p-3 sm:p-4 border border-gray-200 shadow-sm hover:shadow-lg transition-all relative group flex flex-col justify-between"
                  >
                    {/* Dynamic Discount Badge */}
                    <div className="absolute top-3 left-3 bg-red-500 text-white text-[9px] font-black px-2 py-0.5 rounded-md uppercase tracking-wider z-10 shadow-sm">
                      -{discount}% OFF
                    </div>

                    {/* Wishlist Button */}
                    <button
                      onClick={(e) => toggleWishlist(product.id, e)}
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

            {/* Truncated Mobile-Friendly Pagination Controls */}
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
              GET 20% OFF YOUR FIRST TECH ORDER
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