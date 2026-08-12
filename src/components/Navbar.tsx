"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";

interface NavbarProps {
  cartCount: number;
  wishlistCount?: number;
  toggleCart: () => void;
  activeFilter?: string;
  onFilterChange?: (filter: string) => void;
}

export default function Navbar({ 
  cartCount, 
  wishlistCount = 0,
  toggleCart, 
  activeFilter = "All", 
  onFilterChange 
}: NavbarProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  const topNavItems = [
    { name: "Home", value: "All" },
    { name: "Men", value: "Men" },
    { name: "Women", value: "Women" },
    { name: "Collections", value: "Collections" },
  ];

  const handleNavClick = (value: string) => {
    // If not on the home page, navigate back to home first
    if (pathname !== "/") {
      router.push("/");
    }

    if (onFilterChange) {
      onFilterChange(value);
    }
    setIsMobileMenuOpen(false);
  };

  return (
    <header className="bg-white border-b sticky top-0 z-40">
      <div className="flex items-center justify-between py-6 px-4 max-w-7xl mx-auto">
        <div className="flex items-center gap-4 md:gap-8">
          {/* Mobile Hamburger */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden text-gray-600 focus:outline-none"
          >
            <svg width="16" height="15" xmlns="http://www.w3.org/2000/svg">
              <path d="M16 12v3H0v-3h16Zm0-6v3H0V6h16Zm0-6v3H0V0h16Z" fill="#69707D" />
            </svg>
          </button>

          <Link href="/" className="text-3xl font-extrabold tracking-tight text-black">
            sneakers
          </Link>

          {/* Desktop Nav Links */}
          <nav className="hidden md:flex gap-6 font-medium text-sm">
            {topNavItems.map((item) => (
              <button
                key={item.name}
                onClick={() => handleNavClick(item.value)}
                className={`transition-colors relative py-1 ${
                  pathname === "/" && activeFilter === item.value
                    ? "text-black font-bold border-b-2 border-black"
                    : "text-gray-500 hover:text-black"
                }`}
              >
                {item.name}
              </button>
            ))}
          </nav>
        </div>

        {/* Right Side Controls */}
        <div className="flex items-center gap-6 relative">
          <Link
            href="/login"
            className="text-sm font-semibold text-gray-600 hover:text-black transition-colors"
          >
            Login / Register
          </Link>

          <Link href="/wishlist" className="relative p-1 text-gray-600 hover:text-black transition-colors">
            <span className="text-xl leading-none block">❤️</span>
            {wishlistCount > 0 && (
              <span className="absolute -top-1 -right-2 bg-orange-500 text-white text-xs font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center">
                {wishlistCount}
              </span>
            )}
          </Link>

          <button onClick={toggleCart} className="relative p-1">
            <svg width="22" height="20" xmlns="http://www.w3.org/2000/svg">
              <path
                d="M20.925 3.641H3.862L3.599 1.62A1 1 0 0 0 2.616.777H.998a1 1 0 1 0 0 2h1.013l2.38 18.239a1 1 0 0 0 .983.843h12.872a1 1 0 0 0 .982-.843l1.83-14.028a1 1 0 0 0-.133-.811zm-3.02 16.082H6.12L4.12 5.641h15.659l-1.874 14.082z"
                fill="#69707D"
              />
            </svg>
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-2 bg-orange-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                {cartCount}
              </span>
            )}
          </button>

          <div className="w-10 h-10 rounded-full border-2 border-transparent hover:border-orange-500 cursor-pointer overflow-hidden relative">
            <Image src="/images/image-avatar.png" alt="Avatar" fill className="object-cover" />
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex md:hidden">
          <div className="bg-white w-2/3 h-full p-6 flex flex-col gap-8 shadow-2xl">
            <button
              onClick={() => setIsMobileMenuOpen(false)}
              className="text-gray-500 font-bold text-xl self-start"
            >
              ✕
            </button>
            <nav className="flex flex-col gap-4 font-bold text-lg">
              {topNavItems.map((item) => (
                <button
                  key={item.name}
                  onClick={() => handleNavClick(item.value)}
                  className={`text-left transition-colors ${
                    pathname === "/" && activeFilter === item.value ? "text-orange-500" : "text-black"
                  }`}
                >
                  {item.name}
                </button>
              ))}

              <Link
                href="/wishlist"
                onClick={() => setIsMobileMenuOpen(false)}
                className="text-left text-black hover:text-orange-500 flex items-center gap-2 pt-2"
              >
                <span>❤️ Wishlist</span>
                {wishlistCount > 0 && (
                  <span className="bg-orange-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                    {wishlistCount}
                  </span>
                )}
              </Link>

              <Link
                href="/login"
                onClick={() => setIsMobileMenuOpen(false)}
                className="hidden sm:block text-xs font-medium text-gray-700 hover:text-black"
              >
                Login / Register
              </Link>
            </nav>
          </div>
        </div>
      )}
    </header>
  );
}