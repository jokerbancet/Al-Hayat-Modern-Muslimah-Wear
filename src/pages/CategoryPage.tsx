import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronLeft, ShoppingBag, Plus, Minus, Loader2, ArrowRight } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { supabase } from '../lib/supabase';
import { Category, Product, CartItem } from '../types';
import { toast } from 'sonner';

interface CategoryPageProps {
  onAddToCart: (item: CartItem) => void;
}

export default function CategoryPage({ onAddToCart }: CategoryPageProps) {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [category, setCategory] = useState<Category | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (slug) {
      fetchCategoryData(slug);
    }
  }, [slug]);

  const fetchCategoryData = async (categorySlug: string) => {
    setLoading(true);
    try {
      // Fetch Category
      const { data: catData, error: catError } = await supabase
        .from('categories')
        .select('*')
        .eq('slug', categorySlug)
        .single();
      
      if (catError) throw catError;
      setCategory(catData);

      // Fetch Products for this category
      const { data: prodData, error: prodError } = await supabase
        .from('products')
        .select(`
          *,
          images:product_images(*),
          variants:variants!variants_product_id_fkey(*)
        `)
        .eq('category_id', catData.id)
        .order('created_at', { ascending: false });

      if (prodError) throw prodError;
      setProducts(prodData || []);
    } catch (error: any) {
      console.error('Error fetching category data:', error);
      toast.error('Category not found');
      navigate('/');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!category) return null;

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen bg-background pt-32 pb-24"
    >
      <div className="container mx-auto px-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-8 mb-20">
          <div className="space-y-6 max-w-2xl">
            <Button 
              variant="ghost" 
              onClick={() => navigate('/')}
              className="p-0 h-auto hover:bg-transparent text-muted-foreground hover:text-primary transition-colors flex items-center gap-2 group"
            >
              <ChevronLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
              <span className="text-[10px] font-bold tracking-widest uppercase">Back to Collections</span>
            </Button>
            <div className="space-y-4">
              <h1 className="text-6xl md:text-8xl font-serif font-bold tracking-tight leading-none">
                {category.name.split(' ')[0]} <br />
                <span className="italic text-secondary">{category.name.split(' ').slice(1).join(' ') || 'Collection'}</span>
              </h1>
              <p className="text-lg text-muted-foreground leading-relaxed max-w-xl">
                {category.description || `Explore our curated selection of ${category.name}, designed with timeless elegance and modern sophistication.`}
              </p>
            </div>
          </div>
          
          {category.image_url && (
            <div className="w-full md:w-72 aspect-[4/5] rounded-3xl overflow-hidden shadow-2xl rotate-3 hover:rotate-0 transition-transform duration-700">
              <img src={category.image_url} alt={category.name} className="w-full h-full object-cover" />
            </div>
          )}
        </div>

        {/* Product Menu List */}
        <div className="space-y-8">
          <div className="flex items-center gap-4 mb-12">
            <div className="h-px flex-1 bg-primary/10" />
            <span className="text-[10px] font-bold tracking-[0.4em] uppercase text-muted-foreground">The Menu</span>
            <div className="h-px flex-1 bg-primary/10" />
          </div>

          <div className="grid grid-cols-1 gap-6">
            {products.map((product) => (
              <ProductMenuItem key={product.id} product={product} onAddToCart={onAddToCart} />
            ))}
          </div>
          
          {products.length === 0 && (
            <div className="text-center py-32 space-y-4">
              <p className="text-muted-foreground italic">No products found in this category yet.</p>
              <Button onClick={() => navigate('/')} variant="outline" className="rounded-full px-8">
                Explore Other Collections
              </Button>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}

function ProductMenuItem({ product, onAddToCart }: { product: Product; onAddToCart: (item: CartItem) => void }) {
  const [selectedSize, setSelectedSize] = useState<string>('');
  const [selectedColor, setSelectedColor] = useState<string>('');
  const [quantity, setQuantity] = useState(1);

  const colors = Array.from(new Set(product.variants?.map(v => v.color_option) || []));
  const sizes = Array.from(new Set(product.variants?.map(v => v.size_option) || []));

  const currentVariant = product.variants?.find(
    v => v.color_option === selectedColor && v.size_option === selectedSize
  );

  const total = product.base_price * quantity;

  const handleAddToCart = () => {
    if (!selectedSize || !selectedColor) {
      toast.error('Please select both size and color');
      return;
    }

    onAddToCart({
      id: product.id,
      name: product.name,
      price: product.base_price,
      image: product.images?.[0]?.image_url || '',
      variantId: currentVariant?.id || '',
      selectedSize,
      selectedColor,
      quantity
    });
    
    toast.success(`${product.name} added to cart`);
  };

  return (
    <div className="group bg-white border border-primary/5 rounded-3xl p-6 md:p-8 hover:shadow-xl hover:border-secondary/30 transition-all duration-500">
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Image */}
        <div className="w-full lg:w-48 aspect-square rounded-2xl overflow-hidden bg-muted shrink-0">
          <img 
            src={product.images?.[0]?.image_url} 
            alt={product.name} 
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
          />
        </div>

        {/* Info & Selectors */}
        <div className="flex-1 space-y-6">
          <div className="flex flex-col md:flex-row justify-between items-start gap-4">
            <div className="space-y-1">
              <h3 className="text-2xl font-serif font-bold tracking-tight">{product.name}</h3>
              <p className="text-sm text-muted-foreground line-clamp-1">{product.material} • {product.motif}</p>
            </div>
            <div className="text-right">
              <p className="text-xl font-bold tracking-tighter">Rp {product.base_price.toLocaleString()}</p>
              <p className="text-[10px] font-bold tracking-widest uppercase text-muted-foreground">Base Price</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 pt-4 border-t border-primary/5">
            {/* Size Selector */}
            <div className="space-y-3">
              <Label className="text-[10px] font-bold tracking-widest uppercase text-muted-foreground">Select Size</Label>
              <div className="flex flex-wrap gap-2">
                {['S', 'M', 'L', 'XL'].map((size) => {
                  const isAvailable = sizes.includes(size);
                  return (
                    <button
                      key={size}
                      disabled={!isAvailable}
                      onClick={() => setSelectedSize(size)}
                      className={`w-10 h-10 rounded-full text-[10px] font-bold transition-all duration-300 border ${
                        selectedSize === size
                          ? 'bg-primary text-white border-primary shadow-lg scale-110'
                          : isAvailable
                            ? 'bg-white text-primary border-primary/10 hover:border-secondary hover:text-secondary'
                            : 'bg-muted/50 text-muted-foreground border-transparent cursor-not-allowed opacity-30'
                      }`}
                    >
                      {size}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Color Selector */}
            <div className="space-y-3">
              <Label className="text-[10px] font-bold tracking-widest uppercase text-muted-foreground">Select Color</Label>
              <div className="flex flex-wrap gap-3">
                {colors.map((color) => (
                  <button
                    key={color}
                    onClick={() => setSelectedColor(color)}
                    className={`w-8 h-8 rounded-full border-2 transition-all duration-300 relative ${
                      selectedColor === color ? 'border-secondary scale-125' : 'border-transparent hover:scale-110'
                    }`}
                    title={color}
                  >
                    <span 
                      className="absolute inset-0.5 rounded-full shadow-inner" 
                      style={{ backgroundColor: color.toLowerCase() }}
                    />
                    {selectedColor === color && (
                      <motion.div 
                        layoutId="color-active"
                        className="absolute -inset-1 rounded-full border border-secondary"
                      />
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Quantity & Total */}
            <div className="space-y-3">
              <Label className="text-[10px] font-bold tracking-widest uppercase text-muted-foreground">Quantity</Label>
              <div className="flex items-center gap-4">
                <div className="flex items-center bg-muted/30 rounded-full p-1 border border-primary/5">
                  <button 
                    onClick={() => setQuantity(q => Math.max(1, q - 1))}
                    className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-white transition-colors"
                  >
                    <Minus className="w-3 h-3" />
                  </button>
                  <span className="w-8 text-center text-xs font-bold">{quantity}</span>
                  <button 
                    onClick={() => setQuantity(q => q + 1)}
                    className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-white transition-colors"
                  >
                    <Plus className="w-3 h-3" />
                  </button>
                </div>
                <div className="flex-1 text-right">
                  <p className="text-xs font-bold tracking-widest uppercase text-muted-foreground">Total</p>
                  <p className="text-lg font-bold tracking-tighter text-secondary">Rp {total.toLocaleString()}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="lg:w-48 flex items-end">
          <Button 
            disabled={!selectedSize || !selectedColor}
            onClick={handleAddToCart}
            className={`w-full h-14 rounded-2xl font-bold tracking-widest uppercase text-[10px] transition-all duration-500 ${
              selectedSize && selectedColor 
                ? 'bg-secondary text-primary hover:bg-hover hover:text-white shadow-xl shadow-secondary/20' 
                : 'bg-muted text-muted-foreground cursor-not-allowed'
            }`}
          >
            Add to Cart
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </div>
    </div>
  );
}

function Label({ children, className }: { children: React.ReactNode; className?: string }) {
  return <p className={className}>{children}</p>;
}
