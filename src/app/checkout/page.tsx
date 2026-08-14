"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

interface CartItem {
  id: string;
  name: string;
  price: number;
  image_url: string;
  quantity: number;
}

export default function CheckoutPage() {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [currentStep, setCurrentStep] = useState<1 | 2>(1);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [orderId, setOrderId] = useState("");

  // Interactive Options
  const [shippingMethod, setShippingMethod] = useState<"standard" | "express">("standard");
  const [paymentMethod, setPaymentMethod] = useState<"card" | "express">("card");
  const [promoCode, setPromoCode] = useState("");
  const [appliedDiscount, setAppliedDiscount] = useState<{ code: string; percent: number } | null>(null);
  const [promoError, setPromoError] = useState("");

  // Form State
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    address: "",
    city: "",
    postalCode: "",
  });

  useEffect(() => {
    const savedCart = localStorage.getItem("sneaker_cart");
    if (savedCart) {
      try {
        const parsed = JSON.parse(savedCart);
        if (Array.isArray(parsed)) {
          setCart(parsed);
        }
      } catch (e) {
        console.error("Failed to load cart:", e);
      }
    }
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Step 1 Validation
  const handleProceedToStep2 = (e: React.FormEvent) => {
    e.preventDefault();
    if (cart.length === 0) return;
    setCurrentStep(2);
  };

  // Calculations
  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const shippingCost = cart.length > 0 ? (shippingMethod === "express" ? 25.0 : 15.0) : 0.0;
  const discountAmount = appliedDiscount ? (subtotal * appliedDiscount.percent) / 100 : 0;
  const tax = (subtotal - discountAmount) * 0.08;
  const total = Math.max(0, subtotal - discountAmount + shippingCost + tax);

  const handleApplyPromo = (e: React.FormEvent) => {
    e.preventDefault();
    setPromoError("");
    const cleaned = promoCode.trim().toUpperCase();

    if (cleaned === "STREET20") {
      setAppliedDiscount({ code: "STREET20", percent: 20 });
      setPromoCode("");
    } else if (cleaned === "KICKS10") {
      setAppliedDiscount({ code: "KICKS10", percent: 10 });
      setPromoCode("");
    } else {
      setPromoError("Invalid code. Try STREET20 for 20% off!");
    }
  };

  const handlePay = (e: React.FormEvent) => {
    e.preventDefault();
    if (cart.length === 0) return;

    setIsProcessing(true);

    const generatedOrderNum = "KICKS-" + Math.floor(100000 + Math.random() * 900000);
    setOrderId(generatedOrderNum);

    setTimeout(() => {
      setIsProcessing(false);
      setIsSuccess(true);
      localStorage.removeItem("sneaker_cart");
    }, 2000);
  };

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
        <div className="bg-white p-8 rounded-3xl shadow-xl max-w-md w-full text-center">
          <div className="w-16 h-16 bg-orange-100 text-orange-500 rounded-full flex items-center justify-center mx-auto text-2xl font-bold mb-4">
            ✓
          </div>
          <span className="text-xs font-bold text-orange-500 uppercase tracking-widest">
            {orderId}
          </span>
          <h1 className="text-2xl font-black text-gray-900 mt-1">Order Confirmed!</h1>
          <p className="text-gray-500 text-sm mt-2">
            Thanks for your purchase. We've sent a receipt to {formData.email || "your email"}!
          </p>

          <div className="bg-gray-50 p-4 rounded-2xl my-6 text-left border border-gray-100 space-y-2">
            <div className="flex justify-between text-xs text-gray-600">
              <span>Estimated Delivery:</span>
              <span className="font-bold text-gray-900">
                {shippingMethod === "express" ? "1 - 2 Business Days" : "3 - 5 Business Days"}
              </span>
            </div>
            <div className="flex justify-between text-xs text-gray-600">
              <span>Total Paid:</span>
              <span className="font-black text-orange-500">${total.toFixed(2)}</span>
            </div>
          </div>

          <Link
            href="/"
            className="inline-block w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-3.5 rounded-xl transition-all shadow-lg active:scale-95 text-sm"
          >
            Continue Shopping →
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        <Link href="/" className="text-sm font-bold text-gray-500 hover:text-orange-500 mb-6 inline-block">
          ← Back to store
        </Link>
        
        {/* Step Indicator */}
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-black text-gray-900">Checkout</h1>
          <div className="flex items-center gap-2 text-xs font-bold">
            <span className={`px-3 py-1 rounded-full ${currentStep === 1 ? "bg-orange-500 text-white" : "bg-gray-200 text-gray-600"}`}>
              1. Details
            </span>
            <span className="text-gray-300">→</span>
            <span className={`px-3 py-1 rounded-full ${currentStep === 2 ? "bg-orange-500 text-white" : "bg-gray-200 text-gray-600"}`}>
              2. Delivery & Payment
            </span>
          </div>
        </div>

        {cart.length === 0 ? (
          <div className="bg-white p-12 rounded-3xl shadow-sm text-center">
            <span className="text-4xl block mb-3">🛒</span>
            <h2 className="text-xl font-bold text-gray-900 mb-2">Your cart is empty</h2>
            <p className="text-gray-500 text-sm mb-6">Add items to your cart before proceeding to checkout.</p>
            <Link
              href="/"
              className="bg-orange-500 hover:bg-orange-600 text-white font-bold px-6 py-3 rounded-xl text-sm transition-colors shadow-md"
            >
              Explore Drops
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            {/* Main Form Section */}
            <div className="lg:col-span-7">
              {currentStep === 1 ? (
                /* STEP 1: Shipping Information */
                <form onSubmit={handleProceedToStep2} className="bg-white text-black p-6 md:p-8 rounded-3xl shadow-sm space-y-4">
                  <h2 className="text-xl font-bold text-gray-900 mb-4">Shipping Information</h2>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-bold text-gray-600 uppercase">First Name</label>
                      <input
                        required
                        type="text"
                        name="firstName"
                        value={formData.firstName}
                        onChange={handleInputChange}
                        className="w-full mt-1 p-3 border border-gray-200 rounded-xl text-sm outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-gray-600 uppercase">Last Name</label>
                      <input
                        required
                        type="text"
                        name="lastName"
                        value={formData.lastName}
                        onChange={handleInputChange}
                        className="w-full mt-1 p-3 border border-gray-200 rounded-xl text-sm outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-gray-600 uppercase">Email Address</label>
                    <input
                      required
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className="w-full mt-1 p-3 border border-gray-200 rounded-xl text-sm outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-gray-600 uppercase">Street Address</label>
                    <input
                      required
                      type="text"
                      name="address"
                      value={formData.address}
                      onChange={handleInputChange}
                      className="w-full mt-1 p-3 border border-gray-200 rounded-xl text-sm outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-bold text-gray-600 uppercase">City</label>
                      <input
                        required
                        type="text"
                        name="city"
                        value={formData.city}
                        onChange={handleInputChange}
                        className="w-full mt-1 p-3 border border-gray-200 rounded-xl text-sm outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-gray-600 uppercase">Postal Code</label>
                      <input
                        required
                        type="text"
                        name="postalCode"
                        value={formData.postalCode}
                        onChange={handleInputChange}
                        className="w-full mt-1 p-3 border border-gray-200 rounded-xl text-sm outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full mt-6 bg-orange-500 hover:bg-orange-600 text-white font-extrabold py-4 rounded-2xl transition-all shadow-lg active:scale-95 text-sm flex items-center justify-center gap-2"
                  >
                    <span>Continue to Delivery & Payment</span>
                    <span>→</span>
                  </button>
                </form>
              ) : (
                /* STEP 2: Delivery & Payment Options */
                <form onSubmit={handlePay} className="space-y-6">
                  
                  {/* Delivery Option */}
                  <div className="bg-white p-6 md:p-8 rounded-3xl shadow-sm space-y-3">
                    <div className="flex justify-between items-center mb-2">
                      <h2 className="text-xl font-bold text-gray-900">Delivery Option</h2>
                      <button
                        type="button"
                        onClick={() => setCurrentStep(1)}
                        className="text-xs font-bold text-orange-500 hover:underline"
                      >
                        ← Edit Shipping Details
                      </button>
                    </div>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <label
                        onClick={() => setShippingMethod("standard")}
                        className={`p-4 border-2 rounded-2xl cursor-pointer flex justify-between items-center transition-all ${
                          shippingMethod === "standard" ? "border-orange-500 bg-orange-50/30" : "border-gray-200 hover:border-gray-300"
                        }`}
                      >
                        <div>
                          <p className="text-sm font-bold">Standard Delivery</p>
                          <p className="text-xs text-gray-500">3 - 5 business days</p>
                        </div>
                        <span className="font-extrabold text-sm text-orange-500">$15.00</span>
                      </label>

                      <label
                        onClick={() => setShippingMethod("express")}
                        className={`p-4 border-2 rounded-2xl cursor-pointer flex justify-between items-center transition-all ${
                          shippingMethod === "express" ? "border-orange-500 bg-orange-50/30" : "border-gray-200 hover:border-gray-300"
                        }`}
                      >
                        <div>
                          <p className="text-sm font-bold">Express Courier</p>
                          <p className="text-xs text-gray-500">1 - 2 business days</p>
                        </div>
                        <span className="font-extrabold text-sm text-orange-500">$25.00</span>
                      </label>
                    </div>
                  </div>

                  {/* Payment Details */}
                  <div className="bg-white p-6 md:p-8 rounded-3xl shadow-sm space-y-4">
                    <h2 className="text-xl font-bold text-gray-900 mb-2">Payment Details</h2>

                    <div className="flex gap-3 border-b border-gray-100 pb-4">
                      <button
                        type="button"
                        onClick={() => setPaymentMethod("card")}
                        className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all ${
                          paymentMethod === "card" ? "bg-orange-500 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                        }`}
                      >
                        Credit / Debit Card
                      </button>
                      <button
                        type="button"
                        onClick={() => setPaymentMethod("express")}
                        className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all ${
                          paymentMethod === "express" ? "bg-orange-500 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                        }`}
                      >
                        Express Checkout
                      </button>
                    </div>

                    {paymentMethod === "card" ? (
                      <div className="space-y-3">
                        <div>
                          <label className="text-xs font-bold text-gray-600 uppercase">Card Number</label>
                          <input
                            required
                            type="text"
                            maxLength={19}
                            placeholder="4532 •••• •••• 8892"
                            className="w-full mt-1 p-3 border border-gray-200 rounded-xl text-sm outline-none focus:border-orange-500"
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="text-xs font-bold text-gray-600 uppercase">Expiry Date</label>
                            <input
                              required
                              type="text"
                              placeholder="MM/YY"
                              className="w-full mt-1 p-3 border border-gray-200 rounded-xl text-sm outline-none focus:border-orange-500"
                            />
                          </div>
                          <div>
                            <label className="text-xs font-bold text-gray-600 uppercase">CVV</label>
                            <input
                              required
                              type="password"
                              maxLength={4}
                              placeholder="123"
                              className="w-full mt-1 p-3 border border-gray-200 rounded-xl text-sm outline-none focus:border-orange-500"
                            />
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="p-4 bg-gray-50 border border-gray-200 rounded-2xl text-center space-y-3">
                        <p className="text-xs text-gray-500 font-medium">Click pay below to authorize via Apple Pay or PayPal.</p>
                        <div className="flex justify-center gap-4 text-2xl">
                          <span>Pay</span>
                          <span>🅿️ayPal</span>
                        </div>
                      </div>
                    )}

                    <div className="flex gap-3 pt-2">
                      <button
                        type="button"
                        onClick={() => setCurrentStep(1)}
                        className="w-1/3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold py-4 rounded-2xl text-xs transition-colors"
                      >
                        Back
                      </button>
                      <button
                        disabled={isProcessing}
                        type="submit"
                        className="w-2/3 bg-orange-500 hover:bg-orange-600 disabled:bg-gray-300 text-white font-extrabold py-4 rounded-2xl transition-all shadow-lg active:scale-95 text-sm flex justify-center items-center"
                      >
                        {isProcessing ? "Authorizing Payment..." : `Pay $${total.toFixed(2)}`}
                      </button>
                    </div>
                  </div>

                </form>
              )}
            </div>

            {/* Order Summary Sidebar */}
            <div className="lg:col-span-5 bg-white p-6 md:p-8 rounded-3xl shadow-sm h-fit space-y-6">
              <h2 className="text-xl font-bold text-gray-900">Order Summary</h2>

              {/* Items List */}
              <div className="divide-y border-y border-gray-100 max-h-64 overflow-y-auto">
                {cart.map((item) => (
                  <div key={item.id} className="py-3 flex items-center justify-between gap-3">
                    <img src={item.image_url} alt={item.name} className="w-12 h-12 object-cover rounded-lg bg-gray-100" />
                    <div className="flex-1">
                      <p className="text-sm font-bold text-gray-900 line-clamp-1">{item.name}</p>
                      <p className="text-xs text-gray-500">Qty: {item.quantity}</p>
                    </div>
                    <p className="text-black text-sm font-black">${(item.price * item.quantity).toFixed(2)}</p>
                  </div>
                ))}
              </div>

              {/* Promo Code Form */}
              <div>
                <form onSubmit={handleApplyPromo} className="flex gap-2">
                  <input
                    type="text"
                    value={promoCode}
                    onChange={(e) => setPromoCode(e.target.value)}
                    placeholder="Promo code (STREET20)"
                    className="text-black flex-1 p-2.5 border border-gray-200 rounded-xl text-xs uppercase font-bold outline-none focus:border-orange-500"
                  />
                  <button
                    type="submit"
                    className="bg-orange-500 hover:bg-orange-600 text-white text-xs font-extrabold px-4 rounded-xl transition-colors shadow-sm"
                  >
                    Apply
                  </button>
                </form>

                {promoError && <p className="text-xs text-red-500 mt-1 font-medium">{promoError}</p>}
                
                {appliedDiscount && (
                  <div className="mt-2 flex justify-between items-center bg-green-50 text-green-700 px-3 py-1.5 rounded-lg text-xs font-bold border border-green-200">
                    <span>Code '{appliedDiscount.code}' Applied ({appliedDiscount.percent}% off)</span>
                    <button
                      onClick={() => setAppliedDiscount(null)}
                      className="text-red-500 hover:text-red-700 ml-2"
                    >
                      ✕
                    </button>
                  </div>
                )}
              </div>

              {/* Price Breakdown */}
              <div className="space-y-2 text-sm pt-2">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal</span>
                  <span className="font-semibold">${subtotal.toFixed(2)}</span>
                </div>

                {appliedDiscount && (
                  <div className="flex justify-between text-green-600 font-medium">
                    <span>Discount ({appliedDiscount.percent}%)</span>
                    <span>-${discountAmount.toFixed(2)}</span>
                  </div>
                )}

                <div className="flex justify-between text-gray-600">
                  <span>Shipping ({shippingMethod === "express" ? "Express" : "Standard"})</span>
                  <span className="font-semibold">${shippingCost.toFixed(2)}</span>
                </div>

                <div className="flex justify-between text-gray-600">
                  <span>Estimated Tax (8%)</span>
                  <span className="font-semibold">${tax.toFixed(2)}</span>
                </div>

                <div className="flex justify-between text-lg font-black text-gray-900 border-t border-gray-100 pt-3 mt-2">
                  <span>Total Due</span>
                  <span className="text-orange-500">${total.toFixed(2)}</span>
                </div>
              </div>

              {/* Security Badge */}
              <div className="pt-2 text-center border-t border-gray-100">
                <p className="text-[11px] text-gray-400 font-medium flex items-center justify-center gap-1">
                  🔒 256-Bit SSL Encrypted Checkout
                </p>
              </div>

            </div>
          </div>
        )}
      </div>
    </div>
  );
}