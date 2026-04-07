import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { ShoppingBag, X, Plus, Minus, Trash2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Button } from '../ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '../ui/sheet';
import { ScrollArea } from '../ui/scroll-area';
import { CartItem } from '../../types';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  onUpdateQuantity: (id: string, delta: number) => void;
  onRemove: (id: string) => void;
}

export default function CartDrawer({ isOpen, onClose, items, onUpdateQuantity, onRemove }: CartDrawerProps) {
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const handleCheckout = () => {
    onClose();
    navigate('/checkout');
  };

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent side="right" className="w-full sm:w-[450px] p-0 flex flex-col bg-background border-none shadow-2xl">
        <SheetHeader className="p-8 border-b">
          <div className="flex items-center justify-between">
            <SheetTitle className="text-2xl font-serif font-bold tracking-tight">{t('common.your_bag')}</SheetTitle>
            <span className="text-[10px] font-bold tracking-widest uppercase text-muted-foreground">
              {items.length} {items.length === 1 ? t('common.item') : t('common.items')}
            </span>
          </div>
        </SheetHeader>

        <ScrollArea className="flex-1 p-8">
          {items.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center space-y-6 py-24">
              <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center text-muted-foreground">
                <ShoppingBag className="w-8 h-8" />
              </div>
              <div className="text-center space-y-2">
                <p className="font-serif text-xl font-bold">{t('common.bag_empty')}</p>
                <p className="text-sm text-muted-foreground">Looks like you haven't added anything yet.</p>
              </div>
              <Button variant="outline" className="rounded-none h-12 px-8 font-bold tracking-widest text-[10px] uppercase" onClick={onClose}>
                {t('common.start_shopping')}
              </Button>
            </div>
          ) : (
            <div className="space-y-12">
              {items.map((item) => {
                const itemName = item.name;
                return (
                  <div key={item.id} className="flex gap-6 group">
                    <div className="w-24 aspect-[3/4] bg-muted overflow-hidden shrink-0">
                      <img
                        src={item.image}
                        alt={itemName}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                        referrerPolicy="no-referrer"
                      />
                    </div>
                    <div className="flex-1 flex flex-col justify-between py-1">
                      <div className="space-y-1">
                        <div className="flex justify-between items-start">
                          <h4 className="text-sm font-bold tracking-tight hover:text-secondary transition-colors cursor-pointer">
                            {itemName}
                          </h4>
                          <button
                            onClick={() => onRemove(item.id)}
                            className="text-muted-foreground hover:text-destructive transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                        <p className="text-[10px] font-bold tracking-widest uppercase text-muted-foreground">
                          {item.selectedColor} / {item.selectedSize}
                        </p>
                      </div>
                      
                      <div className="flex justify-between items-center">
                        <div className="flex items-center border rounded-none">
                          <button
                            onClick={() => onUpdateQuantity(item.id, -1)}
                            className="p-2 hover:bg-muted transition-colors"
                            disabled={item.quantity <= 1}
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="w-8 text-center text-xs font-bold">{item.quantity}</span>
                          <button
                            onClick={() => onUpdateQuantity(item.id, 1)}
                            className="p-2 hover:bg-muted transition-colors"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>
                        <p className="text-sm font-bold">${item.price * item.quantity}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </ScrollArea>

        {items.length > 0 && (
          <div className="p-8 border-t space-y-6 bg-muted/30">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">{t('common.subtotal')}</span>
                <span className="font-bold">${subtotal}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">{t('common.shipping')}</span>
                <span className="font-bold">Calculated at checkout</span>
              </div>
              <div className="pt-4 flex justify-between items-center">
                <span className="text-lg font-serif font-bold">{t('common.total')}</span>
                <span className="text-2xl font-serif font-bold">${subtotal}</span>
              </div>
            </div>
            
            <Button 
              onClick={handleCheckout}
              className="w-full h-14 bg-primary text-white font-bold tracking-[0.2em] uppercase hover:bg-primary/90 transition-all duration-300"
            >
              {t('common.checkout_now')}
            </Button>
            
            <p className="text-[10px] text-center text-muted-foreground tracking-widest uppercase">
              {t('common.free_shipping')}
            </p>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
