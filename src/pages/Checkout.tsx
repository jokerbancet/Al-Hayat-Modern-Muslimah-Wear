import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { ArrowLeft, CreditCard, ShieldCheck } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { CartItem } from '../types';
import { useMidtrans } from '../hooks/useMidtrans';
import { toast } from 'sonner';
import { formatCurrency } from '../lib/utils';

interface CheckoutProps {
  items: CartItem[];
  onClearCart: () => void;
}

export default function Checkout({ items, onClearCart }: CheckoutProps) {
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const { pay, isLoaded } = useMidtrans();
  const [isProcessing, setIsProcessing] = useState(false);
  
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    postalCode: '',
  });

  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    if (items.length === 0) return;
    
    setIsProcessing(true);
    
    try {
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items,
          customerDetails: {
            firstName: formData.firstName,
            lastName: formData.lastName,
            email: formData.email,
            phone: formData.phone,
          },
          shippingAddress: {
            address: formData.address,
            city: formData.city,
            postalCode: formData.postalCode,
          },
        }),
      });

      const data = await response.json();

      if (data.token) {
        pay(data.token, {
          onSuccess: (result: any) => {
            console.log('Payment Success:', result);
            onClearCart();
            navigate('/success');
          },
          onPending: (result: any) => {
            console.log('Payment Pending:', result);
            toast.info('Payment is pending. We will notify you once it is completed.');
            navigate('/');
          },
          onError: (result: any) => {
            console.error('Payment Error:', result);
            toast.error('Payment failed. Please try again.');
            setIsProcessing(false);
          },
          onClose: () => {
            console.log('Payment Closed');
            setIsProcessing(false);
          },
        });
      } else {
        throw new Error(data.error || 'Failed to create payment session');
      }
    } catch (error: any) {
      console.error('Checkout Error:', error);
      toast.error(error.message || 'Something went wrong');
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-background pt-32 pb-24">
      <div className="container mx-auto px-6">
        <Button 
          variant="ghost" 
          className="mb-12 hover:bg-transparent -ml-4 group"
          onClick={() => navigate(-1)}
        >
          <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
          {t('common.back_to_bag')}
        </Button>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-24">
          {/* Checkout Form */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-12"
          >
            <div className="space-y-4">
              <h1 className="text-5xl font-serif font-bold tracking-tight">{t('common.checkout')}</h1>
              <p className="text-muted-foreground">Silakan masukkan detail pengiriman dan kontak Anda.</p>
            </div>

            <form onSubmit={handleCheckout} className="space-y-8">
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="firstName" className="text-[10px] font-bold tracking-widest uppercase">Nama Depan</Label>
                  <Input 
                    id="firstName" 
                    name="firstName"
                    required 
                    className="rounded-none border-primary/20 focus:border-primary h-12"
                    value={formData.firstName}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName" className="text-[10px] font-bold tracking-widest uppercase">Nama Belakang</Label>
                  <Input 
                    id="lastName" 
                    name="lastName"
                    required 
                    className="rounded-none border-primary/20 focus:border-primary h-12"
                    value={formData.lastName}
                    onChange={handleInputChange}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-[10px] font-bold tracking-widest uppercase">Alamat Email</Label>
                  <Input 
                    id="email" 
                    name="email"
                    type="email" 
                    required 
                    className="rounded-none border-primary/20 focus:border-primary h-12"
                    value={formData.email}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone" className="text-[10px] font-bold tracking-widest uppercase">Nomor Telepon</Label>
                  <Input 
                    id="phone" 
                    name="phone"
                    type="tel" 
                    required 
                    className="rounded-none border-primary/20 focus:border-primary h-12"
                    value={formData.phone}
                    onChange={handleInputChange}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="address" className="text-[10px] font-bold tracking-widest uppercase">Alamat Pengiriman</Label>
                <Input 
                  id="address" 
                  name="address"
                  required 
                  className="rounded-none border-primary/20 focus:border-primary h-12"
                  value={formData.address}
                  onChange={handleInputChange}
                />
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="city" className="text-[10px] font-bold tracking-widest uppercase">Kota</Label>
                  <Input 
                    id="city" 
                    name="city"
                    required 
                    className="rounded-none border-primary/20 focus:border-primary h-12"
                    value={formData.city}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="postalCode" className="text-[10px] font-bold tracking-widest uppercase">Kode Pos</Label>
                  <Input 
                    id="postalCode" 
                    name="postalCode"
                    required 
                    className="rounded-none border-primary/20 focus:border-primary h-12"
                    value={formData.postalCode}
                    onChange={handleInputChange}
                  />
                </div>
              </div>

              <Button 
                type="submit" 
                disabled={isProcessing || !isLoaded}
                className="w-full h-16 bg-primary text-white font-bold tracking-[0.2em] uppercase hover:bg-primary/90 transition-all duration-300"
              >
                {isProcessing ? 'Memproses...' : t('common.proceed_to_payment')}
              </Button>
            </form>

            <div className="flex items-center justify-center gap-8 pt-8 border-t opacity-50">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4" />
                <span className="text-[10px] font-bold tracking-widest uppercase">SSL Aman</span>
              </div>
              <div className="flex items-center gap-2">
                <CreditCard className="w-4 h-4" />
                <span className="text-[10px] font-bold tracking-widest uppercase">Pembayaran Terenkripsi</span>
              </div>
            </div>
          </motion.div>

          {/* Order Summary */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-muted/30 p-12 rounded-3xl h-fit sticky top-32"
          >
            <h3 className="text-2xl font-serif font-bold tracking-tight mb-8">{t('common.order_summary')}</h3>
            
            <div className="space-y-8 mb-12">
              {items.map((item) => {
                const itemName = item.name;
                return (
                  <div key={item.id} className="flex gap-4">
                    <div className="w-16 aspect-[3/4] bg-muted overflow-hidden shrink-0">
                      <img src={item.image || undefined} alt={itemName} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-bold">{itemName}</p>
                      <div className="flex items-center gap-2">
                        <p className="text-[10px] font-bold tracking-widest uppercase text-muted-foreground">
                          {item.selectedColor} / {item.selectedSize} × {item.quantity}
                        </p>
                        {item.selectedColorSwatchUrl && (
                          <div className="w-3 h-3 rounded border border-[#2D2D2D]/10 overflow-hidden shrink-0">
                            <img 
                              src={item.selectedColorSwatchUrl || undefined} 
                              alt={item.selectedColor} 
                              className="w-full h-full object-cover"
                              referrerPolicy="no-referrer"
                            />
                          </div>
                        )}
                      </div>
                    </div>
                    <p className="text-sm font-bold">{formatCurrency(item.price * item.quantity)}</p>
                  </div>
                );
              })}
            </div>

            <div className="space-y-4 pt-8 border-t">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">{t('common.subtotal')}</span>
                <span className="font-bold">{formatCurrency(subtotal)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">{t('common.shipping')}</span>
                <span className="font-bold">Gratis</span>
              </div>
              <div className="pt-4 flex justify-between items-center">
                <span className="text-xl font-serif font-bold">{t('common.total')}</span>
                <span className="text-3xl font-serif font-bold">{formatCurrency(subtotal)}</span>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
