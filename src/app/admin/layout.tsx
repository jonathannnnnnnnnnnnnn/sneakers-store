// src/app/admin/layout.tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { checkIsAdmin } from "@/lib/authGuard";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const router = useRouter();

  useEffect(() => {
    async function verify() {
      const allowed = await checkIsAdmin();
      if (!allowed) {
        router.push("/login");
      } else {
        setIsAdmin(true);
      }
      setLoading(false);
    }
    verify();
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center font-bold">
        Verifying Admin Security...
      </div>
    );
  }

  if (!isAdmin) return null;

  return <div className="min-h-screen bg-gray-900 text-white">{children}</div>;
}   