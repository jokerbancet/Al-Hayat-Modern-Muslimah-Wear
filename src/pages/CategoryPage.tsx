import { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ChevronLeft, 
  ShoppingBag, 
  Plus, 
  Minus, 
  Loader2, 
  ArrowRight, 
  LayoutGrid, 
  List, 
  ChevronDown,
  Filter,
  X
} from 'lucide-react';
import * as Slider from '@radix-ui/react-slider';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import * as Checkbox from '@radix-ui/react-checkbox';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '../components/ui/sheet';
import { supabase } from '../lib/supabase';
import { Category, Product, CartItem } from '../types';
import { toast } from 'sonner';
import { formatCurrency } from '../lib/utils';

interface CategoryPageProps {
  onAddToCart: (item: CartItem) => void;
}

export default function CategoryPage({ onAddToCart }: CategoryPageProps) {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [category, setCategory] = useState<Category | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Filter States
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState<'newest' | 'price-low' | 'price-high'>('newest');
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 5000000]);
  const [availability, setAvailability] = useState<string[]>(['in-stock', 'out-of-stock']);

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
        .eq('category_id', catData.id);

      if (prodError) throw prodError;
      setProducts(prodData || []);
      
      // Set initial price range based on products
      if (prodData && prodData.length > 0) {
        const prices = prodData.map(p => p.base_price);
        setPriceRange([0, Math.max(...prices)]);
      }
    } catch (error: any) {
      console.error('Error fetching category data:', error);
      toast.error('Category not found');
      navigate('/');
    } finally {
      setLoading(false);
    }
  };

  const filteredProducts = useMemo(() => {
    let result = [...products];

    // Filter by Availability
    result = result.filter(p => {
      const totalStock = p.variants?.reduce((sum, v) => sum + v.stock_quantity, 0) || 0;
      const status = totalStock > 0 ? 'in-stock' : 'out-of-stock';
      return availability.includes(status);
    });

    // Filter by Price
    result = result.filter(p => p.base_price >= priceRange[0] && p.base_price <= priceRange[1]);

    // Sort
    if (sortBy === 'newest') {
      result.sort((a, b) => new Date(b.created_at || '').getTime() - new Date(a.created_at || '').getTime());
    } else if (sortBy === 'price-low') {
      result.sort((a, b) => a.base_price - b.base_price);
    } else if (sortBy === 'price-high') {
      result.sort((a, b) => b.base_price - a.base_price);
    }

    return result;
  }, [products, availability, priceRange, sortBy]);

  const inStockCount = products.filter(p => (p.variants?.reduce((sum, v) => sum + v.stock_quantity, 0) || 0) > 0).length;
  const outOfStockCount = products.length - inStockCount;

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
      className="min-h-screen bg-[#FDFCFB] pt-32 pb-24"
    >
      <div className="container mx-auto px-6">
        {/* Header */}
        <div className="text-center mb-16 space-y-4">
          <h1 className="text-5xl md:text-7xl font-serif font-bold tracking-tight uppercase">
            {category.name}
          </h1>
          <p className="text-muted-foreground max-w-2xl mx-auto italic">
            {category.description || `A curated collection of ${category.name} for the modern wardrobe.`}
          </p>
        </div>

        {/* Toolbar */}
        <div className="border-y border-primary/10 py-4 mb-12 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setViewMode('grid')}
              className={`p-2 transition-colors ${viewMode === 'grid' ? 'text-primary' : 'text-muted-foreground hover:text-primary'}`}
            >
              <LayoutGrid className="w-5 h-5" />
            </button>
            <button 
              onClick={() => setViewMode('list')}
              className={`p-2 transition-colors ${viewMode === 'list' ? 'text-primary' : 'text-muted-foreground hover:text-primary'}`}
            >
              <List className="w-5 h-5" />
            </button>
            
            {/* Mobile Filter Trigger */}
            <div className="lg:hidden ml-2">
              <Sheet>
                <SheetTrigger 
                  render={
                    <Button variant="ghost" size="sm" className="text-[10px] font-bold tracking-widest uppercase gap-2">
                      <Filter className="w-4 h-4" />
                      Filters
                    </Button>
                  }
                />
                <SheetContent side="left" className="w-full sm:w-[400px] p-0 bg-background border-none">
                  <SheetHeader className="p-8 border-b">
                    <SheetTitle className="text-2xl font-serif font-bold tracking-tight">Filters</SheetTitle>
                  </SheetHeader>
                  <div className="p-8">
                    <FilterSidebar 
                      availability={availability}
                      setAvailability={setAvailability}
                      priceRange={priceRange}
                      setPriceRange={setPriceRange}
                      inStockCount={inStockCount}
                      outOfStockCount={outOfStockCount}
                    />
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </div>

          <div className="flex items-center gap-6">
            <span className="text-[10px] font-bold tracking-widest uppercase text-muted-foreground">
              {filteredProducts.length} Products
            </span>
            <DropdownMenu.Root>
              <DropdownMenu.Trigger asChild>
                <button className="text-[10px] font-bold tracking-widest uppercase flex items-center gap-2 text-primary hover:text-secondary transition-colors">
                  Sort: {sortBy === 'newest' ? 'Newest' : sortBy === 'price-low' ? 'Price: Low to High' : 'Price: High to Low'}
                  <ChevronDown className="w-3 h-3" />
                </button>
              </DropdownMenu.Trigger>
              <DropdownMenu.Portal>
                <DropdownMenu.Content className="bg-white border p-2 rounded-xl shadow-xl z-50 min-w-[200px] animate-in fade-in zoom-in-95 duration-200">
                  <DropdownMenu.Item 
                    onClick={() => setSortBy('newest')}
                    className="text-[10px] font-bold tracking-widest uppercase p-3 hover:bg-muted rounded-lg cursor-pointer outline-none"
                  >
                    Newest
                  </DropdownMenu.Item>
                  <DropdownMenu.Item 
                    onClick={() => setSortBy('price-low')}
                    className="text-[10px] font-bold tracking-widest uppercase p-3 hover:bg-muted rounded-lg cursor-pointer outline-none"
                  >
                    Price: Low to High
                  </DropdownMenu.Item>
                  <DropdownMenu.Item 
                    onClick={() => setSortBy('price-high')}
                    className="text-[10px] font-bold tracking-widest uppercase p-3 hover:bg-muted rounded-lg cursor-pointer outline-none"
                  >
                    Price: High to Low
                  </DropdownMenu.Item>
                </DropdownMenu.Content>
              </DropdownMenu.Portal>
            </DropdownMenu.Root>
          </div>
        </div>

        <div className="flex gap-12">
          {/* Desktop Sidebar */}
          <aside className="hidden lg:block w-64 shrink-0 space-y-12">
            <FilterSidebar 
              availability={availability}
              setAvailability={setAvailability}
              priceRange={priceRange}
              setPriceRange={setPriceRange}
              inStockCount={inStockCount}
              outOfStockCount={outOfStockCount}
            />
          </aside>

          {/* Product Grid */}
          <div className="flex-1">
            <div className={`grid gap-x-8 gap-y-16 ${
              viewMode === 'grid' 
                ? 'grid-cols-2 md:grid-cols-3 xl:grid-cols-4' 
                : 'grid-cols-1'
            }`}>
              {filteredProducts.map((product) => (
                <ProductCard 
                  key={product.id} 
                  product={product} 
                  viewMode={viewMode}
                />
              ))}
            </div>
            
            {filteredProducts.length === 0 && (
              <div className="text-center py-24 space-y-4">
                <p className="text-xl font-serif font-bold">No products found</p>
                <p className="text-sm text-muted-foreground">Try adjusting your filters to find what you're looking for.</p>
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setPriceRange([0, 5000000]);
                    setAvailability(['in-stock', 'out-of-stock']);
                  }}
                  className="rounded-full"
                >
                  Clear All Filters
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function FilterSidebar({ 
  availability, 
  setAvailability, 
  priceRange, 
  setPriceRange,
  inStockCount,
  outOfStockCount
}: any) {
  const toggleAvailability = (value: string) => {
    setAvailability((prev: string[]) => 
      prev.includes(value) 
        ? prev.filter(v => v !== value) 
        : [...prev, value]
    );
  };

  return (
    <div className="space-y-12">
      {/* Availability */}
      <div className="space-y-6">
        <h4 className="text-[10px] font-bold tracking-widest uppercase">Availability</h4>
        <div className="space-y-4">
          <div className="flex items-center justify-between group cursor-pointer" onClick={() => toggleAvailability('in-stock')}>
            <div className="flex items-center gap-3">
              <Checkbox.Root 
                checked={availability.includes('in-stock')}
                className="w-4 h-4 rounded border border-primary/20 flex items-center justify-center bg-white data-[state=checked]:bg-primary data-[state=checked]:border-primary transition-colors"
              >
                <Checkbox.Indicator>
                  <X className="w-3 h-3 text-white" />
                </Checkbox.Indicator>
              </Checkbox.Root>
              <span className="text-sm font-medium">In stock</span>
            </div>
            <span className="text-[10px] text-muted-foreground">({inStockCount})</span>
          </div>
          <div className="flex items-center justify-between group cursor-pointer" onClick={() => toggleAvailability('out-of-stock')}>
            <div className="flex items-center gap-3">
              <Checkbox.Root 
                checked={availability.includes('out-of-stock')}
                className="w-4 h-4 rounded border border-primary/20 flex items-center justify-center bg-white data-[state=checked]:bg-primary data-[state=checked]:border-primary transition-colors"
              >
                <Checkbox.Indicator>
                  <X className="w-3 h-3 text-white" />
                </Checkbox.Indicator>
              </Checkbox.Root>
              <span className="text-sm font-medium">Out of stock</span>
            </div>
            <span className="text-[10px] text-muted-foreground">({outOfStockCount})</span>
          </div>
        </div>
      </div>

      {/* Price Range */}
      <div className="space-y-6">
        <h4 className="text-[10px] font-bold tracking-widest uppercase">Price</h4>
        <div className="px-2">
          <Slider.Root
            className="relative flex items-center select-none touch-none w-full h-5"
            value={priceRange}
            max={5000000}
            step={10000}
            onValueChange={(val) => setPriceRange(val as [number, number])}
          >
            <Slider.Track className="bg-primary/10 relative grow rounded-full h-[2px]">
              <Slider.Range className="absolute bg-primary rounded-full h-full" />
            </Slider.Track>
            <Slider.Thumb className="block w-4 h-4 bg-primary rounded-full shadow-lg hover:scale-110 transition-transform focus:outline-none" />
            <Slider.Thumb className="block w-4 h-4 bg-primary rounded-full shadow-lg hover:scale-110 transition-transform focus:outline-none" />
          </Slider.Root>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <span className="text-[8px] font-bold tracking-widest uppercase text-muted-foreground">Min Rp</span>
            <div className="h-10 border border-primary/20 bg-white rounded flex items-center px-3 text-xs font-bold">
              <span className="text-muted-foreground mr-1">Rp</span>
              {priceRange[0].toLocaleString()}
            </div>
          </div>
          <div className="space-y-2 text-right">
            <span className="text-[8px] font-bold tracking-widest uppercase text-muted-foreground">Max Rp</span>
            <div className="h-10 border border-primary/20 bg-white rounded flex items-center px-3 text-xs font-bold justify-end">
              <span className="text-muted-foreground mr-1">Rp</span>
              {priceRange[1].toLocaleString()}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ProductCard({ product, viewMode }: { product: Product; viewMode: 'grid' | 'list' }) {
  const navigate = useNavigate();
  const { slug } = useParams<{ slug: string }>();
  const [isHovered, setIsHovered] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const totalStock = product.variants?.reduce((sum, v) => sum + v.stock_quantity, 0) || 0;

  if (viewMode === 'list') {
    return (
      <motion.div 
        layout
        className="group flex flex-col md:flex-row gap-8 items-center bg-white p-6 rounded-3xl border border-primary/5 hover:border-secondary/30 transition-all duration-500 cursor-pointer"
        onClick={() => navigate(`/category/${slug}/${product.slug}`)}
      >
        <div className="w-full md:w-48 aspect-[4/5] rounded-2xl overflow-hidden bg-muted shrink-0 relative">
          <img 
            src={product.images?.[0]?.image_url} 
            alt={product.name} 
            onLoad={() => setIsLoaded(true)}
            className={`w-full h-full object-cover transition-all duration-700 ${isLoaded ? 'scale-100 blur-0' : 'scale-110 blur-xl'}`}
          />
          {totalStock === 0 && (
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
              <span className="text-[10px] font-bold tracking-widest uppercase text-white border border-white/20 px-4 py-2 rounded-full backdrop-blur-md">
                Out of Stock
              </span>
            </div>
          )}
        </div>
        <div className="flex-1 space-y-4 text-center md:text-left">
          <div className="space-y-1">
            <h3 className="text-2xl font-serif font-bold tracking-tight">{product.name}</h3>
            <p className="text-sm text-muted-foreground">{product.material} • {product.motif}</p>
          </div>
          <p className="text-xl font-bold tracking-tighter">Rp {product.base_price.toLocaleString()}</p>
          <Button 
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/category/${slug}/${product.slug}`);
            }}
            className="rounded-full h-12 px-8 font-bold tracking-widest uppercase text-[10px]"
          >
            Detail Produk
          </Button>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div 
      layout
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="group space-y-6 cursor-pointer"
      onClick={() => navigate(`/category/${slug}/${product.slug}`)}
    >
      <div className="relative aspect-[4/5] rounded-3xl overflow-hidden bg-muted">
        <img 
          src={product.images?.[0]?.image_url} 
          alt={product.name} 
          onLoad={() => setIsLoaded(true)}
          className={`w-full h-full object-cover transition-all duration-1000 group-hover:scale-110 ${isLoaded ? 'scale-100 blur-0' : 'scale-110 blur-xl'}`}
        />
        
        {totalStock === 0 && (
          <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
            <span className="text-[10px] font-bold tracking-widest uppercase text-white border border-white/20 px-4 py-2 rounded-full backdrop-blur-md">
              Out of Stock
            </span>
          </div>
        )}
      </div>

      <div className="space-y-4 text-center">
        <div className="space-y-1">
          <h3 className="text-sm font-bold tracking-tight group-hover:text-secondary transition-colors uppercase">
            {product.name}
          </h3>
          <p className="text-lg font-bold tracking-tighter">
            Rp {product.base_price.toLocaleString()}
          </p>
        </div>
        
        <div className="pt-2">
          <Button
            variant="outline"
            className="w-full h-10 border-primary text-primary font-bold tracking-widest uppercase text-[10px] rounded-none hover:bg-primary hover:text-white transition-all duration-300"
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/category/${slug}/${product.slug}`);
            }}
          >
            Detail Produk
          </Button>
        </div>
      </div>
    </motion.div>
  );
}
