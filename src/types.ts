export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  image_url?: string;
  created_at?: string;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  description?: string;
  base_price: number;
  category_id: string;
  category?: Category;
  age_category: string;
  motif: string;
  material: string;
  is_featured: boolean;
  created_at?: string;
  images?: ProductImage[];
  variants?: ProductVariant[];
}

export interface ProductVariant {
  id: string;
  product_id: string;
  color_option: string;
  size_option: string;
  stock_quantity: number;
}

export interface ProductImage {
  id: string;
  product_id: string;
  image_url: string;
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
