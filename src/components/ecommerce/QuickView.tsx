import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, ShoppingBag, Ruler, ChevronRight, ChevronLeft } from 'lucide-react';
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
  const { t, i18n } = useTranslation();

  const productName = product.name;
  const productDescription = product.description;

  // Extract unique colors and sizes from variants
  const availableColors = Array.from(new Set(product.variants?.map(v => v.color_option) || []));
  const availableSizes = Array.from(new Set(product.variants?.map(v => v.size_option) || []));

  const selectedVariant = product.variants?.find(
    v => v.color_option === selectedColor && v.size_option === selectedSize
  );

  const isOutOfStock = !selectedVariant || selectedVariant.stock_quantity === 0;
  const canAddToCart = selectedColor && selectedSize && !isOutOfStock;

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
          <div className="relative aspect-[3/4] bg-muted group">
            <motion.img
              key={currentImageIndex}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              src={product.images?.[currentImageIndex]?.image_url || ''}
              alt={productName}
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
            
            {product.images && product.images.length > 1 && (
              <>
                <div className="absolute inset-0 flex items-center justify-between px-4 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="rounded-full bg-white/80 backdrop-blur-sm hover:bg-white text-primary"
                    onClick={() => setCurrentImageIndex((prev) => (prev === 0 ? product.images!.length - 1 : prev - 1))}
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="rounded-full bg-white/80 backdrop-blur-sm hover:bg-white text-primary"
                    onClick={() => setCurrentImageIndex((prev) => (prev === product.images!.length - 1 ? 0 : prev + 1))}
                  >
                    <ChevronRight className="w-5 h-5" />
                  </Button>
                </div>
                <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2">
                  {product.images.map((_, idx) => (
                    <button
                      key={idx}
                      onClick={() => setCurrentImageIndex(idx)}
                      className={`w-1.5 h-1.5 rounded-full transition-all ${currentImageIndex === idx ? 'bg-white w-4' : 'bg-white/40'}`}
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
                <span className="text-[10px] font-bold tracking-widest uppercase flex items-center gap-2">
                  Color: <span className="text-primary">{selectedColor || 'Select Option'}</span>
                </span>
                <div className="flex flex-wrap gap-3">
                  {availableColors.map((color) => (
                    <button
                      key={color}
                      onClick={() => setSelectedColor(color)}
                      className={`px-4 py-2 text-[10px] font-bold tracking-widest uppercase border transition-all duration-300 ${
                        selectedColor === color 
                          ? 'bg-primary text-white border-primary shadow-lg shadow-primary/20' 
                          : 'bg-white text-primary border-muted hover:border-primary'
                      }`}
                    >
                      {color}
                    </button>
                  ))}
                </div>
              </div>

              {/* Size Selection */}
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] font-bold tracking-widest uppercase flex items-center gap-2">
                    Size: <span className="text-primary">{selectedSize || 'Select Option'}</span>
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
                  {availableSizes.map((size) => (
                    <Button
                      key={size}
                      variant={selectedSize === size ? 'default' : 'outline'}
                      className={`min-w-[60px] font-bold tracking-widest text-[10px] h-12 transition-all duration-300 ${
                        selectedSize === size 
                          ? 'bg-primary text-white shadow-lg shadow-primary/20' 
                          : 'hover:border-primary text-primary'
                      }`}
                      onClick={() => setSelectedSize(size)}
                    >
                      {size}
                    </Button>
                  ))}
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
