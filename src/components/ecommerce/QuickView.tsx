import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, ShoppingBag, Ruler, ChevronRight, ChevronLeft } from 'lucide-react';
import InnerImageZoom from 'react-inner-image-zoom';
import 'react-inner-image-zoom/lib/styles.min.css';
import { useTranslation } from 'react-i18next';
import { Product, CartItem } from '../../types';
import { Button } from '../ui/button';
import { Dialog, DialogContent, DialogTitle } from '../ui/dialog';
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerTrigger } from '../ui/drawer';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { MOCK_SIZE_GUIDE } from '../../lib/mock-data';
import { toast } from 'sonner';
import { formatCurrency } from '../../lib/utils';

interface QuickViewProps {
  product: Product;
  isOpen: boolean;
  onClose: () => void;
  onAddToCart: (item: CartItem) => void;
}

export default function QuickView({ product, isOpen, onClose, onAddToCart }: QuickViewProps) {
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedColor, setSelectedColor] = useState('');
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [hoveredSwatchUrl, setHoveredSwatchUrl] = useState<string | null>(null);
  const [showVariantImage, setShowVariantImage] = useState(false);
  const { t, i18n } = useTranslation();

  const productName = product.name;
  const productDescription = product.description;

  const availableColors = Array.from(
    (product.variants || []).reduce((acc, v) => {
      const colorName = v.color_option;
      const existing = acc.get(colorName);
      
      if (!existing || (!existing.swatch_url && v.color_swatch_url)) {
        const colorVariants = product.variants?.filter(variant => variant.color_option === colorName) || [];
        const totalStock = colorVariants.reduce((sum, variant) => sum + variant.stock_quantity, 0);
        
        acc.set(colorName, {
          name: colorName,
          swatch_url: v.color_swatch_url || (existing?.swatch_url || ''),
          isOutOfStock: totalStock === 0
        });
      }
      return acc;
    }, new Map<string, { name: string; swatch_url: string; isOutOfStock: boolean }>()).values()
  );

  const variantsForColor = (product.variants || [])
    .filter(v => v.color_option === selectedColor)
    .sort((a, b) => {
      const sizes = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];
      return sizes.indexOf(a.size_option) - sizes.indexOf(b.size_option);
    });

  const availableSizes = Array.from(new Set(variantsForColor.map(v => v.size_option)));

  const selectedVariant = product.variants?.find(
    v => v.color_option === selectedColor && v.size_option === selectedSize
  );

  const isOutOfStock = !selectedVariant || selectedVariant.stock_quantity === 0;
  const canAddToCart = selectedColor && selectedSize && !isOutOfStock;

  const displayImageUrl = hoveredSwatchUrl || (showVariantImage ? selectedVariant?.color_swatch_url : null) || product.images?.[currentImageIndex]?.image_url;

  const handleAddToCart = () => {
    if (!canAddToCart || !selectedVariant) return;

    onAddToCart({
      id: product.id,
      name: product.name,
      price: product.base_price,
      image: product.images?.[0]?.image_url || '',
      variantId: selectedVariant.id,
      selectedSize,
      selectedColor,
      selectedColorSwatchUrl: selectedVariant.color_swatch_url,
      quantity: 1,
    });
    toast.success(`${productName} ${t('common.add_to_cart')}`);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl p-0 overflow-hidden bg-background border-none shadow-2xl">
        <DialogTitle className="sr-only">{productName} Quick View</DialogTitle>
        <div className="grid grid-cols-1 md:grid-cols-2 h-full max-h-[90vh] overflow-y-auto">
          {/* Image Gallery */}
          <div className="relative aspect-[3/4] bg-muted group flex items-center justify-center">
            <AnimatePresence mode="wait">
              {displayImageUrl ? (
                <motion.div 
                  key={displayImageUrl}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                  className="w-full h-full"
                >
                  <InnerImageZoom
                    src={displayImageUrl}
                    zoomSrc={displayImageUrl}
                    imgAttributes={{ 
                      alt: productName,
                      referrerPolicy: "no-referrer"
                    }}
                    className="w-full h-full object-cover"
                    zoomType="hover"
                    zoomScale={1.5}
                    hideHint={true}
                  />
                </motion.div>
              ) : (
                <div className="w-full h-full bg-muted flex items-center justify-center">
                  <ShoppingBag className="w-12 h-12 text-muted-foreground/20" />
                </div>
              )}
            </AnimatePresence>
            
            {product.images && product.images.length > 1 && (
              <>
                <div className="absolute inset-0 flex items-center justify-between px-4 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="rounded-full bg-white/80 backdrop-blur-sm hover:bg-white text-primary"
                    onClick={() => {
                      setCurrentImageIndex((prev) => (prev === 0 ? product.images!.length - 1 : prev - 1));
                      setShowVariantImage(false);
                    }}
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="rounded-full bg-white/80 backdrop-blur-sm hover:bg-white text-primary"
                    onClick={() => {
                      setCurrentImageIndex((prev) => (prev === product.images!.length - 1 ? 0 : prev + 1));
                      setShowVariantImage(false);
                    }}
                  >
                    <ChevronRight className="w-5 h-5" />
                  </Button>
                </div>
                <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2">
                  {product.images.map((_, idx) => (
                    <button
                      key={idx}
                      onClick={() => {
                        setCurrentImageIndex(idx);
                        setShowVariantImage(false);
                      }}
                      className={`w-1.5 h-1.5 rounded-full transition-all ${!showVariantImage && currentImageIndex === idx ? 'bg-white w-4' : 'bg-white/40'}`}
                    />
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Product Details */}
          <div className="p-8 md:p-12 flex flex-col space-y-8">
            <div className="space-y-4">
              <div className="flex justify-between items-start">
                <div className="space-y-1">
                  <p className="text-[10px] font-bold tracking-[0.2em] text-muted-foreground uppercase">
                    {product.category?.name || 'Uncategorized'} • {product.age_category}
                  </p>
                  <h2 className="text-3xl font-serif font-bold tracking-tight">{productName}</h2>
                </div>
                <p className="text-2xl font-serif font-bold text-secondary">{formatCurrency(product.base_price)}</p>
              </div>
              
              <div className="flex flex-wrap gap-4 py-4 border-y border-muted">
                <div className="space-y-1">
                  <p className="text-[8px] font-bold tracking-widest uppercase text-muted-foreground">Motif</p>
                  <p className="text-xs font-medium">{product.motif}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-[8px] font-bold tracking-widest uppercase text-muted-foreground">Material</p>
                  <p className="text-xs font-medium">{product.material}</p>
                </div>
              </div>

              <p className="text-sm text-muted-foreground leading-relaxed">
                {productDescription}
              </p>
            </div>

            <div className="space-y-8">
              {/* Color Selection */}
              <div className="space-y-4">
                <span className="text-[10px] font-bold tracking-widest uppercase flex items-center gap-2 text-[#2D2D2D]">
                  Warna: <span className="text-primary">{selectedColor || 'Select Option'}</span>
                </span>
                <div className="flex flex-wrap gap-3">
                  {availableColors.map((color) => (
                    <button
                      key={color.name}
                      onClick={() => {
                        setSelectedColor(color.name);
                        setShowVariantImage(true);
                      }}
                      onMouseEnter={() => setHoveredSwatchUrl(color.swatch_url)}
                      onMouseLeave={() => setHoveredSwatchUrl(null)}
                      className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border-2 transition-all group ${
                        selectedColor === color.name 
                          ? 'border-[#2D2D2D] bg-white shadow-[4px_4px_0px_0px_rgba(45,45,45,1)]' 
                          : 'border-[#2D2D2D]/10 bg-white/50 hover:border-[#2D2D2D]/30'
                      }`}
                    >
                      <div className={`w-6 h-6 rounded-lg overflow-hidden border border-[#2D2D2D]/10 shrink-0 ${color.isOutOfStock ? 'grayscale opacity-50' : ''}`}>
                        <img 
                          src={color.swatch_url || undefined} 
                          alt={color.name} 
                          className="w-full h-full object-cover"
                          referrerPolicy="no-referrer"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = 'https://placehold.co/100x100?text=' + color.name[0];
                          }}
                        />
                      </div>
                      <span className={`text-[10px] font-bold tracking-tight ${color.isOutOfStock ? 'text-muted-foreground/60' : 'text-[#2D2D2D]'}`}>
                        {color.name}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Size Selection */}
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] font-bold tracking-widest uppercase flex items-center gap-2 text-[#2D2D2D]">
                    Ukuran: <span className="text-primary">{selectedSize || 'Select Option'}</span>
                  </span>
                  
                  <Drawer>
                    <DrawerTrigger asChild>
                      <Button variant="link" className="p-0 h-auto text-[10px] font-bold tracking-widest uppercase flex items-center gap-2 hover:text-secondary">
                        <Ruler className="w-3 h-3" />
                        Size Guide
                      </Button>
                    </DrawerTrigger>
                    <DrawerContent className="bg-background max-h-[80vh]">
                      <div className="container mx-auto px-6 py-12 max-w-2xl">
                        <DrawerHeader className="px-0 mb-8">
                          <DrawerTitle className="text-3xl font-serif font-bold tracking-tight text-center text-primary">
                            Size Guide: {product.category?.name || 'Uncategorized'}
                          </DrawerTitle>
                        </DrawerHeader>
                        
                        <div className="overflow-hidden rounded-lg border border-primary/10">
                          <Table>
                            <TableHeader className="bg-primary text-white">
                              <TableRow>
                                <TableHead className="text-white font-bold tracking-widest uppercase text-[10px]">Size</TableHead>
                                <TableHead className="text-white font-bold tracking-widest uppercase text-[10px]">Chest</TableHead>
                                <TableHead className="text-white font-bold tracking-widest uppercase text-[10px]">Length</TableHead>
                                <TableHead className="text-white font-bold tracking-widest uppercase text-[10px]">Sleeve</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {MOCK_SIZE_GUIDE[0].measurements.map((m) => (
                                <TableRow key={m.size} className="hover:bg-muted/50 transition-colors">
                                  <TableCell className="font-bold text-primary">{m.size}</TableCell>
                                  <TableCell className="text-primary/80">{m.chest}</TableCell>
                                  <TableCell className="text-primary/80">{m.length}</TableCell>
                                  <TableCell className="text-primary/80">{m.sleeve}</TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </div>
                      </div>
                    </DrawerContent>
                  </Drawer>
                </div>
                <div className="flex flex-wrap gap-2">
                  {availableSizes.map((size) => {
                    const variant = variantsForColor.find(v => v.size_option === size);
                    const isOutOfStock = !variant || variant.stock_quantity === 0;
                    
                    return (
                      <Button
                        key={size}
                        disabled={isOutOfStock}
                        variant={selectedSize === size ? 'default' : 'outline'}
                        className={`min-w-[50px] font-bold tracking-widest text-[10px] h-10 transition-all duration-300 border-2 ${
                          selectedSize === size 
                            ? 'bg-[#2D2D2D] text-white border-[#2D2D2D] shadow-[4px_4px_0px_0px_rgba(45,45,45,0.2)]' 
                            : isOutOfStock
                              ? 'border-[#2D2D2D]/5 bg-[#2D2D2D]/5 text-muted-foreground/40 cursor-not-allowed'
                              : 'border-[#2D2D2D]/10 text-[#2D2D2D] hover:border-[#2D2D2D]/30'
                        }`}
                        onClick={() => setSelectedSize(size)}
                      >
                        {size}
                      </Button>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="pt-4 space-y-4">
              {selectedColor && selectedSize && (
                <p className="text-[10px] font-bold tracking-widest uppercase text-center">
                  {isOutOfStock ? (
                    <span className="text-destructive">Currently Out of Stock</span>
                  ) : (
                    <span className="text-sage-dark">In Stock: {selectedVariant?.stock_quantity} units available</span>
                  )}
                </p>
              )}
              
              <Button 
                disabled={!canAddToCart}
                className={`w-full h-14 font-bold tracking-[0.2em] uppercase transition-all duration-300 flex items-center justify-center gap-3 ${
                  canAddToCart 
                    ? 'bg-primary text-white hover:bg-primary/90 shadow-xl shadow-primary/10' 
                    : 'bg-muted text-muted-foreground cursor-not-allowed'
                }`}
                onClick={handleAddToCart}
              >
                <ShoppingBag className="w-5 h-5" />
                {isOutOfStock && selectedColor && selectedSize ? 'Out of Stock' : 'Add to Cart'}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
