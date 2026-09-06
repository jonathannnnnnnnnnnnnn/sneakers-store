"use client";
import Link from "next/link";
import { slugify } from "@/data/products";
import { Minus, Plus, ShoppingBag, X } from "lucide-react";

export interface CartItem {
  id: string;
  name: string;
  price: number;
  image_url: string;
  quantity: number;
  size?: number;
}

interface CartProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  onUpdateQuantity: (id: string, delta: number, size?: number) => void;
}

export default function Cart({ isOpen, onClose, items, onUpdateQuantity }: CartProps) {
  if (!isOpen) return null;

  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/10 backdrop-blur-sm">
      <div className="bg-white w-full max-w-md h-full p-6 flex flex-col justify-between shadow-2xl animate-in slide-in-from-right duration-300">
        <div>
          <div className="flex items-center justify-between pb-4 border-b">
            <h2 className="text-xl font-bold text-black">Your Cart</h2>
            <button onClick={onClose} className="text-gray-500 hover:text-black" aria-label="Close cart">
              <X className="h-5 w-5" strokeWidth={2} />
            </button>
          </div>

          <div className="mt-6 flex flex-col gap-4 max-h-[60vh] overflow-y-auto">
            {items.length === 0 ? (
              <p className="text-gray-500 text-center py-8">Your cart is empty.</p>
            ) : (
              items.map((item) => {
                const itemKey = `${item.id}-${item.size || "nosize"}`;
                return (
                  <div key={itemKey} className="flex items-center justify-between gap-4 border-b pb-4">
                    <Link href={`/products/${slugify(item.name)}`} className="shrink-0">
                      <img src={item.image_url} alt={item.name} className="w-16 h-16 object-cover rounded-md" />
                    </Link>
                    
                    <div className="flex-1">
                      <Link href={`/products/${slugify(item.name)}`} className="font-semibold text-sm text-black hover:text-orange-500">
                        {item.name}
                      </Link>
                      
                      {item.size && (
                        <span className="inline-block mt-1 bg-gray-100 text-gray-700 text-[10px] font-extrabold px-2 py-0.5 rounded-md border border-gray-200">
                          US {item.size}
                        </span>
                      )}

                      <p className="text-gray-500 text-xs mt-1">${item.price.toFixed(2)}</p>
                      
                      <div className="flex items-center gap-2 mt-2">
                        <button
                          onClick={() => onUpdateQuantity(item.id, -1, item.size)}
                          className="inline-flex h-6 w-6 items-center justify-center rounded bg-gray-100 text-center text-xs font-bold leading-none hover:bg-gray-200"
                        >
                          <Minus className="h-3.5 w-3.5" strokeWidth={2.5} />
                        </button>
                        <span className="text-sm font-semibold">{item.quantity}</span>
                        <button
                          onClick={() => onUpdateQuantity(item.id, 1, item.size)}
                          className="inline-flex h-6 w-6 items-center justify-center rounded bg-gray-100 text-center text-xs font-bold leading-none hover:bg-gray-200"
                        >
                          <Plus className="h-3.5 w-3.5" strokeWidth={2.5} />
                        </button>
                      </div>
                    </div>

                    <p className="font-bold text-black">${(item.price * item.quantity).toFixed(2)}</p>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {items.length > 0 && (
          <div className="border-t pt-4">
            <div className="flex justify-between items-center mb-4">
              <span className="text-gray-600 font-medium">Subtotal</span>
              <span className="text-2xl font-extrabold text-black">${subtotal.toFixed(2)}</span>
            </div>

            <Link href="/checkout" onClick={onClose} className="block w-full">
              <button className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 rounded-xl transition-colors shadow-lg flex items-center justify-center gap-2">
                <ShoppingBag className="h-4 w-4" strokeWidth={2} />
                Checkout
              </button>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}