import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export const getProducts = async () => {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .order('created_at', { ascending: false });
  
  if (error) throw error;
  return data;
};

export const getProductVariants = async (productId: string) => {
  const { data, error } = await supabase
    .from('variants')
    .select('*')
    .eq('product_id', productId);
  
  if (error) throw error;
  return data;
};

export const getSizeGuides = async () => {
  const { data, error } = await supabase
    .from('size_guides')
    .select('*');
  
  if (error) throw error;
  return data;
};
