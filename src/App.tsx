import { useState, useEffect } from 'react';
import { Routes, Route, useNavigate, useLocation, Navigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { useTranslation } from 'react-i18next';
import Navbar from './components/layout/Navbar';
import ScrollToTop from './components/layout/ScrollToTop';
import Hero from './components/ecommerce/Hero';
import CategoryGrid from './components/ecommerce/CategoryGrid';
import ProductCard from './components/ecommerce/ProductCard';
import SizeGuideSection from './components/ecommerce/SizeGuideSection';
import CartDrawer from './components/ecommerce/CartDrawer';
import AdminDashboard from './components/admin/AdminDashboard';
import Login from './pages/admin/Login';
import ProtectedRoute from './components/admin/ProtectedRoute';
import Checkout from './pages/Checkout';
import Success from './pages/Success';
import CategoryPage from './pages/CategoryPage';
import ProductDetailPage from './pages/ProductDetailPage';
import { MOCK_PRODUCTS } from './lib/mock-data';
import { Toaster } from './components/ui/sonner';
import { Button } from './components/ui/button';
import { CartItem, Category, Product } from './types';
import { useAuth } from './hooks/useAuth';
import { supabase } from './lib/supabase';
import { toast } from 'sonner';

export default function App() {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const { user, isAdmin, signOut, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation();

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    setLoadingData(true);
    try {
      // Fetch Categories
      const { data: catData, error: catError } = await supabase
        .from('categories')
        .select('*')
        .order('name', { ascending: true });
      
      if (catError) throw catError;
      setCategories(catData || []);

      // Fetch Products with images and variants
      const { data: prodData, error: prodError } = await supabase
        .from('products')
        .select(`
          *,
          category:categories(*),
          images:product_images(*),
          variants:variants!variants_product_id_fkey(*)
        `)
        .order('created_at', { ascending: false });

      if (prodError) {
        console.error('Error fetching products with joins, falling back to mock data:', prodError);
        setProducts(MOCK_PRODUCTS);
      } else {
        setProducts(prodData || []);
      }
    } catch (error: any) {
      console.error('Error fetching initial data:', error);
      toast.error('Failed to load store data');
      setProducts(MOCK_PRODUCTS);
    } finally {
      setLoadingData(false);
    }
  };

  const handleUpdateQuantity = (id: string, size: string, color: string, delta: number) => {
    setCartItems((prev) =>
      prev.map((item) =>
        item.id === id && item.selectedSize === size && item.selectedColor === color
          ? { ...item, quantity: Math.max(1, item.quantity + delta) }
          : item
      )
    );
  };

  const handleRemoveFromCart = (id: string, size: string, color: string) => {
    setCartItems((prev) => prev.filter((item) => !(item.id === id && item.selectedSize === size && item.selectedColor === color)));
  };

  const handleAddToCart = (item: CartItem) => {
    setCartItems((prev) => {
      const existing = prev.find((i) => i.id === item.id && i.selectedSize === item.selectedSize && i.selectedColor === item.selectedColor);
      if (existing) {
        return prev.map((i) =>
          i.id === item.id && i.selectedSize === item.selectedSize && i.selectedColor === item.selectedColor
            ? { ...i, quantity: i.quantity + item.quantity }
            : i
        );
      }
      return [...prev, item];
    });
    setIsCartOpen(true);
  };

  const clearCart = () => setCartItems([]);

  const isAdminRoute = location.pathname.startsWith('/admin');
  const isLoginPage = location.pathname === '/login';

  if (loading || loadingData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background selection:bg-secondary selection:text-primary">
      <ScrollToTop />
      {!isAdminRoute && !isLoginPage && (
        <Navbar onCartClick={() => setIsCartOpen(true)} cartCount={cartItems.length} categories={categories} />
      )}
      
      <Routes>
        <Route path="/" element={
          <main>
            {/* Hero Section */}
            <Hero />

            {/* Category Grid */}
            <CategoryGrid categories={categories} />

            {/* Dynamic Category Sections */}
            {categories.map((category, index) => {
              const categoryProducts = products.filter(p => p.category_id === category.id);
              if (categoryProducts.length === 0) return null;

              return (
                <section 
                  key={category.id} 
                  id={category.slug} 
                  className={`py-24 bg-background ${index > 0 ? 'border-t' : ''}`}
                >
                  <div className="container mx-auto px-6">
                    <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-8">
                      <div className="space-y-4">
                        <p className="text-[10px] font-bold tracking-[0.3em] text-primary/60 uppercase">
                          {category.name} {t('common.category')}
                        </p>
                        <h2 className="text-5xl md:text-7xl font-serif font-bold tracking-tight leading-tight">
                          {category.name.split(' ')[0]} <span className="italic">{category.name.split(' ').slice(1).join(' ') || 'Edit'}</span>
                        </h2>
                      </div>
                      <p className="text-sm text-muted-foreground max-w-xs leading-relaxed">
                        {category.description || `Temukan koleksi eksklusif ${category.name} kami, dibuat dengan keanggunan dan gaya.`}
                      </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-8 gap-y-16">
                      {categoryProducts.map((product) => (
                        <ProductCard key={product.id} product={product} />
                      ))}
                    </div>
                  </div>
                </section>
              );
            })}

            {/* Size Guide Section */}
            <SizeGuideSection />
          </main>
        } />
        <Route path="/checkout" element={<Checkout items={cartItems} onClearCart={clearCart} />} />
        <Route path="/category/:slug" element={<CategoryPage onAddToCart={handleAddToCart} />} />
        <Route path="/category/:categorySlug/:productSlug" element={<ProductDetailPage onAddToCart={handleAddToCart} />} />
        <Route path="/success" element={<Success />} />
        <Route path="/login" element={<Login />} />
        <Route path="/admin" element={
          <ProtectedRoute requireAdmin>
            <AdminDashboard />
          </ProtectedRoute>
        } />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>

      {!isAdminRoute && !isLoginPage && (
        <footer className="bg-primary text-white py-24 border-t border-white/10">
          <div className="container mx-auto px-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-16">
              <div className="md:col-span-2 space-y-8">
                <h2 className="text-4xl font-serif font-bold tracking-tighter">AL-HAYAT</h2>
                <p className="text-sm text-white/60 max-w-md leading-relaxed">
                  Menghadirkan pengalaman belanja yang lancar dan penuh gaya dengan memadukan estetika berani, tata letak bersih, dan kemudahan penggunaan untuk meningkatkan perjalanan belanja Anda.
                </p>
                <div className="flex gap-8">
                  <a href="#" className="text-[10px] font-bold tracking-widest uppercase hover:text-secondary transition-colors">Instagram</a>
                  <a href="#" className="text-[10px] font-bold tracking-widest uppercase hover:text-secondary transition-colors">Pinterest</a>
                  <a href="#" className="text-[10px] font-bold tracking-widest uppercase hover:text-secondary transition-colors">Facebook</a>
                </div>
              </div>
              
              <div className="space-y-6">
                <h4 className="text-[10px] font-bold tracking-widest uppercase text-secondary">{t('common.category')}</h4>
                <div className="flex flex-col gap-4">
                  {categories.map(cat => (
                    <Link key={cat.id} to={`/category/${cat.slug}`} className="text-sm hover:text-secondary transition-colors">{cat.name}</Link>
                  ))}
                  <a href="#size-guide" className="text-sm hover:text-secondary transition-colors">{t('common.size_guide')}</a>
                </div>
              </div>

              <div className="space-y-6">
                <h4 className="text-[10px] font-bold tracking-widest uppercase text-secondary">{t('common.support')}</h4>
                <div className="flex flex-col gap-4">
                  <a href="#" className="text-sm hover:text-secondary transition-colors">Hubungi Kami</a>
                  <a href="#" className="text-sm hover:text-secondary transition-colors">Pengiriman & Pengembalian</a>
                  <a href="#" className="text-sm hover:text-secondary transition-colors">Kebijakan Privasi</a>
                  <a href="#" className="text-sm hover:text-secondary transition-colors">Syarat & Ketentuan</a>
                  <button 
                    onClick={() => navigate('/admin')}
                    className="text-sm text-left hover:text-secondary transition-colors opacity-30 hover:opacity-100"
                  >
                    Portal Admin
                  </button>
                </div>
              </div>
            </div>
            
            <div className="mt-24 pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-8">
              <p className="text-[10px] font-bold tracking-widest uppercase opacity-50">© 2026 AL-HAYAT. Hak cipta dilindungi undang-undang.</p>
              <div className="flex gap-8 opacity-50">
                <span className="text-[10px] font-bold tracking-widest uppercase">Visa</span>
                <span className="text-[10px] font-bold tracking-widest uppercase">Mastercard</span>
                <span className="text-[10px] font-bold tracking-widest uppercase">Apple Pay</span>
              </div>
            </div>
          </div>
        </footer>
      )}

      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        items={cartItems}
        onUpdateQuantity={handleUpdateQuantity}
        onRemove={handleRemoveFromCart}
      />
      <Toaster />
    </div>
  );
}
