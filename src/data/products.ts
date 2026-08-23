// src/data/products.ts
import rawProducts from "./products.json";

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

// 15 Categories matching all mega menu routes, filters, and ALL 9 BRANDS
export const CATEGORIES = [
  "Basketball",
  "Football",
  "Running",
  "Streetwear",
  "Skateboarding",
  "Retro",
  "Training",
  "Outdoor",
  "Luxury",
  "Slides",
  "Apparel",
  "Nike",
  "Jordan",
  "Adidas",
  "New Balance",
  "Vans",
  "Yeezy",
  "Puma",
  "Asics",
  "Balenciaga",
];

// Curated high-res Unsplash image pools for multi-angle generation
export const FALLBACK_IMAGES: Record<string, string[]> = {
  Basketball: [
    "1542291026-7eec264c27ff",
    "1512374382149-233c42b6a83b",
    "1575537302964-96cd47c06b1b",
    "1608231387042-66d1773070a5",
  ],
  Football: [
    "1511886929837-354d827aae26",
    "1542291026-7eec264c27ff",
    "1606107557195-0e29a4b5b4aa",
    "1549298916-b41d501d3772",
  ],
  Running: [
    "1595950653106-6c9ebd614d3a",
    "1584735935682-2f2b69dff9d2",
    "1539185441755-769473a23570",
    "1460353581641-37babbab0fa6",
  ],
  Streetwear: [
    "1600185365483-26d7a4cc7519",
    "1552346154-21d32810aba3",
    "1515955656352-a1fa3ffcd111",
    "1582588678413-dbf45f4823e9",
  ],
  Skateboarding: [
    "1525966222134-fcfa99b8ae77",
    "1562183241-b937e95585b6",
    "1584735175097-719d8b518456",
    "1514989940723-e8e51635b782",
  ],
  Retro: [
    "1582588678413-dbf45f4823e9",
    "1514989940723-e8e51635b782",
    "1597045566677-8cf032ed6634",
    "1600185365483-26d7a4cc7519",
  ],
  Training: [
    "1460353581641-37babbab0fa6",
    "1517838277536-f5f99be501cd",
    "1584735935682-2f2b69dff9d2",
    "1595950653106-6c9ebd614d3a",
  ],
  Outdoor: [
    "1539185441755-769473a23570",
    "1551107696-a4b0c5a0d9a2",
    "1584735935682-2f2b69dff9d2",
    "1525966222134-fcfa99b8ae77",
  ],
  Luxury: [
    "1542291026-7eec264c27ff",
    "1608231387042-66d1773070a5",
    "1560769629-975ec94e6a86",
    "1600185365483-26d7a4cc7519",
  ],
  Slides: [
    "1603808033192-082d6919d3e1",
    "1595950653106-6c9ebd614d3a",
    "1562183241-b937e95585b6",
    "1552346154-21d32810aba3",
  ],
  Apparel: [
    "1556905055-8f358a7a47b2",
    "1521572267360-ee0c2909d518",
    "1503342217505-b0a15ec3261c",
    "1509631179647-0177331693ae",
  ],
  Nike: [
    "1542291026-7eec264c27ff",
    "1595950653106-6c9ebd614d3a",
    "1600185365483-26d7a4cc7519",
    "1552346154-21d32810aba3",
  ],
  Jordan: [
    "1512374382149-233c42b6a83b",
    "1582588678413-dbf45f4823e9",
    "1515955656352-a1fa3ffcd111",
    "1575537302964-96cd47c06b1b",
  ],
  Adidas: [
    "1584735935682-2f2b69dff9d2",
    "1600185365483-26d7a4cc7519",
    "1517838277536-f5f99be501cd",
    "1562183241-b937e95585b6",
  ],
  "New Balance": [
    "1539185441755-769473a23570",
    "1584735935682-2f2b69dff9d2",
    "1552346154-21d32810aba3",
    "1595950653106-6c9ebd614d3a",
  ],
  Vans: [
    "1525966222134-fcfa99b8ae77",
    "1562183241-b937e95585b6",
    "1584735175097-719d8b518456",
    "1514989940723-e8e51635b782",
  ],
  Yeezy: [
    "1603808033192-082d6919d3e1",
    "1600185365483-26d7a4cc7519",
    "1582588678413-dbf45f4823e9",
    "1595950653106-6c9ebd614d3a",
  ],
  Puma: [
    "1584735935682-2f2b69dff9d2",
    "1512374382149-233c42b6a83b",
    "1597045566677-8cf032ed6634",
    "1539185441755-769473a23570",
  ],
  Asics: [
    "1595950653106-6c9ebd614d3a",
    "1539185441755-769473a23570",
    "1584735935682-2f2b69dff9d2",
    "1460353581641-37babbab0fa6",
  ],
  Balenciaga: [
    "1542291026-7eec264c27ff",
    "1608231387042-66d1773070a5",
    "1560769629-975ec94e6a86",
    "1600185365483-26d7a4cc7519",
  ],
};

