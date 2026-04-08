import { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ChevronLeft, 
  ChevronRight, 
  Plus, 
  Minus, 
  Loader2, 
  ShoppingBag,
  ShieldCheck,
  Truck,
  RotateCcw
} from 'lucide-react';
import InnerImageZoom from 'react-inner-image-zoom';
import 'react-inner-image-zoom/lib/styles.min.css';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { supabase } from '../lib/supabase';
import { Product, CartItem, ProductVariant } from '../types';
import { toast } from 'sonner';
import { formatCurrency } from '../lib/utils';
import ProductCard from '../components/ecommerce/ProductCard';

interface ProductDetailPageProps {
  onAddToCart: (item: CartItem) => void;
}

export default function ProductDetailPage({ onAddToCart }: ProductDetailPageProps) {
  const { categorySlug, productSlug } = useParams<{ categorySlug: string; productSlug: string }>();
  const navigate = useNavigate();
  const [product, setProduct] = useState<Product | null>(null);
  const [recommendedProducts, setRecommendedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  
  // Selection States
  const [selectedColor, setSelectedColor] = useState<string>('');
  const [selectedSize, setSelectedSize] = useState<string>('');
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    if (productSlug) {
      fetchProductData(productSlug);
    }
  }, [productSlug]);

  const fetchProductData = async (slug: string) => {
    setLoading(true);
    try {
      // Fetch Product
      const { data: prodData, error: prodError } = await supabase
        .from('products')
        .select(`
          *,
          category:categories(*),
          images:product_images(*),
          variants:variants!variants_product_id_fkey(*)
        `)
        .eq('slug', slug)
        .single();
      
      if (prodError) throw prodError;
      setProduct(prodData);

      // Set initial selections
      if (prodData.variants && prodData.variants.length > 0) {
        setSelectedColor(prodData.variants[0].color_option);
        setSelectedSize(prodData.variants[0].size_option);
      }

      // Fetch Recommended Products (same category, excluding current)
      const { data: recData, error: recError } = await supabase
        .from('products')
        .select(`
          *,
          category:categories(*),
          images:product_images(*),
          variants:variants!variants_product_id_fkey(*)
        `)
        .eq('category_id', prodData.category_id)
        .neq('id', prodData.id)
        .limit(8);

      if (!recError) {
        setRecommendedProducts(recData || []);
      }
    } catch (error: any) {
      console.error('Error fetching product data:', error);
      toast.error('Product not found');
      navigate('/');
    } finally {
      setLoading(false);
    }
  };

  const variantsForColor = useMemo(() => {
    if (!product || !selectedColor) return [];
    return product.variants
      ?.filter(v => v.color_option === selectedColor)
      .sort((a, b) => {
        const sizes = ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL'];
        return sizes.indexOf(a.size_option) - sizes.indexOf(b.size_option);
      }) || [];
  }, [product, selectedColor]);

  const availableColors = useMemo(() => {
    if (!product) return [];
    const colors = new Set(product.variants?.map(v => v.color_option));
    return Array.from(colors);
  }, [product]);

  const currentVariant = useMemo(() => {
    if (!product || !selectedColor || !selectedSize) return null;
    return product.variants?.find(
      v => v.color_option === selectedColor && v.size_option === selectedSize
    ) || null;
  }, [product, selectedColor, selectedSize]);

  // Update selected size if current selection is not available for new color
  useEffect(() => {
    if (variantsForColor.length > 0) {
      const sizeExists = variantsForColor.some(v => v.size_option === selectedSize);
      if (!sizeExists) {
        // Try to find first in-stock size
        const inStock = variantsForColor.find(v => v.stock_quantity > 0);
        setSelectedSize(inStock ? inStock.size_option : variantsForColor[0].size_option);
      }
    }
  }, [selectedColor, variantsForColor]);

  const handleAddToCart = () => {
    if (!product || !currentVariant) return;

    if (currentVariant.stock_quantity < quantity) {
      toast.error('Not enough stock available');
      return;
    }

    onAddToCart({
      id: product.id,
      name: product.name,
      price: product.base_price,
      image: product.images?.[0]?.image_url || '',
      variantId: currentVariant.id,
      selectedSize,
      selectedColor,
      quantity
    });
    toast.success(`${product.name} added to cart`);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!product) return null;

  return (
    <div className="min-h-screen bg-background pt-32 pb-24">
      <div className="container mx-auto px-6">
        {/* Breadcrumbs */}
        <nav className="flex items-center gap-2 mb-12 text-[10px] font-bold tracking-widest uppercase text-muted-foreground">
          <button onClick={() => navigate('/')} className="hover:text-primary transition-colors">Home</button>
          <ChevronRight className="w-3 h-3" />
          <button onClick={() => navigate(`/category/${categorySlug}`)} className="hover:text-primary transition-colors">{product.category?.name}</button>
          <ChevronRight className="w-3 h-3" />
          <span className="text-primary">{product.name}</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24">
          {/* Left Column: Media Gallery */}
          <div className="space-y-6">
            <div className="aspect-[3/4] bg-white rounded-3xl overflow-hidden border border-primary/5 relative group">
              <InnerImageZoom
                src={product.images?.[activeImageIndex]?.image_url || ''}
                zoomSrc={product.images?.[activeImageIndex]?.image_url || ''}
                zoomType="hover"
                zoomScale={1.5}
                className="w-full h-full object-cover"
              />
              
              {/* Navigation Arrows */}
              {product.images && product.images.length > 1 && (
                <>
                  <button 
                    onClick={() => setActiveImageIndex(prev => (prev === 0 ? product.images!.length - 1 : prev - 1))}
                    className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/80 backdrop-blur-md flex items-center justify-center text-primary opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <button 
                    onClick={() => setActiveImageIndex(prev => (prev === product.images!.length - 1 ? 0 : prev + 1))}
                    className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/80 backdrop-blur-md flex items-center justify-center text-primary opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </>
              )}
            </div>

            {/* Thumbnails */}
            <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
              {product.images?.map((image, index) => (
                <button
                  key={image.id}
                  onClick={() => setActiveImageIndex(index)}
                  className={`w-20 aspect-[3/4] rounded-xl overflow-hidden border-2 transition-all shrink-0 ${
                    activeImageIndex === index ? 'border-secondary' : 'border-transparent opacity-60 hover:opacity-100'
                  }`}
                >
                  <img src={image.image_url} alt="" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                </button>
              ))}
            </div>
          </div>

          {/* Right Column: Product Info */}
          <div className="space-y-12">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-[10px] font-bold tracking-[0.3em] text-secondary uppercase">
                  {product.category?.name} Collection
                </p>
                {currentVariant && currentVariant.stock_quantity < 5 && currentVariant.stock_quantity > 0 && (
                  <Badge className="bg-orange-100 text-orange-600 border-none text-[8px] font-bold tracking-widest uppercase">
                    Only {currentVariant.stock_quantity} left
                  </Badge>
                )}
              </div>
              <h1 className="text-5xl md:text-6xl font-serif font-bold tracking-tight text-primary leading-tight">
                {product.name}
              </h1>
              <p className="text-3xl font-bold tracking-tighter text-primary">
                {formatCurrency(product.base_price)}
              </p>
            </div>

            {/* Attributes */}
            <div className="grid grid-cols-3 gap-8 py-8 border-y border-primary/10">
              <div className="space-y-1">
                <p className="text-[8px] font-bold tracking-widest uppercase text-muted-foreground">Age Category</p>
                <p className="text-sm font-bold">{product.age_category}</p>
              </div>
              <div className="space-y-1">
                <p className="text-[8px] font-bold tracking-widest uppercase text-muted-foreground">Motif</p>
                <p className="text-sm font-bold">{product.motif}</p>
              </div>
              <div className="space-y-1">
                <p className="text-[8px] font-bold tracking-widest uppercase text-muted-foreground">Material</p>
                <p className="text-sm font-bold">{product.material}</p>
              </div>
            </div>

            {/* Description */}
            <div className="space-y-4">
              <h4 className="text-[10px] font-bold tracking-widest uppercase">Description</h4>
              <div className="text-sm text-muted-foreground leading-relaxed prose prose-sm max-w-none">
                {product.description}
              </div>
            </div>

            {/* Variant Selectors */}
            <div className="space-y-8">
              {/* Color Selector */}
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h4 className="text-[10px] font-bold tracking-widest uppercase">Color: <span className="text-muted-foreground font-medium">{selectedColor}</span></h4>
                </div>
                <div className="flex gap-3">
                  {availableColors.map((color) => (
                    <button
                      key={color}
                      onClick={() => setSelectedColor(color)}
                      className={`w-10 h-10 rounded-full border-2 transition-all flex items-center justify-center ${
                        selectedColor === color ? 'border-primary ring-2 ring-primary/10' : 'border-transparent hover:border-primary/20'
                      }`}
                      title={color}
                    >
                      <div 
                        className="w-7 h-7 rounded-full border border-black/5" 
                        style={{ backgroundColor: color.toLowerCase().replace(' ', '') }} 
                      />
                    </button>
                  ))}
                </div>
              </div>

              {/* Size Selector */}
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h4 className="text-[10px] font-bold tracking-widest uppercase">Size: <span className="text-muted-foreground font-medium">{selectedSize}</span></h4>
                  <button className="text-[8px] font-bold tracking-widest uppercase text-secondary hover:underline">Size Guide</button>
                </div>
                <div className="flex flex-wrap gap-3">
                  {variantsForColor.map((variant) => {
                    const isSelected = selectedSize === variant.size_option;
                    const isOutOfStock = variant.stock_quantity === 0;
                    
                    return (
                      <button
                        key={variant.id}
                        disabled={isOutOfStock}
                        onClick={() => setSelectedSize(variant.size_option)}
                        className={`relative w-14 h-14 rounded-xl border-2 font-bold transition-all flex items-center justify-center overflow-hidden ${
                          isSelected 
                            ? 'border-primary bg-primary text-white shadow-lg shadow-primary/20' 
                            : isOutOfStock
                              ? 'border-primary/5 bg-secondary/5 text-muted-foreground/40 cursor-not-allowed'
                              : 'border-primary/10 bg-secondary/10 text-primary hover:border-primary/30'
                        }`}
                      >
                        <span className="relative z-10">{variant.size_option}</span>
                        {isOutOfStock && (
                          <div className="absolute inset-0 flex items-center justify-center">
                            <div className="w-[140%] h-[2px] bg-muted-foreground/20 rotate-45 absolute" />
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Purchase Actions */}
            <div className="space-y-6 pt-8 border-t border-primary/10">
              <div className="flex gap-4">
                <div className="flex items-center border-2 border-primary/10 rounded-2xl px-4 h-16">
                  <button 
                    onClick={() => setQuantity(prev => Math.max(1, prev - 1))}
                    className="p-2 hover:text-secondary transition-colors"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="w-12 text-center font-bold">{quantity}</span>
                  <button 
                    onClick={() => setQuantity(prev => prev + 1)}
                    className="p-2 hover:text-secondary transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
                <Button
                  onClick={handleAddToCart}
                  disabled={!currentVariant || currentVariant.stock_quantity === 0}
                  className="flex-1 h-16 bg-secondary text-primary font-bold tracking-[0.2em] uppercase hover:bg-secondary/90 transition-all duration-300 rounded-2xl shadow-xl shadow-secondary/10 gap-3"
                >
                  <ShoppingBag className="w-5 h-5" />
                  {currentVariant?.stock_quantity === 0 ? 'Out of Stock' : 'Add to Cart'}
                </Button>
              </div>

              {/* Trust Badges */}
              <div className="grid grid-cols-3 gap-4 pt-4">
                <div className="flex flex-col items-center text-center gap-2">
                  <Truck className="w-5 h-5 text-secondary" />
                  <span className="text-[8px] font-bold tracking-widest uppercase opacity-60">Free Shipping</span>
                </div>
                <div className="flex flex-col items-center text-center gap-2">
                  <RotateCcw className="w-5 h-5 text-secondary" />
                  <span className="text-[8px] font-bold tracking-widest uppercase opacity-60">30-Day Returns</span>
                </div>
                <div className="flex flex-col items-center text-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-secondary" />
                  <span className="text-[8px] font-bold tracking-widest uppercase opacity-60">Secure Payment</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Recommended Section */}
        {recommendedProducts.length > 0 && (
          <section className="mt-32 pt-24 border-t border-primary/10">
            <div className="text-center mb-16 space-y-4">
              <p className="text-[10px] font-bold tracking-[0.4em] text-secondary uppercase">Curated for you</p>
              <h2 className="text-4xl md:text-5xl font-serif font-bold tracking-tight">RECOMMENDED FOR YOU</h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-16">
              {recommendedProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
