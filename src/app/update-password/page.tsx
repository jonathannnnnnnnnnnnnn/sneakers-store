"use client";

import { useState } from "react";
import { createBrowserClient } from "@supabase/ssr";
import { useRouter } from "next/navigation";

export default function UpdatePasswordPage() {
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { error } = await supabase.auth.updateUser({
      password: password,
    });

    if (error) {
      alert(error.message);
    } else {
      alert("Password updated successfully!");
      router.push("/login");
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 text-black flex items-center justify-center p-4">
      <form
        onSubmit={handleUpdatePassword}
        className="bg-white p-8 rounded-3xl border border-gray-200 shadow-xl max-w-md w-full space-y-4"
      >
        <div className="text-center">
          <span className="text-[10px] font-black uppercase text-orange-500 tracking-wider">
            SOLE VAULT
          </span>
          <h2 className="text-2xl font-black text-gray-900 mt-1">Set New Password</h2>
          <p className="text-xs text-gray-400 font-medium mt-1">
            Enter your new password below to regain access to your account.
          </p>
        </div>

        <input
          type="password"
          placeholder="Enter new password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          className="w-full p-3 bg-gray-100 rounded-xl text-xs outline-none focus:border-orange-500 border border-transparent font-medium"
        />

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-orange-500 text-white font-black py-3 rounded-xl text-xs hover:bg-orange-600 transition-colors shadow-md"
        >
          {loading ? "Updating..." : "UPDATE PASSWORD"}
        </button>
      </form>
    </div>
  );
}