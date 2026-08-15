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

interface Address {
  fullName: string;
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  phone: string;
}

interface PaymentMethod {
  id: string;
  brand: string;
  last4: string;
  expiry: string;
  holderName: string;
  isDefault: boolean;
}

const mockOrders = [
  {
    id: "SV-88421",
    date: "August 10, 2026",
    status: "Delivered",
    total: 210.0,
    trackingNo: "1Z9999999999999999",
    carrier: "UPS Express",
    items: [
      { name: "Air Jordan 1 Retro High OG", qty: 1, price: 180.0, image: "https://images.unsplash.com/photo-1552346154-21d32810aba3?w=500&q=80" },
      { name: "Sneaker Care Cleaning Kit", qty: 1, price: 30.0, image: "https://images.unsplash.com/photo-1600185365483-26d7a4cc7519?w=500&q=80" },
    ],
  },
  {
    id: "SV-73910",
    date: "July 24, 2026",
    status: "In Transit",
    total: 145.0,
    trackingNo: "FE882104928US",
    carrier: "FedEx Ground",
    items: [
      { name: "Nike Dunk Low Retro", qty: 1, price: 145.0, image: "https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=500&q=80" }
    ],
  },
];

const BRANDS_LIST = ["Nike", "Jordan", "Adidas", "Yeezy", "New Balance", "Puma", "Asics", "Travis Scott"];

