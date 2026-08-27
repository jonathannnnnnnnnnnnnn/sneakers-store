"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { allProducts, Product } from "@/data/products";
import { CATEGORY_COUNTS, BRAND_COUNTS } from "@/lib/product-counts";
import { createClient } from "@/lib/supabase/client";
import { useStore } from "@/context/StoreContext";

const supabase = createClient();

interface NavbarProps {
  cartCount: number;
  wishlistCount: number;
  toggleCart: () => void;
  activeFilter?: string;
  onFilterChange?: (filter: string) => void;
  onSignOut?: () => void; // Optional callback to notify parent page on logout
}

const COLLECTIONS_NAV = [
  {
    category: "Performance & Sport",
    items: [
      { name: "Basketball", href: "/collections/basketball", count: `${CATEGORY_COUNTS["basketball"] || 0} ITEMS`, icon: "🏀" },
      { name: "Football", href: "/collections/football", count: `${CATEGORY_COUNTS["football"] || 0} ITEMS`, icon: "⚽️" },
      { name: "Running", href: "/collections/running", count: `${CATEGORY_COUNTS["running"] || 0} ITEMS`, icon: "🏃" },
      { name: "Skateboarding", href: "/collections/skateboarding", count: `${CATEGORY_COUNTS["skateboarding"] || 0} ITEMS`, icon: "🛹" },
      { name: "Training & Gym", href: "/collections/training", count: `${CATEGORY_COUNTS["training"] || 0} ITEMS`, icon: "🏋️" },
      { name: "Outdoor & Trail", href: "/collections/outdoor", count: `${CATEGORY_COUNTS["outdoor"] || 0} ITEMS`, icon: "🥾" },
    ],
  },
  {
    category: "Streetwear & Culture",
    items: [
      { name: "Streetwear & Grails", href: "/collections/streetwear", count: `${CATEGORY_COUNTS["streetwear"] || 0} ITEMS`, icon: "🔥" },
      { name: "Retro Classics", href: "/collections/retro", count: `${CATEGORY_COUNTS["retro"] || 0} ITEMS`, icon: "👟" },
      { name: "Luxury Collabs", href: "/collections/luxury", count: `${CATEGORY_COUNTS["luxury"] || 0} ITEMS`, icon: "✨" },
      { name: "Slides & Foam", href: "/collections/slides", count: `${CATEGORY_COUNTS["slides"] || 0} ITEMS`, icon: "☁️" },
      { name: "Apparel & Accessories", href: "/collections/apparel", count: `${(CATEGORY_COUNTS["apparel"] || 0) + (CATEGORY_COUNTS["accessories"] || 0)} ITEMS`, icon: "👕" },
    ],
  },
  {
    category: "Shop by Brand (9 Brands)",
    items: [
      { name: "Nike", href: "/collections/nike", count: `${BRAND_COUNTS["nike"] || 0} ITEMS`, icon: "✔️" },
      { name: "Jordan", href: "/collections/jordan", count: `${BRAND_COUNTS["jordan"] || 0} ITEMS`, icon: "🏀" },
      { name: "Adidas", href: "/collections/adidas", count: `${BRAND_COUNTS["adidas"] || 0} ITEMS`, icon: "👟" },
      { name: "New Balance", href: "/collections/new-balance", count: `${BRAND_COUNTS["new balance"] || 0} ITEMS`, icon: "👟" },
      { name: "Vans", href: "/collections/vans", count: `${BRAND_COUNTS["vans"] || 0} ITEMS`, icon: "🏁" },
      { name: "Yeezy", href: "/collections/yeezy", count: `${BRAND_COUNTS["yeezy"] || 0} ITEMS`, icon: "🌐" },
      { name: "Puma", href: "/collections/puma", count: `${BRAND_COUNTS["puma"] || 0} ITEMS`, icon: "🐆" },
      { name: "Asics", href: "/collections/asics", count: `${BRAND_COUNTS["asics"] || 0} ITEMS`, icon: "⚡" },
      { name: "Balenciaga", href: "/collections/balenciaga", count: `${BRAND_COUNTS["balenciaga"] || 0} ITEMS`, icon: "💎" },
    ],
  },
];

