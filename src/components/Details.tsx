"use client";

import { useState } from "react";
import { Product } from "@/types/product";

interface DetailsProps {
  product: Product;
  onAddToCart: (quantity: number) => void;
}

export default function Details({ product, onAddToCart }: DetailsProps) {
  const [quantity, setQuantity] = useState(1);

  return (
    <div className="flex flex-col justify-center gap-4 max-w-md">
      <span className="text-orange-500 uppercase tracking-widest text-sm font-bold">
        {product.company}
      </span>
      <h2 className="text-4xl font-bold text-gray-900">{product.name}</h2>
      <p className="text-gray-500 text-sm leading-relaxed">{product.description}</p>
      
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-4">
          <span className="text-3xl font-bold">${product.price.toFixed(2)}</span>
          <span className="bg-orange-100 text-orange-500 font-bold px-2 py-0.5 rounded text-sm">
            {product.discount}%
          </span>
        </div>
        <span className="text-gray-400 line-through text-sm">
          ${product.originalPrice?.toFixed(2)}
        </span>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 mt-4">
        <div className="flex items-center justify-between bg-gray-100 rounded-lg px-4 py-3 w-full sm:w-1/3">
          <button
            onClick={() => setQuantity((q) => Math.max(1, q - 1))}
            className="text-orange-500 font-bold text-xl hover:opacity-70"
          >
            -
          </button>
          <span className="font-bold">{quantity}</span>
          <button
            onClick={() => setQuantity((q) => q + 1)}
            className="text-orange-500 font-bold text-xl hover:opacity-70"
          >
            +
          </button>
        </div>
        <button
          onClick={() => onAddToCart(quantity)}
          className="bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 px-8 rounded-lg shadow-lg shadow-orange-200 flex-1 flex items-center justify-center gap-2"
        >
          Add to cart
        </button>
      </div>
    </div>
  );
}