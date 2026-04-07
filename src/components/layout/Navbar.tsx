import { useState, useEffect } from 'react';
import { ShoppingBag, Search, Menu, X, Globe } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useTranslation } from 'react-i18next';
import { Button } from '../ui/button';
import { Sheet, SheetContent, SheetTrigger } from '../ui/sheet';
import { Category } from '../../types';

interface NavbarProps {
  onCartClick: () => void;
  cartCount: number;
  categories: Category[];
}

export default function Navbar({ onCartClick, cartCount, categories }: NavbarProps) {
  const [isScrolled, setIsScrolled] = useState(false);
  const { t, i18n } = useTranslation();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = categories.map(cat => ({
    name: cat.name,
    href: `/category/${cat.slug}`
  }));

  // Add Size Guide as the last link if categories are few, or handle separately
  const allLinks = [...navLinks, { name: t('nav.size_guide'), href: '#size-guide' }];

  // Split links for desktop view (max 5 on each side if we have 10 total)
  const midPoint = Math.ceil(allLinks.length / 2);
  const leftLinks = allLinks.slice(0, midPoint);
  const rightLinks = allLinks.slice(midPoint);

  const toggleLanguage = () => {
    const newLang = i18n.language === 'en' ? 'id' : 'en';
    i18n.changeLanguage(newLang);
  };

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled ? 'bg-background/80 backdrop-blur-md border-b py-4' : 'bg-transparent py-6'
      }`}
    >
      <div className="container mx-auto px-6 flex items-center justify-between">
        <div className="flex-1 hidden md:flex items-center gap-6 overflow-x-auto no-scrollbar">
          {leftLinks.map((link) => (
            <a
              key={link.name}
              href={link.href}
              className="text-[10px] font-bold tracking-widest uppercase hover:text-secondary transition-colors whitespace-nowrap"
            >
              {link.name}
            </a>
          ))}
        </div>

        <div className="flex-shrink-0 px-8">
          <a href="/" className="text-2xl md:text-3xl font-serif font-bold tracking-tighter">
            AL-HAYAT
          </a>
        </div>

        <div className="flex-1 flex items-center justify-end gap-6">
          <div className="hidden md:flex items-center gap-6 overflow-x-auto no-scrollbar">
            {rightLinks.map((link) => (
              <a
                key={link.name}
                href={link.href}
                className="text-[10px] font-bold tracking-widest uppercase hover:text-secondary transition-colors whitespace-nowrap"
              >
                {link.name}
              </a>
            ))}
          </div>
          
          <div className="flex items-center gap-4">
            {/* Language Switcher */}
            <button 
              onClick={toggleLanguage}
              className="text-[10px] font-bold tracking-widest uppercase hover:text-secondary transition-colors flex items-center gap-1"
            >
              <span className={i18n.language === 'en' ? 'text-primary' : 'text-muted-foreground'}>EN</span>
              <span className="text-muted-foreground">|</span>
              <span className={i18n.language === 'id' ? 'text-primary' : 'text-muted-foreground'}>ID</span>
            </button>

            <Button variant="ghost" size="icon" className="hover:bg-transparent">
              <Search className="w-5 h-5" />
            </Button>
            <Button variant="ghost" size="icon" className="hover:bg-transparent relative" onClick={onCartClick}>
              <ShoppingBag className="w-5 h-5" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-secondary text-primary text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-bold">
                  {cartCount}
                </span>
              )}
            </Button>
            
            <Sheet>
              <SheetTrigger render={
                <Button variant="ghost" size="icon" className="md:hidden hover:bg-transparent">
                  <Menu className="w-6 h-6" />
                </Button>
              } />
              <SheetContent side="right" className="w-full sm:w-[350px] bg-background overflow-y-auto">
                <div className="flex flex-col gap-6 mt-12">
                  {allLinks.map((link) => (
                    <a
                      key={link.name}
                      href={link.href}
                      className="text-xl font-serif font-medium hover:text-secondary transition-colors"
                    >
                      {link.name}
                    </a>
                  ))}
                  <button 
                    onClick={toggleLanguage}
                    className="text-sm font-bold tracking-widest uppercase hover:text-secondary transition-colors flex items-center gap-2 mt-4"
                  >
                    <Globe className="w-4 h-4" />
                    {i18n.language === 'en' ? 'BAHASA INDONESIA' : 'ENGLISH'}
                  </button>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </nav>
  );
}
