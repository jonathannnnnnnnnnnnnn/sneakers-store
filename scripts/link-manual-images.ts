import * as fs from "fs";
import * as path from "path";

// Adjust path if your products.json lives somewhere else
const jsonFilePath = path.join(process.cwd(), "src", "data", "products.json");

function updateCatalogImages() {
  try {
    // Read the current products.json file
    const rawData = fs.readFileSync(jsonFilePath, "utf-8");
    const products = JSON.parse(rawData);

    let updatedCount = 0;

    const updatedProducts = products.map((item: any) => {
      // Path to the local folder for this product ID
      const itemFolder = path.join(
        process.cwd(),
        "public",
        "images",
        "products",
        String(item.id)
      );

      // Check if the folder exists and actually contains image 1.jpg
      const mainImageExists = fs.existsSync(path.join(itemFolder, "1.jpg"));

      if (mainImageExists) {
        updatedCount++;

        const mainImagePath = `/images/products/${item.id}/1.jpg`;
        const galleryPaths = [
          `/images/products/${item.id}/1.jpg`,
          `/images/products/${item.id}/2.jpg`,
          `/images/products/${item.id}/3.jpg`,
        ];

        // Replace remote stock image links with local path routes
        return {
          ...item,
          image_url: mainImagePath,
          images: galleryPaths,
          gallery: galleryPaths,
        };
      }

      // If no local images exist for this ID yet, keep the existing entry intact
      return item;
    });

    // Write updated JSON data back to file
    fs.writeFileSync(jsonFilePath, JSON.stringify(updatedProducts, null, 2));

    console.log(`\n✅ Catalog update complete!`);
    console.log(`🔄 Linked local manual images for ${updatedCount} products.`);
  } catch (error) {
    console.error("❌ Error updating catalog JSON:", error);
  }
}

updateCatalogImages();