import { motion } from 'motion/react';
import { ArrowRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Button } from '../ui/button';

const CATEGORIES = [
  {
    id: 'essentials',
    image: 'https://images.unsplash.com/photo-1583394838336-acd977736f90?auto=format&fit=crop&q=80&w=800',
    size: 'large',
  },
  {
    id: 'occasion',
    image: 'https://images.unsplash.com/photo-1567401893414-76b7b1e5a7a5?auto=format&fit=crop&q=80&w=800',
    size: 'small',
  },
  {
    id: 'seasonal',
    image: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&q=80&w=800',
    size: 'small',
  },
];

export default function CategoryGrid() {
  const { t } = useTranslation();

  return (
    <section className="py-24 bg-background">
      <div className="container mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {CATEGORIES.map((category, index) => (
            <motion.div
              key={category.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.2, duration: 0.8 }}
              className={`group relative overflow-hidden bg-muted ${
                category.size === 'large' ? 'md:col-span-2 lg:col-span-1 lg:row-span-2 aspect-[3/4]' : 'aspect-[4/5]'
              }`}
            >
              <img
                src={category.image}
                alt={t(`categories.${category.id}.name`)}
                className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-black/40 group-hover:bg-black/50 transition-colors duration-500" />
              
              <div className="absolute inset-0 p-12 flex flex-col justify-end text-white">
                <div className="space-y-4">
                  <p className="text-[10px] font-bold tracking-[0.3em] uppercase opacity-80">Collection</p>
                  <h3 className="text-4xl md:text-5xl font-serif font-bold tracking-tight">{t(`categories.${category.id}.name`)}</h3>
                  <p className="text-sm opacity-0 group-hover:opacity-100 transition-opacity duration-500 max-w-xs leading-relaxed">
                    {t(`categories.${category.id}.description`)}
                  </p>
                  <div className="pt-6">
                    <Button variant="outline" className="border-white text-white hover:bg-white hover:text-primary transition-all duration-300 rounded-none h-12 px-8 font-bold tracking-widest text-[10px] uppercase">
                      {t('common.explore')}
                      <ArrowRight className="w-4 h-4 ml-3" />
                    </Button>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
