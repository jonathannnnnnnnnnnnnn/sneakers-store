"use client";

import { useState, useEffect } from "react";
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

export default function WomenPage() {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [wishlist, setWishlist] = useState<string[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

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

  // Filter for Women + Unisex items
  const womenProducts = allProducts.filter(
    (p) => p.gender === "Women" || p.gender === "Unisex"
  );

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 flex flex-col justify-between">
      <div>
        {/* Navbar with dynamic cart & wishlist counts */}
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
          <div className="bg-zinc-900 text-white rounded-3xl p-6 sm:p-8 mb-8 sm:mb-10 flex flex-col justify-end h-56 sm:h-64 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-black via-black/70 to-transparent z-10 p-6 sm:p-8 flex flex-col justify-center">
              <span className="text-orange-500 font-extrabold text-xs uppercase tracking-widest mb-2">
                Women's Collection
              </span>
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-black">WOMEN'S EDITION</h1>
              <p className="text-gray-400 text-xs sm:text-sm mt-2 max-w-md">
                Clean silhouettes, bold colorways, and lightweight tech.
              </p>
            </div>
            <img
              src="https://images.unsplash.com/photo-1582588678413-dbf45f4823e9?w=1200&auto=format&fit=crop"
              alt="Women Banner"
              className="absolute inset-0 w-full h-full object-cover opacity-40"
            />
          </div>

          {/* Grid Layout with Badges, Wishlist & Struck-Through Prices */}
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {womenProducts.map((product) => {
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

                  {/* Dual Pricing & Add to Cart */}
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
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
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

      <Footer />
    </div>
  );
}