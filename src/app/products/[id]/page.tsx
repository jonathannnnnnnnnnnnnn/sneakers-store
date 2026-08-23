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

// Reusable Heart Icon Component
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

export default function ProductDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = use(params);
  const rawId = resolvedParams?.id ? decodeURIComponent(resolvedParams.id).trim() : "";

  const product = allProducts.find((p) => {
  const pId = String(p.id).trim();
  return pId === rawId || pId === rawId.toLowerCase();
});

  const [selectedSize, setSelectedSize] = useState<number | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [wishlistCount, setWishlistCount] = useState<number>(0);
  const [isMounted, setIsMounted] = useState(false);

  // Carousel & Touch/Swipe State
  const [currentImgIndex, setCurrentImgIndex] = useState(0);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);

  // Fallback to single image_url if images/gallery array isn't populated
  const productImages =
    (product as any)?.gallery && (product as any).gallery.length > 0
      ? (product as any).gallery
      : product?.images && product.images.length > 0
      ? product.images
      : product?.image_url
      ? [product.image_url]
      : ["/placeholder.png"];

  // Auto-slide carousel every 3.5 seconds
  useEffect(() => {
    if (productImages.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentImgIndex((prev) => (prev + 1) % productImages.length);
    }, 3500);

    return () => clearInterval(interval);
  }, [productImages]);

  // Touch Swipe Handler
  const minSwipeDistance = 50;

  const onTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    if (isLeftSwipe) {
      setCurrentImgIndex((prev) => (prev + 1) % productImages.length);
    } else if (isRightSwipe) {
      setCurrentImgIndex((prev) =>
        prev === 0 ? productImages.length - 1 : prev - 1
      );
    }
  };

  // Safe client-side mounting effect
  useEffect(() => {
    setIsMounted(true);
  }, []);

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

    const savedWishlist = localStorage.getItem("sneaker_wishlist");
    if (savedWishlist) {
      try {
        const wishlistArray = JSON.parse(savedWishlist);
        if (Array.isArray(wishlistArray)) {
          setWishlistCount(wishlistArray.length);
          if (product) {
            const cleanIds = wishlistArray.map((item: any) =>
              typeof item === "object" ? item.id : item
            );
            setIsWishlisted(cleanIds.includes(product.id));
          }
        }
      } catch (e) {
        console.error("Failed to load wishlist:", e);
      }
    }
  }, [product]);

  // Save cart changes to localStorage
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

  // Related products logic
  const relatedProducts = allProducts
    .filter(
      (p) =>
        p.id !== product.id &&
        (p.category === product.category || p.gender === product.gender)
    )
    .slice(0, 4);

  const showToast = (message: string) => {
    setToast(message);
    setTimeout(() => setToast(null), 2500);
  };

  const toggleWishlist = () => {
    const savedWishlist = localStorage.getItem("sneaker_wishlist");
    let wishlistArray: string[] = savedWishlist ? JSON.parse(savedWishlist) : [];

    if (isWishlisted) {
      wishlistArray = wishlistArray.filter((favId) => favId !== product.id);
      setIsWishlisted(false);
      showToast("Removed from Wishlist");
    } else {
      wishlistArray.push(product.id);
      setIsWishlisted(true);
      showToast("Saved to Wishlist");
    }

    setWishlistCount(wishlistArray.length);
    localStorage.setItem("sneaker_wishlist", JSON.stringify(wishlistArray));
  };

  const handleAddToCart = () => {
    if (!selectedSize) {
      showToast("Please select a size first!");
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

    showToast(`Added "${product.name}" (Size ${selectedSize}) to cart! 🛒`);
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

  const totalCartItems = isMounted
    ? cart.reduce((total, item) => total + item.quantity, 0)
    : 0;

  const displayWishlistCount = isMounted ? wishlistCount : 0;

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 flex flex-col justify-between">
      <div>
        <Navbar
          cartCount={totalCartItems}
          wishlistCount={displayWishlistCount}
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
            {/* Left Column: Image Gallery & Carousel */}
            <div className="flex flex-col gap-4">
              <div
                onTouchStart={onTouchStart}
                onTouchMove={onTouchMove}
                onTouchEnd={onTouchEnd}
                className="w-full h-80 md:h-[580px] lg:h-[620px] relative bg-[#f5f5f5] rounded-2xl overflow-hidden group shadow-inner select-none cursor-grab active:cursor-grabbing"
              >
                {/* Active Image */}
                <img
                  src={productImages[currentImgIndex]}
                  alt={`${product.name} preview ${currentImgIndex + 1}`}
                  className="w-full h-full object-cover transition-all duration-500 ease-in-out"
                />

                {/* Wishlist Button */}
<button
  onClick={() => toggleWishlist()}
  className="absolute top-3 right-3 bg-white/90 p-2 rounded-full shadow-md z-10 hover:scale-110 transition-transform"
>
  <HeartIcon filled={isWishlisted} />
</button>

                {/* Carousel Arrows */}
                {productImages.length > 1 && (
                  <>
                    <button
                      onClick={() =>
                        setCurrentImgIndex((prev) =>
                          prev === 0 ? productImages.length - 1 : prev - 1
                        )
                      }
                      className="absolute left-3 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white backdrop-blur-md p-2.5 rounded-full shadow-md transition-all active:scale-95 z-20 opacity-0 group-hover:opacity-100"
                    >
                      ←
                    </button>
                    <button
                      onClick={() =>
                        setCurrentImgIndex((prev) => (prev + 1) % productImages.length)
                      }
                      className="absolute right-3 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white backdrop-blur-md p-2.5 rounded-full shadow-md transition-all active:scale-95 z-20 opacity-0 group-hover:opacity-100"
                    >
                      →
                    </button>

                    {/* Dots Indicator */}
                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 bg-black/30 backdrop-blur-md px-3 py-1.5 rounded-full z-20">
                      {productImages.map((_: string, idx: number) => (
                        <button
                          key={idx}
                          onClick={() => setCurrentImgIndex(idx)}
                          className={`h-2 rounded-full transition-all ${
                            currentImgIndex === idx
                              ? "w-6 bg-orange-500"
                              : "w-2 bg-white/60"
                          }`}
                        />
                      ))}
                    </div>
                  </>
                )}
              </div>

              {/* Thumbnails Row */}
              {productImages.length > 1 && (
                <div className="flex gap-3 overflow-x-auto pb-1">
                  {productImages.map((img: string, idx: number) => (
                    <button
                      key={idx}
                      onClick={() => setCurrentImgIndex(idx)}
                      className={`w-20 h-20 rounded-xl overflow-hidden border-2 flex-shrink-0 transition-all ${
                        currentImgIndex === idx
                          ? "border-orange-500 scale-95 shadow-sm"
                          : "border-transparent opacity-60 hover:opacity-100"
                      }`}
                    >
                      <img
                        src={img}
                        alt={`Thumbnail ${idx + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Right Column: Info & Actions */}
            <div className="flex flex-col justify-start gap-2">
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black uppercase tracking-wider text-orange-500">
                    {product.gender || product.category || "Sneakers"}
                  </span>
                  <div className="flex items-center gap-1 bg-gray-100 px-3 py-1 rounded-full text-xs font-bold text-gray-700">
                    <span>★ {product.rating || "4.8"}</span>
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

              {/* Fit Guarantee Callout */}
<div className="mt-4 p-3.5 bg-gray-50 border border-gray-200 rounded-xl flex items-center gap-2.5 text-xs text-gray-700 font-medium">
  <span className="text-sm">ⓘ</span>
  <span>
    <strong className="font-bold text-gray-900">True to size.</strong> We recommend ordering your usual size.
  </span>
</div>

              {/* Add to Cart Button */}
              <div className="pt-4 border-t border-gray-100">
                <button
                  onClick={handleAddToCart}
                  className="w-full py-4 bg-orange-500 hover:bg-orange-600 text-white font-extrabold rounded-xl transition-colors shadow-md active:scale-95"
                >
                  🛒 Add to Cart
                </button>
              </div>
            </div>
          </div>

          {/* Related Products Grid */}
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