"use client";

import { useState } from "react";
import Link from "next/link";

export default function Footer() {
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim()) {
      setSubscribed(true);
      setEmail("");
    }
  };

  return (
    <footer className="bg-gray-900 text-gray-300 pt-16 pb-12 border-t border-gray-800 -mb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 pb-12 border-b border-gray-800">
          
          {/* Brand Info */}
          <div className="md:col-span-1">
            <Link href="/" className="inline-flex items-center gap-2 group">
              <span className="bg-orange-500 text-white font-black text-xs sm:text-sm w-7 h-7 sm:w-8 sm:h-8 rounded-xl flex items-center justify-center shadow-md group-hover:scale-105 transition-transform">
                ⚡
              </span>
              <span className="text-xl sm:text-2xl font-black text-white tracking-tight leading-none">
                SOLE<span className="text-orange-500">VAULT.</span>
              </span>
            </Link>
            <p className="text-xs text-gray-400 mt-4 leading-relaxed">
              Your ultimate destination for authentic sneakers, limited drops, and premium streetwear logic.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-white font-bold text-sm mb-4 uppercase tracking-wider">Shop</h4>
            <ul className="space-y-2 text-xs">
              <li><a href="#" className="hover:text-orange-400 transition-colors">New Arrivals</a></li>
              <li><a href="#" className="hover:text-orange-400 transition-colors">Men's Kicks</a></li>
              <li><a href="#" className="hover:text-orange-400 transition-colors">Women's Kicks</a></li>
              <li><a href="#" className="hover:text-orange-400 transition-colors">Exclusive Drops</a></li>
            </ul>
          </div>

          {/* Customer Care */}
          <div>
            <h4 className="text-white font-bold text-sm mb-4 uppercase tracking-wider">Support</h4>
            <ul className="space-y-2 text-xs">
              <li><a href="#" className="hover:text-orange-400 transition-colors">Order Status</a></li>
              <li><a href="#" className="hover:text-orange-400 transition-colors">Shipping & Delivery</a></li>
              <li><a href="#" className="hover:text-orange-400 transition-colors">Returns & Exchange</a></li>
              <li><a href="#" className="hover:text-orange-400 transition-colors">Contact Us</a></li>
            </ul>
          </div>

          {/* Newsletter Signup Form */}
          <div>
            <h4 className="text-white font-bold text-sm mb-4 uppercase tracking-wider">Stay in the Loop</h4>
            <p className="text-xs text-gray-400 mb-4">
              Subscribe to get notified about secret drops and special discount codes.
            </p>

            {subscribed ? (
              <div className="bg-orange-500/10 border border-orange-500/30 text-orange-400 p-3 rounded-xl text-xs font-semibold">
                🎉 Thanks for subscribing! Check your inbox soon.
              </div>
            ) : (
              <form onSubmit={handleSubscribe} className="flex flex-col gap-2">
                <input
                  type="email"
                  required
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="bg-gray-800 text-white text-xs px-4 py-3 rounded-xl border border-gray-700 focus:outline-none focus:border-orange-500 transition-colors"
                />
                <button
                  type="submit"
                  className="bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold py-3 rounded-xl transition-all active:scale-95 shadow-md"
                >
                  Subscribe
                </button>
              </form>
            )}
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="pt-8 flex flex-col md:flex-row items-center justify-between text-xs text-gray-500 gap-4">
          <p>© {new Date().getFullYear()} Sole Vault Inc. All rights reserved.</p>
          <div className="flex gap-6">
            <a href="#" className="hover:text-gray-300">Privacy Policy</a>
            <a href="#" className="hover:text-gray-300">Terms of Service</a>
          </div>
        </div>
      </div>
    </footer>
  );
}