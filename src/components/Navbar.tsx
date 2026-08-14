"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createBrowserClient } from "@supabase/ssr";
import { allProducts, Product } from "@/data/products";

interface NavbarProps {
  cartCount: number;
  wishlistCount: number;
  toggleCart: () => void;
  activeFilter?: string;
  onFilterChange?: (filter: string) => void;
}

export default function Navbar({
  cartCount,
  wishlistCount,
  toggleCart,
  activeFilter,
}: NavbarProps) {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<Product[]>([]);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [animateCart, setAnimateCart] = useState(false);
  const [animateWishlist, setAnimateWishlist] = useState(false);
  
  // Auth & UI States
  const [user, setUser] = useState<any>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  const searchRef = useRef<HTMLDivElement>(null);

  // Initialize Supabase browser client
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  // Check current auth user
  useEffect(() => {
    const fetchUser = async () => {
      const { data } = await supabase.auth.getUser();
      setUser(data?.user || null);
    };

    fetchUser();

    // Listen for auth changes (login/logout)
    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null);
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [supabase]);

  // Handle Logout
  const handleSignOut = async () => {
    await supabase.auth.signOut();
    setIsUserMenuOpen(false);
    setUser(null);
    router.push("/");
    router.refresh();
  };

  // Trigger pop animation on badge updates
  useEffect(() => {
    if (cartCount > 0) {
      setAnimateCart(true);
      const timer = setTimeout(() => setAnimateCart(false), 300);
      return () => clearTimeout(timer);
    }
  }, [cartCount]);

  useEffect(() => {
    if (wishlistCount > 0) {
      setAnimateWishlist(true);
      const timer = setTimeout(() => setAnimateWishlist(false), 300);
      return () => clearTimeout(timer);
    }
  }, [wishlistCount]);

  // Real-time product search filtering
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

  // Close search on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setIsSearchOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Helper to extract display name or initials
  const userName = user?.user_metadata?.full_name || user?.email?.split("@")[0] || "Collector";
  const userInitials = userName.substring(0, 2).toUpperCase();

  return (
    <>
      {/* Fixed Navbar pinned to top */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 h-16 flex items-center justify-between gap-2 sm:gap-4">
          
          {/* Mobile Menu Toggle Button */}
          <button
            onClick={() => setIsMobileMenuOpen(true)}
            className="md:hidden p-2 text-gray-700 hover:text-black focus:outline-none"
            aria-label="Open Menu"
          >
            <span className="text-xl">☰</span>
          </button>

          {/* Brand Logo - SOLE VAULT */}
          <Link href="/" className="flex items-center gap-2 group shrink-0">
            <div className="bg-orange-500 text-white font-black text-sm w-7 h-7 sm:w-8 sm:h-8 rounded-xl flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform">
              ⚡
            </div>
            <span className="font-black text-lg sm:text-xl tracking-wider text-gray-900">
              SOLE<span className="text-orange-500">VAULT.</span>
            </span>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-6 text-xs font-extrabold uppercase tracking-wider text-gray-600">
            <Link href="/" className={activeFilter === "All" ? "text-orange-500 font-black" : "hover:text-black"}>
              Home
            </Link>
            <Link href="/men" className={activeFilter === "Men" ? "text-orange-500 font-black" : "hover:text-black"}>
              Men
            </Link>
            <Link href="/women" className={activeFilter === "Women" ? "text-orange-500 font-black" : "hover:text-black"}>
              Women
            </Link>
            <Link href="/collections" className={activeFilter === "Collections" ? "text-orange-500 font-black" : "hover:text-black"}>
              Collections
            </Link>
          </nav>

          {/* Real-Time Interactive Search Bar */}
          <div ref={searchRef} className="relative flex-1 max-w-xs sm:max-w-md mx-1 sm:mx-2">
            <div className="relative">
              <input
                type="text"
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => searchQuery.trim() && setIsSearchOpen(true)}
                className="w-full bg-gray-100 hover:bg-gray-100/80 focus:bg-white text-gray-900 text-xs font-semibold py-2 pl-8 sm:pl-9 pr-7 sm:pr-8 rounded-full border border-transparent focus:border-orange-500 outline-none transition-all"
              />
              <span className="absolute left-2.5 sm:left-3 top-2.5 text-xs text-gray-400">🔍</span>
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-2.5 text-xs text-gray-400 hover:text-black"
                >
                  ✕
                </button>
              )}
            </div>

            {/* Search Dropdown Results */}
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

          {/* User, Wishlist & Cart Actions */}
          <div className="flex items-center gap-1 sm:gap-2 shrink-0">
            
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

              {/* User Hover Menu */}
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
                        <Link
                          href="/login"
                          onClick={() => setIsUserMenuOpen(false)}
                          className="block px-4 py-2.5 text-xs font-bold text-gray-800 hover:bg-orange-50 hover:text-orange-600 transition-colors border-t border-gray-100"
                        >
                          My Account & Profile
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

            {/* Wishlist Icon & Badge */}
            <Link
              href="/wishlist"
              className="p-2 text-gray-700 hover:text-black relative flex items-center justify-center"
              title="Wishlist"
            >
              <span className="text-base">❤️</span>
              {wishlistCount > 0 && (
                <span
                  className={`absolute -top-0.5 -right-0.5 bg-red-500 text-white text-[10px] font-black w-4 h-4 rounded-full flex items-center justify-center ${
                    animateWishlist ? "animate-pop" : ""
                  }`}
                >
                  {wishlistCount}
                </span>
              )}
            </Link>

            {/* Cart Icon & Badge */}
            <button
              onClick={toggleCart}
              className="p-2 text-gray-700 hover:text-black relative flex items-center justify-center"
              title="Cart"
            >
              <span className="text-base">🛒</span>
              {cartCount > 0 && (
                <span
                  className={`absolute -top-0.5 -right-0.5 bg-orange-500 text-white text-[10px] font-black w-4 h-4 rounded-full flex items-center justify-center ${
                    animateCart ? "animate-pop" : ""
                  }`}
                >
                  {cartCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* --- LEFT SLIDE-OUT MOBILE DRAWER --- */}

      {/* Dark Overlay Backdrop */}
      <div
        className={`fixed inset-0 bg-black/50 backdrop-blur-sm z-50 transition-opacity duration-300 md:hidden ${
          isMobileMenuOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
        onClick={() => setIsMobileMenuOpen(false)}
      />

      {/* Left Drawer Panel */}
      <aside
        className={`fixed top-0 left-0 bottom-0 w-[280px] bg-white z-50 shadow-2xl flex flex-col transition-transform duration-300 ease-in-out md:hidden ${
          isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Drawer Header */}
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

        {/* Navigation Links */}
        <nav className="p-5 flex-1 space-y-2">
          <p className="text-[10px] font-black uppercase text-gray-400 tracking-wider mb-4">Navigation</p>
          
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
        </nav>

        {/* Drawer Footer / Account Link */}
        <div className="p-5 border-t border-gray-100 bg-gray-50">
          <Link
            href={user ? "/account" : "/login"}
            onClick={() => setIsMobileMenuOpen(false)}
            className="w-full bg-black hover:bg-orange-500 text-white font-bold text-xs py-3 px-4 rounded-xl flex items-center justify-center gap-2 transition-colors"
          >
            <span>👤</span>
            <span>{user ? "My Dashboard" : "Login / Account"}</span>
          </Link>
        </div>
      </aside>

      {/* Spacer to prevent page content from tucking underneath fixed navbar */}
      <div className="h-16" />
    </>
  );
}