"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Cart from "@/components/Cart";
import Footer from "@/components/Footer";
import { allProducts } from "@/data/products";
import { CATEGORY_COUNTS, BRAND_COUNTS } from "@/lib/product-counts";
import { useStore } from "@/context/StoreContext";

// Helper to reliably find a matching image while avoiding misplaced tech items
const getCollectionImage = (type: "category" | "brand", query: string) => {
  const q = query.toLowerCase().trim();

  let match = allProducts.find((p) => {
    const pCat = (p.category || "").toLowerCase();
    const pBrand = ((p as any).company || (p as any).brand || "").toLowerCase();
    const pName = (p.name || "").toLowerCase();

    // Prevent audio/headphones from showing in shoe categories
    const isTech = pCat.includes("tech") || pName.includes("headphone") || pName.includes("earphone");
    if (type === "category" && q !== "apparel" && isTech) return false;

    if (type === "brand") {
      return pBrand === q || pBrand.includes(q);
    }

    // Match football boots explicitly
    if (q === "football") {
      return pCat.includes("football") || pCat.includes("cleat") || pName.includes("boot") || pName.includes("cleat");
    }

    // Match apparel & accessories
    if (q === "apparel") {
      return pCat.includes("apparel") || pCat.includes("accessories") || pCat.includes("clothing");
    }

    return pCat.includes(q) || pName.includes(q);
  });

  if (!match) {
    match = allProducts.find((p) => !(p.category || "").toLowerCase().includes("tech"));
  }

  return match ? match.image_url : "/placeholder.jpg";
};


// 1. Performance & Sport Group (6 Collections)
const PERFORMANCE_COLLECTIONS = [
  { id: "basketball", name: "Basketball", query: "basketball", count: `${CATEGORY_COUNTS["basketball"] || 0} ITEMS`, desc: "Pro court performance & high-top heat" },
  { id: "football", name: "Football & Cleats", query: "football", count: `${CATEGORY_COUNTS["football"] || 0} ITEMS`, desc: "Elite firm ground boots, turf cleats & pitch control" },
  { id: "running", name: "Running", query: "running", count: `${CATEGORY_COUNTS["running"] || 0} ITEMS`, desc: "Marathon comfort & daily responsiveness" },
  { id: "skateboarding", name: "Skateboarding", query: "skate", count: `${CATEGORY_COUNTS["skateboarding"] || 0} ITEMS`, desc: "Durable suede, grip soles & board feel" },
  { id: "training", name: "Training & Gym", query: "training", count: `${CATEGORY_COUNTS["training"] || 0} ITEMS`, desc: "Heavy lift support & workout stability" },
  { id: "outdoor", name: "Outdoor & Trail", query: "outdoor", count: `${CATEGORY_COUNTS["outdoor"] || 0} ITEMS`, desc: "GORE-TEX protection & all-terrain traction" },
];

// 2. Streetwear & Culture Group (5 Collections)
const STREETWEAR_COLLECTIONS = [
  { id: "streetwear", name: "Streetwear & Grails", query: "streetwear", count: `${CATEGORY_COUNTS["streetwear"] || 0} ITEMS`, desc: "Limited drops, grails & hype footwear" },
  { id: "retro", name: "Retro Classics", query: "retro", count: `${CATEGORY_COUNTS["retro"] || 0} ITEMS`, desc: "Timeless silhouettes from the vault" },
  { id: "luxury", name: "Luxury Collabs", query: "luxury", count: `${CATEGORY_COUNTS["luxury"] || 0} ITEMS`, desc: "High-fashion & designer streetwear drops" },
  { id: "slides", name: "Slides & Foam", query: "foam", count: `${CATEGORY_COUNTS["slides"] || 0} ITEMS`, desc: "Slip-ons, slides & foam runners" },
  { id: "apparel", name: "Apparel & Accessories", query: "apparel", count: `${(CATEGORY_COUNTS["apparel"] || 0) + (CATEGORY_COUNTS["accessories"] || 0)} ITEMS`, desc: "Hoodies, caps & streetwear gear" },
];

