import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { useTranslation } from 'react-i18next';
import { Product } from '../../types';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { formatCurrency } from '../../lib/utils';

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const navigate = useNavigate();
  const [isHovered, setIsHovered] = useState(false);
  const { t, i18n } = useTranslation();

  const productName = product.name;
  const totalStock = product.variants?.reduce((sum, v) => sum + v.stock_quantity, 0) || 0;
  const isOutOfStock = totalStock === 0;

  return (
    <motion.div
      className="group relative bg-white overflow-hidden"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6 }}
      onClick={() => navigate(`/category/${product.category?.slug || 'all'}/${product.slug}`)}
    >
      <div className="aspect-[3/4] overflow-hidden relative cursor-pointer">
        <motion.img
          src={product.images?.[0]?.image_url || undefined}
          alt={productName}
          className={`w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 ${isOutOfStock ? 'grayscale opacity-60' : ''}`}
          referrerPolicy="no-referrer"
        />
        
        {product.is_featured && !isOutOfStock && (
          <Badge className="absolute top-4 left-4 bg-secondary text-primary border-none font-semibold tracking-widest text-[10px] uppercase px-3 py-1">
            {t('common.best_seller')}
          </Badge>
        )}

        {isOutOfStock && (
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
            <Badge className="bg-destructive text-white border-none font-bold tracking-widest text-xs uppercase px-4 py-2 rounded-none">
              Stok Habis
            </Badge>
          </div>
        )}
      </div>

      <div className="mt-4 space-y-3">
        <div className="space-y-1">
          <p className="text-[10px] font-semibold tracking-widest text-muted-foreground uppercase">
            {product.category?.name || 'Uncategorized'}
          </p>
          <div className="flex justify-between items-start">
            <h3 className="text-sm font-medium tracking-tight group-hover:text-secondary transition-colors">
              {productName}
            </h3>
            <p className="text-sm font-medium">{formatCurrency(product.base_price)}</p>
          </div>
        </div>

        <div className="pt-2">
            <Button
              variant="outline"
              className="w-full h-10 border-primary text-primary font-bold tracking-widest uppercase text-[10px] rounded-none hover:bg-primary hover:text-white transition-all duration-300"
              onClick={(e) => {
                e.stopPropagation();
                navigate(`/category/${product.category?.slug || 'all'}/${product.slug}`);
              }}
            >
              {t('common.detail_produk')}
            </Button>
        </div>
      </div>
    </motion.div>
  );
}
