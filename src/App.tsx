import { useState, useEffect } from 'react';
import { Routes, Route, useNavigate, useLocation, Navigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { useTranslation } from 'react-i18next';
import Navbar from './components/layout/Navbar';
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
import { MOCK_PRODUCTS } from './lib/mock-data';
import { Toaster } from './components/ui/sonner';
import { Button } from './components/ui/button';
import { CartItem } from './types';
import { useAuth } from './hooks/useAuth';

export default function App() {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const { user, isAdmin, signOut, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation();

  const handleUpdateQuantity = (id: string, delta: number) => {
    setCartItems((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, quantity: Math.max(1, item.quantity + delta) } : item
      )
    );
  };

  const handleRemoveFromCart = (id: string) => {
    setCartItems((prev) => prev.filter((item) => item.id !== id));
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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background selection:bg-secondary selection:text-white">
      {!isAdminRoute && !isLoginPage && (
        <Navbar onCartClick={() => setIsCartOpen(true)} cartCount={cartItems.length} />
      )}
      
      <Routes>
        <Route path="/" element={
          <main>
            {/* Hero Section */}
            <Hero />

            {/* Category Grid */}
            <CategoryGrid />

            {/* Featured Products Section */}
            <section id="essentials" className="py-24 bg-background">
              <div className="container mx-auto px-6">
                <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-8">
                  <div className="space-y-4">
                    <p className="text-[10px] font-bold tracking-[0.3em] text-secondary uppercase">
                      {t('common.curated_selection')}
                    </p>
                    <h2 className="text-5xl md:text-7xl font-serif font-bold tracking-tight leading-tight">
                      The <span className="italic">{t('common.essentials')}</span>
                    </h2>
                  </div>
                  <p className="text-sm text-muted-foreground max-w-xs leading-relaxed">
                    {t('common.discover_essentials')}
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-8 gap-y-16">
                  {MOCK_PRODUCTS.map((product) => (
                    <ProductCard key={product.id} product={product} onAddToCart={handleAddToCart} />
                  ))}
                </div>
              </div>
            </section>

            {/* Size Guide Section */}
            <SizeGuideSection />

            {/* Occasion Wear Section */}
            <section id="occasion" className="py-24 bg-background border-t">
              <div className="container mx-auto px-6">
                 <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-8">
                  <div className="space-y-4">
                    <p className="text-[10px] font-bold tracking-[0.3em] text-secondary uppercase">
                      {t('common.exquisite_craftsmanship')}
                    </p>
                    <h2 className="text-5xl md:text-7xl font-serif font-bold tracking-tight leading-tight">
                      {t('common.occasion_wear')} <span className="italic">Wear</span>
                    </h2>
                  </div>
                  <p className="text-sm text-muted-foreground max-w-xs leading-relaxed">
                    {t('common.discover_occasion')}
                  </p>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-16">
                  {MOCK_PRODUCTS.filter(p => p.category?.name === 'Occasion Wear').map((product) => (
                    <ProductCard key={product.id} product={product} onAddToCart={handleAddToCart} />
                  ))}
                </div>
              </div>
            </section>

            {/* Seasonal Section */}
            <section id="seasonal" className="py-24 bg-background border-t">
              <div className="container mx-auto px-6">
                 <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-8">
                  <div className="space-y-4">
                    <p className="text-[10px] font-bold tracking-[0.3em] text-secondary uppercase">
                      {t('common.contemporary_designs')}
                    </p>
                    <h2 className="text-5xl md:text-7xl font-serif font-bold tracking-tight leading-tight">
                      {t('common.seasonal')} <span className="italic">Edit</span>
                    </h2>
                  </div>
                  <p className="text-sm text-muted-foreground max-w-xs leading-relaxed">
                    {t('common.discover_seasonal')}
                  </p>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-16">
                  {MOCK_PRODUCTS.filter(p => p.category?.name === 'Seasonal').map((product) => (
                    <ProductCard key={product.id} product={product} onAddToCart={handleAddToCart} />
                  ))}
                </div>
              </div>
            </section>
          </main>
        } />
        <Route path="/checkout" element={<Checkout items={cartItems} onClearCart={clearCart} />} />
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
                  Bringing a seamless and stylish shopping experience to life by combining bold aesthetics, clean layouts, and effortless usability to elevate the browsing journey.
                </p>
                <div className="flex gap-8">
                  <a href="#" className="text-[10px] font-bold tracking-widest uppercase hover:text-secondary transition-colors">Instagram</a>
                  <a href="#" className="text-[10px] font-bold tracking-widest uppercase hover:text-secondary transition-colors">Pinterest</a>
                  <a href="#" className="text-[10px] font-bold tracking-widest uppercase hover:text-secondary transition-colors">Facebook</a>
                </div>
              </div>
              
              <div className="space-y-6">
                <h4 className="text-[10px] font-bold tracking-widest uppercase text-secondary">Shop</h4>
                <div className="flex flex-col gap-4">
                  <a href="#essentials" className="text-sm hover:text-secondary transition-colors">{t('nav.essentials')}</a>
                  <a href="#occasion" className="text-sm hover:text-secondary transition-colors">{t('nav.occasion')}</a>
                  <a href="#seasonal" className="text-sm hover:text-secondary transition-colors">{t('nav.seasonal')}</a>
                  <a href="#size-guide" className="text-sm hover:text-secondary transition-colors">{t('nav.size_guide')}</a>
                </div>
              </div>

              <div className="space-y-6">
                <h4 className="text-[10px] font-bold tracking-widest uppercase text-secondary">Support</h4>
                <div className="flex flex-col gap-4">
                  <a href="#" className="text-sm hover:text-secondary transition-colors">Contact Us</a>
                  <a href="#" className="text-sm hover:text-secondary transition-colors">Shipping & Returns</a>
                  <a href="#" className="text-sm hover:text-secondary transition-colors">Privacy Policy</a>
                  <a href="#" className="text-sm hover:text-secondary transition-colors">Terms of Service</a>
                  <button 
                    onClick={() => navigate('/admin')}
                    className="text-sm text-left hover:text-secondary transition-colors opacity-30 hover:opacity-100"
                  >
                    Admin Portal
                  </button>
                </div>
              </div>
            </div>
            
            <div className="mt-24 pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-8">
              <p className="text-[10px] font-bold tracking-widest uppercase opacity-50">© 2026 AL-HAYAT. All rights reserved.</p>
              <div className="flex gap-8 opacity-50">
                <span className="text-[10px] font-bold tracking-widest uppercase">Visa</span>
                <span className="text-[10px] font-bold tracking-widest uppercase">Mastercard</span>
                <span className="text-[10px] font-bold tracking-widest uppercase">Apple Pay</span>
              </div>
            </div>
          </div>
        </footer>
      )}

      {isAdmin && isAdminRoute && (
        <Button 
          onClick={() => signOut()}
          className="fixed bottom-8 right-8 bg-primary text-white font-bold tracking-widest text-[10px] uppercase h-12 px-8 shadow-2xl z-50"
        >
          Sign Out
        </Button>
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
