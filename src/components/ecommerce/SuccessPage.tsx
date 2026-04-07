import { motion } from 'motion/react';
import { CheckCircle2, ArrowRight, ShoppingBag } from 'lucide-react';
import { Button } from '../ui/button';

export default function SuccessPage() {
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 text-center">
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="max-w-md w-full space-y-8"
      >
        <div className="flex justify-center">
          <div className="w-24 h-24 rounded-full bg-secondary/20 flex items-center justify-center text-secondary">
            <CheckCircle2 className="w-12 h-12" />
          </div>
        </div>

        <div className="space-y-4">
          <h1 className="text-5xl md:text-6xl font-serif font-bold tracking-tight text-primary">
            THANK YOU
          </h1>
          <p className="text-[10px] font-bold tracking-[0.3em] uppercase text-muted-foreground">
            Your order has been placed
          </p>
        </div>

        <div className="bg-white p-8 border border-primary/10 rounded-2xl space-y-6">
          <p className="text-sm text-muted-foreground leading-relaxed">
            We've received your order and we're getting it ready for shipment. 
            A confirmation email has been sent to your inbox.
          </p>
          
          <div className="pt-6 border-t border-primary/5 flex flex-col gap-4">
            <Button 
              className="h-14 bg-primary text-white font-bold tracking-[0.2em] uppercase hover:bg-primary/90 transition-all duration-300 group"
              onClick={() => window.location.href = '/'}
            >
              Return to Home
              <ArrowRight className="w-5 h-5 ml-3 group-hover:translate-x-2 transition-transform" />
            </Button>
            
            <Button 
              variant="outline"
              className="h-14 border-primary/20 text-primary font-bold tracking-[0.2em] uppercase hover:bg-muted transition-all duration-300"
              onClick={() => window.location.href = '/'}
            >
              <ShoppingBag className="w-5 h-5 mr-3" />
              Continue Shopping
            </Button>
          </div>
        </div>

        <p className="text-[10px] font-bold tracking-widest uppercase text-muted-foreground opacity-50">
          Order #ALH-{Math.floor(Math.random() * 1000000)}
        </p>
      </motion.div>
    </div>
  );
}
