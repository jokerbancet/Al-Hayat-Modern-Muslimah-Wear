import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Package, Image as ImageIcon, Loader2, ChevronLeft } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Button } from '../ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Badge } from '../ui/badge';
import { supabase } from '../../lib/supabase';
import { Product } from '../../types';
import { toast } from 'sonner';
import { formatCurrency } from '../../lib/utils';
import ProductForm from './ProductForm';

export default function InventoryManager() {
  const { t } = useTranslation();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Attempt joined fetch first
      const { data: prodData, error: prodError } = await supabase
        .from('products')
        .select(`
          *,
          category:categories(name),
          images:product_images(*),
          variants:variants!variants_product_id_fkey(*)
        `)
        .order('created_at', { ascending: false });
      
      if (prodError) {
        // Fallback: Fetch separately if relationship is missing
        if (prodError.message.includes('relationship')) {
          console.warn('Supabase relationship missing, falling back to separate fetches');
          
          const [productsRes, imagesRes, variantsRes, categoriesRes] = await Promise.all([
            supabase.from('products').select('*').order('created_at', { ascending: false }),
            supabase.from('product_images').select('*'),
            supabase.from('variants').select('*'),
            supabase.from('categories').select('id, name')
          ]);

          if (productsRes.error) throw productsRes.error;

          const combinedData = (productsRes.data || []).map(product => ({
            ...product,
            category: (categoriesRes.data || []).find(c => c.id === product.category_id),
            images: (imagesRes.data || []).filter(img => img.product_id === product.id),
            variants: (variantsRes.data || []).filter(v => v.product_id === product.id)
          }));

          setProducts(combinedData);
          return;
        }
        throw prodError;
      }
      
      setProducts(prodData || []);
    } catch (error: any) {
      console.error('Fetch error:', error);
      toast.error('Error fetching data: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteProduct = async (id: string) => {
    if (!confirm(t('common.messages.are_you_sure'))) return;
    try {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      toast.success('Produk dihapus');
      fetchData();
    } catch (error: any) {
      toast.error('Gagal menghapus produk: ' + error.message);
    }
  };

  const getTotalStock = (variants: any[] = []) => {
    return variants.reduce((sum, v) => sum + v.stock_quantity, 0);
  };

  if (loading && products.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (isAdding || editingProduct) {
    return (
      <div className="space-y-8">
        <div className="flex items-center gap-4">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => { setIsAdding(false); setEditingProduct(null); }}
            className="hover:bg-muted"
          >
            <ChevronLeft className="w-6 h-6" />
          </Button>
          <div className="space-y-1">
            <h2 className="text-3xl font-serif font-bold tracking-tight">
              {editingProduct ? 'Ubah Produk' : 'Produk Baru'}
            </h2>
            <p className="text-sm text-muted-foreground">
              {editingProduct ? `Memperbarui: ${editingProduct.name}` : 'Isi detail untuk membuat item katalog baru.'}
            </p>
          </div>
        </div>

        <ProductForm 
          initialData={editingProduct}
          onSuccess={() => {
            setIsAdding(false);
            setEditingProduct(null);
            fetchData();
          }}
          onCancel={() => {
            setIsAdding(false);
            setEditingProduct(null);
          }}
        />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-end">
        <div className="space-y-2">
          <h2 className="text-3xl font-serif font-bold tracking-tight">Kontrol Inventaris</h2>
          <p className="text-sm text-muted-foreground">Kelola produk, tingkat stok, dan varian Anda.</p>
        </div>
        <Button 
          onClick={() => setIsAdding(true)}
          className="bg-secondary text-primary font-bold tracking-widest text-[10px] uppercase h-12 px-8 hover:bg-primary hover:text-white transition-all duration-300"
        >
          <Plus className="w-4 h-4 mr-2" />
          {t('admin.add_new_product')}
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 border rounded-xl space-y-2">
          <p className="text-[10px] font-bold tracking-widest text-muted-foreground uppercase">Total Produk</p>
          <p className="text-3xl font-serif font-bold">{products.length}</p>
        </div>
        <div className="bg-white p-6 border rounded-xl space-y-2">
          <p className="text-[10px] font-bold tracking-widest text-muted-foreground uppercase">Item Stok Rendah</p>
          <p className="text-3xl font-serif font-bold text-destructive">
            {products.filter(p => getTotalStock(p.variants) < 10).length}
          </p>
        </div>
        <div className="bg-white p-6 border rounded-xl space-y-2">
          <p className="text-[10px] font-bold tracking-widest text-muted-foreground uppercase">Total Nilai Stok</p>
          <p className="text-3xl font-serif font-bold">
            {formatCurrency(products.reduce((sum, p) => sum + (p.base_price * getTotalStock(p.variants)), 0))}
          </p>
        </div>
      </div>

      <div className="bg-white border rounded-xl overflow-hidden shadow-sm">
        <Table>
          <TableHeader className="bg-muted/50">
            <TableRow>
              <TableHead className="font-bold tracking-widest uppercase text-[10px]">Produk</TableHead>
              <TableHead className="font-bold tracking-widest uppercase text-[10px]">Kategori</TableHead>
              <TableHead className="font-bold tracking-widest uppercase text-[10px]">Harga</TableHead>
              <TableHead className="font-bold tracking-widest uppercase text-[10px]">Stok</TableHead>
              <TableHead className="font-bold tracking-widest uppercase text-[10px]">Status</TableHead>
              <TableHead className="text-right font-bold tracking-widest uppercase text-[10px]">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {products.map((product) => (
              <TableRow key={product.id} className="hover:bg-muted/20 transition-colors">
                <TableCell>
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-16 bg-muted rounded overflow-hidden flex items-center justify-center">
                      {product.images && product.images.length > 0 ? (
                        <img src={product.images[0].image_url || undefined} alt={product.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                      ) : (
                        <ImageIcon className="w-6 h-6 text-muted-foreground" />
                      )}
                    </div>
                    <div>
                      <p className="font-bold text-sm">{product.name}</p>
                      <p className="text-[10px] text-muted-foreground uppercase tracking-widest">ID: {product.id.slice(0, 8)}...</p>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant="outline" className="text-[10px] font-bold tracking-widest uppercase">
                    {product.category?.name || 'Tanpa Kategori'}
                  </Badge>
                </TableCell>
                <TableCell className="font-medium">{formatCurrency(product.base_price)}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Package className="w-3 h-3 text-muted-foreground" />
                    <span className="text-sm">{getTotalStock(product.variants)} unit</span>
                  </div>
                </TableCell>
                <TableCell>
                  {getTotalStock(product.variants) === 0 ? (
                    <Badge className="bg-destructive/10 text-destructive border-none text-[10px] font-bold tracking-widest uppercase">
                      Stok Habis
                    </Badge>
                  ) : getTotalStock(product.variants) < 10 ? (
                    <Badge className="bg-amber-100 text-amber-700 border-none text-[10px] font-bold tracking-widest uppercase">
                      Stok Rendah
                    </Badge>
                  ) : (
                    <Badge className="bg-sage text-primary border-none text-[10px] font-bold tracking-widest uppercase">
                      Tersedia
                    </Badge>
                  )}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      onClick={() => setEditingProduct(product)}
                      className="hover:text-secondary"
                    >
                      <Edit2 className="w-4 h-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      onClick={() => handleDeleteProduct(product.id)}
                      className="hover:text-destructive"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
            {products.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="h-32 text-center text-muted-foreground">
                  Produk tidak ditemukan. Tambahkan produk pertama Anda untuk memulai.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
