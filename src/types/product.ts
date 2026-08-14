// export interface Product {
//   id: string;
//   name: string;
//   company: string;
//   description: string;
//   price: number;
//   discount: number;
//   originalPrice: number;
//   images: string[];
//   thumbnails: string[];
// }

export interface Product {
  id: string;
  name: string;
  price: number;
  company?: string;
  description?: string;
  discount?: number;
  originalPrice?: number;
  image_url: string;
  category: string;
  gender: string;
  images: string[];
  thumbnails?: string[];
  brand?: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
}