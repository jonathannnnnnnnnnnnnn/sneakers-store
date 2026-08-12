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
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
    const savedCart = localStorage.getItem("sneaker_cart");
    if (savedCart) {
      try {
        setCart(JSON.parse(savedCart));
      } catch (e) {
        console.error("Failed to load cart:", e);
      }
    }
  }, []);

  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const shipping = cart.length > 0 ? 15.0 : 0.0;
  const total = subtotal + shipping;

  const handlePay = (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);

    // Simulate payment gateway delay
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
          <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto text-2xl font-bold mb-4">
            ✓
          </div>
          <h1 className="text-2xl font-black text-gray-900">Order Confirmed!</h1>
          <p className="text-gray-500 text-sm mt-2">
            Thanks for your purchase. We've received your order and are getting it ready.
          </p>
          <Link
            href="/"
            className="mt-6 inline-block w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 rounded-xl transition-colors shadow-lg"
          >
            Back to Store
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        <Link href="/" className="text-sm font-bold text-gray-500 hover:text-black mb-6 inline-block">
          ← Back to store
        </Link>
        <h1 className="text-3xl font-black text-gray-900 mb-8">Checkout</h1>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Shipping Form */}
          <form onSubmit={handlePay} className="lg:col-span-7 bg-white p-6 md:p-8 rounded-3xl shadow-sm space-y-4">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Shipping Information</h2>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-gray-600 uppercase">First Name</label>
                <input required type="text" className="w-full mt-1 p-3 border border-gray-200 rounded-xl text-sm outline-none focus:border-orange-500" placeholder="John" />
              </div>
              <div>
                <label className="text-xs font-bold text-gray-600 uppercase">Last Name</label>
                <input required type="text" className="w-full mt-1 p-3 border border-gray-200 rounded-xl text-sm outline-none focus:border-orange-500" placeholder="Doe" />
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-gray-600 uppercase">Email Address</label>
              <input required type="email" className="w-full mt-1 p-3 border border-gray-200 rounded-xl text-sm outline-none focus:border-orange-500" placeholder="john@example.com" />
            </div>

            <div>
              <label className="text-xs font-bold text-gray-600 uppercase">Address</label>
              <input required type="text" className="w-full mt-1 p-3 border border-gray-200 rounded-xl text-sm outline-none focus:border-orange-500" placeholder="123 Main St" />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-gray-600 uppercase">City</label>
                <input required type="text" className="w-full mt-1 p-3 border border-gray-200 rounded-xl text-sm outline-none focus:border-orange-500" placeholder="Lagos" />
              </div>
              <div>
                <label className="text-xs font-bold text-gray-600 uppercase">Postal Code</label>
                <input required type="text" className="w-full mt-1 p-3 border border-gray-200 rounded-xl text-sm outline-none focus:border-orange-500" placeholder="100001" />
              </div>
            </div>

            <button
              disabled={isProcessing || cart.length === 0}
              type="submit"
              className="w-full mt-6 bg-orange-500 hover:bg-orange-600 disabled:bg-gray-300 text-white font-bold py-4 rounded-xl transition-all shadow-lg active:scale-95 flex justify-center items-center"
            >
              {isProcessing ? "Processing Order..." : `Pay $${total.toFixed(2)}`}
            </button>
          </form>

          {/* Order Summary */}
          <div className="lg:col-span-5 bg-white p-6 md:p-8 rounded-3xl shadow-sm h-fit">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Order Summary</h2>

            <div className="divide-y max-h-64 overflow-y-auto mb-4">
              {cart.map((item) => (
                <div key={item.id} className="py-3 flex items-center justify-between gap-3">
                  <img src={item.image_url} alt={item.name} className="w-12 h-12 object-cover rounded-lg" />
                  <div className="flex-1">
                    <p className="text-sm font-bold text-gray-900 line-clamp-1">{item.name}</p>
                    <p className="text-xs text-gray-500">Qty: {item.quantity}</p>
                  </div>
                  <p className="text-sm font-bold">${(item.price * item.quantity).toFixed(2)}</p>
                </div>
              ))}
            </div>

            <div className="border-t pt-4 space-y-2 text-sm">
              <div className="flex justify-between text-gray-600">
                <span>Subtotal</span>
                <span>${subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Flat Shipping</span>
                <span>${shipping.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-base font-black text-gray-900 border-t pt-2">
                <span>Total</span>
                <span>${total.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}