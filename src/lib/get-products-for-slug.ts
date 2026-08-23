import { allProducts } from "@/data/products";

export const getProductsForSlug = (slug: string) => {
  if (slug === "all") return allProducts;

  return allProducts.filter((p) => {
    const company = (p.company || "").toLowerCase();
    const category = (p.category || "").toLowerCase();
    const brand = ((p as any).brand || "").toLowerCase();
    const name = (p.name || "").toLowerCase();

    // Brand Specific Strict Filtering
    if (slug === "balenciaga") return company.includes("balenciaga") || brand.includes("balenciaga") || name.includes("balenciaga");
    if (slug === "nike") return company.includes("nike") || brand.includes("nike") || name.includes("nike");
    if (slug === "jordan") return company.includes("jordan") || brand.includes("jordan") || name.includes("jordan");
    if (slug === "adidas") return company.includes("adidas") || brand.includes("adidas") || name.includes("adidas");
    if (slug === "new-balance") return company.includes("new balance") || brand.includes("new balance") || name.includes("new balance");
    if (slug === "vans") return company.includes("vans") || brand.includes("vans") || name.includes("vans");
    if (slug === "yeezy") return company.includes("yeezy") || brand.includes("yeezy") || name.includes("yeezy");
    if (slug === "puma") return company.includes("puma") || brand.includes("puma") || name.includes("puma");
    if (slug === "asics") return company.includes("asics") || brand.includes("asics") || name.includes("asics");

    // Performance & Sport
    if (slug === "basketball") return category.includes("basketball") || name.includes("jordan") || name.includes("dunk") || name.includes("kobe") || name.includes("lebron");
    if (slug === "football") return category.includes("football") || category.includes("soccer") || name.includes("cleat") || name.includes("boot") || name.includes("jersey") || name.includes("predator") || name.includes("mercurial") || name.includes("phantom");
    if (slug === "running") return category.includes("running") || name.includes("runner") || name.includes("pegasus") || name.includes("boost") || name.includes("vomero");
    if (slug === "skateboarding") return category.includes("skate") || company.includes("vans") || name.includes("sb") || name.includes("suede");
    if (slug === "training") return category.includes("training") || category.includes("gym") || name.includes("metcon") || name.includes("trainer");
    if (slug === "outdoor") return category.includes("outdoor") || category.includes("trail") || name.includes("gore-tex") || name.includes("terrex");

    // Streetwear & Culture
    if (slug === "streetwear") return category.includes("streetwear") || name.includes("travis") || name.includes("off-white") || name.includes("supreme");
    if (slug === "retro") return category.includes("retro") || name.includes("og") || name.includes("1985") || name.includes("88") || name.includes("77");
    if (slug === "luxury") return category.includes("luxury") || company.includes("balenciaga") || brand.includes("balenciaga") || name.includes("balenciaga") || name.includes("gucci");
    if (slug === "slides") return category.includes("foam") || category.includes("slide") || name.includes("slide") || name.includes("foam");
    if (slug === "apparel") return category.includes("apparel") || category.includes("clothing") || name.includes("hoodie") || name.includes("jacket");

    return company === slug || brand === slug || category === slug || name.includes(slug);
  });
};