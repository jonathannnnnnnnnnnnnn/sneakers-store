import { ProductGridSkeleton } from "@/components/ProductSkeleton";

export default function Loading() {
  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 flex flex-col justify-between">
      <main className="max-w-7xl mx-auto px-3 sm:px-4 py-8 w-full">
        {/* Banner Skeleton */}
        <div className="w-full h-56 sm:h-64 bg-gray-200 rounded-3xl animate-pulse mb-8 sm:mb-10" />

        {/* Product Cards Skeleton Grid */}
        <ProductGridSkeleton count={8} />
      </main>
    </div>
  );
}