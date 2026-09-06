"use client";

import { useState } from "react";
import Image from "next/image";

interface GalleryProps {
  images: string[];
  thumbnails: string[];
}

export default function Gallery({ images, thumbnails }: GalleryProps) {
  const [selectedIndex, setSelectedIndex] = useState(0);

  // Safe fallback if images array is empty
  const displayImages = images && images.length > 0 ? images : ["/placeholder.png"];
  const displayThumbnails = thumbnails && thumbnails.length > 0 ? thumbnails : displayImages;

  return (
    <div className="flex flex-col gap-4 max-w-md mx-auto w-full">
      {/* Main Image View */}
      <div className="relative aspect-square w-full rounded-2xl overflow-hidden bg-gray-50 border border-gray-200 group shadow-sm">
        <Image
          key={selectedIndex} // Forces crisp re-render animation when swapping main images
          src={displayImages[selectedIndex] || displayImages[0]}
          alt="Product detail view"
          fill
          className="object-contain p-4 group-hover:scale-105 transition-transform duration-500 ease-out"
          priority
        />
        
        {/* Subtle Badge */}
        <span className="absolute bottom-3 right-3 bg-white/80 backdrop-blur-md text-[10px] font-black text-gray-500 px-2.5 py-1 rounded-full border border-gray-200/50 shadow-sm">
          {selectedIndex + 1} / {displayImages.length}
        </span>
      </div>

      {/* Thumbnails Navigation */}
      {displayThumbnails.length > 1 && (
        <div className="grid grid-cols-4 gap-3 sm:gap-4">
          {displayThumbnails.map((thumb, idx) => {
            const isSelected = selectedIndex === idx;

            return (
              <button
                key={idx}
                type="button"
                onClick={() => setSelectedIndex(idx)}
                className={`relative aspect-square rounded-xl overflow-hidden border-2 bg-gray-50 transition-all duration-200 active:scale-95 ${
                  isSelected
                    ? "border-orange-500 ring-4 ring-orange-500/10 scale-95 shadow-sm"
                    : "border-gray-200 hover:border-gray-300 opacity-70 hover:opacity-100"
                }`}
              >
                <Image
                  src={thumb}
                  alt={`Product thumbnail ${idx + 1}`}
                  fill
                  className="object-cover"
                />
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}