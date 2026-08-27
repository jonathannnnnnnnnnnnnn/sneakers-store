const fs = require("node:fs");
const path = require("node:path");
const { createClient } = require("@supabase/supabase-js");

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error(
    "Missing NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY or NEXT_PUBLIC_SUPABASE_ANON_KEY"
  );
}

const catalogPath = path.join(process.cwd(), "src", "data", "products.json");
const catalog = JSON.parse(fs.readFileSync(catalogPath, "utf8"));
const supabase = createClient(supabaseUrl, supabaseKey);

const products = catalog.map((product) => {
  const images = Array.isArray(product.images) && product.images.length > 0
    ? product.images
    : [product.image_url];

  return {
    id: String(product.id),
    name: product.name,
    company: product.company,
    category: product.category,
    gender: product.gender,
    price: Number(product.price),
    description: product.description || null,
    image_url: images[0],
    images,
    gallery: Array.isArray(product.gallery) && product.gallery.length > 0
      ? product.gallery
      : images,
    rating: Number(product.rating || 0),
    isTrending: Boolean(product.isTrending),
  };
});

async function seedProducts() {
  console.log(`Seeding ${products.length} products into Supabase...`);

  const row = { ...products[0] };
  const omittedColumns = [];

  while (true) {
    const { error } = await supabase
      .from("products")
      .upsert(products.map((product) => {
        const filteredProduct = { ...product };
        omittedColumns.forEach((column) => delete filteredProduct[column]);
        return filteredProduct;
      }), { onConflict: "id" });

    if (!error) break;

    const missingColumn = error.message.match(/Could not find the '([^']+)' column/);
    if (missingColumn && Object.hasOwn(row, missingColumn[1])) {
      omittedColumns.push(missingColumn[1]);
      console.warn(`Skipping unavailable products.${missingColumn[1]} column.`);
      continue;
    }

    throw new Error(
      `Supabase ${error.code || "error"}: ${error.message}` +
      `${error.details ? ` Details: ${error.details}` : ""}` +
      `${error.hint ? ` Hint: ${error.hint}` : ""}`
    );
  }

  console.log(`Seed complete: ${products.length} products upserted.`);
}

seedProducts().catch((error) => {
  console.error("Product seed failed:", error.message);
  process.exitCode = 1;
});