export default function AccountPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"profile" | "orders" | "addresses" | "payment" | "preferences" | "wishlist">("profile");
  const [wishlistIds, setWishlistIds] = useState<string[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);

  // Address state
  const [isEditingAddress, setIsEditingAddress] = useState(false);
  const [savedAddress, setSavedAddress] = useState<Address>({
    fullName: "",
    street: "",
    city: "",
    state: "",
    zipCode: "",
    country: "United States",
    phone: "",
  });

  // Sneaker Preferences state
  const [shoeSize, setShoeSize] = useState("10.5");
  const [sizeSystem, setSizeSystem] = useState<"US" | "EU" | "UK">("US");
  const [selectedBrands, setSelectedBrands] = useState<string[]>(["Nike", "Jordan"]);

  // Payment Methods State & Add-Card Form State
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([
    {
      id: "pm_1",
      brand: "Visa",
      last4: "4242",
      expiry: "12/28",
      holderName: "Collector Standard",
      isDefault: true,
    },
  ]);
  const [isAddingCard, setIsAddingCard] = useState(false);
  const [newCard, setNewCard] = useState({
    holderName: "",
    cardNumber: "",
    expiry: "",
    brand: "Visa",
    isDefault: false,
  });

  // UI status messages
  const [saveSuccessMsg, setSaveSuccessMsg] = useState("");

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
        router.push("/login");
      } else {
        setUser(data.user);
        
        // Auto-fill address & card name if empty
        const defaultName = data.user.user_metadata?.full_name || data.user.email?.split("@")[0] || "";
        setSavedAddress((prev) => ({ ...prev, fullName: prev.fullName || defaultName }));
        setNewCard((prev) => ({ ...prev, holderName: prev.holderName || defaultName }));
      }
      setLoading(false);
    };

    fetchUser();

    // 2. Load Wishlist, Cart & Local Preferences
    try {
      const savedWishlist = localStorage.getItem("sneaker_wishlist");
      if (savedWishlist) setWishlistIds(JSON.parse(savedWishlist));

      const savedCart = localStorage.getItem("sneaker_cart");
      if (savedCart) setCart(JSON.parse(savedCart));

      const localAddr = localStorage.getItem("vault_address");
      if (localAddr) setSavedAddress(JSON.parse(localAddr));

      const localPrefs = localStorage.getItem("vault_preferences");
      if (localPrefs) {
        const parsed = JSON.parse(localPrefs);
        if (parsed.shoeSize) setShoeSize(parsed.shoeSize);
        if (parsed.sizeSystem) setSizeSystem(parsed.sizeSystem);
        if (parsed.selectedBrands) setSelectedBrands(parsed.selectedBrands);
      }

      const localPayments = localStorage.getItem("vault_payments");
      if (localPayments) {
        setPaymentMethods(JSON.parse(localPayments));
      }
    } catch (e) {
      console.error("Failed to parse saved vault data", e);
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

  // Save address handler
  const handleSaveAddress = (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.setItem("vault_address", JSON.stringify(savedAddress));
    setIsEditingAddress(false);
    triggerSuccessBanner("Shipping address saved successfully!");
  };

  // Save sneaker preferences handler
  const handleSavePreferences = () => {
    const prefs = { shoeSize, sizeSystem, selectedBrands };
    localStorage.setItem("vault_preferences", JSON.stringify(prefs));
    triggerSuccessBanner("Collector preferences saved!");
  };

  // Payment Methods Handlers
  const handleAddPaymentMethod = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanNumber = newCard.cardNumber.replace(/\s+/g, "");
    const last4 = cleanNumber.slice(-4) || "0000";

    const createdCard: PaymentMethod = {
      id: `pm_${Date.now()}`,
      brand: newCard.brand,
      last4,
      expiry: newCard.expiry || "12/28",
      holderName: newCard.holderName || "Collector",
      isDefault: newCard.isDefault || paymentMethods.length === 0,
    };

    let updatedMethods = [...paymentMethods];
    if (createdCard.isDefault) {
      updatedMethods = updatedMethods.map((pm) => ({ ...pm, isDefault: false }));
    }
    updatedMethods.push(createdCard);

    setPaymentMethods(updatedMethods);
    localStorage.setItem("vault_payments", JSON.stringify(updatedMethods));

    setIsAddingCard(false);
    setNewCard({ holderName: "", cardNumber: "", expiry: "", brand: "Visa", isDefault: false });
    triggerSuccessBanner("New payment card added to your Vault!");
  };

  const handleDeletePaymentMethod = (id: string) => {
    const updated = paymentMethods.filter((pm) => pm.id !== id);
    setPaymentMethods(updated);
    localStorage.setItem("vault_payments", JSON.stringify(updated));
    triggerSuccessBanner("Payment method removed.");
  };

  const toggleBrand = (brand: string) => {
    if (selectedBrands.includes(brand)) {
      setSelectedBrands(selectedBrands.filter((b) => b !== brand));
    } else {
      setSelectedBrands([...selectedBrands, brand]);
    }
  };

  const triggerSuccessBanner = (msg: string) => {
    setSaveSuccessMsg(msg);
    setTimeout(() => setSaveSuccessMsg(""), 3500);
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
          
          {/* Notification Banner */}
          {saveSuccessMsg && (
            <div className="mb-6 bg-emerald-500 text-white font-extrabold text-xs py-3 px-5 rounded-2xl shadow-lg flex items-center justify-between animate-fadeIn">
              <span>⚡ {saveSuccessMsg}</span>
              <button onClick={() => setSaveSuccessMsg("")}>✕</button>
            </div>
          )}

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
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-black uppercase tracking-widest text-orange-500 bg-orange-50 px-2 py-0.5 rounded-md border border-orange-200">
                    Verified Collector
                  </span>
                  <span className="text-[10px] font-black uppercase tracking-widest text-gray-500 bg-gray-100 px-2 py-0.5 rounded-md">
                    Size {sizeSystem} {shoeSize}
                  </span>
                </div>
                <h1 className="text-2xl sm:text-3xl font-black text-gray-900 mt-1">
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
          <div className="flex border-b border-gray-200 mb-8 gap-6 sm:gap-8 overflow-x-auto no-scrollbar">
            {[
              { id: "profile", label: "Overview" },
              { id: "orders", label: `Orders (${mockOrders.length})` },
              { id: "addresses", label: "Shipping Address" },
              { id: "payment", label: `Payment Methods (${paymentMethods.length})` },
              { id: "preferences", label: "Sole Profile" },
              { id: "wishlist", label: `Wishlist (${wishlistProducts.length})` },
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

          {/* TAB 1: OVERVIEW & PROFILE */}
          {activeTab === "profile" && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm space-y-4">
                <h3 className="font-black text-sm uppercase text-gray-900 tracking-wider flex items-center justify-between">
                  <span>Account Info</span>
                  <span className="text-xs text-orange-500">ID verified</span>
                </h3>
                <div className="space-y-3 text-xs">
                  <div>
                    <span className="text-gray-400 font-bold block">DISPLAY NAME</span>
                    <span className="font-extrabold text-gray-800">{userName}</span>
                  </div>
                  <div>
                    <span className="text-gray-400 font-bold block">EMAIL ADDRESS</span>
                    <span className="font-extrabold text-gray-800">{user?.email || "N/A"}</span>
                  </div>
                  <div>
                    <span className="text-gray-400 font-bold block">PROVIDER</span>
                    <span className="font-bold text-gray-700 capitalize">
                      {user?.app_metadata?.provider || "Email / Password"}
                    </span>
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm space-y-4">
                <h3 className="font-black text-sm uppercase text-gray-900 tracking-wider">
                  Sole Preferences
                </h3>
                <div className="space-y-3 text-xs">
                  <div>
                    <span className="text-gray-400 font-bold block">DEFAULT SHOE SIZE</span>
                    <span className="font-black text-orange-500 text-sm">
                      {sizeSystem} {shoeSize}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-400 font-bold block mb-1">FAVORITE BRANDS</span>
                    <div className="flex flex-wrap gap-1.5">
                      {selectedBrands.map((b) => (
                        <span key={b} className="bg-gray-100 font-extrabold px-2.5 py-1 rounded-lg text-[10px]">
                          {b}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm space-y-4">
                <h3 className="font-black text-sm uppercase text-gray-900 tracking-wider">
                  Vault Metrics
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-orange-50 p-4 rounded-xl border border-orange-100">
                    <span className="text-2xl font-black text-orange-500">{mockOrders.length}</span>
                    <span className="block text-[10px] font-bold text-gray-500 uppercase">Total Orders</span>
                  </div>
                  <div className="bg-emerald-50 p-4 rounded-xl border border-emerald-100">
                    <span className="text-2xl font-black text-emerald-600">{wishlistProducts.length}</span>
                    <span className="block text-[10px] font-bold text-gray-500 uppercase">Saved Drops</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: ORDERS */}
          {activeTab === "orders" && (
            <div className="space-y-4">
              {mockOrders.map((order) => (
                <div key={order.id} className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm">
                  <div className="flex flex-wrap items-center justify-between border-b border-gray-100 pb-3 mb-4 gap-2">
                    <div>
                      <span className="font-black text-sm text-gray-900 mr-3">{order.id}</span>
                      <span className="text-xs text-gray-400 font-medium">{order.date}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold text-gray-400">{order.carrier}</span>
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
                  </div>

                  {/* Order Items list */}
                  <div className="space-y-3 mb-4">
                    {order.items.map((item, idx) => (
                      <div key={idx} className="flex items-center justify-between text-xs font-semibold text-gray-800 gap-3">
                        <div className="flex items-center gap-3">
                          <img src={item.image} alt={item.name} className="w-12 h-12 object-cover rounded-xl bg-gray-100 shrink-0" />
                          <div>
                            <p className="font-bold text-gray-900">{item.name}</p>
                            <p className="text-[10px] text-gray-400 font-bold">Qty: {item.qty}</p>
                          </div>
                        </div>
                        <span className="font-black text-gray-900">${item.price.toFixed(2)}</span>
                      </div>
                    ))}
                  </div>

                  <div className="flex flex-wrap justify-between items-center pt-3 border-t border-gray-100 gap-2">
                    <div className="text-xs text-gray-400">
                      Tracking Number: <span className="font-mono text-gray-700 font-bold">{order.trackingNo}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="font-black text-sm text-gray-900">Total: <span className="text-orange-500">${order.total.toFixed(2)}</span></span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* TAB 3: SHIPPING ADDRESS */}
          {activeTab === "addresses" && (
            <div className="max-w-2xl bg-white p-6 sm:p-8 rounded-3xl border border-gray-200 shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="font-black text-base text-gray-900">Shipping & Delivery Details</h3>
                  <p className="text-xs text-gray-400">Used for fast 1-click drop checkouts</p>
                </div>
                {!isEditingAddress && savedAddress.street && (
                  <button
                    onClick={() => setIsEditingAddress(true)}
                    className="text-xs font-black text-orange-500 hover:text-orange-600 bg-orange-50 px-3 py-1.5 rounded-lg border border-orange-200"
                  >
                    ✏️ Edit Address
                  </button>
                )}
              </div>

              {!isEditingAddress && savedAddress.street ? (
                <div className="bg-gray-50 p-5 rounded-2xl border border-gray-100 space-y-2 text-xs font-semibold text-gray-700">
                  <p className="font-black text-sm text-gray-900">{savedAddress.fullName}</p>
                  <p>{savedAddress.street}</p>
                  <p>{savedAddress.city}, {savedAddress.state} {savedAddress.zipCode}</p>
                  <p>{savedAddress.country}</p>
                  <p className="text-gray-400 pt-2 border-t border-gray-200">📞 {savedAddress.phone}</p>
                </div>
              ) : (
                <form onSubmit={handleSaveAddress} className="space-y-4 text-xs">
                  <div>
                    <label className="block font-bold text-gray-600 mb-1">Full Recipient Name</label>
                    <input
                      type="text"
                      required
                      value={savedAddress.fullName}
                      onChange={(e) => setSavedAddress({ ...savedAddress, fullName: e.target.value })}
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 font-semibold text-gray-900 outline-none focus:border-orange-500"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-gray-600 mb-1">Street Address</label>
                    <input
                      type="text"
                      required
                      value={savedAddress.street}
                      onChange={(e) => setSavedAddress({ ...savedAddress, street: e.target.value })}
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 font-semibold text-gray-900 outline-none focus:border-orange-500"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block font-bold text-gray-600 mb-1">City</label>
                      <input
                        type="text"
                        required
                        value={savedAddress.city}
                        onChange={(e) => setSavedAddress({ ...savedAddress, city: e.target.value })}
                        className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 font-semibold text-gray-900 outline-none focus:border-orange-500"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-gray-600 mb-1">State / Province</label>
                      <input
                        type="text"
                        required
                        value={savedAddress.state}
                        onChange={(e) => setSavedAddress({ ...savedAddress, state: e.target.value })}
                        className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 font-semibold text-gray-900 outline-none focus:border-orange-500"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block font-bold text-gray-600 mb-1">Postal / Zip Code</label>
                      <input
                        type="text"
                        required
                        value={savedAddress.zipCode}
                        onChange={(e) => setSavedAddress({ ...savedAddress, zipCode: e.target.value })}
                        className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 font-semibold text-gray-900 outline-none focus:border-orange-500"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-gray-600 mb-1">Phone Number</label>
                      <input
                        type="text"
                        required
                        value={savedAddress.phone}
                        onChange={(e) => setSavedAddress({ ...savedAddress, phone: e.target.value })}
                        className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 font-semibold text-gray-900 outline-none focus:border-orange-500"
                      />
                    </div>
                  </div>
                  <div className="flex gap-3 pt-2">
                    <button
                      type="submit"
                      className="bg-orange-500 hover:bg-orange-600 text-white font-extrabold px-6 py-3 rounded-xl text-xs transition-colors shadow-md"
                    >
                      Save Address
                    </button>
                    {savedAddress.street && (
                      <button
                        type="button"
                        onClick={() => setIsEditingAddress(false)}
                        className="bg-gray-100 text-gray-600 font-extrabold px-6 py-3 rounded-xl text-xs"
                      >
                        Cancel
                      </button>
                    )}
                  </div>
                </form>
              )}
            </div>
          )}

          {/* TAB 4: PAYMENT METHODS */}
          {activeTab === "payment" && (
            <div className="max-w-2xl bg-white p-6 sm:p-8 rounded-3xl border border-gray-200 shadow-sm space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-black text-base text-gray-900">Saved Payment Methods</h3>
                  <p className="text-xs text-gray-400">Manage your cards for instant checkouts</p>
                </div>
                {!isAddingCard && (
                  <button
                    onClick={() => setIsAddingCard(true)}
                    className="bg-orange-500 hover:bg-orange-600 text-white font-extrabold px-4 py-2 rounded-xl text-xs transition-all shadow-md"
                  >
                    + Add Payment Method
                  </button>
                )}
              </div>

              {/* Add New Card Form */}
              {isAddingCard && (
                <form onSubmit={handleAddPaymentMethod} className="bg-gray-50 p-5 rounded-2xl border border-orange-200 space-y-4 text-xs animate-fadeIn">
                  <div className="flex justify-between items-center border-b border-gray-200 pb-2">
                    <h4 className="font-black text-xs uppercase text-gray-800">Add New Payment Card</h4>
                    <button
                      type="button"
                      onClick={() => setIsAddingCard(false)}
                      className="text-gray-400 hover:text-black font-bold"
                    >
                      ✕
                    </button>
                  </div>

                  <div>
                    <label className="block font-bold text-gray-600 mb-1">Cardholder Name</label>
                    <input
                      type="text"
                      required
                      value={newCard.holderName}
                      onChange={(e) => setNewCard({ ...newCard, holderName: e.target.value })}
                      className="w-full bg-white border border-gray-200 rounded-xl p-3 font-semibold text-gray-900 outline-none focus:border-orange-500"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block font-bold text-gray-600 mb-1">Card Brand</label>
                      <select
                        value={newCard.brand}
                        onChange={(e) => setNewCard({ ...newCard, brand: e.target.value })}
                        className="w-full bg-white border border-gray-200 rounded-xl p-3 font-semibold text-gray-900 outline-none focus:border-orange-500"
                      >
                        <option value="Visa">Visa</option>
                        <option value="Mastercard">Mastercard</option>
                        <option value="Amex">American Express</option>
                        <option value="Discover">Discover</option>
                      </select>
                    </div>
                    <div>
                      <label className="block font-bold text-gray-600 mb-1">Card Number</label>
                      <input
                        type="text"
                        required
                        maxLength={19}
                        placeholder="•••• •••• •••• 1234"
                        value={newCard.cardNumber}
                        onChange={(e) => setNewCard({ ...newCard, cardNumber: e.target.value })}
                        className="w-full bg-white border border-gray-200 rounded-xl p-3 font-semibold text-gray-900 outline-none focus:border-orange-500"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block font-bold text-gray-600 mb-1">Expiry Date</label>
                      <input
                        type="text"
                        required
                        placeholder="MM/YY"
                        maxLength={5}
                        value={newCard.expiry}
                        onChange={(e) => setNewCard({ ...newCard, expiry: e.target.value })}
                        className="w-full bg-white border border-gray-200 rounded-xl p-3 font-semibold text-gray-900 outline-none focus:border-orange-500"
                      />
                    </div>
                    <div className="flex items-end">
                      <label className="flex items-center gap-2 font-bold text-gray-700 cursor-pointer pb-3">
                        <input
                          type="checkbox"
                          checked={newCard.isDefault}
                          onChange={(e) => setNewCard({ ...newCard, isDefault: e.target.checked })}
                          className="w-4 h-4 accent-orange-500 rounded"
                        />
                        <span>Set as Default</span>
                      </label>
                    </div>
                  </div>

                  <div className="flex gap-3 pt-2">
                    <button
                      type="submit"
                      className="bg-orange-500 hover:bg-orange-600 text-white font-extrabold px-6 py-3 rounded-xl text-xs transition-colors shadow-md"
                    >
                      Save Card
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsAddingCard(false)}
                      className="bg-gray-200 text-gray-700 font-extrabold px-6 py-3 rounded-xl text-xs"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              )}

              {/* Saved Cards List */}
              {paymentMethods.length === 0 ? (
                <div className="text-center py-12 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                  <p className="text-gray-500 font-bold text-xs">No saved payment methods found.</p>
                  <button
                    onClick={() => setIsAddingCard(true)}
                    className="mt-3 bg-orange-500 text-white font-black px-4 py-2 rounded-xl text-xs"
                  >
                    Add Card Now
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {paymentMethods.map((pm) => (
                    <div
                      key={pm.id}
                      className="bg-gradient-to-r from-gray-900 to-gray-800 text-white p-5 rounded-2xl shadow-lg relative overflow-hidden group"
                    >
                      <div className="flex justify-between items-start mb-6">
                        <span className="font-black text-lg tracking-wider text-orange-400">{pm.brand}</span>
                        <div className="flex items-center gap-2">
                          {pm.isDefault && (
                            <span className="bg-orange-500/20 text-orange-400 border border-orange-500/30 text-[9px] font-black uppercase px-2 py-0.5 rounded-full">
                              Default
                            </span>
                          )}
                          <button
                            onClick={() => handleDeletePaymentMethod(pm.id)}
                            className="bg-red-500/20 hover:bg-red-500 text-red-300 hover:text-white text-[10px] font-extrabold px-2.5 py-1 rounded-lg border border-red-500/30 transition-colors"
                            title="Remove Card"
                          >
                            🗑️ Delete
                          </button>
                        </div>
                      </div>
                      <p className="font-mono text-base tracking-widest mb-4">•••• •••• •••• {pm.last4}</p>
                      <div className="flex justify-between text-[10px] text-gray-400 font-bold uppercase">
                        <div>
                          <span className="block text-[8px] text-gray-500">CARD HOLDER</span>
                          {pm.holderName}
                        </div>
                        <div>
                          <span className="block text-[8px] text-gray-500">EXPIRES</span>
                          {pm.expiry}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 5: SOLE PROFILE / PREFERENCES */}
          {activeTab === "preferences" && (
            <div className="max-w-2xl bg-white p-6 sm:p-8 rounded-3xl border border-gray-200 shadow-sm space-y-6">
              <div>
                <h3 className="font-black text-base text-gray-900">Sole Profile & Collector Sizing</h3>
                <p className="text-xs text-gray-400">Personalize your feed and size recommendations</p>
              </div>

              <div className="space-y-6">
                {/* Size Selection */}
                <div>
                  <label className="block font-bold text-xs text-gray-700 mb-2">Preferred Shoe Size</label>
                  <div className="flex items-center gap-3">
                    <select
                      value={sizeSystem}
                      onChange={(e) => setSizeSystem(e.target.value as any)}
                      className="bg-gray-100 font-bold text-xs p-3 rounded-xl border border-gray-200 outline-none"
                    >
                      <option value="US">US</option>
                      <option value="EU">EU</option>
                      <option value="UK">UK</option>
                    </select>

                    <input
                      type="text"
                      value={shoeSize}
                      onChange={(e) => setShoeSize(e.target.value)}
                      placeholder="e.g. 10.5"
                      className="bg-gray-50 font-bold text-xs p-3 rounded-xl border border-gray-200 outline-none flex-1"
                    />
                  </div>
                </div>

                {/* Brands Selection */}
                <div>
                  <label className="block font-bold text-xs text-gray-700 mb-2">Favorite Sneaker Brands</label>
                  <div className="flex flex-wrap gap-2">
                    {BRANDS_LIST.map((brand) => {
                      const isSelected = selectedBrands.includes(brand);
                      return (
                        <button
                          key={brand}
                          type="button"
                          onClick={() => toggleBrand(brand)}
                          className={`px-4 py-2 rounded-xl text-xs font-black transition-all ${
                            isSelected
                              ? "bg-orange-500 text-white shadow-sm"
                              : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                          }`}
                        >
                          {isSelected ? `✓ ${brand}` : `+ ${brand}`}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <button
                  onClick={handleSavePreferences}
                  className="bg-black hover:bg-orange-500 text-white font-extrabold px-6 py-3 rounded-xl text-xs transition-colors shadow-md"
                >
                  Save Sole Profile
                </button>
              </div>
            </div>
          )}

          {/* TAB 6: WISHLIST */}
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