// src/data/products.ts

export interface Product {
  id: string;
  name: string;
  price: number;
  image_url: string;
  images?: string[];
  gallery?: string[];
  description?: string;
  category: string;
  gender: string;
  rating: number;
  company: string;
  isTrending?: boolean;
}

// Direct keyword-based image pools so high heels NEVER show up again!
const CATEGORY_KEYWORDS: Record<string, string> = {
  Basketball: "basketball-shoes,sneakers",
  Running: "running-shoes,sneakers",
  Streetwear: "streetwear-sneakers,kicks",
  Skateboarding: "skate-shoes,vans-sneakers",
  Retro: "vintage-sneakers,retro-kicks"
};

// Generates reliable sneaker images based on explicit search terms
const getUrl = (keyword: string, seed: string) =>
  `https://source.unsplash.com/featured/800x800/?${keyword}&sig=${seed}`;

// Backup curated reliable image IDs just in case
const FALLBACK_IMAGES: Record<string, string[]> = {
  Basketball: ["1542291026-7eec264c27ff", "1512374382149-233c42b6a83b", "1575537302964-96cd47c06b1b"],
  Running: ["1595950653106-6c9ebd614d3a", "1584735935682-2f2b69dff9d2", "1539185441755-769473a23570"],
  Streetwear: ["1600185365483-26d7a4cc7519", "1552346154-21d32810aba3", "1515955656352-a1fa3ffcd111"],
  Skateboarding: ["1525966222134-fcfa99b8ae77", "1562183241-b937e95585b6", "1584735175097-719d8b518456"],
  Retro: ["1582588678413-dbf45f4823e9", "1514989940723-e8e51635b782", "1597045566677-8cf032ed6634"]
};

const CATEGORIES = ["Basketball", "Running", "Streetwear", "Skateboarding", "Retro"];

const BRANDS: Record<string, string[]> = {
  Basketball: ["Nike", "Jordan", "Adidas"],
  Running: ["Asics", "New Balance", "Nike", "Puma"],
  Streetwear: ["Nike", "Adidas", "New Balance"],
  Skateboarding: ["Vans", "Nike SB", "Adidas"],
  Retro: ["Jordan", "Reebok", "Puma"]
};

const MODEL_NAMES: Record<string, string[]> = {
  Basketball: ["Air Zoom", "LeBron Elite", "Court Vision", "Dunk High"],
  Running: ["Pegasus Ultra", "Gel Nimbus", "FuelCell Pro", "Ultraboost"],
  Streetwear: ["Air Force 1", "Forum Low", "550 Classic", "Samba OG"],
  Skateboarding: ["Old Skool", "SB Dunk Low", "Campus 80s", "Authentic Suede"],
  Retro: ["Club C 85", "Jordan 1 Retro", "RS-X 1998", "574 Legacy"]
};

export const allProducts: Product[] = Array.from({ length: 120 }, (_, index) => {
  const id = (index + 1).toString();
  
  const category = CATEGORIES[index % CATEGORIES.length];
  const brandList = BRANDS[category];
  const company = brandList[index % brandList.length];
  
  const modelList = MODEL_NAMES[category];
  const modelName = modelList[index % modelList.length];

  const pool = FALLBACK_IMAGES[category] || FALLBACK_IMAGES.Streetwear;
  const photoId1 = pool[index % pool.length];
  const photoId2 = pool[(index + 1) % pool.length];

  // Guaranteed sneaker photo URLs
  const img1 = `https://images.unsplash.com/photo-${photoId1}?auto=format&fit=crop&q=80&w=800`;
  const img2 = `https://images.unsplash.com/photo-${photoId2}?auto=format&fit=crop&q=80&w=800`;
  const gallery = [img1, img2];

  return {
    id,
    name: `${company} ${modelName} '0${(index % 9) + 1}'`,
    price: Math.floor(90 + ((index * 13) % 170)) + 0.99,
    image_url: img1,
    images: gallery,
    gallery: gallery,
    description: `Engineered performance meets high-street design. Built specifically for ${category.toLowerCase()} performance and daily rotation.`,
    category,
    gender: index % 3 === 0 ? "Men" : index % 3 === 1 ? "Women" : "Unisex",
    rating: Number((4.1 + ((index * 2) % 9) / 10).toFixed(1)),
    company,
    isTrending: index < 12
  };
});