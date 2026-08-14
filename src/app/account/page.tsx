"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createBrowserClient } from "@supabase/ssr";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Cart from "@/components/Cart";
import { allProducts } from "@/data/products";

interface CartItem {
  id: string;
  name: string;
  price: number;
  image_url: string;
  quantity: number;
}

const mockOrders = [
  {
    id: "SV-88421",
    date: "August 10, 2026",
    status: "Delivered",
    total: 210.0,
    items: [
      { name: "Air Jordan 1 Retro High OG", qty: 1, price: 180.0 },
      { name: "Sneaker Care Cleaning Kit", qty: 1, price: 30.0 },
    ],
  },
  {
    id: "SV-73910",
    date: "July 24, 2026",
    status: "In Transit",
    total: 145.0,
    items: [{ name: "Nike Dunk Low Retro", qty: 1, price: 145.0 }],
  },
];

export default function AccountPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"profile" | "orders" | "wishlist">("profile");
  const [wishlistIds, setWishlistIds] = useState<string[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);

  // Initialize Supabase client
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

useEffect(() => {
    // 1. Fetch Supabase Auth User & Protect Route
    const fetchUser = async () => {
      const { data } = await supabase.auth.getUser();
      if (!data?.user) {
        router.push("/login"); // 👈 Redirects guest users directly to login page
      } else {
        setUser(data.user);
      }
      setLoading(false);
    };

    fetchUser();

    // 2. Load Wishlist from Local Storage
    const savedWishlist = localStorage.getItem("sneaker_wishlist");
    if (savedWishlist) {
      try {
        const parsed = JSON.parse(savedWishlist);
        if (Array.isArray(parsed)) setWishlistIds(parsed);
      } catch (e) {}
    }

    // 3. Load Cart from Local Storage
    const savedCart = localStorage.getItem("sneaker_cart");
    if (savedCart) {
      try {
        const parsed = JSON.parse(savedCart);
        if (Array.isArray(parsed)) setCart(parsed);
      } catch (e) {}
    }
  }, [supabase, router]);

  // Handle Logout
  const handleSignOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    router.push("/login");
    router.refresh();
  };

  const wishlistProducts = allProducts.filter((p) => wishlistIds.includes(p.id));

  const removeWishlist = (id: string) => {
    const updated = wishlistIds.filter((wId) => wId !== id);
    setWishlistIds(updated);
    localStorage.setItem("sneaker_wishlist", JSON.stringify(updated));
  };

  const updateQuantity = (id: string, delta: number) => {
    setCart((prev) => {
      const updated = prev
        .map((item) => (item.id === id ? { ...item, quantity: item.quantity + delta } : item))
        .filter((item) => item.quantity > 0);
      localStorage.setItem("sneaker_cart", JSON.stringify(updated));
      return updated;
    });
  };

  // User display helpers
  const userName = user?.user_metadata?.full_name || user?.email?.split("@")[0] || "Collector";
  const userInitials = userName.substring(0, 2).toUpperCase();

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 flex flex-col justify-between">
      <div>
        <Navbar
          cartCount={cart.reduce((sum, item) => sum + item.quantity, 0)}
          wishlistCount={wishlistIds.length}
          toggleCart={() => setIsCartOpen(!isCartOpen)}
        />

        <Cart
          isOpen={isCartOpen}
          onClose={() => setIsCartOpen(false)}
          items={cart}
          onUpdateQuantity={updateQuantity}
        />

        <main className="max-w-7xl mx-auto px-4 py-8">
          
          {/* User Profile Header Card */}
          <div className="bg-white border border-gray-200 rounded-3xl p-6 sm:p-8 mb-8 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-5">
              {user?.user_metadata?.avatar_url ? (
                <img
                  src={user.user_metadata.avatar_url}
                  alt={userName}
                  className="w-20 h-20 rounded-2xl object-cover border-2 border-orange-500 shadow-md"
                />
              ) : (
                <div className="w-20 h-20 rounded-2xl bg-orange-500 text-white font-black text-2xl flex items-center justify-center border-2 border-orange-600 shadow-md shrink-0">
                  {userInitials}
                </div>
              )}

              <div>
                <span className="text-[10px] font-black uppercase tracking-widest text-orange-500">
                  {user ? "Verified Vault Member" : "Guest Collector"}
                </span>
                <h1 className="text-2xl sm:text-3xl font-black text-gray-900">
                  {loading ? "Loading Vault..." : userName}
                </h1>
                <p className="text-gray-400 text-xs sm:text-sm font-medium">
                  {user ? user.email : "Sign in to access your full vault benefits"}
                </p>
              </div>
            </div>

            {user ? (
              <button
                onClick={handleSignOut}
                className="bg-red-50 hover:bg-red-100 text-red-600 font-extrabold px-6 py-3 rounded-xl text-xs transition-all border border-red-200"
              >
                Sign Out of Vault
              </button>
            ) : (
              <Link
                href="/login"
                className="bg-orange-500 hover:bg-orange-600 text-white font-extrabold px-6 py-3 rounded-xl text-xs transition-all shadow-md"
              >
                Sign In to Vault
              </Link>
            )}
          </div>

          {/* Navigation Tabs */}
          <div className="flex border-b border-gray-200 mb-8 gap-8 overflow-x-auto">
            {[
              { id: "profile", label: "Overview & Profile" },
              { id: "orders", label: `Orders (${mockOrders.length})` },
              { id: "wishlist", label: `Wishlist Vault (${wishlistProducts.length})` },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`pb-4 text-xs font-black uppercase tracking-wider transition-colors whitespace-nowrap border-b-2 ${
                  activeTab === tab.id
                    ? "border-orange-500 text-orange-500"
                    : "border-transparent text-gray-400 hover:text-gray-700"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          {activeTab === "profile" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm space-y-4">
                <h3 className="font-black text-sm uppercase text-gray-900 tracking-wider">
                  Account Details
                </h3>
                <div className="space-y-3 text-xs">
                  <div>
                    <span className="text-gray-400 font-bold block">DISPLAY NAME</span>
                    <span className="font-extrabold text-gray-800">{userName}</span>
                  </div>
                  <div>
                    <span className="text-gray-400 font-bold block">EMAIL ADDRESS</span>
                    <span className="font-extrabold text-gray-800">{user?.email || "Not signed in"}</span>
                  </div>
                  <div>
                    <span className="text-gray-400 font-bold block">USER ID</span>
                    <span className="font-mono text-gray-500 text-[11px] truncate block">
                      {user?.id || "N/A"}
                    </span>
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm space-y-4">
                <h3 className="font-black text-sm uppercase text-gray-900 tracking-wider">
                  Vault Stats
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-orange-50 p-4 rounded-xl border border-orange-100">
                    <span className="text-2xl font-black text-orange-500">{mockOrders.length}</span>
                    <span className="block text-[10px] font-bold text-gray-500 uppercase">Orders Placed</span>
                  </div>
                  <div className="bg-emerald-50 p-4 rounded-xl border border-emerald-100">
                    <span className="text-2xl font-black text-emerald-600">{wishlistProducts.length}</span>
                    <span className="block text-[10px] font-bold text-gray-500 uppercase">Saved Items</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "orders" && (
            <div className="space-y-4">
              {mockOrders.map((order) => (
                <div key={order.id} className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm">
                  <div className="flex flex-wrap items-center justify-between border-b border-gray-100 pb-3 mb-3 gap-2">
                    <div>
                      <span className="font-black text-sm text-gray-900 mr-3">{order.id}</span>
                      <span className="text-xs text-gray-400 font-medium">{order.date}</span>
                    </div>
                    <span
                      className={`text-[10px] font-black uppercase px-2.5 py-1 rounded-full ${
                        order.status === "Delivered"
                          ? "bg-emerald-100 text-emerald-700"
                          : "bg-amber-100 text-amber-700"
                      }`}
                    >
                      {order.status}
                    </span>
                  </div>
                  <div className="space-y-2 mb-3">
                    {order.items.map((item, idx) => (
                      <div key={idx} className="flex justify-between text-xs font-semibold text-gray-700">
                        <span>{item.qty}x {item.name}</span>
                        <span>${item.price.toFixed(2)}</span>
                      </div>
                    ))}
                  </div>
                  <div className="flex justify-between items-center pt-2 border-t border-gray-100 font-black text-sm">
                    <span>Total</span>
                    <span className="text-orange-500">${order.total.toFixed(2)}</span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === "wishlist" && (
            <div>
              {wishlistProducts.length === 0 ? (
                <div className="text-center py-16 bg-white rounded-3xl border border-gray-200">
                  <span className="text-4xl block mb-2">❤️</span>
                  <p className="text-gray-500 font-semibold text-sm">Your wishlist is empty.</p>
                  <Link
                    href="/"
                    className="mt-4 inline-block bg-orange-500 text-white font-extrabold px-6 py-2.5 rounded-xl text-xs"
                  >
                    Explore Drops
                  </Link>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                  {wishlistProducts.map((product) => (
                    <div key={product.id} className="bg-white p-4 rounded-2xl border border-gray-200 shadow-sm relative group">
                      <button
                        onClick={() => removeWishlist(product.id)}
                        className="absolute top-3 right-3 text-xs bg-gray-100 hover:bg-red-50 hover:text-red-500 p-1.5 rounded-full transition-colors z-10"
                      >
                        ✕
                      </button>
                      <Link href={`/products/${product.id}`}>
                        <img
                          src={product.image_url}
                          alt={product.name}
                          className="w-full h-36 object-cover rounded-xl mb-3"
                        />
                        <h4 className="font-extrabold text-xs text-gray-900 truncate">{product.name}</h4>
                        <p className="font-black text-sm text-orange-500 mt-1">${product.price}</p>
                      </Link>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

        </main>
      </div>

      <Footer />
    </div>
  );
}