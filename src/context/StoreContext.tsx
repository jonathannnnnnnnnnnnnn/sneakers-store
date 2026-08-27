"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { createClient } from "@/lib/supabase/client";
import { allProducts, Product } from "@/data/products";
import toast from "react-hot-toast";

export interface CartItem {
  id: string;
  name: string;
  price: number;
  image_url: string;
  quantity: number;
}

interface StoreContextType {
  user: any;
  cart: CartItem[];
  wishlistIds: string[];
  clearCart: () => Promise<void>;
  addToCart: (product: Product) => void;
  updateQuantity: (id: string, delta: number) => void;
  addToWishlist: (id: string) => void;
  toggleWishlist: (id: string) => void;
  clearWishlist: () => void;
  removeFromWishlist: (id: string) => void;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

export function StoreProvider({ children }: { children: ReactNode }) {
  // Initialize client once outside render loops
  const [supabase] = useState(() => createClient());
  const [user, setUser] = useState<any>(null);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [wishlistIds, setWishlistIds] = useState<string[]>([]);

  useEffect(() => {
    let isMounted = true;
    let authListener: { subscription: { unsubscribe: () => void } } | null = null;
    let initialAuthResolved = false;

    const loadUserData = async (activeUser: any) => {
      if (!isMounted) return;

      if (activeUser) {
        await fetchCart(activeUser.id);
        await fetchWishlist(activeUser.id);
      } else {
        // Guest fallback from LocalStorage
        const savedCart = localStorage.getItem("sneaker_cart");
        const savedWishlist = localStorage.getItem("sneaker_wishlist");
        if (savedCart && isMounted) {
          try {
            setCart(JSON.parse(savedCart));
          } catch (error) {
            console.error("Failed to parse saved cart:", error);
          }
        }
        if (savedWishlist && isMounted) {
          try {
            setWishlistIds(JSON.parse(savedWishlist));
          } catch (error) {
            console.error("Failed to parse saved wishlist:", error);
          }
        }
      }
    };

    const fetchCart = async (userId: string) => {
      const { data, error } = await supabase
        .from("cart_items")
        .select("product_id, quantity")
        .eq("user_id", userId);

      if (error) {
        console.error(
          "Failed to load cart from Supabase:",
          `message: ${error.message || "Unknown error"}`,
          `details: ${error.details || "No details provided"}`
        );
        return;
      }

      if (!isMounted) return;

      const formattedCart = (data || [])
        .map((item) => {
          const productDetails = allProducts.find(
            (product) => String(product.id) === String(item.product_id)
          );
          if (!productDetails || !Number.isFinite(item.quantity) || item.quantity <= 0) return null;
          return {
            id: productDetails.id,
            name: productDetails.name,
            price: productDetails.price,
            image_url: productDetails.image_url,
            quantity: item.quantity,
          };
        })
        .filter((item): item is CartItem => item !== null);

      setCart(formattedCart);
    };

    const fetchWishlist = async (userId: string) => {
      const { data, error } = await supabase
        .from("wishlist_items")
        .select("product_id")
        .eq("user_id", userId);

      if (error) {
        console.error(
          "Failed to load wishlist from Supabase:",
          `message: ${error.message || "Unknown error"}`,
          `details: ${error.details || "No details provided"}`
        );
        return;
      }

      if (isMounted) {
        const ids = (data || []).map((item) => String(item.product_id));
        setWishlistIds([...new Set(ids)]);
      }
    };

    const initializeStore = async () => {
      const { data, error } = await supabase.auth.getUser();
      if (error) {
        const authError = error as { message?: string; details?: string };
        console.error(
          "Failed to resolve authenticated user:",
          `message: ${authError.message || "Unknown error"}`,
          `details: ${authError.details || "No details provided"}`
        );
      }

      const activeUser = data?.user || null;
      if (!isMounted) return;

      setUser(activeUser);
      await loadUserData(activeUser);
      initialAuthResolved = true;

      if (!isMounted) return;

      // Listen only after initial hydration so INITIAL_SESSION cannot overwrite it.
      const listener = supabase.auth.onAuthStateChange((_event, session) => {
        if (!isMounted || !initialAuthResolved || _event === "INITIAL_SESSION") return;

        const nextUser = session?.user || null;
        setUser(nextUser);
        if (_event === "SIGNED_OUT") {
          setCart([]);
          setWishlistIds([]);
        } else {
          loadUserData(nextUser);
        }
      });
      authListener = listener.data;
    };

    initializeStore();

    return () => {
      isMounted = false;
      authListener?.subscription.unsubscribe();
    };
  }, []); // Run ONCE on mount

  // Add to Cart
  const addToCart = async (product: Product) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.id === product.id);
      let updated: CartItem[];
      if (existing) {
        updated = prev.map((item) =>
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      } else {
        updated = [
          ...prev,
          {
            id: product.id,
            name: product.name,
            price: product.price,
            image_url: product.image_url,
            quantity: 1,
          },
        ];
      }

      if (!user) {
        localStorage.setItem("sneaker_cart", JSON.stringify(updated));
      }
      return updated;
    });

    if (user) {
      const existing = cart.find((i) => i.id === product.id);
      const newQty = existing ? existing.quantity + 1 : 1;
      await supabase.from("cart_items").upsert(
        { user_id: user.id, product_id: product.id, quantity: newQty },
        { onConflict: "user_id, product_id" }
      );
    }
  };

  // Update Quantity
  const updateQuantity = async (id: string, delta: number) => {
    setCart((prev) => {
      const updated = prev
        .map((item) => {
          if (item.id === id) {
            const newQty = item.quantity + delta;
            return newQty > 0 ? { ...item, quantity: newQty } : null;
          }
          return item;
        })
        .filter(Boolean) as CartItem[];

      if (!user) {
        localStorage.setItem("sneaker_cart", JSON.stringify(updated));
      }
      return updated;
    });

    if (user) {
      const targetItem = cart.find((i) => i.id === id);
      if (targetItem) {
        const newQty = targetItem.quantity + delta;
        if (newQty <= 0) {
          await supabase.from("cart_items").delete().eq("user_id", user.id).eq("product_id", id);
        } else {
          await supabase
            .from("cart_items")
            .update({ quantity: newQty })
            .eq("user_id", user.id)
            .eq("product_id", id);
        }
      }
    }
  };

  const clearCart = async () => {
    setCart([]);

    if (user) {
      const { error } = await supabase.from("cart_items").delete().eq("user_id", user.id);
      if (error) {
        console.error(
          "Failed to clear cart from Supabase:",
          `message: ${error.message || "Unknown error"}`,
          `details: ${error.details || "No details provided"}`
        );
      }
    } else {
      localStorage.removeItem("sneaker_cart");
    }
  };

  // Wishlist Operations
  const addToWishlist = async (id: string) => {
    if (wishlistIds.includes(id)) return;

    const updated = [...wishlistIds, id];
    setWishlistIds(updated);

    if (user) {
      const { error } = await supabase
        .from("wishlist_items")
        .upsert({ user_id: user.id, product_id: id }, { onConflict: "user_id, product_id" });
      if (error) {
        console.error(
          "Failed to add item to wishlist in Supabase:",
          `message: ${error.message || "Unknown error"}`,
          `details: ${error.details || "No details provided"}`
        );
      }
    } else {
      localStorage.setItem("sneaker_wishlist", JSON.stringify(updated));
    }

    toast.success("Added to Wishlist!");
  };

  const toggleWishlist = async (id: string) => {
    if (!wishlistIds.includes(id)) {
      await addToWishlist(id);
      return;
    }

    const updated = wishlistIds.filter((favId) => favId !== id);
    setWishlistIds(updated);

    if (user) {
      const { error } = await supabase
        .from("wishlist_items")
        .delete()
        .eq("user_id", user.id)
        .eq("product_id", id);
      if (error) {
        console.error(
          "Failed to remove item from wishlist in Supabase:",
          `message: ${error.message || "Unknown error"}`,
          `details: ${error.details || "No details provided"}`
        );
      }
    } else {
      localStorage.setItem("sneaker_wishlist", JSON.stringify(updated));
    }

    toast.success("Removed from Wishlist");
  };

  const removeFromWishlist = async (id: string) => {
    const updated = wishlistIds.filter((favId) => favId !== id);
    setWishlistIds(updated);

    if (user) {
      await supabase.from("wishlist_items").delete().eq("user_id", user.id).eq("product_id", id);
    } else {
      localStorage.setItem("sneaker_wishlist", JSON.stringify(updated));
    }
  };

  const clearWishlist = async () => {
    setWishlistIds([]);
    if (user) {
      await supabase.from("wishlist_items").delete().eq("user_id", user.id);
    } else {
      localStorage.removeItem("sneaker_wishlist");
    }
  };

  return (
    <StoreContext.Provider
      value={{
        user,
        cart,
        wishlistIds,
        clearCart,
        addToCart,
        updateQuantity,
        addToWishlist,
        toggleWishlist,
        clearWishlist,
        removeFromWishlist,
      }}
    >
      {children}
    </StoreContext.Provider>
  );
}

export function useStore() {
  const context = useContext(StoreContext);
  if (!context) throw new Error("useStore must be used within a StoreProvider");
  return context;
}