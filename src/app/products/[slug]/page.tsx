"use client";

import { use, useState, useEffect, useCallback } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Cart from "@/components/Cart";
import Footer from "@/components/Footer";
import { allProducts, slugify } from "@/data/products";
import { useStore } from "@/context/StoreContext";
import { createClient } from "@/lib/supabase/client";
import { toast as notify } from "react-hot-toast";
import { reviewSchema } from "@/lib/validation";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Heart,
  Info,
  LockKeyhole,
  RotateCcw,
  ShieldCheck,
  ShoppingCart,
  Star,
  Truck,
  X,
  Zap,
} from "lucide-react";

interface Review {
  id: number | string;
  user_id?: string | null;
  name: string;
  rating: number;
  size: string;
  comment: string;
  date: string;
}

export default function ProductDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const resolvedParams = use(params);
  const rawSlug = resolvedParams?.slug ? decodeURIComponent(resolvedParams.slug).trim().toLowerCase() : "";
  const { user: activeUser, userProfile, cart, wishlistIds, addToCart, toggleWishlist, updateQuantity } = useStore();
  const [supabase] = useState(() => createClient());

  const product = allProducts.find(
    (p) => slugify(p.name) === rawSlug || String(p.id) === rawSlug || p.slug === rawSlug
  );

  const [selectedSize, setSelectedSize] = useState<number | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [reviewErrors, setReviewErrors] = useState<Record<string, string>>({});
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [newReview, setNewReview] = useState({
    name: "",
    rating: 0,
    size: "",
    comment: "",
  });

  // Carousel & Touch/Swipe State
  const [currentImgIndex, setCurrentImgIndex] = useState(0);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);

  // Fallback to single image_url if images/gallery array isn't populated
  const productImages =
    (product as any)?.gallery && (product as any).gallery.length > 0
      ? (product as any).gallery
      : product?.images && product.images.length > 0
      ? product.images
      : product?.image_url
      ? [product.image_url]
      : ["/placeholder.png"];

  // Auto-slide carousel every 3.5 seconds
  useEffect(() => {
    if (productImages.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentImgIndex((prev) => (prev + 1) % productImages.length);
    }, 3500);

    return () => clearInterval(interval);
  }, [productImages]);

  // Touch Swipe Handler
  const minSwipeDistance = 50;

  const onTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    if (isLeftSwipe) {
      setCurrentImgIndex((prev) => (prev + 1) % productImages.length);
    } else if (isRightSwipe) {
      setCurrentImgIndex((prev) =>
        prev === 0 ? productImages.length - 1 : prev - 1
      );
    }
  };

  // Safe client-side mounting effect
  useEffect(() => {
    setIsMounted(true);
  }, []);

  const fetchReviews = useCallback(async () => {
    if (!product?.id) return;

    const { data, error } = await supabase
      .from("reviews")
      .select("id, product_id, user_id, user_name, rating, size, comment, created_at")
      .eq("product_id", product.id)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Failed to load product reviews:", error.message, error.details);
      return;
    }

    setReviews(
      (data || []).map((review) => ({
        id: review.id,
        user_id: review.user_id,
        name: review.user_name || "Anonymous",
        rating: Number(review.rating),
        size: review.size ? `${review.size} US` : "Not specified",
        comment: review.comment,
        date: review.created_at
          ? new Date(review.created_at).toLocaleDateString()
          : "Recently",
      }))
    );
  }, [product?.id, supabase]);

  useEffect(() => {
    fetchReviews();
  }, [fetchReviews]);

  const sizes = [7, 8, 8.5, 9, 9.5, 10, 10.5, 11, 12];

  useEffect(() => {
    if (!activeUser) return;

    const preferredSize = Number(
      userProfile?.shoe_size ??
        userProfile?.default_shoe_size ??
        activeUser.user_metadata?.shoe_size ??
        activeUser.user_metadata?.shoeSize
    );

    if (Number.isFinite(preferredSize) && sizes.includes(preferredSize)) {
      setSelectedSize(preferredSize);
    }
  }, [activeUser, userProfile]);

  if (!product) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 text-gray-900">
        <h1 className="text-2xl font-bold">Product Not Found</h1>
        <Link href="/" className="mt-4 text-orange-500 underline font-medium">
          ← Back to Catalog
        </Link>
      </div>
    );
  }

  // Related products logic
  const preferredBrands = (
    userProfile?.preferred_brands?.length
      ? userProfile.preferred_brands
      : [
          userProfile?.preferred_brand,
          userProfile?.brand_interest,
          activeUser?.user_metadata?.preferred_brand,
          activeUser?.user_metadata?.brand_interest,
        ].filter((brand): brand is string => Boolean(brand))
  ).map((brand) => brand.trim().toLowerCase());

  const relatedProducts = allProducts
    .filter(
      (p) =>
        p.id !== product.id &&
        (p.category === product.category || p.gender === product.gender)
    )
    .sort((a, b) => {
      if (preferredBrands.length === 0) return 0;

      const aBrand = (a as typeof a & { brand?: string }).brand;
      const bBrand = (b as typeof b & { brand?: string }).brand;
      const aMatches = preferredBrands.some((brand) => (a.company || aBrand || "").toLowerCase().includes(brand));
      const bMatches = preferredBrands.some((brand) => (b.company || bBrand || "").toLowerCase().includes(brand));
      return Number(bMatches) - Number(aMatches);
    })
    .slice(0, 4);

  const reviewCount = reviews.length;
  const averageRating = reviewCount
    ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviewCount
    : 0;
  const averageRatingLabel = averageRating ? averageRating.toFixed(1) : "0.0";
  const ratingBreakdown = [5, 4, 3, 2, 1].map((stars) => {
    const count = reviews.filter((review) => review.rating === stars).length;
    return {
      stars,
      count,
      percentage: reviewCount ? Math.round((count / reviewCount) * 100) : 0,
    };
  });

  const showToast = (message: string) => {
    setToast(message);
    setTimeout(() => setToast(null), 2500);
  };

  const handleOpenReview = async () => {
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      showToast("Please log in to leave a review.");
      return;
    }

    const profileName =
      userProfile?.full_name?.trim() ||
      user.user_metadata?.full_name?.trim() ||
      user.user_metadata?.display_name?.trim() ||
      user.user_metadata?.name?.trim() ||
      "";

    setNewReview((currentReview) => ({
      ...currentReview,
      name: currentReview.name.trim() || profileName,
    }));
    setIsReviewModalOpen(true);
  };

  const handleAddReview = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const validation = reviewSchema.safeParse({
      name: newReview.name,
      rating: Number(newReview.rating),
      comment: newReview.comment,
    });
    if (!validation.success) {
      setReviewErrors(Object.fromEntries(validation.error.issues.map((issue) => [String(issue.path[0]), issue.message])));
      return;
    }
    setReviewErrors({});

    if (!activeUser?.id) {
      showToast("Please sign in to submit a review.");
      return;
    }

    setIsSubmittingReview(true);
    const reviewPayload = {
      product_id: product.id,
      user_id: activeUser?.id,
      user_name: newReview.name.trim(),
      rating: Number(newReview.rating),
      size: newReview.size,
      comment: newReview.comment.trim(),
      created_at: new Date().toISOString(),
    };

    const { error } = await supabase
      .from("reviews")
      .insert(reviewPayload);

    if (error) {
      console.error("Failed to add product review:", error.message, error.details);
      showToast("Unable to submit review. Please try again.");
      setIsSubmittingReview(false);
      return;
    }

    await fetchReviews();
    setNewReview({ name: "", rating: 0, size: "", comment: "" });
    setIsSubmittingReview(false);
    setIsReviewModalOpen(false);
  };

  const handleDeleteReview = async (reviewId: number | string) => {
    const { error } = await supabase.from("reviews").delete().eq("id", reviewId);

    if (error) {
      console.error("Failed to delete product review:", error.message, error.details);
      showToast("Unable to delete review. Please try again.");
      return;
    }

    setReviews((currentReviews) => currentReviews.filter((review) => review.id !== reviewId));
  };

  const handleAddToCart = () => {
    if (!selectedSize) {
      showToast("Please select a size first!");
      return;
    }

    addToCart(product);

    notify.success("Added to Cart! 🛒");
  };

  const totalCartItems = isMounted
    ? cart.reduce((total, item) => total + item.quantity, 0)
    : 0;

  const displayWishlistCount = isMounted ? wishlistIds.length : 0;

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 flex flex-col justify-between">
      <div>
        <Navbar
          cartCount={totalCartItems}
          wishlistCount={displayWishlistCount}
          toggleCart={() => setIsCartOpen(!isCartOpen)}
          activeFilter="All"
          onFilterChange={() => {}}
        />

        <Cart
          isOpen={isCartOpen}
          onClose={() => setIsCartOpen(false)}
          items={cart}
          onUpdateQuantity={updateQuantity}
        />

        <main className="max-w-6xl mx-auto px-4 py-8">
          <Link
            href="/"
            className="text-sm font-medium text-gray-500 hover:text-black transition-colors inline-block mb-6"
          >
            ← Back to Catalog
          </Link>

          {/* Product Detail Card */}
          <div className="bg-white rounded-2xl p-6 md:p-10 shadow-sm border border-gray-200 grid grid-cols-1 md:grid-cols-2 gap-10">
            {/* Left Column: Image Gallery & Carousel */}
            <div className="flex flex-col gap-4">
              <div
                onTouchStart={onTouchStart}
                onTouchMove={onTouchMove}
                onTouchEnd={onTouchEnd}
                className="w-full h-80 md:h-[400px] lg:h-[550px] relative bg-[#f5f5f5] rounded-2xl overflow-hidden group shadow-inner select-none cursor-grab active:cursor-grabbing"
              >
                {/* Active Image */}
                <img
                  src={productImages[currentImgIndex]}
                  alt={`${product.name} preview ${currentImgIndex + 1}`}
                  className="w-full h-full object-cover transition-all duration-500 ease-in-out"
                />

                {/* Wishlist Button */}
