"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createBrowserClient } from "@supabase/ssr";

export default function AuthCallbackPage() {
  const [verifying, setVerifying] = useState(true);
  const router = useRouter();

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  useEffect(() => {
    const handleAuth = async () => {
      // Exchange session or check existing session
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session) {
        setVerifying(false);
        
        // Wait 3 seconds so the user sees the confirmation message before redirecting
        setTimeout(() => {
          router.push("/");
          router.refresh();
        }, 5000);
      } else {
        router.push("/login");
      }
    };

    handleAuth();
  }, [router, supabase]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-4 text-center">
      <div className="bg-white p-8 rounded-3xl shadow-xl max-w-sm w-full space-y-4 border border-gray-100">
        {verifying ? (
          <>
            <div className="animate-spin text-4xl mx-auto w-max">⚡</div>
            <h1 className="text-xl font-black text-gray-900">Verifying Account...</h1>
            <p className="text-xs text-gray-500 font-medium">
              Please wait while we confirm your credentials.
            </p>
          </>
        ) : (
          <>
            <div className="text-4xl">🎉</div>
            <h1 className="text-xl font-black text-gray-900">Verification Successful!</h1>
            <p className="text-xs text-gray-500 font-medium">
              Your account is confirmed. Redirecting you to SoleVault in a few seconds...
            </p>
          </>
        )}
      </div>
    </div>
  );
}