"use client";

import Link from "next/link";

export default function VerifiedPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-4">
      <div className="bg-white p-8 md:p-10 rounded-2xl shadow-sm border border-gray-200 max-w-md w-full text-center space-y-4">
        <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto text-3xl font-bold">
          ✓
        </div>

        <h1 className="text-2xl font-black text-gray-900">
          Account Verified Successfully!
        </h1>

        <p className="text-sm text-gray-500 leading-relaxed">
          Your email has been confirmed. You are ready to start shopping in the Vault.
        </p>

        <div className="pt-4">
          <Link
            href="/login"
            className="block w-full py-3.5 bg-orange-500 hover:bg-orange-600 text-white font-extrabold rounded-xl transition-all shadow-md active:scale-95 text-center"
          >
            Return to Site & Log In
          </Link>
        </div>
      </div>
    </div>
  );
}