export const BRANDS: Record<string, string[]> = {
  Basketball: ["Nike", "Jordan", "Adidas"],
  Football: ["Nike", "Adidas", "Puma", "New Balance", "Mizuno"],
  Running: ["Asics", "New Balance", "Nike", "Puma"],
  Streetwear: ["Nike", "Adidas", "New Balance"],
  Skateboarding: ["Vans", "Nike", "Adidas"],
  Retro: ["Jordan", "Nike", "Puma"],
  Training: ["Nike", "Adidas", "Puma"],
  Outdoor: ["New Balance", "Nike", "Adidas"],
  Luxury: ["Balenciaga", "Nike", "Adidas"],
  Slides: ["Yeezy", "Nike", "Adidas"],
  Apparel: ["Nike", "Jordan", "Adidas"],
  Nike: ["Nike"],
  Jordan: ["Jordan"],
  Adidas: ["Adidas"],
  "New Balance": ["New Balance"],
  Vans: ["Vans"],
  Yeezy: ["Yeezy"],
  Puma: ["Puma"],
  Asics: ["Asics"],
  Balenciaga: ["Balenciaga"],
};

export const MODEL_NAMES: Record<string, string[]> = {
  Basketball: ["Air Zoom", "LeBron Elite", "Court Vision", "Dunk High"],
  Football: ["Mercurial Superfly", "Predator Elite", "Phantom Luna", "Future Ultimate"],
  Running: ["Pegasus Ultra", "Gel Nimbus", "FuelCell Pro", "Ultraboost"],
  Streetwear: ["Air Force 1", "Forum Low", "550 Classic", "Samba OG"],
  Skateboarding: ["Old Skool", "SB Dunk Low", "Campus 80s", "Authentic Suede"],
  Retro: ["Club C 85", "Jordan 1 Retro", "RS-X 1998", "574 Legacy"],
  Training: ["Metcon 9", "Nano X3", "Dropset Trainer", "Tribase Reign"],
  Outdoor: ["XT-6 GORE-TEX", "Pegasus Trail 4", "Terrex Free Hiker", "Ultra Raptor"],
  Luxury: ["Defender Chunky", "Gazelle Velvet", "Out of Office", "Triple S"],
  Slides: ["Foam Runner Onyx", "Calm Slide Black", "Adilette 22", "Yeezy Slide Pure"],
  Apparel: ["Heavyweight Hoodie", "Oversized Tee", "Cargo Track Pants", "Fleece Zip-Up"],
  Nike: ["Dunk Low Retro", "Air Max 90", "Vomero 5", "Air Force 1 '07"],
  Jordan: ["Air Jordan 1 High OG", "Air Jordan 4 Retro", "Air Jordan 3 Cement", "Jordan 11 Concord"],
  Adidas: ["Samba OG", "Gazelle Indoor", "Campus 00s", "Ultraboost Light"],
  "New Balance": ["9060 Classic", "2002R Protection Pack", "550 White/Green", "990v6 Made in USA"],
  Vans: ["Old Skool Core", "Sk8-Hi Tapered", "Authentic Canvas", "Knu Skool Black"],
  Yeezy: ["Boost 350 V2 Onyx", "Foam Runner Vermillion", "700 V2 Static", "Slide Bone"],
  Puma: ["Suede Classic", "RS-X Efekt", "Palermo Special", "Cali Star"],
  Asics: ["Gel-Kayano 14", "Gel-NYC", "GT-2160", "Gel-1130"],
  Balenciaga: ["Triple S Clear Sole", "Track Sneaker", "Defender Chunky", "Speed 2.0"],
};

// Connect directly to the generated products.json file
export const allProducts: Product[] = (rawProducts as any[]).map((item, index) => {
  const images = item.images && item.images.length > 0 ? item.images : [item.image_url];
  return {
    ...item,
    image_url: images[0],
    images: images,
    gallery: images,
    rating: item.rating || Number((4.1 + ((index * 2) % 9) / 10).toFixed(1)),
    isTrending: item.isTrending ?? (index % 3 === 0 || index < 15),
  };
});