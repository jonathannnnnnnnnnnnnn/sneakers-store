"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { signupSchema } from "@/lib/validation";

export default function AdminSignupPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [passkey, setPasskey] = useState("");
  const [loading, setLoading] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const supabase = createClient();
  const router = useRouter();

  const handleAdminSignup = async (e: React.FormEvent) => {
    e.preventDefault();

    const validation = signupSchema.safeParse({
      email,
      password,
      name: fullName,
      confirmPassword: password,
    });
    if (!validation.success) {
      setFieldErrors(Object.fromEntries(validation.error.issues.map((issue) => [String(issue.path[0]), issue.message])));
      return;
    }
    setFieldErrors({});
    setLoading(true);

    const passkeyResponse = await fetch("/api/admin/verify-passkey", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ passkey }),
    });

    if (!passkeyResponse.ok) {
      const data = await passkeyResponse.json();
      toast.error(data.error || "Invalid Secret Admin Passkey!");
      setLoading(false);
      return;
    }

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
    <div className="relative min-h-screen flex items-center justify-center bg-black text-white px-4">
      <header className="absolute inset-x-0 top-0 flex justify-center py-6">
        <div className="flex items-center gap-2" aria-label="SoleVault">
          <div className="bg-orange-500 text-white font-black text-sm w-8 h-8 rounded-xl flex items-center justify-center shadow-sm">
            ⚡
          </div>
          <span className="font-black text-xl tracking-wider text-white">
            SOLE<span className="text-orange-500">VAULT.</span>
          </span>
        </div>
      </header>
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
            {fieldErrors.name && <p className="mt-1 text-xs text-red-400">{fieldErrors.name}</p>}
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
            {fieldErrors.email && <p className="mt-1 text-xs text-red-400">{fieldErrors.email}</p>}
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
            {fieldErrors.password && <p className="mt-1 text-xs text-red-400">{fieldErrors.password}</p>}
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