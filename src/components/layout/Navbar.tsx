import { useState, useEffect } from 'react';
import { ShoppingBag, Search, Menu, X, Globe } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useTranslation } from 'react-i18next';
import { Button } from '../ui/button';
import { Sheet, SheetContent, SheetTrigger } from '../ui/sheet';

interface NavbarProps {
  onCartClick: () => void;
  cartCount: number;
}

export default function Navbar({ onCartClick, cartCount }: NavbarProps) {
  const [isScrolled, setIsScrolled] = useState(false);
  const { t, i18n } = useTranslation();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { name: t('nav.essentials'), href: '#essentials' },
    { name: t('nav.occasion'), href: '#occasion' },
    { name: t('nav.seasonal'), href: '#seasonal' },
    { name: t('nav.size_guide'), href: '#size-guide' },
  ];

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
        <div className="flex-1 hidden md:flex items-center gap-8">
          {navLinks.slice(0, 2).map((link) => (
            <a
              key={link.name}
              href={link.href}
              className="text-xs font-semibold tracking-widest hover:text-hover transition-colors"
            >
              {link.name}
            </a>
          ))}
        </div>

        <div className="flex-1 flex justify-center">
          <a href="/" className="text-2xl md:text-3xl font-serif font-bold tracking-tighter">
            AL-HAYAT
          </a>
        </div>

        <div className="flex-1 flex items-center justify-end gap-6">
          <div className="hidden md:flex items-center gap-8">
            {navLinks.slice(2).map((link) => (
              <a
                key={link.name}
                href={link.href}
                className="text-xs font-semibold tracking-widest hover:text-hover transition-colors"
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
              <SheetContent side="right" className="w-full sm:w-[350px] bg-background">
                <div className="flex flex-col gap-8 mt-12">
                  {navLinks.map((link) => (
                    <a
                      key={link.name}
                      href={link.href}
                      className="text-2xl font-serif font-medium hover:text-hover transition-colors"
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
