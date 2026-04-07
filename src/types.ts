export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  description?: string;
  base_price: number;
  category_id?: string;
  is_featured: boolean;
  created_at?: string;
  category?: Category;
  images?: ProductImage[];
  variants?: Variant[];
}

export interface Variant {
  id: string;
  product_id: string;
  size?: string;
  color?: string;
  stock: number;
  price_override?: number;
  sku?: string;
}

export interface ProductImage {
  id: string;
  product_id: string;
  url: string;
  alt_text?: string;
  is_primary: boolean;
  display_order: number;
}

export interface SizeGuide {
  id: string;
  category: string;
  measurements: {
    size: string;
    chest: string;
    length: string;
    sleeve: string;
    waist?: string;
  }[];
}

export interface CartItem {
  id: string;
  name: string;
  price: number;
  image: string;
  variantId: string;
  selectedSize: string;
  selectedColor: string;
  quantity: number;
}
