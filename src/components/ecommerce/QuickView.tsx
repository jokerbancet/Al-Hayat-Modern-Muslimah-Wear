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
  const [selectedSize, setSelectedSize] = useState('M');
  const [selectedColor, setSelectedColor] = useState('Sand');
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const { t, i18n } = useTranslation();

  const productName = product.name;
  const productDescription = product.description;

  const colors = ['Sand', 'Charcoal', 'Sage'];
  const sizes = ['S', 'M', 'L', 'XL'];

  const sizeGuide = MOCK_SIZE_GUIDE.find(sg => sg.category === 'Abayas') || MOCK_SIZE_GUIDE[0];

  const handleAddToCart = () => {
    onAddToCart({
      id: product.id,
      name: product.name,
      price: product.base_price,
      image: product.images?.[0]?.url || '',
      variantId: `${product.id}-${selectedSize}-${selectedColor}`,
      selectedSize,
      selectedColor,
      quantity: 1,
    });
    toast.success(`${productName} ${t('common.add_to_cart')}`);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl p-0 overflow-hidden bg-background border-none shadow-2xl">
        <DialogTitle className="sr-only">{productName} Quick View</DialogTitle>
        <div className="grid grid-cols-1 md:grid-cols-2 h-full max-h-[90vh] overflow-y-auto">
          {/* Image Gallery */}
          <div className="relative aspect-[3/4] bg-muted">
            <motion.img
              key={currentImageIndex}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              src={product.images?.[currentImageIndex]?.url || ''}
              alt={productName}
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
            
            {product.images && product.images.length > 1 && (
              <div className="absolute inset-0 flex items-center justify-between px-4">
                <Button
                  variant="ghost"
                  size="icon"
                  className="rounded-full bg-white/50 backdrop-blur-sm hover:bg-white"
                  onClick={() => setCurrentImageIndex((prev) => (prev === 0 ? product.images.length - 1 : prev - 1))}
                >
                  <ChevronLeft className="w-5 h-5" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="rounded-full bg-white/50 backdrop-blur-sm hover:bg-white"
                  onClick={() => setCurrentImageIndex((prev) => (prev === product.images.length - 1 ? 0 : prev + 1))}
                >
                  <ChevronRight className="w-5 h-5" />
                </Button>
              </div>
            )}
          </div>

          {/* Product Details */}
          <div className="p-8 md:p-12 flex flex-col justify-center space-y-8">
            <div className="space-y-4">
              <p className="text-[10px] font-semibold tracking-[0.2em] text-muted-foreground uppercase">
                {product.category?.name}
              </p>
              <h2 className="text-3xl font-serif font-bold tracking-tight">{productName}</h2>
              <p className="text-2xl font-medium">{formatCurrency(product.base_price)}</p>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {productDescription}
              </p>
            </div>

            <div className="space-y-6">
              {/* Color Selection */}
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] font-bold tracking-widest uppercase">Color: {selectedColor}</span>
                </div>
                <div className="flex gap-3">
                  {colors.map((color) => (
                    <button
                      key={color}
                      onClick={() => setSelectedColor(color)}
                      className={`w-8 h-8 rounded-full border-2 transition-all duration-300 ${
                        selectedColor === color ? 'border-primary scale-110' : 'border-transparent'
                      }`}
                      style={{ backgroundColor: color === 'Sand' ? '#F4C2C2' : color === 'Charcoal' ? '#3E2723' : '#B2AC88' }}
                    />
                  ))}
                </div>
              </div>

              {/* Size Selection */}
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] font-bold tracking-widest uppercase">Size: {selectedSize}</span>
                  
                  <Drawer>
                    <DrawerTrigger asChild>
                      <Button variant="link" className="p-0 h-auto text-[10px] font-bold tracking-widest uppercase flex items-center gap-2 hover:text-hover">
                        <Ruler className="w-3 h-3" />
                        {t('common.size_guide')}
                      </Button>
                    </DrawerTrigger>
                    <DrawerContent className="bg-background max-h-[80vh]">
                      <div className="container mx-auto px-6 py-12 max-w-2xl">
                        <DrawerHeader className="px-0 mb-8">
                          <DrawerTitle className="text-3xl font-serif font-bold tracking-tight text-center text-primary">
                            {t('common.size_guide')}: {sizeGuide.category}
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
                                {sizeGuide.measurements[0].waist && (
                                  <TableHead className="text-white font-bold tracking-widest uppercase text-[10px]">Waist</TableHead>
                                )}
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {sizeGuide.measurements.map((m) => (
                                <TableRow key={m.size} className="hover:bg-muted/50 transition-colors">
                                  <TableCell className="font-bold text-primary">{m.size}</TableCell>
                                  <TableCell className="text-primary/80">{m.chest}</TableCell>
                                  <TableCell className="text-primary/80">{m.length}</TableCell>
                                  <TableCell className="text-primary/80">{m.sleeve}</TableCell>
                                  {m.waist && <TableCell className="text-primary/80">{m.waist}</TableCell>}
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </div>

                        <div className="mt-12 space-y-4">
                          <h4 className="text-xs font-bold tracking-widest uppercase">How to Measure</h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs text-muted-foreground leading-relaxed">
                            <p><strong>Chest:</strong> Measure around the fullest part of your chest, keeping the tape horizontal.</p>
                            <p><strong>Length:</strong> Measure from the highest point of your shoulder down to your desired length.</p>
                          </div>
                        </div>
                      </div>
                    </DrawerContent>
                  </Drawer>
                </div>
                <div className="flex gap-2">
                  {sizes.map((size) => (
                    <Button
                      key={size}
                      variant={selectedSize === size ? 'default' : 'outline'}
                      className={`flex-1 font-bold tracking-widest text-[10px] h-12 transition-all duration-300 ${
                        selectedSize === size ? 'bg-primary text-white' : 'hover:border-primary text-primary'
                      }`}
                      onClick={() => setSelectedSize(size)}
                    >
                      {size}
                    </Button>
                  ))}
                </div>
              </div>
            </div>

            <Button 
              className="w-full h-14 bg-primary text-white font-bold tracking-[0.2em] uppercase hover:bg-primary/90 transition-all duration-300 flex items-center justify-center gap-3"
              onClick={handleAddToCart}
            >
              <ShoppingBag className="w-5 h-5" />
              {t('common.add_to_cart')}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