export default function Navbar({
  toggleCart,
  activeFilter,
  onSignOut,
}: NavbarProps) {
  const router = useRouter();
  const { user, cart, wishlistIds } = useStore();
  const contextCartCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const contextWishlistCount = wishlistIds.length;
  const isAdmin = Boolean(
    user?.email &&
      process.env.NEXT_PUBLIC_ADMIN_EMAIL &&
      user.email.toLowerCase() === process.env.NEXT_PUBLIC_ADMIN_EMAIL.toLowerCase()
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<Product[]>([]);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isMobileSearchExpanded, setIsMobileSearchExpanded] = useState(false);
  const [animateCart, setAnimateCart] = useState(false);
  const [animateWishlist, setAnimateWishlist] = useState(false);
  
  // Hover & UI States
  const [isCollectionsHovered, setIsCollectionsHovered] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  const searchRef = useRef<HTMLDivElement>(null);
  const mobileSearchRef = useRef<HTMLDivElement>(null);

  const handleSignOut = async () => {
    if (user) {
      localStorage.removeItem(`sneaker_cart_${user.id}`);
      localStorage.removeItem(`sneaker_wishlist_${user.id}`);
    }

    // Clear generic & guest storage keys
    localStorage.removeItem("sneaker_cart");
    localStorage.removeItem("pending_order");
    localStorage.removeItem("sneaker_wishlist");
    localStorage.removeItem("sneaker_cart_guest");
    localStorage.removeItem("sneaker_wishlist_guest");

    await supabase.auth.signOut();
    setIsUserMenuOpen(false);

    if (onSignOut) {
      onSignOut();
    }

    router.push("/");
    router.refresh();
  };

  useEffect(() => {
    if (contextCartCount > 0) {
      setAnimateCart(true);
      const timer = setTimeout(() => setAnimateCart(false), 300);
      return () => clearTimeout(timer);
    }
  }, [contextCartCount]);

  useEffect(() => {
    if (contextWishlistCount > 0) {
      setAnimateWishlist(true);
      const timer = setTimeout(() => setAnimateWishlist(false), 300);
      return () => clearTimeout(timer);
    }
  }, [contextWishlistCount]);

  useEffect(() => {
    const query = searchQuery.trim().toLowerCase();
    if (query.length > 0) {
      const filtered = allProducts.filter(
        (p) =>
          p.name.toLowerCase().includes(query) ||
          p.company?.toLowerCase().includes(query) ||
          p.category.toLowerCase().includes(query)
      );
      setSearchResults(filtered.slice(0, 5));
      setIsSearchOpen(true);
    } else {
      setSearchResults([]);
      setIsSearchOpen(false);
    }
  }, [searchQuery]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        searchRef.current &&
        !searchRef.current.contains(e.target as Node) &&
        mobileSearchRef.current &&
        !mobileSearchRef.current.contains(e.target as Node)
      ) {
        setIsSearchOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const userName = user?.user_metadata?.full_name || user?.email?.split("@")[0] || "Collector";
  const userInitials = userName.substring(0, 2).toUpperCase();

 const getInitialLang = () => {
  if (typeof window !== "undefined") {
    const match = document.cookie.match(/googtrans=\/en\/([a-z]{2})/i);
    return match ? match[1].toLowerCase() : "en";
  }
  return "en";
};

const [selectedLang, setSelectedLang] = useState(getInitialLang);

const languages = [
  { code: "en", name: "English (US)", flag: "🇺🇸" },
  { code: "fr", name: "Français", flag: "🇫🇷" },
  { code: "es", name: "Español", flag: "🇪🇸" },
  { code: "de", name: "Deutsch", flag: "🇩🇪" },
  { code: "ja", name: "日本語", flag: "🇯🇵" },
];

const handleLanguageChange = (langCode: string) => {
  setSelectedLang(langCode);

  if (langCode === "en") {
    document.cookie = "googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    document.cookie = `googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=${window.location.hostname}`;
    document.cookie = `googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=.${window.location.hostname}`;
  } else {
    document.cookie = `googtrans=/en/${langCode}; path=/; domain=${window.location.hostname}`;
    document.cookie = `googtrans=/en/${langCode}; path=/;`;
  }

  window.location.reload();
};

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-b border-gray-200">
  {/* TOP UTILITY BAR */}
  <div className="bg-zinc-900 text-white text-xs py-1.5 px-4 sm:px-8 flex justify-between items-center">
    <p className="text-[11px] font-medium text-zinc-400">
      Free Express Shipping on orders over $150
    </p>

    <div className="flex items-center gap-4 ml-auto text-[11px]">
 <div className="relative flex items-center cursor-pointer notranslate" translate="no">
  <select
    value={selectedLang}
    onChange={(e) => handleLanguageChange(e.target.value)}
    className="bg-transparent text-zinc-300 font-medium cursor-pointer focus:outline-none appearance-none pr-4 notranslate"
    translate="no"
  >
    {languages.map((lang) => (
      <option key={lang.code} value={lang.code} className="bg-zinc-900 text-white notranslate">
        {lang.flag} {lang.name}
      </option>
    ))}
  </select>
  <span className="absolute right-0 pointer-events-none text-zinc-400 text-[9px]">▼</span>
</div>
    </div>
  </div>

        <div className="max-w-7xl mx-auto px-3 sm:px-4 h-16 flex items-center justify-between gap-2 sm:gap-4">
          
          {/* Left: Mobile Toggle & Brand Logo */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            <button
              onClick={() => setIsMobileMenuOpen(true)}
              className="md:hidden p-1.5 text-gray-700 hover:text-black focus:outline-none"
              aria-label="Open Menu"
            >
              <span className="text-xl">☰</span>
            </button>

            <Link href="/" className="flex items-center gap-2 group shrink-0">
              <div className="bg-orange-500 text-white font-black text-sm w-7 h-7 sm:w-8 sm:h-8 rounded-xl flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform">
                ⚡
              </div>
              <span className="font-black text-lg sm:text-xl tracking-wider text-gray-900">
                SOLE<span className="text-orange-500">VAULT.</span>
              </span>
            </Link>
          </div>

          {/* Desktop Navigation Links + Collections Hover Dropdown */}
          <nav className="hidden md:flex items-center gap-6 text-xs font-extrabold uppercase tracking-wider text-gray-600 h-full">
            <Link href="/" className={activeFilter === "All" ? "text-orange-500 font-black" : "hover:text-black"}>
              Home
            </Link>
            <Link href="/men" className={activeFilter === "Men" ? "text-orange-500 font-black" : "hover:text-black"}>
              Men
            </Link>
            <Link href="/women" className={activeFilter === "Women" ? "text-orange-500 font-black" : "hover:text-black"}>
              Women
            </Link>
            
            {/* COLLECTIONS DROPDOWN CONTAINER */}
            <div 
              className="relative h-full flex items-center"
              onMouseEnter={() => setIsCollectionsHovered(true)}
              onMouseLeave={() => setIsCollectionsHovered(false)}
            >
              <Link 
                href="/collections" 
                className={`flex items-center gap-1 py-5 ${
                  activeFilter === "Collections" || isCollectionsHovered ? "text-orange-500 font-black" : "hover:text-black"
                }`}
              >
                <span>Collections</span>
                <span className={`text-[10px] transition-transform duration-200 ${isCollectionsHovered ? "rotate-180" : ""}`}>▼</span>
              </Link>

              {/* Collections Mega Menu Dropdown */}
              {isCollectionsHovered && (
                <div className="absolute top-full -left-20 w-[75vw] max-w-[890px] bg-white rounded-3xl border border-gray-200 shadow-2xl p-6 z-50 transition-all animate-fadeIn">
                  <div className="flex justify-between items-center pb-4 mb-4 border-b border-gray-100">
                    <div>
                      <h3 className="font-black text-sm uppercase text-gray-900 tracking-wider">Curated Collections</h3>
                      <p className="text-[11px] text-gray-500 font-medium normal-case">Quick access to all exclusive Vault categories & 9 brand drops.</p>
                    </div>
                    <Link 
                      href="/collections" 
                      onClick={() => setIsCollectionsHovered(false)}
                      className="text-[10px] font-black uppercase text-orange-500 hover:text-orange-600 bg-orange-50 px-3 py-1.5 rounded-full"
                    >
                      View All Page →
                    </Link>
                  </div>

                  {/* 3 Columns Layout */}
                  <div className="grid grid-cols-3 gap-2">
                    {COLLECTIONS_NAV.map((group) => (
                      <div key={group.category} className="space-y-3">
                        <span className="text-[10px] font-black uppercase text-gray-400 tracking-wider block border-b border-gray-50 pb-1">
                          {group.category}
                        </span>
                        <div className="space-y-1">
                          {group.items.map((item) => (
                            <Link
                              key={item.name}
                              href={item.href}
                              onClick={() => setIsCollectionsHovered(false)}
                              className="group flex items-center justify-start gap-2 p-1 p-3 rounded-xl hover:bg-orange-50/80 transition-colors"
                            >
                              <div className="flex items-center gap-2">
                                <span className="text-xs group-hover:scale-110 transition-transform">{item.icon}</span>
                                <span className="text-xs font-bold text-gray-800 group-hover:text-orange-600 transition-colors">
                                  {item.name}
                                </span>
                              </div>
                              <span className="text-[9px] font-extrabold text-gray-400 group-hover:text-orange-500">
                                {item.count}
                              </span>
                            </Link>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </nav>

          {/* Desktop Search Bar */}
          <div ref={searchRef} className="hidden md:block relative flex-1 max-w-xs sm:max-w-md mx-2">
            <div className="relative">
              <input
                type="text"
                placeholder="Search kicks, brands..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => searchQuery.trim() && setIsSearchOpen(true)}
                className="w-full bg-gray-100 hover:bg-gray-100/80 focus:bg-white text-gray-900 text-xs font-semibold py-2 pl-9 pr-8 rounded-full border border-transparent focus:border-orange-500 outline-none transition-all"
              />
              <span className="absolute left-3 top-2.5 text-xs text-gray-400">🔍</span>
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-2.5 text-xs text-gray-400 hover:text-black"
                >
                  ✕
                </button>
              )}
            </div>

            {/* Desktop Search Dropdown Results */}
            {isSearchOpen && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl border border-gray-200 shadow-2xl overflow-hidden z-50">
                {searchResults.length > 0 ? (
                  <div>
                    <div className="px-4 py-2 bg-gray-50 text-[10px] font-black uppercase text-gray-400 border-b border-gray-100">
                      Quick Results
                    </div>
                    {searchResults.map((product) => (
                      <Link
                        key={product.id}
                        href={`/products/${product.id}`}
                        onClick={() => setIsSearchOpen(false)}
                        className="flex items-center gap-3 p-3 hover:bg-orange-50 transition-colors border-b border-gray-50 last:border-none"
                      >
                        <img
                          src={product.image_url}
                          alt={product.name}
                          className="w-10 h-10 object-cover rounded-lg bg-gray-100 shrink-0"
                        />
                        <div className="flex-1 min-w-0">
                          <span className="text-[9px] font-black uppercase text-orange-500 block">
                            {product.company}
                          </span>
                          <h4 className="font-bold text-xs text-gray-900 truncate">
                            {product.name}
                          </h4>
                        </div>
                        <span className="font-black text-xs text-black shrink-0">
                          ${product.price.toFixed(2)}
                        </span>
                      </Link>
                    ))}
                  </div>
                ) : (
                  <div className="p-4 text-center text-xs text-gray-500">
                    No drops matching "<span className="font-bold text-gray-800">{searchQuery}</span>"
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-1 sm:gap-2 shrink-0">
            <button
              onClick={() => setIsMobileSearchExpanded(!isMobileSearchExpanded)}
              className="md:hidden p-2 text-gray-700 hover:text-black transition-colors"
              title="Search"
              aria-label="Toggle Search"
            >
              <span className="text-base">🔍</span>
            </button>

            {/* User Icon + Hover Dropdown */}
            <div 
              className="relative"
              onMouseEnter={() => setIsUserMenuOpen(true)}
              onMouseLeave={() => setIsUserMenuOpen(false)}
            >
              <button
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                className="p-1.5 text-gray-700 hover:text-black flex items-center justify-center transition-colors rounded-full"
                title="Account"
              >
                {user ? (
                  <div className="w-7 h-7 rounded-full bg-orange-500 text-white font-black text-[10px] flex items-center justify-center border border-orange-600 shadow-sm">
                    {userInitials}
                  </div>
                ) : (
                  <span className="text-base p-1">👤</span>
                )}
              </button>

              {isUserMenuOpen && (
                <div className="absolute right-0 top-full pt-2 w-52 z-50 animate-fadeIn">
                  <div className="bg-white rounded-2xl border border-gray-200 shadow-xl overflow-hidden py-1">
                    <div className="px-4 py-2.5 border-b border-gray-100 bg-gray-50/80">
                      <p className="text-[10px] font-black uppercase tracking-wider text-orange-500">
                        {user ? "Logged In" : "Welcome"}
                      </p>
                      <p className="text-xs font-black text-gray-900 truncate">
                        {user ? userName : "Vault Guest"}
                      </p>
                    </div>

                    {!user ? (
                      <>
                        <Link
                          href="/login"
                          onClick={() => setIsUserMenuOpen(false)}
                          className="block px-4 py-2.5 text-xs font-bold text-gray-800 hover:bg-orange-50 hover:text-orange-600 transition-colors"
                        >
                          Login / Signup
                        </Link>
                      </>
                    ) : (
                      <>
                        <Link
                          href="/account"
                          onClick={() => setIsUserMenuOpen(false)}
                          className="block px-4 py-2.5 text-xs font-bold text-gray-800 hover:bg-orange-50 hover:text-orange-600 transition-colors"
                        >
                          👤 My Account & Profile
                        </Link>
                        {isAdmin && (
                          <Link
                            href="/admin"
                            onClick={() => setIsUserMenuOpen(false)}
                            className="flex items-center gap-2 px-4 py-2.5 text-xs font-bold text-gray-800 hover:bg-orange-50 hover:text-orange-600 transition-colors"
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              className="h-4 w-4"
                              aria-hidden="true"
                            >
                              <path d="M12 3 4.5 6v5.5c0 4.6 3.1 7.8 7.5 9.5 4.4-1.7 7.5-4.9 7.5-9.5V6L12 3Z" />
                              <path d="m9.5 12 1.7 1.7 3.5-3.5" />
                            </svg>
                            <span>Admin Dashboard</span>
                          </Link>
                        )}
                        <button
                          onClick={handleSignOut}
                          className="w-full text-left px-4 py-2.5 text-xs font-bold text-red-500 hover:bg-red-50 transition-colors border-t border-gray-100"
                        >
                          🚪 Sign Out
                        </button>
                      </>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Desktop Wishlist Icon */}
            <Link
              href="/wishlist"
              className="hidden md:flex p-2 text-gray-700 hover:text-black relative items-center justify-center"
              title="Wishlist"
            >
              <svg
  xmlns="http://www.w3.org/2000/svg"
  viewBox="0 0 24 24"
              fill={contextWishlistCount > 0 ? "#ef4444" : "none"}
              stroke={contextWishlistCount > 0 ? "#ef4444" : "currentColor"}
  strokeWidth="2"
  strokeLinecap="round"
  strokeLinejoin="round"
  className="w-5 h-5 transition-colors"
>
  <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
</svg>
              {contextWishlistCount > 0 && (
                <span
                  className={`absolute -top-0.5 -right-0.5 bg-red-500 text-white text-[10px] font-black w-4 h-4 rounded-full flex items-center justify-center ${
                    animateWishlist ? "animate-pop" : ""
                  }`}
                >
                  {contextWishlistCount}
                </span>
              )}
            </Link>

            {/* Cart Icon */}
            <button
              onClick={toggleCart}
              className="p-2 text-gray-700 hover:text-black relative flex items-center justify-center"
              title="Cart"
            >
              <span className="text-base">🛒</span>
              {contextCartCount > 0 && (
                <span
                  className={`absolute -top-0.5 -right-0.5 bg-orange-500 text-white text-[10px] font-black w-4 h-4 rounded-full flex items-center justify-center ${
                    animateCart ? "animate-pop" : ""
                  }`}
                >
                  {contextCartCount}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Expandable Mobile Search Dropdown */}
        {isMobileSearchExpanded && (
          <div ref={mobileSearchRef} className="md:hidden px-4 pb-3 pt-1 border-t border-gray-100 bg-white shadow-md">
            <div className="relative flex items-center">
              <input
                type="text"
                placeholder="Search sneakers, drops..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                autoFocus
                className="w-full bg-gray-100 text-gray-900 text-xs font-semibold py-2 pl-9 pr-8 rounded-xl border border-gray-200 focus:border-orange-500 outline-none"
              />
              <span className="absolute left-3 text-xs text-gray-400">🔍</span>
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 text-xs text-gray-400 hover:text-black"
                >
                  ✕
                </button>
              )}
            </div>

            {isSearchOpen && (
              <div className="mt-2 bg-white rounded-xl border border-gray-200 shadow-lg overflow-hidden max-h-60 overflow-y-auto">
                {searchResults.length > 0 ? (
                  searchResults.map((product) => (
                    <Link
                      key={product.id}
                      href={`/products/${product.id}`}
                      onClick={() => {
                        setIsSearchOpen(false);
                        setIsMobileSearchExpanded(false);
                      }}
                      className="flex items-center gap-3 p-2.5 border-b border-gray-100 last:border-none"
                    >
                      <img
                        src={product.image_url}
                        alt={product.name}
                        className="w-8 h-8 object-cover rounded-md bg-gray-100 shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <h4 className="font-bold text-xs text-gray-900 truncate">
                          {product.name}
                        </h4>
                      </div>
                      <span className="font-black text-xs text-black shrink-0">
                        ${product.price.toFixed(2)}
                      </span>
                    </Link>
                  ))
                ) : (
                  <div className="p-3 text-center text-xs text-gray-500">
                    No drops matching "{searchQuery}"
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </header>

      {/* --- MOBILE DRAWER --- */}
      <div
        className={`fixed inset-0 bg-black/50 backdrop-blur-sm z-50 transition-opacity duration-300 md:hidden ${
          isMobileMenuOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
        onClick={() => setIsMobileMenuOpen(false)}
      />

      <aside
        className={`fixed top-0 left-0 bottom-0 w-[280px] bg-white z-50 shadow-2xl flex flex-col transition-transform duration-300 ease-in-out md:hidden ${
          isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="h-16 px-5 border-b border-gray-100 flex items-center justify-between">
          <Link
            href="/"
            onClick={() => setIsMobileMenuOpen(false)}
            className="flex items-center gap-2"
          >
            <div className="bg-orange-500 text-white font-black text-xs w-6 h-6 rounded-lg flex items-center justify-center">
              ⚡
            </div>
            <span className="font-black text-base tracking-wider text-gray-900">
              SOLE<span className="text-orange-500">VAULT.</span>
            </span>
          </Link>
          <button
            onClick={() => setIsMobileMenuOpen(false)}
            className="p-2 text-gray-400 hover:text-black text-lg font-bold"
          >
            ✕
          </button>
        </div>

        <nav className="p-5 flex-1 space-y-2 overflow-y-auto">
          <p className="text-[10px] font-black uppercase text-gray-400 tracking-wider mb-2">Navigation</p>
          
          <Link
            href="/"
            onClick={() => setIsMobileMenuOpen(false)}
            className={`flex items-center justify-between p-3 rounded-xl font-bold text-xs uppercase tracking-wider transition-colors ${
              activeFilter === "All" ? "bg-orange-50 text-orange-600 font-black" : "text-gray-700 hover:bg-gray-50"
            }`}
          >
            <span>Home</span>
            <span>→</span>
          </Link>

          <Link
            href="/men"
            onClick={() => setIsMobileMenuOpen(false)}
            className={`flex items-center justify-between p-3 rounded-xl font-bold text-xs uppercase tracking-wider transition-colors ${
              activeFilter === "Men" ? "bg-orange-50 text-orange-600 font-black" : "text-gray-700 hover:bg-gray-50"
            }`}
          >
            <span>Men</span>
            <span>→</span>
          </Link>

          <Link
            href="/women"
            onClick={() => setIsMobileMenuOpen(false)}
            className={`flex items-center justify-between p-3 rounded-xl font-bold text-xs uppercase tracking-wider transition-colors ${
              activeFilter === "Women" ? "bg-orange-50 text-orange-600 font-black" : "text-gray-700 hover:bg-gray-50"
            }`}
          >
            <span>Women</span>
            <span>→</span>
          </Link>

          <Link
            href="/collections"
            onClick={() => setIsMobileMenuOpen(false)}
            className={`flex items-center justify-between p-3 rounded-xl font-bold text-xs uppercase tracking-wider transition-colors ${
              activeFilter === "Collections" ? "bg-orange-50 text-orange-600 font-black" : "text-gray-700 hover:bg-gray-50"
            }`}
          >
            <span>Collections</span>
            <span>→</span>
          </Link>

          <hr className="my-3 border-gray-100" />

          <p className="text-[10px] font-black uppercase text-gray-400 tracking-wider mb-2">My Vault</p>

          <Link
            href="/wishlist"
            onClick={() => setIsMobileMenuOpen(false)}
            className="flex items-center justify-between p-3 rounded-xl font-bold text-xs text-gray-700 hover:bg-orange-50 hover:text-orange-600 transition-colors"
          >
            <div className="flex items-center gap-2.5">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="w-4 h-4"
              >
                <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
              </svg>
              <span>My Wishlist</span>
            </div>
            {contextWishlistCount > 0 && (
              <span className="bg-red-500 text-white text-[10px] font-black px-2 py-0.5 rounded-full">
                {contextWishlistCount}
              </span>
            )}
          </Link>

          <button
            onClick={() => {
              setIsMobileMenuOpen(false);
              toggleCart();
            }}
            className="w-full flex items-center justify-between p-3 rounded-xl font-bold text-xs text-gray-700 hover:bg-orange-50 hover:text-orange-600 transition-colors text-left"
          >
            <div className="flex items-center gap-2.5">
              <span>🛒</span>
              <span>My Cart</span>
            </div>
            {contextCartCount > 0 && (
              <span className="bg-orange-500 text-white text-[10px] font-black px-2 py-0.5 rounded-full">
                {contextCartCount}
              </span>
            )}
          </button>
        </nav>

        <div className="p-5 border-t border-gray-100 bg-gray-50">
          <Link
            href={user ? "/account" : "/login"}
            onClick={() => setIsMobileMenuOpen(false)}
            className="w-full bg-black hover:bg-orange-500 text-white font-bold text-xs py-3 px-4 rounded-xl flex items-center justify-center gap-2 transition-colors shadow-sm"
          >
            <span>👤</span>
            <span>{user ? "My Dashboard" : "Login / Account"}</span>
          </Link>
        </div>
      </aside>

      <div className="h-16" />
    </>
  );
}