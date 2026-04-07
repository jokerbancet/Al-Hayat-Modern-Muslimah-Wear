import { Product, SizeGuide } from '../types';

export const MOCK_PRODUCTS: Product[] = [
  {
    id: '1',
    name: 'The Essential Abaya',
    slug: 'the-essential-abaya',
    description: 'A timeless silhouette crafted from premium Nidha fabric. Designed for the modern woman who values both comfort and elegance.',
    base_price: 1290000,
    category_id: 'cat1',
    category: { id: 'cat1', name: 'Essentials', slug: 'essentials' },
    age_category: 'Adult',
    motif: 'Plain',
    material: 'Premium Nidha',
    images: [{ id: 'img1', product_id: '1', image_url: 'https://images.unsplash.com/photo-1583394838336-acd977736f90?auto=format&fit=crop&q=80&w=800', display_order: 0 }],
    is_featured: true,
    variants: [
      { id: 'v1', product_id: '1', color_option: 'Black', size_option: 'M', stock_quantity: 15 },
      { id: 'v2', product_id: '1', color_option: 'Navy', size_option: 'L', stock_quantity: 8 }
    ]
  },
  {
    id: '2',
    name: 'Midnight Velvet Kaftan',
    slug: 'midnight-velvet-kaftan',
    description: 'Elevate your evening with our luxurious velvet kaftan, featuring intricate gold embroidery and a flowing drape.',
    base_price: 2490000,
    category_id: 'cat2',
    category: { id: 'cat2', name: 'Occasion Wear', slug: 'occasion-wear' },
    age_category: 'Adult',
    motif: 'Floral',
    material: 'Velvet',
    images: [{ id: 'img2', product_id: '2', image_url: 'https://images.unsplash.com/photo-1567401893414-76b7b1e5a7a5?auto=format&fit=crop&q=80&w=800', display_order: 0 }],
    is_featured: true,
    variants: [
      { id: 'v3', product_id: '2', color_option: 'Midnight', size_option: 'One Size', stock_quantity: 5 }
    ]
  },
  {
    id: '3',
    name: 'Sage Linen Set',
    slug: 'sage-linen-set',
    description: 'Breathable linen blend set perfect for seasonal transitions. Includes a relaxed-fit tunic and wide-leg trousers.',
    base_price: 1590000,
    category_id: 'cat3',
    category: { id: 'cat3', name: 'Seasonal', slug: 'seasonal' },
    age_category: 'Adult',
    motif: 'Geometric',
    material: 'Linen Blend',
    images: [{ id: 'img3', product_id: '3', image_url: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&q=80&w=800', display_order: 0 }],
    is_featured: false,
    variants: [
      { id: 'v4', product_id: '3', color_option: 'Sage', size_option: 'S', stock_quantity: 12 }
    ]
  },
  {
    id: '4',
    name: 'Silk Chiffon Hijab',
    slug: 'silk-chiffon-hijab',
    description: 'Our signature silk chiffon hijab offers a lightweight feel and a beautiful sheen. Available in a range of earthy tones.',
    base_price: 350000,
    category_id: 'cat1',
    category: { id: 'cat1', name: 'Essentials', slug: 'essentials' },
    age_category: 'Adult',
    motif: 'Plain',
    material: 'Silk Chiffon',
    images: [{ id: 'img4', product_id: '4', image_url: 'https://images.unsplash.com/photo-1585487000160-6ebcfceb0d03?auto=format&fit=crop&q=80&w=800', display_order: 0 }],
    is_featured: false,
    variants: [
      { id: 'v5', product_id: '4', color_option: 'Sand', size_option: 'One Size', stock_quantity: 50 }
    ]
  },
  {
    id: '5',
    name: 'Ethereal Lace Gown',
    slug: 'ethereal-lace-gown',
    description: 'A masterpiece of delicate lace and soft tulle. Perfect for weddings and special celebrations.',
    base_price: 3890000,
    category_id: 'cat2',
    category: { id: 'cat2', name: 'Occasion Wear', slug: 'occasion-wear' },
    age_category: 'Adult',
    motif: 'Floral',
    material: 'Lace & Tulle',
    images: [{ id: 'img5', product_id: '5', image_url: 'https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?auto=format&fit=crop&q=80&w=800', display_order: 0 }],
    is_featured: true,
    variants: [
      { id: 'v6', product_id: '5', color_option: 'White', size_option: 'M', stock_quantity: 3 }
    ]
  },
  {
    id: '6',
    name: 'Sand Dune Kimono',
    slug: 'sand-dune-kimono',
    description: 'Versatile layering piece in a warm sand hue. Effortlessly chic over any outfit.',
    base_price: 890000,
    category_id: 'cat3',
    category: { id: 'cat3', name: 'Seasonal', slug: 'seasonal' },
    age_category: 'Adult',
    motif: 'Plain',
    material: 'Viscose',
    images: [{ id: 'img6', product_id: '6', image_url: 'https://images.unsplash.com/photo-1539109132314-d49c02d82267?auto=format&fit=crop&q=80&w=800', display_order: 0 }],
    is_featured: false,
    variants: [
      { id: 'v7', product_id: '6', color_option: 'Sand', size_option: 'One Size', stock_quantity: 0 }
    ]
  },
];

export const MOCK_SIZE_GUIDE: SizeGuide[] = [
  {
    id: 'sg1',
    category: 'Abayas',
    measurements: [
      { size: 'S', chest: '38"', length: '52"', sleeve: '23"' },
      { size: 'M', chest: '40"', length: '54"', sleeve: '24"' },
      { size: 'L', chest: '42"', length: '56"', sleeve: '25"' },
      { size: 'XL', chest: '44"', length: '58"', sleeve: '26"' },
    ],
  },
  {
    id: 'sg2',
    category: 'Tops & Trousers',
    measurements: [
      { size: 'S', chest: '36"', length: '28"', sleeve: '22"', waist: '28"' },
      { size: 'M', chest: '38"', length: '29"', sleeve: '23"', waist: '30"' },
      { size: 'L', chest: '40"', length: '30"', sleeve: '24"', waist: '32"' },
      { size: 'XL', chest: '42"', length: '31"', sleeve: '25"', waist: '34"' },
    ],
  },
];
