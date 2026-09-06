export default function ProductSkeleton() {
  return (
    <div className="bg-white rounded-2xl p-3 sm:p-4 border border-gray-200 shadow-sm animate-pulse flex flex-col justify-between">
      <div>
        {/* Image Placeholder */}
        <div className="w-full h-36 sm:h-44 bg-gray-200 rounded-xl mb-3" />
        
        {/* Brand Tag Placeholder */}
        <div className="h-2.5 bg-gray-200 rounded w-1/4 mb-2" />
        
        {/* Title Placeholder */}
        <div className="h-4 bg-gray-200 rounded w-3/4 mb-1" />
      </div>

      {/* Side-by-Side Price & Button Placeholder */}
      <div className="mt-3 pt-2 sm:pt-3 border-t border-gray-100 flex items-center justify-between gap-2">
        <div className="space-y-1">
          <div className="h-2 bg-gray-200 rounded w-8" />
          <div className="h-4 bg-gray-200 rounded w-12" />
        </div>
        <div className="h-7 sm:h-8 bg-gray-200 rounded-lg sm:rounded-xl w-16 sm:w-20" />
      </div>
    </div>
  );
}

{/* Full Grid Skeleton for Page Loads */}
export function ProductGridSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <ProductSkeleton key={i} />
      ))}
    </div>
  );
}