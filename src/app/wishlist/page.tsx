"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Cart from "@/components/Cart";
import Footer from "@/components/Footer";
import { allProducts, Product } from "@/data/products";

interface CartItem {
  id: string;
  name: string;
  price: number;
  image_url: string;
  quantity: number;
}

export default function WishlistPage() {
  const [wishlistIds, setWishlistIds] = useState<string[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  // Load Saved Wishlist & Cart from localStorage with strict array validation
  useEffect(() => {
    const savedWishlist = localStorage.getItem("sneaker_wishlist");
    if (savedWishlist) {
      try {
        const parsed = JSON.parse(savedWishlist);
        if (Array.isArray(parsed)) {
          // Filter out nulls, undefined, or empty strings
          setWishlistIds(parsed.filter((id): id is string => Boolean(id) && typeof id === "string"));
        } else {
          setWishlistIds([]);
        }
      } catch (e) {
        console.error("Failed to load wishlist:", e);
        setWishlistIds([]);
      }
    }

    const savedCart = localStorage.getItem("sneaker_cart");
    if (savedCart) {
      try {
        const parsedCart = JSON.parse(savedCart);
        if (Array.isArray(parsedCart)) {
          setCart(parsedCart);
        }
      } catch (e) {
        console.error("Failed to load cart:", e);
      }
    }
  }, []);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2500);
  };

  // Only match products that actually exist in allProducts and wishlistIds
  const favoriteProducts = allProducts.filter((p) => wishlistIds.includes(p.id));

  // Remove single item from Wishlist
  const removeItem = (id: string) => {
    const updated = wishlistIds.filter((favId) => favId !== id);
    setWishlistIds(updated);
    localStorage.setItem("sneaker_wishlist", JSON.stringify(updated));
    showToast("Removed from wishlist");
  };

  // Clear entire Wishlist
  const clearWishlist = () => {
    setWishlistIds([]);
    localStorage.removeItem("sneaker_wishlist");
    showToast("Wishlist cleared");
  };

  // Add item to Cart
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

  // Update quantity in Cart
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

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 flex flex-col justify-between">
      <div>
        <Navbar
          cartCount={cart.reduce((sum, item) => sum + item.quantity, 0)}
          wishlistCount={favoriteProducts.length}
          toggleCart={() => setIsCartOpen(!isCartOpen)}
          activeFilter="All"
        />

        <Cart
          isOpen={isCartOpen}
          onClose={() => setIsCartOpen(false)}
          items={cart}
          onUpdateQuantity={updateQuantity}
        />

        <main className="max-w-6xl mx-auto px-3 sm:px-4 py-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-2xl sm:text-3xl font-black">YOUR FAVORITES <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="#ef4444"
    className="w-10 h-10 inline-block"
  >
    <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
  </svg></h1>
              <p className="text-gray-500 text-xs sm:text-sm mt-1">
                {favoriteProducts.length} {favoriteProducts.length === 1 ? "item" : "items"} saved in your wishlist
              </p>
            </div>

            {favoriteProducts.length > 0 && (
              <button
                onClick={clearWishlist}
                className="text-xs font-bold text-red-500 hover:text-red-600 bg-red-50 hover:bg-red-100 px-3 py-1.5 sm:px-4 sm:py-2 rounded-xl transition-colors"
              >
                Clear All
              </button>
            )}
          </div>

          {favoriteProducts.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-3xl border border-gray-200 shadow-sm max-w-lg mx-auto px-4">
              {/* <span className="text-5xl block mb-4">💔</span> */}
              <div className="w-12 h-12 text-gray-300 mx-auto mb-4">
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="w-full h-full"
  >
    <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
  </svg>
</div>
              <h2 className="text-xl font-bold mb-2">Your wishlist is empty</h2>
              <p className="text-gray-500 text-sm mb-6">
                Explore our catalog and click the heart icon on any drop to save it here.
              </p>
              <Link
                href="/"
                className="bg-black hover:bg-orange-500 text-white font-extrabold px-8 py-3.5 rounded-2xl text-sm transition-all shadow-md inline-block active:scale-95"
              >
                Browse Catalog →
              </Link>
            </div>
          ) : (
            /* 2x2 Grid on Mobile (grid-cols-2) and side-by-side layout maintained */
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-6">
              {favoriteProducts.map((product) => (
                <div
                  key={product.id}
                  className="bg-white rounded-2xl p-3 sm:p-4 border border-gray-200 shadow-sm hover:shadow-md transition-all relative group flex flex-col justify-between"
                >
                  {/* Remove Button */}
                  <button
                    onClick={() => removeItem(product.id)}
                    className="absolute top-2 right-2 sm:top-3 sm:right-3 bg-white/90 hover:bg-red-500 hover:text-white text-gray-400 p-1.5 rounded-full shadow-md z-10 transition-colors w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center text-xs font-bold"
                    title="Remove from wishlist"
                  >
                    ✕
                  </button>

                  <div>
                    <Link href={`/products/${product.id}`}>
                      <div className="w-full h-36 sm:h-48 relative rounded-xl overflow-hidden bg-gray-100 mb-2 sm:mb-3">
                        <img
                          src={product.image_url}
                          alt={product.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      </div>
                      <span className="text-[10px] font-extrabold text-orange-500 uppercase tracking-wider block">
                        {product.company || product.category}
                      </span>
                      <h3 className="font-bold text-gray-900 text-xs sm:text-sm line-clamp-1 mt-0.5">
                        {product.name}
                      </h3>
                    </Link>
                  </div>

                  {/* Side-by-Side Price and Add to Cart */}
                  <div className="mt-3 pt-2.5 border-t border-gray-100 flex items-center justify-between gap-1.5">
                    <div>
                      <span className="text-[9px] sm:text-[10px] uppercase tracking-wider text-gray-400 font-bold block">
                        Price
                      </span>
                      <p className="text-black font-black text-xs sm:text-base leading-none">
                        ${product.price.toFixed(2)}
                      </p>
                    </div>

                    <button
                      onClick={() => addToCart(product)}
                      className="bg-orange-500 hover:bg-orange-600 text-white font-extrabold py-1.5 px-2.5 sm:px-3 rounded-xl text-xs transition-all shadow-sm active:scale-95 flex items-center gap-1 whitespace-nowrap"
                    >
                      <span>🛒</span>
                      <span className="hidden sm:inline">Add to Cart</span>
                      <span className="sm:hidden">Add</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </main>
      </div>

      {/* Toast Notification */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 bg-gray-900 text-white px-5 py-3 rounded-xl shadow-2xl flex items-center gap-3 border border-gray-700">
          <span className="text-orange-400 font-bold">✓</span>
          <span className="text-sm font-semibold">{toast}</span>
        </div>
      )}

      <Footer />
    </div>
  );
}