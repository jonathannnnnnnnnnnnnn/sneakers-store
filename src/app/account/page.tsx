"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { createBrowserClient } from "@supabase/ssr";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Cart from "@/components/Cart";
import { allProducts } from "@/data/products";
import { useStore } from "@/context/StoreContext";

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

interface Order {
  id: string;
  created_at?: string;
  date?: string;
  status?: string;
  total: number;
  trackingNo?: string;
  trackingNumber?: string;
  carrier?: string;
  items?: any[];
}

const BRANDS_LIST = ["Nike", "Jordan", "Adidas", "Yeezy", "New Balance", "Puma", "Asics", "Travis Scott"];

export default function AccountPage() {
  const { user, cart, wishlistIds, clearCart, updateQuantity, removeFromWishlist } = useStore();
  const [showBanner, setShowBanner] = useState(true);
  const searchParams = useSearchParams();
  const isSuccess = searchParams.get("success") === "true";
  const checkoutSessionId = searchParams.get("session_id");

  const [orders, setOrders] = useState<Order[]>([]);
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"profile" | "orders" | "addresses" | "payment" | "preferences" | "wishlist">("profile");
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
  const clearedSuccessRef = useRef<string | null>(null);

  useEffect(() => {
    const successKey = isSuccess ? `${checkoutSessionId || "success"}:${user?.id || "guest"}` : null;
    if (successKey && clearedSuccessRef.current !== successKey) {
      clearedSuccessRef.current = successKey;
      clearCart();
    }
  }, [checkoutSessionId, clearCart, isSuccess, user?.id]);

  // Initialize Supabase client
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  useEffect(() => {
    let isMounted = true;

    const fetchUserAndOrders = async () => {
      // 1. Check Authenticated User
      const { data } = await supabase.auth.getUser();
      if (!data?.user) {
        router.push("/login");
        return;
      }

      const currentUser = data.user;

      const userCartKey = `sneaker_cart_${currentUser.id}`;

      // 2. Handle Stripe success redirect: Create order if coming from checkout
      if (isSuccess && checkoutSessionId) {
        try {
          const pendingCart =
            localStorage.getItem("pending_order") ||
            localStorage.getItem(userCartKey) ||
            localStorage.getItem("sneaker_cart");
          const items = pendingCart ? JSON.parse(pendingCart) : [];

          if (items.length > 0) {
            const totalAmount = items.reduce(
              (sum: number, item: any) => sum + item.price * item.quantity,
              0
            );

            // Call server endpoint
            const response = await fetch("/api/orders/create", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                userId: currentUser.id,
                total: totalAmount,
                items: items,
                stripeSessionId: checkoutSessionId,
              }),
            });

            const resData = await response.json();

            if (!response.ok) {
              console.error("🔴 Server Order Error:", resData.error);
            } else {
              console.log("✅ Order Inserted Successfully:", resData.order);
            }
          }
        } catch (e) {
          console.error("🔴 Error processing order:", e);
        }

        // Payment succeeded, so clear the cart even when the order already exists or API fails.
        await clearCart();
        localStorage.removeItem(userCartKey);
        localStorage.removeItem("sneaker_cart");
        localStorage.removeItem("pending_order");
      }

      // 3. Fetch User-Specific Orders from Supabase
      const { data: userOrders, error: orderError } = await supabase
        .from("orders")
        .select("*")
        .eq("user_id", currentUser.id)
        .order("created_at", { ascending: false });

      if (!orderError && userOrders && isMounted) {
        setOrders(userOrders);
      }

      // 4. Fetch User Shipping Address
      const { data: addressData, error: addressError } = await supabase
        .from("addresses")
        .select("*")
        .eq("user_id", currentUser.id)
        .maybeSingle();

      if (!addressError && addressData && isMounted) {
        setSavedAddress({
          fullName: addressData.fullName || "",
          street: addressData.street || "",
          city: addressData.city || "",
          state: addressData.state || "",
          zipCode: addressData.zipCode || "",
          country: addressData.country || "United States",
          phone: addressData.phone || "",
        });
      }

      if (isMounted) setLoading(false);
    };

    fetchUserAndOrders();

    return () => {
      isMounted = false;
    };
  }, [checkoutSessionId, isSuccess, router, supabase]);

  // Handle Logout (Preserves user storage, resets session state)
  const handleSignOut = async () => {
    await supabase.auth.signOut();
    localStorage.removeItem("pending_order");
    localStorage.removeItem("sneaker_cart_guest");
    localStorage.removeItem("sneaker_wishlist_guest");

    router.push("/login");
    router.refresh();
  };

  const wishlistProducts = allProducts.filter((p) => wishlistIds.map(String).includes(String(p.id)));

  const removeWishlist = (id: string) => {
    removeFromWishlist(id);
  };

  // Save address handler
  const handleSaveAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      triggerSuccessBanner("No logged in user found!");
      return;
    }

    const { error } = await supabase
      .from("addresses")
      .upsert(
        {
          user_id: user.id,
          fullName: savedAddress.fullName,
          street: savedAddress.street,
          city: savedAddress.city,
          state: savedAddress.state,
          zipCode: savedAddress.zipCode,
          country: savedAddress.country,
          phone: savedAddress.phone,
        },
        { onConflict: "user_id" }
      )
      .select();

    if (error) {
      console.error("Full Supabase Error Object:", error);
      triggerSuccessBanner(`Supabase Error: ${error.message} (${error.code})`);
      return;
    }

    setIsEditingAddress(false);
    triggerSuccessBanner("Shipping address saved successfully!");
  };

  // Save sneaker preferences handler
  const handleSavePreferences = () => {
    const prefs = { shoeSize, sizeSystem, selectedBrands };
    const prefsKey = user ? `vault_preferences_${user.id}` : "vault_preferences";
    localStorage.setItem(prefsKey, JSON.stringify(prefs));
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
    const pmKey = user ? `vault_payments_${user.id}` : "vault_payments";
    localStorage.setItem(pmKey, JSON.stringify(updatedMethods));

    setIsAddingCard(false);
    setNewCard({ holderName: "", cardNumber: "", expiry: "", brand: "Visa", isDefault: false });
    triggerSuccessBanner("New payment card added to your Vault!");
  };

  const handleDeletePaymentMethod = (id: string) => {
    const updated = paymentMethods.filter((pm) => pm.id !== id);
    setPaymentMethods(updated);
    const pmKey = user ? `vault_payments_${user.id}` : "vault_payments";
    localStorage.setItem(pmKey, JSON.stringify(updated));
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

  const wishlistCount = wishlistIds.length;
  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 flex flex-col justify-between">
      <div>
        <Navbar
          cartCount={cartCount}
          wishlistCount={wishlistCount}
          toggleCart={() => setIsCartOpen(!isCartOpen)}
        />

        <Cart
          isOpen={isCartOpen}
          onClose={() => setIsCartOpen(false)}
          items={cart}
          onUpdateQuantity={updateQuantity}
        />

        <main className="max-w-7xl mx-auto px-4 py-8">
          {showBanner && (saveSuccessMsg || isSuccess) && (
            <div className="mb-6 bg-emerald-500 text-white font-semibold text-sm py-3 px-5 rounded-2xl shadow-lg flex items-center justify-between animate-fade-in">
              <span>{saveSuccessMsg || "🎉 Payment Successful! Your order has been logged and confirmed."}</span>
              <button 
                onClick={() => {
                  setShowBanner(false);
                  setSaveSuccessMsg("");
                  window.history.replaceState({}, "", "/account");
                }} 
                className="font-bold hover:opacity-75 text-lg leading-none"
              >
                ✕
              </button>
            </div>
          )}

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

          <div className="flex border-b border-gray-200 mb-8 gap-6 sm:gap-8 overflow-x-auto no-scrollbar">
            {[
              { id: "profile", label: "Overview" },
              { id: "orders", label: `Orders (${orders.length})` },
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
                  <div className="bg-orange-50 p-4 rounded-xl border border-orange-200">
                    <span className="text-3xl font-black text-orange-600">{orders.length}</span>
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

          {activeTab === "orders" && (
            <div className="space-y-4">
              {orders.length === 0 ? (
                <div className="text-center py-16 bg-white rounded-3xl border border-gray-200">
                  <span className="text-4xl block mb-2">📦</span>
                  <p className="text-gray-500 font-semibold text-sm">No orders found for this account.</p>
                  <Link
                    href="/"
                    className="mt-4 inline-block bg-orange-500 text-white font-extrabold px-6 py-2.5 rounded-xl text-xs"
                  >
                    Start Shopping
                  </Link>
                </div>
              ) : (
                orders.map((order) => (
                  <div key={order.id} className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm">
                    <div className="flex flex-wrap items-center justify-between border-b border-gray-100 pb-3 mb-4 gap-2">
                      <div>
                        <span className="font-black text-sm text-gray-900 mr-3">{order.id}</span>
                        <span className="text-xs text-gray-400 font-medium">
                          {order.date || (order.created_at ? new Date(order.created_at).toLocaleDateString() : "")}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold text-gray-400">{order.carrier || "Standard Shipping"}</span>
                        <span
                          className={`text-[10px] font-black uppercase px-2.5 py-1 rounded-full ${
                            order.status === "Delivered" || order.status === "DELIVERED"
                              ? "bg-emerald-100 text-emerald-700"
                              : "bg-amber-100 text-amber-700"
                          }`}
                        >
                          {order.status || "PROCESSING"}
                        </span>
                      </div>
                    </div>

                    <div className="space-y-3 mb-4">
                      {order.items?.map((item: any, idx: number) => (
                        <div key={idx} className="flex items-center justify-between text-xs font-semibold text-gray-800 gap-3">
                          <div className="flex items-center gap-3">
                            <img 
                              src={item.image_url || item.image || "/placeholder.jpg"} 
                              alt={item.name} 
                              className="w-12 h-12 object-cover rounded-xl bg-gray-100 shrink-0" 
                            />
                            <div>
                              <p className="font-bold text-gray-900">{item.name}</p>
                              <p className="text-[10px] text-gray-400 font-bold">
                                Qty: {item.quantity || item.qty || 1}
                              </p>
                            </div>
                          </div>
                          <span className="font-black text-gray-900">
                            ${(item.price * (item.quantity || item.qty || 1)).toFixed(2)}
                          </span>
                        </div>
                      ))}
                    </div>

                    <div className="flex flex-wrap justify-between items-center pt-3 border-t border-gray-100 gap-2">
                      <div className="text-xs text-gray-400">
                        Tracking Number: <span className="font-mono text-gray-700 font-bold">{order.trackingNo || order.trackingNumber || "Pending"}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="font-black text-sm text-gray-900">
                          Total: <span className="text-orange-500">${Number(order.total).toFixed(2)}</span>
                        </span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

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

          {activeTab === "preferences" && (
            <div className="max-w-2xl bg-white p-6 sm:p-8 rounded-3xl border border-gray-200 shadow-sm space-y-6">
              <div>
                <h3 className="font-black text-base text-gray-900">Sole Profile & Collector Sizing</h3>
                <p className="text-xs text-gray-400">Personalize your feed and size recommendations</p>
              </div>

              <div className="space-y-6">
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