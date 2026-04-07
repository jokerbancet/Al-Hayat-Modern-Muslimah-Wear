import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Eye, ShoppingBag } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Product, CartItem } from '../../types';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import QuickView from './QuickView';

interface ProductCardProps {
  product: Product;
  onAddToCart: (item: CartItem) => void;
}

export default function ProductCard({ product, onAddToCart }: ProductCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [isQuickViewOpen, setIsQuickViewOpen] = useState(false);
  const { i18n } = useTranslation();

  const productName = product.name;

  const handleQuickAdd = () => {
    onAddToCart({
      id: product.id,
      name: product.name,
      price: product.base_price,
      image: product.images?.[0]?.url || '',
      variantId: `${product.id}-default`,
      selectedSize: 'M',
      selectedColor: 'Sand',
      quantity: 1,
    });
  };

  return (
    <>
      <motion.div
        className="group relative bg-white overflow-hidden"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
      >
        <div className="aspect-[3/4] overflow-hidden relative">
          <motion.img
            src={product.images?.[0]?.url || ''}
            alt={productName}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            referrerPolicy="no-referrer"
          />
          
          {product.is_featured && (
            <Badge className="absolute top-4 left-4 bg-secondary text-primary border-none font-semibold tracking-widest text-[10px] uppercase px-3 py-1">
              Featured
            </Badge>
          )}

          <AnimatePresence>
            {isHovered && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 bg-black/20 flex items-center justify-center gap-4"
              >
                <Button
                  variant="secondary"
                  size="icon"
                  className="rounded-full w-12 h-12 bg-white text-primary hover:bg-hover hover:text-white transition-all duration-300"
                  onClick={() => setIsQuickViewOpen(true)}
                >
                  <Eye className="w-5 h-5" />
                </Button>
                <Button
                  variant="secondary"
                  size="icon"
                  className="rounded-full w-12 h-12 bg-white text-primary hover:bg-hover hover:text-white transition-all duration-300"
                  onClick={handleQuickAdd}
                >
                  <ShoppingBag className="w-5 h-5" />
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="mt-4 space-y-1">
          <p className="text-[10px] font-semibold tracking-widest text-muted-foreground uppercase">
            {product.category?.name}
          </p>
          <div className="flex justify-between items-start">
            <h3 className="text-sm font-medium tracking-tight group-hover:text-secondary transition-colors">
              {productName}
            </h3>
            <p className="text-sm font-medium">${product.base_price}</p>
          </div>
        </div>
      </motion.div>

      <QuickView
        product={product}
        isOpen={isQuickViewOpen}
        onClose={() => setIsQuickViewOpen(false)}
        onAddToCart={onAddToCart}
      />
    </>
  );
}
