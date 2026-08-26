"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createBrowserClient } from "@supabase/ssr";

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [name, setName] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "error" | "success"; text: string } | null>(null);

  const router = useRouter();

  // Initialize browser-side Supabase client
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  // 1. HANDLE FORGOT PASSWORD
  const handleForgotPassword = async () => {
    if (!email) {
      setMessage({ type: "error", text: "Please enter your email address first!" });
      return;
    }

    setResetLoading(true);
    setMessage(null);

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/update-password`,
      });

      if (error) throw error;

      setMessage({
        type: "success",
        text: "Password reset link sent! Please check your email inbox.",
      });
    } catch (err: any) {
      setMessage({ type: "error", text: err.message || "Failed to send reset email." });
    } finally {
      setResetLoading(false);
    }
  };

  // 2. HANDLE GOOGLE & GITHUB OAUTH LOGIN
  const handleOAuthLogin = async (provider: "google" | "github") => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: `${window.location.origin}/login/callback`,
        },
      });
      if (error) throw error;
    } catch (err: any) {
      setMessage({ type: "error", text: err.message || `Failed to sign in with ${provider}` });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isLogin && password !== confirmPassword) {
      setMessage({ type: "error", text: "Passwords do not match." });
      return;
    }

    if (!email || !password || (!isLogin && !name)) {
      setMessage({ type: "error", text: "Please fill in all required fields." });
      return;
    }

    setLoading(true);
    setMessage(null);

    try {
      if (isLogin) {
        // SUPABASE LOGIN
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) throw error;

        setMessage({ type: "success", text: "Logged in successfully! Redirecting..." });

        const role = data.user?.user_metadata?.role || "buyer";

        setTimeout(() => {
          if (role === "admin") {
            router.push("/admin");
          } else {
            router.push("/");
          }
          router.refresh();
        }, 1000);

      } else {
        // SUPABASE SIGNUP
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/login/callback`,
            data: {
              full_name: name,
              role: "buyer",
            },
          },
        });

        if (error) throw error;

        setMessage({
          type: "success",
          text: "Check your email inbox for the confirmation link!",
        });

        setTimeout(() => {
          setIsLogin(true);
          setPassword("");
          setConfirmPassword("");
        }, 3000);
      }
    } catch (err: any) {
      setMessage({ type: "error", text: err.message || "An unexpected error occurred." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100/80 px-4 py-12">
      
      {/* Brand Header Badge */}
      <div className="bg-white border border-gray-200 shadow-sm rounded-2xl px-6 py-3 mb-6 flex items-center gap-3">
        <div className="bg-orange-500 text-white font-black text-base w-8 h-8 rounded-xl flex items-center justify-center shadow-md">
          ⚡
        </div>
        <div className="flex flex-col leading-none">
          <span className="font-black text-xl tracking-wider text-gray-900">
            SOLE<span className="text-orange-500">VAULT.</span>
          </span>
        </div>
      </div>

      {/* Main Auth Card */}
      <div className="max-w-md w-full bg-white p-8 sm:p-10 rounded-3xl shadow-xl border border-gray-100 space-y-6">
        
        {/* Title Section */}
        <div className="text-center space-y-1">
          <h1 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight">
            {isLogin ? "Sign In" : "Create Account"}
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 font-medium">
            {isLogin
              ? "Welcome back! Please sign in to your account."
              : "Join SoleVault today and start shopping!"}
          </p>
        </div>

        {/* Feedback Messages */}
        {message && (
          <div
            className={`p-3.5 text-xs rounded-xl text-center font-bold transition-all ${
              message.type === "error"
                ? "bg-red-50 text-red-600 border border-red-100"
                : "bg-emerald-50 text-emerald-600 border border-emerald-100"
            }`}
          >
            {message.text}
          </div>
        )}

        {/* Form Fields */}
        <form onSubmit={handleSubmit} className="space-y-4">
          
          {!isLogin && (
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1.5">
                Full Name
              </label>
              <input
                type="text"
                required={!isLogin}
                placeholder="Enter your full name"
                className="w-full px-4 py-3 border border-gray-200 bg-gray-50/50 text-gray-900 text-xs sm:text-sm placeholder-gray-400 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:bg-white transition-all font-medium"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1.5">
              Email address
            </label>
            <input
              type="email"
              required
              placeholder="Enter your email"
              className="w-full px-4 py-3 border border-gray-200 bg-gray-50/50 text-gray-900 text-xs sm:text-sm placeholder-gray-400 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:bg-white transition-all font-medium"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1.5">
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                required
                placeholder="Enter your password"
                className="w-full px-4 py-3 border border-gray-200 bg-gray-50/50 text-gray-900 text-xs sm:text-sm placeholder-gray-400 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:bg-white transition-all font-medium pr-10"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-xs"
              >
                {showPassword ? "👁️‍🗨️" : "👁️"}
              </button>
            </div>
            {!isLogin && (
              <p className="text-[10px] font-semibold text-gray-400 mt-1">
                Password must be at least 6 characters long
              </p>
            )}
          </div>

          {!isLogin && (
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1.5">
                Confirm Password
              </label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  required={!isLogin}
                  placeholder="Confirm your password"
                  className="w-full px-4 py-3 border border-gray-200 bg-gray-50/50 text-gray-900 text-xs sm:text-sm placeholder-gray-400 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:bg-white transition-all font-medium pr-10"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-xs"
                >
                  {showConfirmPassword ? "👁️‍🗨️" : "👁️"}
                </button>
              </div>
            </div>
          )}

          {/* Remember Me & Forgot Password / Terms Checkbox */}
          {isLogin ? (
            <div className="flex items-center justify-between text-xs font-semibold pt-1">
              <label className="flex items-center gap-2 text-gray-600 cursor-pointer">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="rounded border-gray-300 text-orange-500 focus:ring-orange-500 accent-orange-500"
                />
                Remember me
              </label>
              
              {/* Connected Forgot Password Link Button */}
              <button
                type="button"
                onClick={handleForgotPassword}
                disabled={resetLoading}
                className="text-orange-500 hover:underline font-bold disabled:opacity-50"
              >
                {resetLoading ? "Sending..." : "Forgot your password?"}
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2 text-xs text-gray-600 pt-1 font-medium">
              <input
                type="checkbox"
                required
                className="rounded border-gray-300 text-orange-500 focus:ring-orange-500 accent-orange-500"
              />
              <span>
                I agree to the{" "}
                <a href="#" className="text-orange-500 font-bold hover:underline">
                  Terms and Conditions
                </a>{" "}
                and{" "}
                <a href="#" className="text-orange-500 font-bold hover:underline">
                  Privacy Policy
                </a>
              </span>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 px-4 bg-orange-500 hover:bg-orange-600 text-white font-black text-xs sm:text-sm uppercase tracking-wider rounded-xl transition-all shadow-md active:scale-95 disabled:opacity-50 mt-2"
          >
            {loading ? "Processing..." : isLogin ? "Sign in" : "Create account"}
          </button>
        </form>

        {/* Divider */}
        <div className="relative flex items-center justify-center my-4">
          <div className="border-t border-gray-200 w-full"></div>
          <span className="bg-white px-3 text-[10px] font-extrabold uppercase text-gray-400 whitespace-nowrap absolute">
            Or continue with
          </span>
        </div>

        {/* Social Logins */}
        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => handleOAuthLogin("google")}
            className="flex items-center justify-center gap-2 border border-gray-200 bg-white hover:bg-gray-50 font-bold text-xs py-2.5 px-4 rounded-xl transition-colors shadow-sm text-gray-700"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path
                fill="#EA4335"
                d="M12 5c1.6 0 3 .6 4.1 1.6l3.1-3.1C17.3 1.7 14.8 1 12 1 7.5 1 3.7 3.6 1.9 7.3l3.7 2.9C6.5 7.2 9 5 12 5z"
              />
              <path
                fill="#4285F4"
                d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.5h6.5c-.3 1.5-1.1 2.8-2.4 3.7l3.7 2.9c2.2-2 3.7-5 3.7-8.8z"
              />
              <path
                fill="#FBBC05"
                d="M5.6 14.8c-.2-.7-.4-1.5-.4-2.3s.2-1.6.4-2.3L1.9 7.3C.7 9.7 0 10.8 0 12s.7 2.3 1.9 4.7l3.7-2.9z"
              />
              <path
                fill="#34A853"
                d="M12 23c3.2 0 6-1.1 8-3l-3.7-2.9c-1.1.7-2.5 1.2-4.3 1.2-3 0-5.5-2.2-6.4-5.2L1.9 16C3.7 19.7 7.5 23 12 23z"
              />
            </svg>
            Google
          </button>

          <button
            type="button"
            onClick={() => handleOAuthLogin("github")}
            className="flex items-center justify-center gap-2 border border-gray-200 bg-white hover:bg-gray-50 font-bold text-xs py-2.5 px-4 rounded-xl transition-colors shadow-sm text-gray-700"
          >
            <svg className="w-4 h-4 fill-current text-gray-900" viewBox="0 0 24 24">
              <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
            </svg>
            GitHub
          </button>
        </div>

        {/* Toggle Switcher */}
        <div className="text-center pt-2">
          <p className="text-xs text-gray-500 font-medium">
            {isLogin ? "Don't have an account? " : "Already have an account? "}
            <button
              type="button"
              onClick={() => {
                setIsLogin(!isLogin);
                setMessage(null);
              }}
              className="font-extrabold text-orange-500 hover:underline ml-1"
            >
              {isLogin ? "Sign up" : "Sign in"}
            </button>
          </p>
        </div>

      </div>

      {/* Footer Back Link */}
      <div className="mt-6">
        <Link
          href="/"
          className="text-xs font-bold text-gray-400 hover:text-gray-800 transition-colors flex items-center gap-1"
        >
          ← Back to Store
        </Link>
      </div>

    </div>
  );
}