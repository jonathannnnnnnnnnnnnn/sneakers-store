"use client";

import Navbar from "@/components/Navbar";
import { allProducts } from "@/data/products";
import Image from "next/image";

export default function WomenPage() {
  const womenProducts = allProducts.filter(
    (p) => p.name.includes("Women") || Number(p.id) % 2 !== 0
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar cartCount={0} toggleCart={() => {}} />
      <main className="max-w-7xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-extrabold mb-6 text-black">Women's Collection</h1>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
          {womenProducts.map((product) => (
            <div key={product.id} className="bg-white rounded-2xl border p-4 shadow-sm">
              <div className="relative aspect-square w-full rounded-xl overflow-hidden bg-gray-100 mb-2">
                <Image src={product.images[0]} alt={product.name} fill className="object-cover" />
              </div>
              <h3 className="font-bold text-sm">{product.name}</h3>
              <p className="font-extrabold text-orange-500">${product.price.toFixed(2)}</p>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}