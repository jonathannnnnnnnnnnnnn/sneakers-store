"use client";

import { useState } from "react";
import Image from "next/image";

interface GalleryProps {
  images: string[];
  thumbnails: string[];
}

export default function Gallery({ images, thumbnails }: GalleryProps) {
  const [selectedIndex, setSelectedIndex] = useState(0);

  return (
    <div className="flex flex-col gap-4 max-w-md mx-auto w-full">
      {/* Main Image */}
      <div className="relative aspect-square w-full rounded-2xl overflow-hidden bg-gray-100">
        <Image
          src={images[selectedIndex]}
          alt="Product image"
          fill
          className="object-contain p-2"
          priority
        />
      </div>

      {/* Thumbnails */}
      <div className="grid grid-cols-4 gap-4">
        {thumbnails.map((thumb, idx) => (
          <button
            key={idx}
            onClick={() => setSelectedIndex(idx)}
            className={`relative aspect-square rounded-xl overflow-hidden border-2 bg-gray-100 ${
              selectedIndex === idx
                ? "border-orange-500 opacity-60"
                : "border-transparent hover:opacity-80"
            }`}
          >
            <Image
              src={thumb}
              alt={`Thumbnail ${idx + 1}`}
              fill
              className="object-cover"
            />
          </button>
        ))}
      </div>
    </div>
  );
}