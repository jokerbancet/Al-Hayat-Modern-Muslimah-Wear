import { motion } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle2, ArrowRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Button } from '../components/ui/button';

export default function Success() {
  const navigate = useNavigate();
  const { t } = useTranslation();

  return (
    <div className="min-h-screen bg-background flex items-center justify-center py-32">
      <div className="container mx-auto px-6 text-center max-w-2xl">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="w-24 h-24 bg-secondary/10 rounded-full flex items-center justify-center text-secondary mx-auto mb-12"
        >
          <CheckCircle2 className="w-12 h-12" />
        </motion.div>

        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="space-y-6"
        >
          <h1 className="text-6xl md:text-8xl font-serif font-bold tracking-tight leading-tight">
            {t('common.order_success')}
          </h1>
          <p className="text-lg text-muted-foreground max-w-md mx-auto leading-relaxed">
            Pesanan Anda telah berhasil dibuat. Kami telah mengirimkan email konfirmasi dengan semua detailnya.
          </p>
        </motion.div>

        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.5 }}
          className="mt-16 flex flex-col sm:flex-row items-center justify-center gap-8"
        >
          <Button 
            className="h-16 px-12 bg-primary text-white font-bold tracking-[0.2em] uppercase hover:bg-primary/90 transition-all duration-300 group"
            onClick={() => navigate('/')}
          >
            Kembali ke Beranda
            <ArrowRight className="w-5 h-5 ml-3 group-hover:translate-x-2 transition-transform" />
          </Button>
          
          <p className="text-[10px] font-bold tracking-widest uppercase opacity-50">
            ID Pesanan: #ORD-{Math.floor(Math.random() * 1000000)}
          </p>
        </motion.div>
      </div>
    </div>
  );
}
