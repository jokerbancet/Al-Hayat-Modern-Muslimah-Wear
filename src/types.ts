export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  image_url?: string;
  created_at?: string;
  product_count?: number;
}

export interface HeroBanner {
  id: string;
  image_url: string;
  display_order: number;
  is_active: boolean;
  main_title: string;
  sub_title: string;
  button_text: string;
  button_link: string;
  show_button: boolean;
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
  color_swatch_url: string;
  size_option: string;
  stock_quantity: number;
  color_hex?: string;    // For backward compatibility
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
  selectedColorSwatchUrl?: string;
  quantity: number;
}
