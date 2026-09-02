"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

export default function AdminSignupPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [passkey, setPasskey] = useState("");
  const [loading, setLoading] = useState(false);

  const supabase = createClient();
  const router = useRouter();

  const handleAdminSignup = async (e: React.FormEvent) => {
    e.preventDefault();

    if (passkey !== process.env.NEXT_PUBLIC_ADMIN_SECRET) {
      toast.error("Invalid Secret Admin Passkey!");
      return;
    }

    setLoading(true);

    // Sign up user with metadata (the SQL trigger creates the profile row instantly)
    // Replace line 29 with this:
const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
          role: "admin", // SQL trigger reads this and sets role to admin in profiles
        },
      },
    });

    if (authError) {
      toast.error(authError.message);
      setLoading(false);
      return;
    }

    toast.success("Account created! Check your email to verify before logging in.");
    setLoading(false);
    router.push("/login");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-black text-white px-4">
      <div className="max-w-md w-full p-8 bg-zinc-900 border border-zinc-800 rounded-xl shadow-2xl">
        <h2 className="text-2xl font-bold mb-2 text-center text-red-500">
          Admin Portal Registration
        </h2>
        <p className="text-zinc-400 text-sm mb-6 text-center">
          Authorized personnel only. Secret passkey required.
        </p>

        <form onSubmit={handleAdminSignup} className="space-y-4">
          <div>
            <label className="block text-xs uppercase tracking-wider text-zinc-400 mb-1">
              Full Name
            </label>
            <input
              type="text"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full bg-zinc-800 border border-zinc-700 rounded p-3 text-white focus:outline-none focus:border-red-500"
            />
          </div>

          <div>
            <label className="block text-xs uppercase tracking-wider text-zinc-400 mb-1">
              Email Address
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-zinc-800 border border-zinc-700 rounded p-3 text-white focus:outline-none focus:border-red-500"
            />
          </div>

          <div>
            <label className="block text-xs uppercase tracking-wider text-zinc-400 mb-1">
              Password
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-zinc-800 border border-zinc-700 rounded p-3 text-white focus:outline-none focus:border-red-500"
              placeholder="••••••••"
            />
          </div>

          <div>
            <label className="block text-xs uppercase tracking-wider text-red-400 mb-1">
              Secret Admin Passkey
            </label>
            <input
              type="password"
              required
              value={passkey}
              onChange={(e) => setPasskey(e.target.value)}
              className="w-full bg-zinc-800 border border-red-900/50 rounded p-3 text-white focus:outline-none focus:border-red-500"
              placeholder="Enter secret key..."
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-red-600 hover:bg-red-700 font-bold py-3 px-4 rounded transition text-white disabled:opacity-50"
          >
            {loading ? "Registering Admin..." : "Register as Admin"}
          </button>
        </form>
      </div>
    </div>
  );
}