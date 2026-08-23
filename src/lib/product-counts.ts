import { getProductsForSlug } from "@/lib/get-products-for-slug";

const categories = [
  "basketball",
  "football",
  "running",
  "skateboarding",
  "training",
  "outdoor",
  "streetwear",
  "retro",
  "luxury",
  "slides",
  "apparel",
  "accessories",
];

const brands = [
  "nike",
  "jordan",
  "adidas",
  "new-balance",
  "vans",
  "yeezy",
  "puma",
  "asics",
  "balenciaga",
];

export function getProductCounts() {
  const categoryCounts: Record<string, number> = {};
  const brandCounts: Record<string, number> = {};

  categories.forEach((slug) => {
    categoryCounts[slug] = getProductsForSlug(slug).length;
  });

  brands.forEach((slug) => {
    // Keeps the key format consistent for brand lookups (e.g., "new balance")
    const brandKey = slug.replace("-", " ");
    brandCounts[slug] = getProductsForSlug(slug).length;
    brandCounts[brandKey] = getProductsForSlug(slug).length;
  });

  return { categoryCounts, brandCounts };
}

export const { categoryCounts: CATEGORY_COUNTS, brandCounts: BRAND_COUNTS } =
  getProductCounts();