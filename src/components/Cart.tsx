"use client";
import Link from "next/link";

interface CartItem {
  id: string;
  name: string;
  price: number;
  image_url: string;
  quantity: number;
}

interface CartProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  onUpdateQuantity: (id: string, delta: number) => void;
}

export default function Cart({ isOpen, onClose, items, onUpdateQuantity }: CartProps) {
  if (!isOpen) return null;

  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black bg-opacity-50">
      <div className="bg-white w-full max-w-md h-full p-6 flex flex-col justify-between shadow-2xl animate-in slide-in-from-right duration-300">
        <div>
          <div className="flex items-center justify-between pb-4 border-b">
            <h2 className="text-xl font-bold text-black">Your Cart</h2>
            <button onClick={onClose} className="text-gray-500 hover:text-black font-bold text-xl">
              ✕
            </button>
          </div>

          <div className="mt-6 flex flex-col gap-4 max-h-[60vh] overflow-y-auto">
            {items.length === 0 ? (
              <p className="text-gray-500 text-center py-8">Your cart is empty.</p>
            ) : (
              items.map((item, index) => (
                <div key={`{item.id}-${index}`} className="flex items-center justify-between gap-4 border-b pb-4">
                  <img src={item.image_url} alt={item.name} className="w-16 h-16 object-cover rounded-md" />
                  <div className="flex-1">
                    <h3 className="font-semibold text-sm text-black">{item.name}</h3>
                    <p className="text-gray-500 text-xs">${item.price.toFixed(2)}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <button
                        onClick={() => onUpdateQuantity(item.id, -1)}
                        className="w-6 h-6 bg-gray-100 rounded hover:bg-gray-200 text-xs font-bold"
                      >
                        -
                      </button>
                      <span className="text-sm font-semibold">{item.quantity}</span>
                      <button
                        onClick={() => onUpdateQuantity(item.id, 1)}
                        className="w-6 h-6 bg-gray-100 rounded hover:bg-gray-200 text-xs font-bold"
                      >
                        +
                      </button>
                    </div>
                  </div>
                  <p className="font-bold text-black">${(item.price * item.quantity).toFixed(2)}</p>
                </div>
              ))
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
            <button className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 rounded-xl transition-colors shadow-lg">
              Checkout
            </button>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}