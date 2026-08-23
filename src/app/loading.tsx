// import { ProductGridSkeleton } from "@/components/ProductSkeleton";

// export default function Loading() {
//   return (
//     <div className="min-h-screen bg-gray-50 text-gray-900 flex flex-col justify-between">
//       <main className="max-w-7xl mx-auto px-3 sm:px-4 py-8 w-full">
//         {/* Banner Skeleton */}
//         <div className="w-full h-56 sm:h-64 bg-gray-200 rounded-3xl animate-pulse mb-8 sm:mb-10" />

//         {/* Product Cards Skeleton Grid */}
//         <ProductGridSkeleton count={8} />
//       </main>
//     </div>
//   );
// }

import { ProductGridSkeleton } from "@/components/ProductSkeleton";

export default function Loading() {
  return (
    <div className="relative min-h-screen bg-gray-50">
      {/* Light Mode Ghost Brand Overlay */}
      <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-white/90 backdrop-blur-md">
        <div className="relative flex flex-col items-center justify-center">
          {/* Faint Outer Halo */}
          <div className="absolute w-24 h-24 rounded-full bg-gray-200/50 blur-xl animate-pulse" />

          {/* Colorless / Ghost Lightning Bolt Icon */}
          <div className="relative flex items-center justify-center w-20 h-20 rounded-3xl border border-gray-200 bg-gray-50 shadow-sm animate-pulse">
            <svg
              className="w-10 h-10 text-gray-300"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M13 2L3 14h7v8l10-12h-7V2z" />
            </svg>
          </div>

          {/* Minimalist Faded Brand Subtext */}
          <span className="mt-4 text-[10px] font-black uppercase tracking-[0.3em] text-gray-400 animate-pulse">
            SOLE VAULT
          </span>
        </div>
      </div>

      {/* Page Skeleton Background */}
      <main className="max-w-7xl mx-auto px-3 sm:px-4 py-8 w-full opacity-40">
        <div className="w-full h-56 sm:h-64 bg-gray-200 rounded-3xl animate-pulse mb-8" />
        <ProductGridSkeleton count={8} />
      </main>
    </div>
  );
}