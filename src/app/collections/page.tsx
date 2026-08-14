"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Cart from "@/components/Cart";
import Footer from "@/components/Footer";
import { allProducts } from "@/data/products";

interface CartItem {
  id: string;
  name: string;
  price: number;
  image_url: string;
  quantity: number;
}

export default function CollectionsPage() {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [wishlistCount, setWishlistCount] = useState(0);
  const [isCartOpen, setIsCartOpen] = useState(false);

  useEffect(() => {
    const savedWishlist = localStorage.getItem("sneaker_wishlist");
    if (savedWishlist) {
      try {
        const parsed = JSON.parse(savedWishlist);
        if (Array.isArray(parsed)) setWishlistCount(parsed.length);
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

  // 1. Group by Category
  const categoryMap = allProducts.reduce((acc, product) => {
    const cat = product.category || "General";
    if (!acc[cat]) {
      acc[cat] = {
        name: cat,
        count: 0,
        coverImage: product.image_url,
      };
    }
    acc[cat].count += 1;
    return acc;
  }, {} as Record<string, { name: string; count: number; coverImage: string }>);

  const categories = Object.values(categoryMap);

  // 2. Group by Brand / Company
  const brandMap = allProducts.reduce((acc, product) => {
    const brand = product.company || (product as any).brand;
    if (brand) {
      if (!acc[brand]) {
        acc[brand] = {
          name: brand,
          count: 0,
          coverImage: product.image_url,
        };
      }
      acc[brand].count += 1;
    }
    return acc;
  }, {} as Record<string, { name: string; count: number; coverImage: string }>);

  const brands = Object.values(brandMap);

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
          wishlistCount={wishlistCount}
          toggleCart={() => setIsCartOpen(!isCartOpen)}
          activeFilter="Collections"
        />

        <Cart
          isOpen={isCartOpen}
          onClose={() => setIsCartOpen(false)}
          items={cart}
          onUpdateQuantity={updateQuantity}
        />

        <main className="max-w-7xl mx-auto px-4 py-10 space-y-12">
          {/* Header */}
          <div>
            <span className="text-xs font-black uppercase tracking-widest text-orange-500">
              Curated Drops
            </span>
            <h1 className="text-4xl font-black text-gray-900 mt-1">COLLECTIONS</h1>
            <p className="text-gray-500 text-sm mt-1">
              Explore all {allProducts.length} items organized by style categories and top streetwear brands.
            </p>
          </div>

          {/* SECTION 1: CATEGORIES */}
          <section>
            <div className="flex items-center justify-between mb-6 border-b pb-3 border-gray-200">
              <h2 className="text-2xl font-black text-gray-900 uppercase tracking-tight">
                Shop By Category
              </h2>
              <span className="text-xs font-bold text-gray-400 uppercase">
                {categories.length} Categories
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {categories.map((col) => (
                <Link
                  key={col.name}
                  href={`/collections/${encodeURIComponent(col.name.toLowerCase())}`}
                  className="group relative h-64 rounded-3xl overflow-hidden shadow-md hover:shadow-xl transition-all border border-gray-200 block"
                >
                  <img
                    src={col.coverImage}
                    alt={col.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-5 flex justify-between items-end">
                    <div>
                      <span className="text-[10px] font-bold text-orange-400 uppercase tracking-widest block mb-0.5">
                        {col.count} {col.count === 1 ? "Item" : "Items"}
                      </span>
                      <h3 className="text-xl font-black text-white uppercase tracking-tight">
                        {col.name}
                      </h3>
                    </div>
                    <span className="w-8 h-8 rounded-full bg-white/20 backdrop-blur-md text-white flex items-center justify-center font-bold text-sm group-hover:bg-orange-500 transition-colors">
                      →
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </section>

          {/* SECTION 2: BRANDS */}
          <section>
            <div className="flex items-center justify-between mb-6 border-b pb-3 border-gray-200">
              <h2 className="text-2xl font-black text-gray-900 uppercase tracking-tight">
                Shop By Brand
              </h2>
              <span className="text-xs font-bold text-gray-400 uppercase">
                {brands.length} Brands
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {brands.map((col) => (
                <Link
                  key={col.name}
                  href={`/collections/${encodeURIComponent(col.name.toLowerCase())}`}
                  className="group relative h-72 rounded-3xl overflow-hidden shadow-md hover:shadow-xl transition-all border border-gray-200 block"
                >
                  <img
                    src={col.coverImage}
                    alt={col.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-6 flex justify-between items-end">
                    <div>
                      <span className="text-xs font-bold text-orange-400 uppercase tracking-widest block mb-1">
                        Brand Drop • {col.count} Items
                      </span>
                      <h3 className="text-2xl font-black text-white uppercase tracking-tight">
                        {col.name}
                      </h3>
                    </div>
                    <span className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-md text-white flex items-center justify-center font-bold group-hover:bg-orange-500 transition-colors">
                      →
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        </main>
      </div>

      <Footer />
    </div>
  );
}