// 3. Shop by Brand Group (All 9 Brands)
const BRAND_COLLECTIONS = [
  { id: "nike", name: "Nike", query: "nike", count: `${BRAND_COUNTS["nike"] || 0} ITEMS`, desc: "Swoosh classics, Air Tech & lifestyle staples" },
  { id: "jordan", name: "Jordan", query: "jordan", count: `${BRAND_COUNTS["jordan"] || 0} ITEMS`, desc: "Jumpman heritage from AJ1 to AJ14" },
  { id: "adidas", name: "Adidas", query: "adidas", count: `${BRAND_COUNTS["adidas"] || 0} ITEMS`, desc: "Three-stripe icons, Samba & Boost comfort" },
  { id: "new-balance", name: "New Balance", query: "new-balance", count: `${BRAND_COUNTS["new balance"] || 0} ITEMS`, desc: "Made in USA premium suede & 9060s" },
  { id: "vans", name: "Vans", query: "vans", count: `${BRAND_COUNTS["vans"] || 0} ITEMS`, desc: "Off The Wall skate icons & checkerboards" },
  { id: "yeezy", name: "Yeezy", query: "yeezy", count: `${BRAND_COUNTS["yeezy"] || 0} ITEMS`, desc: "Futuristic silhouettes & foam tech" },
  { id: "puma", name: "Puma", query: "puma", count: `${BRAND_COUNTS["puma"] || 0} ITEMS`, desc: "Motorsport heritage & classic suede lifestyle" },
  { id: "asics", name: "Asics", query: "asics", count: `${BRAND_COUNTS["asics"] || 0} ITEMS`, desc: "GEL-cushioned runners & techwear performance" },
  { id: "balenciaga", name: "Balenciaga", query: "balenciaga", count: `${BRAND_COUNTS["balenciaga"] || 0} ITEMS`, desc: "Avant-garde runway luxury & chunky sneakers" },
];

