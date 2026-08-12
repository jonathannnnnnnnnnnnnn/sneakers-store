"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { allProducts } from "@/data/products";

export default function WishlistPage() {
  const [wishlistIds, setWishlistIds] = useState<string[]>([]);

  useEffect(() => {
    const savedWishlist = localStorage.getItem("sneaker_wishlist");
    if (savedWishlist) {
      try {
        setWishlistIds(JSON.parse(savedWishlist));
      } catch (e) {
        console.error("Failed to load wishlist:", e);
      }
    }
  }, []);

  const favoriteProducts = allProducts.filter((p) => wishlistIds.includes(p.id));

  const removeItem = (id: string) => {
    const updated = wishlistIds.filter((favId) => favId !== id);
    setWishlistIds(updated);
    localStorage.setItem("sneaker_wishlist", JSON.stringify(updated));
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 flex flex-col justify-between">
      <div>
        <Navbar cartCount={0} toggleCart={() => {}} activeFilter="All" onFilterChange={() => {}} />

        <main className="max-w-6xl mx-auto px-4 py-8">
          <h1 className="text-3xl font-black mb-6">Your Favorites ❤️</h1>

          {favoriteProducts.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-2xl border border-gray-200">
              <p className="text-gray-500 font-medium">Your wishlist is currently empty.</p>
              <Link href="/" className="mt-4 inline-block bg-orange-500 text-white font-bold px-6 py-3 rounded-xl text-sm">
                Explore Sneakers
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
              {favoriteProducts.map((product) => (
                <div key={product.id} className="bg-white rounded-2xl p-4 border border-gray-200 shadow-sm relative group">
                  <button
                    onClick={() => removeItem(product.id)}
                    className="absolute top-3 right-3 bg-white/80 p-2 rounded-full shadow-md z-10 hover:scale-110 transition-transform"
                  >
                    ❌
                  </button>
                  <Link href={`/products/${product.id}`}>
                    <div className="w-full h-48 relative rounded-xl overflow-hidden bg-gray-100 mb-3">
                      <img src={product.image_url} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                    </div>
                    <h3 className="font-bold text-gray-900 text-sm">{product.name}</h3>
                    <p className="text-black font-extrabold text-sm mt-1">${product.price.toFixed(2)}</p>
                  </Link>
                </div>
              ))}
            </div>
          )}
        </main>
      </div>

      <Footer />
    </div>
  );
}