<button
  onClick={() => toggleWishlist(product.id)}
  className="absolute top-3 right-3 bg-white/90 p-2 rounded-full shadow-md z-10 hover:scale-110 transition-transform"
>
  <Heart
    className={`h-4 w-4 transition-all ${wishlistIds.map(String).includes(String(product.id)) ? "fill-red-500 text-red-500" : "text-gray-900"}`}
    fill={wishlistIds.map(String).includes(String(product.id)) ? "currentColor" : "none"}
    strokeWidth={2}
  />
</button>

                {/* Carousel Arrows */}
                {productImages.length > 1 && (
                  <>
                    <button
                      onClick={() =>
                        setCurrentImgIndex((prev) =>
                          prev === 0 ? productImages.length - 1 : prev - 1
                        )
                      }
                      className="absolute left-3 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white backdrop-blur-md p-2.5 rounded-full shadow-md transition-all active:scale-95 z-20 opacity-0 group-hover:opacity-100"
                    >
                      <ArrowLeft className="h-5 w-5" strokeWidth={2} />
                    </button>
                    <button
                      onClick={() =>
                        setCurrentImgIndex((prev) => (prev + 1) % productImages.length)
                      }
                      className="absolute right-3 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white backdrop-blur-md p-2.5 rounded-full shadow-md transition-all active:scale-95 z-20 opacity-0 group-hover:opacity-100"
                    >
                      <ArrowRight className="h-5 w-5" strokeWidth={2} />
                    </button>

                    {/* Dots Indicator */}
                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 bg-black/30 backdrop-blur-md px-3 py-1.5 rounded-full z-20">
                      {productImages.map((_: string, idx: number) => (
                        <button
                          key={idx}
                          onClick={() => setCurrentImgIndex(idx)}
                          className={`h-2 rounded-full transition-all ${
                            currentImgIndex === idx
                              ? "w-6 bg-orange-500"
                              : "w-2 bg-white/60"
                          }`}
                        />
                      ))}
                    </div>
                  </>
                )}
              </div>

              {/* Thumbnails Row */}
              {productImages.length > 1 && (
                <div className="flex gap-3 overflow-x-auto pb-1">
                  {productImages.map((img: string, idx: number) => (
                    <button
                      key={idx}
                      onClick={() => setCurrentImgIndex(idx)}
                      className={`w-20 h-20 rounded-xl overflow-hidden border-2 flex-shrink-0 transition-all ${
                        currentImgIndex === idx
                          ? "border-orange-500 scale-95 shadow-sm"
                          : "border-transparent opacity-60 hover:opacity-100"
                      }`}
                    >
                      <img
                        src={img}
                        alt={`Thumbnail ${idx + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

  {/* Right Column: Info & Actions */}
<div className="flex flex-col justify-between gap-6">
  <div>
    <div className="flex items-center justify-between">
      <span className="text-xs font-black uppercase tracking-wider text-orange-500">
        {product.gender || product.category || "Sneakers"}
      </span>
      <div className="flex items-center gap-1 bg-gray-100 px-3 py-1 rounded-full text-xs font-bold text-gray-700">
        <span className="flex items-center gap-1"><Star className="h-3.5 w-3.5 fill-current" strokeWidth={2} /> {averageRatingLabel}</span>
        <span className="text-gray-400">({reviewCount} {reviewCount === 1 ? "review" : "reviews"})</span>
      </div>
    </div>

    <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 mt-2">
      {product.name}
    </h1>

    <div className="flex items-baseline gap-3 mt-3">
      <p className="text-3xl font-black text-black">
        ${product.price.toFixed(2)}
      </p>
      <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
        In Stock & Ready to Ship
      </span>
    </div>

    <p className="text-gray-500 mt-4 leading-relaxed text-sm">
      {product.description ||
        "Premium streetwear aesthetics combined with ultimate everyday comfort. Engineered for performance and clean everyday style."}
    </p>

    {/* Dynamic Size Selector */}
    <div className="mt-6">
      <div className="flex justify-between items-center mb-3">
        <h3 className="text-xs font-bold uppercase tracking-wider text-gray-900">
          Select Size (US)
        </h3>
        {selectedSize && (
          <span className="text-xs font-semibold text-orange-500">
            Selected: US {selectedSize}
          </span>
        )}
      </div>
      <div className="grid grid-cols-4 gap-2">
        {sizes.map((size) => (
          <button
            key={size}
            type="button"
            onClick={() => setSelectedSize(size)}
            className={`py-2.5 text-xs font-extrabold rounded-xl border transition-all ${
              selectedSize === size
                ? "bg-black text-white border-black shadow-md scale-[1.02]"
                : "bg-white text-gray-900 border-gray-200 hover:border-black"
            }`}
          >
            US {size}
          </button>
        ))}
      </div>
    </div>

    {/* Fit Guarantee Callout */}
<div className="mt-4 p-3.5 bg-gray-50 border border-gray-200 rounded-xl flex items-center gap-2.5 text-xs text-gray-700 font-medium">
  <Info className="h-4 w-4 shrink-0" strokeWidth={2} />
  <span>
    <strong className="font-bold text-gray-900">True to size.</strong> We recommend ordering your usual size.
  </span>
</div>

    {/* Fit Guarantee Callout */}
    <div className="mt-6 p-3.5 bg-gray-50 border border-gray-200 rounded-xl flex items-center gap-2.5 text-xs text-gray-700 font-medium">
      <Zap className="h-4 w-4 shrink-0" strokeWidth={2} />
      <span>
        <strong className="font-bold text-gray-900">Fast Shipping:</strong> Order in the next <span className="text-orange-600 font-bold">2 hrs 15 mins</span> to ship today.
      </span>
    </div>
  </div>

  {/* Actions & Payment Trust Badges */}
  <div className="pt-4 border-t border-gray-100 flex flex-col gap-4">
    <button
      onClick={handleAddToCart}
      className="w-full py-4 bg-orange-500 hover:bg-orange-600 text-white font-extrabold text-base rounded-2xl transition-all shadow-lg shadow-orange-500/25 active:scale-95 flex items-center justify-center gap-2"
    >
      <ShoppingCart className="h-5 w-5" strokeWidth={2} />
      <span>Add to Cart — ${(product.price).toFixed(2)}</span>
    </button>

    {/* Accepted Payment Methods */}
    <div className="flex flex-col items-center gap-2 pt-2">
      <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400">
        Guaranteed Safe & Secure Checkout
      </span>
      <div className="flex items-center justify-center gap-2 text-xs font-bold text-gray-500">
        <span className="bg-gray-100 px-2.5 py-1 rounded-md border border-gray-200">💳 Visa</span>
        <span className="bg-gray-100 px-2.5 py-1 rounded-md border border-gray-200">💳 Mastercard</span>
        <span className="bg-gray-100 px-2.5 py-1 rounded-md border border-gray-200"> Pay</span>
        <span className="bg-gray-100 px-2.5 py-1 rounded-md border border-gray-200">G Pay</span>
        <span className="bg-gray-100 px-2.5 py-1 rounded-md border border-gray-200">⚡ Stripe</span>
      </div>
    </div>
  </div>
</div>
</div>

{/* Accordion Specs Section */}
<div className="mt-8 border-b border-gray-100 pb-6 space-y-4">
  <details className="group border-b border-gray-100 pb-4 cursor-pointer">
    <summary className="flex justify-between items-center font-bold text-sm text-gray-900 list-none">
      <span>Product Highlights & Specs</span>
      <span className="transition group-open:rotate-180">▾</span>
    </summary>
    <ul className="mt-3 text-xs text-gray-600 space-y-2 list-disc list-inside leading-relaxed">
      <li>Premium full-grain leather upper with fine suede accents for long-lasting durability.</li>
      <li>Precision-engineered EVA midsole providing high-impact cushioning and lightweight comfort.</li>
      <li>High-traction non-marking rubber outsole designed for multi-surface grip and stability.</li>
      <li>Breathable moisture-wicking lining and padded collar for all-day wearability.</li>
      <li>Includes secondary contrast laces and collector-grade original brand packaging.</li>
    </ul>
  </details>

  <details className="group border-b border-gray-100 pb-4 cursor-pointer">
    <summary className="flex justify-between items-center font-bold text-sm text-gray-900 list-none">
      <span>Authenticity & Quality Guarantee</span>
      <span className="transition group-open:rotate-180">▾</span>
    </summary>
    <p className="mt-3 text-xs text-gray-600 leading-relaxed">
      Every pair in the Vault undergoes a detailed 12-point physical verification check by our expert authentication team before dispatch. We inspect stitch density, material texture, factory codes, and packaging details. Guaranteed 100% authentic, or receive 2x your money back.
    </p>
  </details>

  <details className="group border-b border-gray-100 pb-4 cursor-pointer">
    <summary className="flex justify-between items-center font-bold text-sm text-gray-900 list-none">
      <span>Shipping & Returns</span>
      <span className="transition group-open:rotate-180">▾</span>
    </summary>
    <p className="mt-3 text-xs text-gray-600 leading-relaxed">
      Standard domestic delivery takes 3–5 business days. Express overnight shipping options are calculated at checkout. Enjoy 30-day hassle-free returns and exchanges on unworn items returned with original tags and packaging intact.
    </p>
  </details>
</div>

{/* Customer Reviews Spotlight */}
{/* Customer Reviews Spotlight */}
<div className="mt-12 bg-white rounded-2xl p-6 border border-gray-200 shadow-sm space-y-6">
  {/* Header & Rating Overview */}
  <div className="flex flex-col md:flex-row md:items-center justify-between pb-6 border-b border-gray-100 gap-4">
    <div>
      <div className="flex items-center gap-2">
        <h3 className="font-extrabold text-xl text-gray-900">Verified Buyer Reviews</h3>
        <span className="bg-emerald-50 text-emerald-700 font-semibold text-[10px] px-2.5 py-0.5 rounded-full border border-emerald-200">
          ✓ Verified Purchases
        </span>
      </div>
      <p className="text-xs text-gray-500 mt-1">
        {reviewCount ? `${averageRatingLabel} out of 5 stars • Based on ${reviewCount} customer ${reviewCount === 1 ? "review" : "reviews"}` : "No reviews yet"}
      </p>
    </div>

    <div className="flex items-center gap-3">
      <span className="bg-orange-50 text-orange-600 font-bold text-xs px-3.5 py-2 rounded-full border border-orange-200">
        98% Fit Satisfaction Rate
      </span>
      <button
        onClick={handleOpenReview}
        className="bg-gray-900 hover:bg-gray-800 text-white font-bold text-xs px-4 py-2 rounded-full transition"
      >
        Write a Review
      </button>
    </div>
  </div>

  {/* Rating Breakdown Bar */}
  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 bg-gray-50 p-4 rounded-xl text-xs">
    <div className="flex flex-col justify-center items-center md:border-r md:border-gray-200 pr-4">
      <span className="text-4xl font-black text-gray-900">{averageRatingLabel}</span>
        <span className="flex gap-0.5 text-orange-500 mt-1" aria-label={`${averageRatingLabel} star rating`}>
          {Array.from({ length: 5 }).map((_, index) => <Star key={index} className={`h-4 w-4 ${index < Math.round(averageRating) ? "fill-current" : ""}`} strokeWidth={2} />)}
        </span>
      <span className="text-gray-500 text-[11px] mt-0.5">Overall Customer Rating</span>
    </div>

    <div className="col-span-2 space-y-1.5 justify-center flex flex-col">
      {ratingBreakdown.map((row) => (
        <div key={row.stars} className="flex items-center gap-2">
          <span className="w-5 text-gray-600 font-semibold text-[11px]">{row.stars}★</span>
          <div className="flex-1 bg-gray-200 h-2 rounded-full overflow-hidden">
            <div className="bg-orange-500 h-full rounded-full" style={{ width: `${row.percentage}%` }} />
          </div>
          <span className="w-6 text-right text-gray-400 text-[10px]">{row.count}</span>
        </div>
      ))}
    </div>
  </div>

  {/* Review Cards Grid */}
  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
    {reviewCount === 0 ? (
      <p className="md:col-span-2 py-8 text-center text-sm text-gray-500">No reviews yet. Be the first to review this product.</p>
    ) : reviews.map((review) => (
      <div key={review.id} className="p-4 bg-gray-50/70 border border-gray-100 rounded-xl text-xs space-y-2">
        <div className="flex justify-between items-center">
          <div>
            <span className="font-bold text-gray-900 block">{review.name}</span>
            <span className="text-[10px] text-emerald-600 font-medium">Verified Buyer</span>
          </div>
          <div className="text-right">
            <span className="flex justify-end gap-0.5 text-orange-500" aria-label={`${review.rating} star rating`}>
              {Array.from({ length: review.rating }).map((_, index) => <Star key={index} className="h-3 w-3 fill-current" strokeWidth={2} />)}
            </span>
            <span className="text-[10px] text-gray-400">{review.date}</span>
          </div>
        </div>
        <p className="text-gray-600 leading-relaxed">"{review.comment}"</p>
        <div className="pt-2 flex items-center justify-between text-[11px] text-gray-400 border-t border-gray-200/50">
          <span>Size Purchased: {review.size}</span>
          <div className="flex items-center gap-3">
            <button className="hover:text-gray-600 font-medium">Helpful</button>
            {review.user_id === activeUser?.id && (
              <button
                type="button"
                onClick={() => handleDeleteReview(review.id)}
                className="font-medium text-red-500 hover:text-red-700"
              >
                Delete
              </button>
            )}
          </div>
        </div>
      </div>
    ))}
  </div>
</div>

          {/* Related Products Grid */}
          {relatedProducts.length > 0 && (
            <div className="mt-16">
              <h2 className="text-2xl font-black text-gray-900 mb-6">
                You Might Also Like 🔥
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
                {relatedProducts.map((rel) => (
                  <Link
                    key={rel.id}
                    href={`/products/${slugify(rel.name)}`}
                    className="bg-white rounded-2xl p-4 shadow-sm border border-gray-200 hover:shadow-md transition-all group block"
                  >
                    <div className="w-full h-48 relative rounded-xl overflow-hidden bg-gray-100 mb-3">
                      <img
                        src={rel.image_url || "/placeholder.png"}
                        alt={rel.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                    <span className="text-[10px] uppercase font-bold text-orange-500">
                      {rel.gender || rel.category}
                    </span>
                    <h3 className="font-bold text-gray-900 text-sm mt-1 line-clamp-1">
                      {rel.name}
                    </h3>
                    <p className="text-black font-extrabold text-sm mt-1">
                      ${rel.price.toFixed(2)}
                    </p>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </main>
      </div>

      {isReviewModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-gray-100 pb-4">
              <h2 className="text-xl font-extrabold text-gray-900">Write a Review</h2>
              <button
                type="button"
                onClick={() => setIsReviewModalOpen(false)}
                className="text-xl font-bold text-gray-400 hover:text-gray-900"
                aria-label="Close review form"
              >
                <X className="h-5 w-5" strokeWidth={2} />
              </button>
            </div>

            <form onSubmit={handleAddReview} className="mt-5 space-y-4">
              <label className="block text-xs font-bold text-gray-700">
                Name
                <input
                  required
                  value={newReview.name}
                  onChange={(event) => setNewReview({ ...newReview, name: event.target.value })}
                  className="mt-1 w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm font-normal text-gray-900 outline-none focus:border-orange-500"
                  placeholder="Your name"
                />
                  {reviewErrors.name && <p className="mt-1 text-xs text-red-500">{reviewErrors.name}</p>}
              </label>

              <fieldset>
                <legend className="text-xs font-bold text-gray-700">Rating</legend>
                <div className="mt-2 flex gap-2">
                  {[1, 2, 3, 4, 5].map((rating) => (
                    <button
                      key={rating}
                      type="button"
                      onClick={() => setNewReview({ ...newReview, rating })}
                      className={`text-2xl ${rating <= newReview.rating ? "text-orange-500" : "text-gray-300"}`}
                      aria-label={`${rating} star${rating === 1 ? "" : "s"}`}
                    >
                      <Star className="h-6 w-6 fill-current" strokeWidth={2} />
                    </button>
                  ))}
                </div>
                {reviewErrors.rating && <p className="mt-1 text-xs text-red-500">{reviewErrors.rating}</p>}
              </fieldset>

              <label className="block text-xs font-bold text-gray-700">
                Size Purchased
                <select
                  required
                  value={newReview.size}
                  onChange={(event) => setNewReview({ ...newReview, size: event.target.value })}
                  className="mt-1 w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm font-normal text-gray-900 outline-none focus:border-orange-500"
                >
                  <option value="" disabled>Select a size</option>
                  {sizes.map((size) => <option key={size} value={size}>{size}</option>)}
                </select>
              </label>

              <label className="block text-xs font-bold text-gray-700">
                Review
                <textarea
                  required
                  rows={4}
                  value={newReview.comment}
                  onChange={(event) => setNewReview({ ...newReview, comment: event.target.value })}
                  className="mt-1 w-full resize-none rounded-xl border border-gray-200 px-3 py-2.5 text-sm font-normal text-gray-900 outline-none focus:border-orange-500"
                  placeholder="Tell us about the fit and quality"
                />
                {reviewErrors.comment && <p className="mt-1 text-xs text-red-500">{reviewErrors.comment}</p>}
              </label>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsReviewModalOpen(false)}
                  className="rounded-xl border border-gray-200 px-4 py-2.5 text-xs font-bold text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingReview}
                  className="rounded-xl bg-orange-500 px-4 py-2.5 text-xs font-bold text-white hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {isSubmittingReview ? "Submitting..." : "Submit Review"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {toast && (
        <div className="fixed bottom-6 right-6 z-50 bg-gray-900 text-white px-5 py-3 rounded-xl shadow-2xl flex items-center gap-3 border border-gray-700">
          <span className="text-orange-400 font-bold">✓</span>
          <span className="text-sm font-semibold">{toast}</span>
          {toast === "Please log in to leave a review." && (
            <Link href="/login" className="text-sm font-bold text-orange-400 hover:text-orange-300 underline">
              Log in
            </Link>
          )}
        </div>
      )}

                        {/* Value Proposition Grid */}
      <section className="max-w-7xl mx-auto px-4 w-full">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 my-6 sm:my-12">
          {[
            { icon: Truck, title: "Free Worldwide Shipping", desc: "On all orders over $150" },
            { icon: ShieldCheck, title: "100% Verified Authentic", desc: "Every item hand-checked by experts" },
            { icon: RotateCcw, title: "30-Day Easy Returns", desc: "Hassle-free exchanges & refunds" },
            { icon: LockKeyhole, title: "Encrypted Checkout", desc: "Bank-level secure payments" },
          ].map((feature, idx) => (
            <div
              key={idx}
              className="bg-white p-5 sm:p-6 rounded-2xl border border-gray-200 shadow-sm flex items-start gap-4"
            >
              <feature.icon className="h-6 w-6 sm:h-7 sm:w-7 shrink-0 text-orange-500" strokeWidth={2} />
              <div>
                <h4 className="font-bold text-gray-900 text-xs sm:text-sm">{feature.title}</h4>
                <p className="text-gray-500 text-[11px] sm:text-xs mt-1">{feature.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <Footer />
    </div>
  );
}