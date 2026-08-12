"use client";

import { use, useState, useEffect } from "react";
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
  size?: number;
}

export default function ProductDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const product = allProducts.find((p) => String(p.id) === id);

  const [selectedSize, setSelectedSize] = useState<number | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isWishlisted, setIsWishlisted] = useState(false);

  // Load cart and wishlist from localStorage on mount
  useEffect(() => {
    const savedCart = localStorage.getItem("sneaker_cart");
    if (savedCart) {
      try {
        setCart(JSON.parse(savedCart));
      } catch (e) {
        console.error("Failed to load saved cart:", e);
      }
    }

    if (product) {
      const savedWishlist = localStorage.getItem("sneaker_wishlist");
      if (savedWishlist) {
        try {
          const wishlistArray = JSON.parse(savedWishlist);
          setIsWishlisted(wishlistArray.includes(product.id));
        } catch (e) {
          console.error("Failed to load wishlist:", e);
        }
      }
    }
  }, [product]);

  // Save cart to localStorage on changes
  useEffect(() => {
    if (cart.length > 0) {
      localStorage.setItem("sneaker_cart", JSON.stringify(cart));
    }
  }, [cart]);

  if (!product) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 text-gray-900">
        <h1 className="text-2xl font-bold">Product Not Found</h1>
        <Link href="/" className="mt-4 text-orange-500 underline font-medium">
          ← Back to Catalog
        </Link>
      </div>
    );
  }

  const sizes = [7, 8, 8.5, 9, 9.5, 10, 10.5, 11, 12];

  // Related products logic (items in same category/gender excluding current item)
  const relatedProducts = allProducts
    .filter(
      (p) =>
        p.id !== product.id &&
        (p.category === product.category || p.gender === product.gender)
    )
    .slice(0, 4);

  const toggleWishlist = () => {
    const savedWishlist = localStorage.getItem("sneaker_wishlist");
    let wishlistArray: string[] = savedWishlist ? JSON.parse(savedWishlist) : [];

    if (isWishlisted) {
      wishlistArray = wishlistArray.filter((favId) => favId !== product.id);
      setIsWishlisted(false);
      setToast("Removed from Wishlist");
    } else {
      wishlistArray.push(product.id);
      setIsWishlisted(true);
      setToast("Saved to Wishlist ❤️");
    }

    localStorage.setItem("sneaker_wishlist", JSON.stringify(wishlistArray));
    setTimeout(() => setToast(null), 2500);
  };

  const handleAddToCart = () => {
    if (!selectedSize) {
      setToast("Please select a size first!");
      setTimeout(() => setToast(null), 2500);
      return;
    }

    setCart((prevCart) => {
      const existing = prevCart.find((item) => item.id === product.id);
      if (existing) {
        return prevCart.map((item) =>
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [
        ...prevCart,
        {
          id: product.id,
          name: product.name,
          price: product.price,
          image_url: product.image_url,
          quantity: 1,
          size: selectedSize,
        },
      ];
    });

    setToast(`Added "${product.name}" (Size ${selectedSize}) to cart!`);
    setIsCartOpen(true);
    setTimeout(() => setToast(null), 2500);
  };

  const updateQuantity = (id: string, delta: number) => {
    setCart((prevCart) => {
      const updated = prevCart
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

  const totalCartItems = cart.reduce((total, item) => total + item.quantity, 0);

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 flex flex-col justify-between">
      <div>
        <Navbar
          cartCount={totalCartItems}
          toggleCart={() => setIsCartOpen(!isCartOpen)}
          activeFilter="All"
          onFilterChange={() => {}}
        />

        <Cart
          isOpen={isCartOpen}
          onClose={() => setIsCartOpen(false)}
          items={cart}
          onUpdateQuantity={updateQuantity}
        />

        <main className="max-w-6xl mx-auto px-4 py-8">
          <Link
            href="/"
            className="text-sm font-medium text-gray-500 hover:text-black transition-colors inline-block mb-6"
          >
            ← Back to Catalog
          </Link>

          {/* Product Detail Card */}
          <div className="bg-white rounded-2xl p-6 md:p-10 shadow-sm border border-gray-200 grid grid-cols-1 md:grid-cols-2 gap-10">
            {/* Left Column: Image & Wishlist Button */}
            <div className="w-full h-96 md:h-[450px] relative bg-gray-100 rounded-xl overflow-hidden group">
              <img
                src={product.image_url || "/placeholder.png"}
                alt={product.name}
                className="w-full h-full object-cover"
              />
              <button
                onClick={toggleWishlist}
                className="absolute top-4 right-4 bg-white/80 backdrop-blur-md p-3 rounded-full shadow-md hover:scale-110 transition-transform"
              >
                <span className="text-xl">{isWishlisted ? "❤️" : "🤍"}</span>
              </button>
            </div>

            {/* Right Column: Details & Controls */}
            <div className="flex flex-col justify-between space-y-6">
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black uppercase tracking-wider text-orange-500">
                    {product.gender || product.category || "Sneakers"}
                  </span>
                  <div className="flex items-center gap-1 bg-gray-100 px-3 py-1 rounded-full text-xs font-bold text-gray-700">
                    <span>★ 4.8</span>
                    <span className="text-gray-400">(42 reviews)</span>
                  </div>
                </div>

                <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 mt-2">
                  {product.name}
                </h1>
                <p className="text-2xl font-bold text-black mt-3">
                  ${product.price.toFixed(2)}
                </p>

                <p className="text-gray-500 mt-4 leading-relaxed text-sm">
                  {product.description ||
                    "Premium streetwear aesthetics combined with ultimate everyday comfort. Engineered for performance and clean everyday style."}
                </p>

                {/* Size Selector */}
                <div className="mt-6">
                  <h3 className="text-sm font-bold text-gray-900 mb-3">
                    Select Size (US)
                  </h3>
                  <div className="grid grid-cols-4 gap-2">
                    {sizes.map((size) => (
                      <button
                        key={size}
                        onClick={() => setSelectedSize(size)}
                        className={`py-2 text-sm font-semibold rounded-lg border transition-all ${
                          selectedSize === size
                            ? "bg-black text-white border-black shadow-md"
                            : "bg-white text-gray-900 border-gray-300 hover:border-black"
                        }`}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Add to Cart Action */}
              <div className="pt-4 border-t border-gray-100">
                <button
                  onClick={handleAddToCart}
                  className="w-full py-4 bg-orange-500 hover:bg-orange-600 text-white font-extrabold rounded-xl transition-colors shadow-md active:scale-95"
                >
                  + Add to Cart
                </button>
              </div>
            </div>
          </div>

          {/* Related Products Section */}
          {relatedProducts.length > 0 && (
            <div className="mt-16">
              <h2 className="text-2xl font-black text-gray-900 mb-6">
                You Might Also Like 🔥
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
                {relatedProducts.map((rel) => (
                  <Link
                    key={rel.id}
                    href={`/products/${rel.id}`}
                    className="bg-white rounded-2xl p-4 shadow-sm border border-gray-200 hover:shadow-md transition-all group block"
                  >
                    <div className="w-full h-48 relative rounded-xl overflow-hidden bg-gray-100 mb-3">
                      <img
                        src={rel.image_url || "/placeholder.png"}
                        alt={rel.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                    <span className="text-[10px] uppercase font-bold text-orange-500">
                      {rel.gender || rel.category}
                    </span>
                    <h3 className="font-bold text-gray-900 text-sm mt-1 line-clamp-1">
                      {rel.name}
                    </h3>
                    <p className="text-black font-extrabold text-sm mt-1">
                      ${rel.price.toFixed(2)}
                    </p>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </main>
      </div>

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