import { motion } from 'motion/react';
import { ArrowRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { Button } from '../ui/button';
import { Category } from '../../types';

interface CategoryGridProps {
  categories: Category[];
}

export default function CategoryGrid({ categories }: CategoryGridProps) {
  const { t } = useTranslation();

  const defaultImage = 'https://images.unsplash.com/photo-1539109132314-d49c02d82267?auto=format&fit=crop&q=80&w=800';

  return (
    <section className="py-24 bg-background">
      <div className="container mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {categories.slice(0, 6).map((category, index) => (
            <motion.div
              key={category.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1, duration: 0.8 }}
              className={`group relative overflow-hidden bg-muted aspect-[3/4] rounded-3xl`}
            >
              <img
                src={category.image_url || defaultImage}
                alt={category.name}
                className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-black/40 group-hover:bg-black/50 transition-colors duration-500" />
              
              <div className="absolute inset-0 p-12 flex flex-col justify-end text-white">
                <div className="space-y-4">
                  <p className="text-[10px] font-bold tracking-[0.3em] uppercase opacity-80">Collection</p>
                  <h3 className="text-5xl font-serif font-bold tracking-tight">{category.name}</h3>
                  <p className="text-sm opacity-0 group-hover:opacity-100 transition-opacity duration-500 max-w-xs leading-relaxed line-clamp-2">
                    {category.description || `Discover our exclusive ${category.name} collection.`}
                  </p>
                  <div className="pt-6">
                    <Link to={`/category/${category.slug}`}>
                      <Button className="bg-secondary text-primary hover:bg-primary hover:text-white transition-all duration-300 rounded-full h-12 px-8 font-bold tracking-widest text-[10px] uppercase border-none">
                        {t('common.explore')}
                        <ArrowRight className="w-4 h-4 ml-3" />
                      </Button>
                    </Link>
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
