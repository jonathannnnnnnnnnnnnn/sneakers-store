"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import Navbar from "@/components/Navbar";
import Cart from "@/components/Cart";
import ProductModal from "@/components/ProductModal";
import Footer from "@/components/Footer";
import { allProducts } from "@/data/products";

interface Product {
  id: string;
  name: string;
  description?: string;
  price: number;
  discount?: number;
  company?: string;
  image_url: string;
  category: string;
  gender: string;
}

interface CartItem {
  id: string;
  name: string;
  price: number;
  image_url: string;
  quantity: number;
}

export default function Home() {
  // const [products, setProducts] = useState<Product[]>([]);
  // Instead of fetching from Supabase in useEffect:
  const [selectedBrand, setSelectedBrand] = useState("All");
  const [maxPrice, setMaxPrice] = useState(300); // Set to highest price in your data
  const [products, setProducts] = useState(allProducts);
  const [loading, setLoading] = useState(true);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [toast, setToast] = useState<string | null>(null);

  const [wishlist, setWishlist] = useState<string[]>([]);

// Load saved favorites on mount
useEffect(() => {
  const savedWishlist = localStorage.getItem("sneaker_wishlist");
  if (savedWishlist) {
    try {
      setWishlist(JSON.parse(savedWishlist));
    } catch (e) {
      console.error("Failed to load wishlist:", e);
    }
  }
}, []);

// Toggle heart icon
const toggleWishlist = (productId: string, e: React.MouseEvent) => {
  e.stopPropagation(); // Prevents clicking the heart from navigating to the product page
  e.preventDefault();

  let updatedWishlist: string[];
  if (wishlist.includes(productId)) {
    updatedWishlist = wishlist.filter((id) => id !== productId);
    showToast("Removed from Wishlist");
  } else {
    updatedWishlist = [...wishlist, productId];
    showToast("Saved to Wishlist ❤️");
  }

  setWishlist(updatedWishlist);
  localStorage.setItem("sneaker_wishlist", JSON.stringify(updatedWishlist));
};

  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  const supabase = createClient();

  const showToast = (message: string) => {
    setToast(message);
    setTimeout(() => setToast(null), 2500);
  };

  // Fetch live products from Supabase on load
  // useEffect(() => {
  //   async function fetchProducts() {
  //     setLoading(true);
  //     const { data, error } = await supabase.from("products").select("*");

  //     if (error) {
  //       console.error("Error fetching products from Supabase:", error.message);
  //     } else if (data) {
  //       setProducts(data);
  //     }
  //     setLoading(false);
  //   }

  //   fetchProducts();
  // }, []);

  useEffect(() => {
  setLoading(false);
}, []);

  // Load cart from localStorage on mount
  useEffect(() => {
    const loadCart = () => {
      const savedCart = localStorage.getItem("sneaker_cart");
      if (savedCart) {
        try {
          setCart(JSON.parse(savedCart));
        } catch (e) {
          console.error("Failed to load saved cart:", e);
        }
      }
    };

    loadCart();

    // Re-sync cart count whenever you click back to the homepage
    window.addEventListener("focus", loadCart);
    return () => window.removeEventListener("focus", loadCart);
  }, []);

  // Save cart to localStorage on changes
  useEffect(() => {
    if (cart.length > 0) {
      localStorage.setItem("sneaker_cart", JSON.stringify(cart));
    }
  }, [cart]);

  // Cart Management
  const addToCart = (product: Product) => {
    setCart((prevCart) => {
      const existing = prevCart.find((item) => item.id === product.id);
      if (existing) {
        return prevCart.map((item) =>
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [
        ...prevCart,
        {
          id: product.id,
          name: product.name,
          price: product.price,
          image_url: product.image_url,
          quantity: 1,
        },
      ];
    });
    showToast(`Added "${product.name}" to cart!`);
  };

  const updateQuantity = (id: string, delta: number) => {
    setCart((prevCart) =>
      prevCart
        .map((item) => {
          if (item.id === id) {
            const newQty = item.quantity + delta;
            return newQty > 0 ? { ...item, quantity: newQty } : null;
          }
          return item;
        })
        .filter(Boolean) as CartItem[]
    );
  };

  const totalCartItems = cart.reduce((total, item) => total + item.quantity, 0);

  // Filter & Search Logic
  // const filteredProducts = products.filter((product) => {
  //   const matchesCategory =
  //     selectedCategory === "All" ||
  //     product.category?.toLowerCase() === selectedCategory.toLowerCase() ||
  //     product.gender?.toLowerCase() === selectedCategory.toLowerCase() ||
  //     (selectedCategory === "Collections" && product.category);

  //   const matchesSearch =
  //     product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
  //     (product.company && product.company.toLowerCase().includes(searchQuery.toLowerCase()));

  //   return matchesCategory && matchesSearch;
  // });

  // Filter & Search & Brand & Price Logic
  const filteredProducts = products.filter((product) => {
    const matchesCategory =
      selectedCategory === "All" ||
      product.category?.toLowerCase() === selectedCategory.toLowerCase() ||
      product.gender?.toLowerCase() === selectedCategory.toLowerCase() ||
      (selectedCategory === "Collections" && product.category);

    const matchesSearch =
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (product.company && product.company.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesBrand =
      selectedBrand === "All" ||
      (product.company && product.company.toLowerCase() === selectedBrand.toLowerCase());

    const matchesPrice = product.price <= maxPrice;

    return matchesCategory && matchesSearch && matchesBrand && matchesPrice;
  });

  return (
    <div className="min-h-screen bg-gray-50 font-sans pb-20">
      <Navbar
        cartCount={totalCartItems}
        wishlistCount={wishlist.length} // <--- Pass it here
        toggleCart={() => setIsCartOpen(!isCartOpen)}
        activeFilter={selectedCategory}
        onFilterChange={(filter) => setSelectedCategory(filter)}
      />

      <Cart
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        items={cart}
        onUpdateQuantity={updateQuantity}
      />

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Top Hero Banner */}
        <section className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-gray-900 via-gray-800 to-black text-white py-16 px-8 md:px-12 mb-8 shadow-2xl">
          <div className="max-w-2xl z-10 relative">
            <span className="inline-block bg-orange-500/20 text-orange-400 text-xs font-black uppercase tracking-widest px-3 py-1 rounded-full mb-4 border border-orange-500/30">
              New Season Arrival
            </span>
            <h1 className="text-4xl md:text-6xl font-black tracking-tight leading-none mb-4">
              STEP INTO THE <span className="text-orange-500">FUTURE.</span>
            </h1>
            <p className="text-gray-300 text-sm md:text-base mb-8 max-w-lg leading-relaxed">
              Discover the exclusive drop of high-performance sneakers and street-ready footwear built for speed, comfort, and style.
            </p>
            <div className="flex flex-wrap gap-4">
              <button className="bg-orange-500 hover:bg-orange-600 text-white font-extrabold px-8 py-4 rounded-2xl shadow-lg transition-all active:scale-95 text-sm">
                Shop Collection
              </button>
              <button className="border border-gray-700 hover:border-gray-500 text-gray-200 font-bold px-6 py-4 rounded-2xl transition-all text-sm">
                Explore Drops 🔥
              </button>
            </div>
          </div>
        </section>

        {/* Search & Category Filter Controls */}
<div className="flex flex-col md:flex-row justify-between items-center gap-4 my-6">
  
  {/* 1. Category Nav Pills */}
  <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto">
    {["All", "Men", "Women", "Collections"].map((cat) => (
      <button
        key={cat}
        onClick={() => setSelectedCategory(cat)}
        className={`px-4 py-2 rounded-full text-sm font-medium transition-colors border ${
          selectedCategory === cat
            ? "bg-orange-500 text-white border-orange-500"
            : "bg-white text-gray-900 border-gray-300 hover:border-black"
        }`}
      >
        {cat}
      </button>
    ))}
  </div>

  {/* 2. Search Input (Moved to Right with visible black outline) */}
  <div className="w-full md:w-72">
    <input
      type="text"
      placeholder="Search products..."
      value={searchQuery}
      onChange={(e) => setSearchQuery(e.target.value)}
      className="w-full px-4 py-2 bg-white text-gray-900 placeholder-gray-500 border-2 border-black rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 font-medium shadow-sm"
    />
  </div>

</div>

        {/* Product Count Header */}
        <p className="text-gray-500 font-medium mb-6">
          Showing <span className="text-black font-bold">{filteredProducts.length}</span> Products
        </p>

{/* Brand & Price Filter Controls */}
<div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-sm mb-6 flex flex-col md:flex-row items-center justify-between gap-6">
  
  {/* Brand Selector */}
  <div className="flex items-center gap-3 w-full md:w-auto">
    <label className="text-sm font-bold text-gray-900 whitespace-nowrap">Brand:</label>
    <select
      value={selectedBrand}
      onChange={(e) => setSelectedBrand(e.target.value)}
      className="px-3 py-2 bg-gray-50 border border-gray-300 rounded-xl text-sm font-medium text-gray-900 focus:outline-none focus:ring-2 focus:ring-orange-500 w-full md:w-48"
    >
      <option value="All">All Brands</option>
      <option value="Nike">Nike</option>
      <option value="Adidas">Adidas</option>
      <option value="Jordan">Jordan</option>
      <option value="Puma">Puma</option>
    </select>
  </div>

  {/* Price Range Slider */}
  <div className="flex items-center gap-4 w-full md:w-72">
    <label className="text-sm font-bold text-gray-900 whitespace-nowrap">
      Max Price: <span className="text-orange-500">${maxPrice}</span>
    </label>
    <input
      type="range"
      min="50"
      max="300"
      step="10"
      value={maxPrice}
      onChange={(e) => setMaxPrice(Number(e.target.value))}
      className="w-full accent-orange-500 cursor-pointer"
    />
  </div>

</div>

        {/* Product Grid */}
        {loading ? (
          <div className="text-center py-20 text-gray-500">Loading catalog from database...</div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-6">
            {filteredProducts.map((product) => (
              <div
  key={product.id}
  className="bg-white rounded-2xl p-4 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between group"
>
  <div>
    <Link href={`/products/${product.id}`} className="block">
    <div className="w-full h-36 sm:h-52 relative rounded-xl overflow-hidden bg-gray-100 mb-2 cursor-pointer">
  <img
    src={product.image_url || "/placeholder.png"}
    alt={product.name}
    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
  />

  {/* Heart Icon Button */}
  <button
    onClick={(e) => toggleWishlist(product.id, e)}
    className="absolute top-3 right-3 bg-white/80 backdrop-blur-md p-2 rounded-full shadow-md hover:scale-110 transition-transform z-10"
  >
    <span className="text-base">
      {wishlist.includes(product.id) ? "❤️" : "🤍"}
    </span>
  </button>
</div>
      <span className="text-xs uppercase font-extrabold tracking-wider text-orange-500">
        {product.gender || product.category}
      </span>
<h3 className="font-bold text-gray-900 text-xs sm:text-base mt-1 line-clamp-1 hover:text-orange-500 transition-colors">
  {product.name}
</h3>
    </Link>
    {/* <p className="text-gray-500 text-xs line-clamp-2 mt-1">
      {product.description || "Premium quality sneakers and apparel."}
    </p> */}
  </div>

<div className="flex items-center justify-between gap-1 sm:gap-2 mt-1 pt-2 border-t">
  <span className="text-xs sm:text-lg font-black text-black truncate">
    ${product.price.toFixed(2)}
  </span>
  <button
    onClick={() => addToCart(product)}
    className="whitespace-nowrap bg-orange-500 hover:bg-orange-600 text-white font-bold py-1 px-2 sm:py-2 sm:px-4 text-[11px] sm:text-sm rounded-lg transition-colors flex-shrink-0"
  >
    + Add
  </button>
</div> 
              </div>
            ))}
          </div>
        )}

        {/* Mid-Page Promo Banner */}
        <section className="my-12 rounded-3xl bg-orange-500 text-white p-8 md:p-12 relative overflow-hidden shadow-xl flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="z-10 max-w-xl text-center md:text-left">
            <span className="bg-black/20 text-white text-xs font-black uppercase tracking-widest px-3 py-1 rounded-full inline-block mb-3">
              Limited Time Offer
            </span>
            <h2 className="text-3xl md:text-5xl font-black tracking-tight leading-tight">
              GET 20% OFF YOUR FIRST ORDER
            </h2>
            <p className="text-orange-100 text-sm mt-2">
              Use code <span className="font-extrabold underline decoration-white">SNEAKER20</span> at checkout. Valid on all new arrivals.
            </p>
          </div>

          <div className="z-10 flex-shrink-0">
            <button className="bg-black hover:bg-gray-900 text-white font-extrabold px-8 py-4 rounded-2xl shadow-lg transition-all active:scale-95 text-sm">
              Claim Discount ⚡
            </button>
          </div>

          <div className="absolute -left-12 -bottom-12 w-64 h-64 bg-white/10 rounded-full blur-2xl pointer-events-none" />
        </section>

        {/* Value Props Section */}
        <div className="bg-gray-100 py-12 px-4 my-12 rounded-3xl max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div className="flex flex-col items-center">
              <div className="w-12 h-12 bg-orange-100 text-orange-500 rounded-2xl flex items-center justify-center font-bold text-xl mb-3">
                🚚
              </div>
              <h4 className="font-extrabold text-gray-900">Free Express Delivery</h4>
              <p className="text-xs text-gray-500 mt-1">On all orders over $150</p>
            </div>
            <div className="flex flex-col items-center">
              <div className="w-12 h-12 bg-orange-100 text-orange-500 rounded-2xl flex items-center justify-center font-bold text-xl mb-3">
                🛡️
              </div>
              <h4 className="font-extrabold text-gray-900">100% Authentic Guarantee</h4>
              <p className="text-xs text-gray-500 mt-1">Verified directly by sneaker experts</p>
            </div>
            <div className="flex flex-col items-center">
              <div className="w-12 h-12 bg-orange-100 text-orange-500 rounded-2xl flex items-center justify-center font-bold text-xl mb-3">
                🔄
              </div>
              <h4 className="font-extrabold text-gray-900">Hassle-Free Returns</h4>
              <p className="text-xs text-gray-500 mt-1">30-day window for easy exchange</p>
            </div>
          </div>
        </div>
      </main>

      {/* Toast Notification */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 bg-gray-900 text-white px-5 py-3 rounded-xl shadow-2xl flex items-center gap-3 border border-gray-700">
          <span className="text-orange-400 font-bold">✓</span>
          <span className="text-sm font-semibold">{toast}</span>
        </div>
      )}

      <ProductModal
        product={selectedProduct}
        onClose={() => setSelectedProduct(null)}
        onAddToCart={addToCart}
      />

      <Footer />
    </div>
  );
}