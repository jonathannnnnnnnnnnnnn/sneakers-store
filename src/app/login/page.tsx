"use client";

import { useState } from "react";
import Link from "next/link";

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [message, setMessage] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !password || (!isLogin && !name)) {
      setMessage("Please fill in all fields.");
      return;
    }

    if (isLogin) {
      setMessage(`Welcome back! Logged in as ${email}`);
    } else {
      setMessage(`Account created successfully for ${name}!`);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-xl shadow-lg border border-gray-200">
        <div className="text-center">
          <h2 className="text-3xl font-extrabold text-gray-900">
            {isLogin ? "Sign in to your account" : "Create a new account"}
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            {isLogin ? "Don't have an account? " : "Already have an account? "}
            <button
              onClick={() => {
                setIsLogin(!isLogin);
                setMessage(null);
              }}
              className="font-semibold text-black underline hover:text-gray-700"
            >
              {isLogin ? "Sign Up" : "Log In"}
            </button>
          </p>
        </div>

        {message && (
          <div
            className={`p-3 text-sm rounded-md text-center ${
              message.includes("Please")
                ? "bg-red-100 text-red-700"
                : "bg-green-100 text-green-700"
            }`}
          >
            {message}
          </div>
        )}

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            {!isLogin && (
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  required={!isLogin}
                  className="w-full px-3 py-2 border border-gray-300 bg-white text-gray-900 placeholder-gray-400 rounded-md focus:outline-none focus:ring-2 focus:ring-black"
                  placeholder="John Doe"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-900 mb-1">
                Email address
              </label>
              <input
                type="email"
                required
                className="w-full px-3 py-2 border border-gray-300 bg-white text-gray-900 placeholder-gray-400 rounded-md focus:outline-none focus:ring-2 focus:ring-black"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-900 mb-1">
                Password
              </label>
              <input
                type="password"
                required
                className="w-full px-3 py-2 border border-gray-300 bg-white text-gray-900 placeholder-gray-400 rounded-md focus:outline-none focus:ring-2 focus:ring-black"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-3 px-4 bg-black text-white font-medium rounded-md hover:bg-gray-800 transition-colors"
          >
            {isLogin ? "Sign In" : "Register"}
          </button>
        </form>

        <div className="text-center pt-4">
          <Link href="/" className="text-sm font-medium text-gray-600 hover:text-black">
            ← Back to Store
          </Link>
        </div>
      </div>
    </div>
  );
}