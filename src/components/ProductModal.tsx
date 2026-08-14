"use client";

import { useState } from "react";

interface Product {
  id: string;
  name: string;
  description?: string;
  price: number;
  image_url: string;
  category: string;
  gender: string;
}

interface ProductModalProps {
  product: Product | null;
  onClose: () => void;
  onAddToCart: (product: any) => void;
}

export default function ProductModal({ product, onClose, onAddToCart }: ProductModalProps) {
  const [selectedSize, setSelectedSize] = useState<string>("US 9");

  if (!product) return null;

  const sizes = ["US 7", "US 8", "US 9", "US 10", "US 11", "US 12"];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white rounded-3xl max-w-2xl w-full p-6 md:p-8 relative shadow-2xl animate-in zoom-in-95 duration-200">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-black font-bold text-xl w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
        >
          ✕
        </button>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
          <div className="w-full h-64 md:h-80 bg-gray-100 rounded-2xl overflow-hidden relative">
            <img
              src={product.image_url || "/placeholder.png"}
              alt={product.name}
              className="w-full h-full object-cover"
            />
          </div>

          <div className="flex flex-col justify-between h-full">
            <div>
              <span className="text-xs font-black uppercase text-orange-500 tracking-wider">
                {product.gender || product.category}
              </span>
              <h2 className="text-2xl font-black text-gray-900 mt-1">{product.name}</h2>
              <p className="text-2xl font-extrabold text-black mt-2">${product.price.toFixed(2)}</p>
              <p className="text-gray-600 text-sm mt-3 line-clamp-3">
                {product.description || "Premium quality build designed for everyday comfort and high-durability performance."}
              </p>

              <div className="mt-4">
                <label className="text-xs font-bold text-gray-700 uppercase tracking-wider block mb-2">
                  Select Size
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {sizes.map((size) => (
                    <button
                      key={size}
                      onClick={() => setSelectedSize(size)}
                      className={`py-1.5 text-xs font-bold rounded-lg border transition-all ${
                        selectedSize === size
                          ? "border-orange-500 bg-orange-50 text-orange-600"
                          : "border-gray-200 text-gray-700 hover:border-gray-400"
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <button
              onClick={() => {
                onAddToCart(product);
                onClose();
              }}
              className="mt-6 w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 rounded-xl transition-colors shadow-lg active:scale-95"
            >
              Add to Cart
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}