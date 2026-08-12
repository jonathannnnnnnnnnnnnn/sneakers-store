import { Product } from "@/types/product";

// Array of unique sneaker image URLs from Unsplash
const SNEAKER_IMAGES = [
  "https://images.unsplash.com/photo-1552346154-21d32810aba3?w=800&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1584735935682-2f2b69dff9d2?w=800&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1608231387042-66d1773070a5?w=800&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1539185441755-769473a23570?w=800&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?w=800&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1600185365483-26d7a4cc7519?w=800&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=800&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1582588678413-dbf45f4823e9?w=800&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1607522370275-f14206abe5d3?w=800&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1515955656352-a1fa3ffcd111?w=800&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1560769629-975ec94e6a86?w=800&auto=format&fit=crop",
];

const categories = ["Men", "Women", "Collections", "Accessories"];
const genders = ["Men", "Women", "Unisex"];
const brands = ["SNEAKER COMPANY", "NIKE", "ADIDAS", "PUMA", "NEW BALANCE"];
const styles = [
  "Retro High",
  "Air Max Speed",
  "Ultraboost Lite",
  "RS-X Bold",
  "550 Vintage",
  "Streetwear Flex",
  "Pro Runner",
  "Court Classic",
];

export const allProducts: Product[] = Array.from({ length: 48 }, (_, index) => {
  const id = (index + 1).toString();
  const brand = brands[index % brands.length];
  const category = categories[index % categories.length];
  const gender = genders[index % genders.length];
  const style = styles[index % styles.length];

  const price = 55 + ((index * 13) % 165);
  const discount = index % 3 === 0 ? 50 : index % 2 === 0 ? 20 : 0;
  const originalPrice = discount > 0 ? Math.round(price / (1 - discount / 100)) : price;

  // Cycles cleanly through 12 different real sneaker photos
  const imageUrl = SNEAKER_IMAGES[index % SNEAKER_IMAGES.length];

  return {
    id,
    company: brand,
    name: `${brand} ${style} Edition ${id}`,
    description: `High-performance athletic footwear designed for daily wear, extreme comfort, and maximum durability. Perfect for ${category.toLowerCase()}.`,
    price,
    discount,
    originalPrice,
    image_url: imageUrl,
    category,
    gender,
    images: [imageUrl],
    thumbnails: [imageUrl],
  };
});