export default function CollectionsPage() {
  const { cart, wishlistIds, updateQuantity } = useStore();
  const [isCartOpen, setIsCartOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 flex flex-col justify-between scroll-smooth">
      <div>
        <Navbar
          cartCount={cart.reduce((sum, item) => sum + item.quantity, 0)}
          wishlistCount={wishlistIds.length}
          toggleCart={() => setIsCartOpen(!isCartOpen)}
          activeFilter="Collections"
        />

        <Cart
          isOpen={isCartOpen}
          onClose={() => setIsCartOpen(false)}
          items={cart}
          onUpdateQuantity={updateQuantity}
        />

        <main className="max-w-7xl mx-auto px-4 py-10 space-y-16">
          {/* Header */}
          <div>
            <span className="text-xs font-black uppercase tracking-widest text-orange-500">
              Curated Vault Drops
            </span>
            <h1 className="text-4xl sm:text-5xl font-black text-gray-900 mt-1">COLLECTIONS</h1>
            <p className="text-gray-500 text-sm mt-1 max-w-2xl">
              Explore 19 curated collections spanning court performance, retro street style, and 9 top footwear brands.
            </p>
          </div>

          {/* SECTION 1: PERFORMANCE & SPORT */}
          <section>
            <div className="flex items-center justify-between mb-6 border-b pb-3 border-gray-200">
              <div>
                <h2 className="text-2xl font-black text-gray-900 uppercase tracking-tight">
                  Performance & Sport
                </h2>
                <p className="text-xs text-gray-400 font-medium">Built for athletic motion, endurance, and training</p>
              </div>
              <span className="text-xs font-bold text-orange-500 bg-orange-50 px-3 py-1 rounded-full uppercase">
                6 Collections
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {PERFORMANCE_COLLECTIONS.map((col) => (
                <div key={col.id} id={col.id} className="scroll-mt-24">
                  <Link
                    href={`/collections/${col.id}`}
                    className="group relative h-72 rounded-3xl overflow-hidden shadow-md hover:shadow-2xl transition-all border border-gray-200 block"
                  >
                    <img
                      src={getCollectionImage("category", col.query)}
                      alt={col.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent" />
                    <div className="absolute bottom-0 left-0 right-0 p-6 flex justify-between items-end">
                      <div>
                        <span className="text-[10px] font-black text-orange-400 uppercase tracking-widest block mb-1">
                          {col.count}
                        </span>
                        <h3 className="text-2xl font-black text-white uppercase tracking-tight">
                          {col.name}
                        </h3>
                        <p className="text-[11px] text-gray-300 font-medium mt-0.5 line-clamp-1">
                          {col.desc}
                        </p>
                      </div>
                      <span className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-md text-white flex items-center justify-center font-bold text-sm group-hover:bg-orange-500 transition-colors shrink-0">
                        →
                      </span>
                    </div>
                  </Link>
                </div>
              ))}
            </div>
          </section>

          {/* SECTION 2: STREETWEAR & CULTURE */}
          <section>
            <div className="flex items-center justify-between mb-6 border-b pb-3 border-gray-200">
              <div>
                <h2 className="text-2xl font-black text-gray-900 uppercase tracking-tight">
                  Streetwear & Culture
                </h2>
                <p className="text-xs text-gray-400 font-medium">Hype drops, archival retros, luxury collabs & lifestyle heat</p>
              </div>
              <span className="text-xs font-bold text-orange-500 bg-orange-50 px-3 py-1 rounded-full uppercase">
                5 Collections
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {STREETWEAR_COLLECTIONS.map((col) => (
                <div key={col.id} id={col.id} className="scroll-mt-24">
                  <Link
                    href={`/collections/${col.id}`}
                    className="group relative h-72 rounded-3xl overflow-hidden shadow-md hover:shadow-2xl transition-all border border-gray-200 block"
                  >
                    <img
                      src={getCollectionImage("category", col.query)}
                      alt={col.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent" />
                    <div className="absolute bottom-0 left-0 right-0 p-6 flex justify-between items-end">
                      <div>
                        <span className="text-[10px] font-black text-orange-400 uppercase tracking-widest block mb-1">
                          {col.count}
                        </span>
                        <h3 className="text-2xl font-black text-white uppercase tracking-tight">
                          {col.name}
                        </h3>
                        <p className="text-[11px] text-gray-300 font-medium mt-0.5 line-clamp-1">
                          {col.desc}
                        </p>
                      </div>
                      <span className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-md text-white flex items-center justify-center font-bold text-sm group-hover:bg-orange-500 transition-colors shrink-0">
                        →
                      </span>
                    </div>
                  </Link>
                </div>
              ))}
            </div>
          </section>

          {/* SECTION 3: SHOP BY BRAND */}
          <section id="brands" className="scroll-mt-24 space-y-4">
            <div className="flex items-center justify-between mb-6 border-b pb-3 border-gray-200">
              <div>
                <h2 className="text-2xl font-black text-gray-900 uppercase tracking-tight">
                  Shop By Brand
                </h2>
                <p className="text-xs text-gray-400 font-medium">Top global brands and signature brand drops</p>
              </div>
              <span className="text-xs font-bold text-orange-500 bg-orange-50 px-3 py-1 rounded-full uppercase">
                9 Top Brands
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {BRAND_COLLECTIONS.map((col) => (
                <div key={col.id} id={col.id} className="scroll-mt-24">
                  <Link
                    href={`/collections/${col.id}`}
                    className="group relative h-72 rounded-3xl overflow-hidden shadow-md hover:shadow-2xl transition-all border border-gray-200 block"
                  >
                    <img
                      src={getCollectionImage("brand", col.query)}
                      alt={col.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent" />
                    <div className="absolute bottom-0 left-0 right-0 p-6 flex justify-between items-end">
                      <div>
                        <span className="text-[10px] font-black text-orange-400 uppercase tracking-widest block mb-1">
                          Brand Drop • {col.count}
                        </span>
                        <h3 className="text-2xl font-black text-white uppercase tracking-tight">
                          {col.name}
                        </h3>
                        <p className="text-[11px] text-gray-300 font-medium mt-0.5 line-clamp-1">
                          {col.desc}
                        </p>
                      </div>
                      <span className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-md text-white flex items-center justify-center font-bold text-sm group-hover:bg-orange-500 transition-colors shrink-0">
                        →
                      </span>
                    </div>
                  </Link>
                </div>
              ))}
            </div>
          </section>
        </main>
      </div>

      <br />

      {/* Moving Marquee Brand Spotlight Row */}
<section className="py-6 border-y border-gray-200 bg-white overflow-hidden my-12 relative w-full">
  <div className="animate-marquee flex items-center gap-8 md:gap-16 whitespace-nowrap">
    {[...BRAND_COLLECTIONS, ...BRAND_COLLECTIONS].map((col, idx) => (
      <span
        key={`${col.id}-${idx}`}
        className="text-lg md:text-2xl font-black tracking-widest text-gray-400 hover:text-orange-500 transition-colors cursor-pointer select-none uppercase"
      >
        {col.name}
      </span>
    ))}
  </div>
</section>

<br /><br />

      <Footer />
    </div>
  );
}