import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Button } from '../ui/button';
import { supabase } from '../../lib/supabase';
import { HeroBanner } from '../../types';
import { useNavigate } from 'react-router-dom';

export default function Hero() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [banners, setBanners] = useState<HeroBanner[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBanners();
  }, []);

  const fetchBanners = async () => {
    try {
      const { data, error } = await supabase
        .from('hero_banners')
        .select('*')
        .eq('is_active', true)
        .order('display_order', { ascending: true });

      if (error) throw error;
      setBanners(data || []);
    } catch (error) {
      console.error('Error fetching banners:', error);
    } finally {
      setLoading(false);
    }
  };

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev === banners.length - 1 ? 0 : prev + 1));
  };

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev === 0 ? banners.length - 1 : prev - 1));
  };

  useEffect(() => {
    if (banners.length > 1) {
      const timer = setInterval(nextSlide, 6000);
      return () => clearInterval(timer);
    }
  }, [banners.length]);

  if (loading) {
    return <div className="h-screen bg-background animate-pulse" />;
  }

  if (banners.length === 0) {
    // Fallback if no banners are active
    return (
      <section className="relative h-screen flex items-center justify-center overflow-hidden bg-background">
        <div className="container mx-auto px-6 text-center">
          <h1 className="text-6xl md:text-9xl font-serif font-bold tracking-tighter leading-[0.85] mb-8">
            AL-HAYAT <br />
            <span className="italic text-primary">{t('common.category').toUpperCase()}</span>
          </h1>
        </div>
      </section>
    );
  }

  const currentBanner = banners[currentIndex];

  if (!currentBanner) return null;

  return (
    <section className="relative h-screen flex items-center justify-center overflow-hidden bg-background">
      <AnimatePresence mode="wait">
        <motion.div
          key={currentBanner.id}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1 }}
          className="absolute inset-0 z-0"
        >
          <motion.img
            initial={{ scale: 1.1 }}
            animate={{ scale: 1 }}
            transition={{ duration: 6, ease: "linear" }}
            src={currentBanner.image_url || undefined}
            alt={currentBanner.main_title || ''}
            className="w-full h-full object-cover opacity-80"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent opacity-60" />
        </motion.div>
      </AnimatePresence>

      <div className="container mx-auto px-6 relative z-10 text-center md:text-left">
        <div className="max-w-4xl">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentBanner.id}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -30 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
            >
              <p className="text-[10px] md:text-xs font-bold tracking-[0.5em] text-primary uppercase mb-6">
                {currentBanner.sub_title}
              </p>
              
              <h1 
                className="text-6xl md:text-9xl font-serif font-bold tracking-tighter leading-[0.85] mb-8 whitespace-pre-line"
                dangerouslySetInnerHTML={{ __html: (currentBanner.main_title || '').replace(/\n/g, '<br />') }}
              />

              <div className="flex flex-col md:flex-row items-center gap-8">
                {currentBanner.show_button && (
                  <Button 
                    onClick={() => navigate(currentBanner.button_link || '/')}
                    className="h-16 px-12 bg-secondary text-primary font-bold tracking-[0.2em] uppercase hover:bg-primary hover:text-white transition-all duration-300 group"
                  >
                    {currentBanner.button_text || t('common.shop_now')}
                    <ArrowRight className="w-5 h-5 ml-3 group-hover:translate-x-2 transition-transform" />
                  </Button>
                )}
                
                <p className="text-sm md:text-base text-primary/70 max-w-xs leading-relaxed">
                  Elevating the browsing journey with bold aesthetics and effortless usability.
                </p>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* Navigation Controls */}
      {banners.length > 1 && (
        <div className="absolute bottom-12 right-12 z-20 flex gap-4">
          <button 
            onClick={prevSlide}
            className="w-12 h-12 rounded-full border border-primary/10 flex items-center justify-center hover:bg-primary hover:text-white transition-all"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button 
            onClick={nextSlide}
            className="w-12 h-12 rounded-full border border-primary/10 flex items-center justify-center hover:bg-primary hover:text-white transition-all"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      )}

      {/* Scroll Indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5, duration: 1 }}
        className="absolute bottom-12 left-1/2 -translate-x-1/2 flex flex-col items-center gap-4"
      >
        <span className="text-[10px] font-bold tracking-widest uppercase opacity-50">Scroll</span>
        <div className="w-[1px] h-12 bg-primary/10 relative overflow-hidden">
          <motion.div
            animate={{ y: ["0%", "200%"] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
            className="w-full h-1/3 bg-secondary absolute top-0"
          />
        </div>
      </motion.div>
    </section>
  );
}
