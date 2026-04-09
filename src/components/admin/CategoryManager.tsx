import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Loader2, ChevronLeft, Layers, AlertTriangle, Lock } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Button } from '../ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Badge } from '../ui/badge';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle 
} from '../ui/dialog';
import { supabase } from '../../lib/supabase';
import { Category } from '../../types';
import { toast } from 'sonner';
import CategoryForm from './CategoryForm';

export default function CategoryManager() {
  const { t } = useTranslation();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [categoryToDelete, setCategoryToDelete] = useState<Category | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('categories')
        .select(`
          *,
          products:products(count)
        `)
        .order('name', { ascending: true });
      
      if (error) throw error;

      const categoriesWithCount = data?.map(cat => ({
        ...cat,
        product_count: (cat as any).products?.[0]?.count || 0
      })) || [];

      setCategories(categoriesWithCount);
    } catch (error: any) {
      toast.error('Error fetching categories: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteCategory = async () => {
    if (!categoryToDelete) return;

    // Double check count before deleting
    if ((categoryToDelete.product_count || 0) > 0) {
      toast.error('Tidak dapat menghapus kategori: Kategori ini berisi produk aktif. Harap pindahkan atau hapus produk terlebih dahulu.', {
        className: 'bg-destructive text-destructive-foreground font-bold',
      });
      setCategoryToDelete(null);
      return;
    }

    setIsDeleting(true);
    try {
      // Delete image from storage if it exists
      if (categoryToDelete.image_url) {
        try {
          // Extract path from public URL
          // Example URL: https://.../storage/v1/object/public/product-images/categories/filename.jpg
          const urlParts = categoryToDelete.image_url.split('/product-images/');
          if (urlParts.length > 1) {
            const filePath = urlParts[1];
            await supabase.storage.from('product-images').remove([filePath]);
          }
        } catch (storageError) {
          console.error('Error deleting category image:', storageError);
          // Continue with category deletion even if image deletion fails
        }
      }

      const { error } = await supabase
        .from('categories')
        .delete()
        .eq('id', categoryToDelete.id);

      if (error) throw error;
      
      toast.success('Kategori dihapus');
      setCategoryToDelete(null);
      fetchData();
    } catch (error: any) {
      toast.error('Gagal menghapus kategori: ' + error.message);
    } finally {
      setIsDeleting(false);
    }
  };

  if (loading && categories.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (isAdding || editingCategory) {
    return (
      <div className="space-y-8">
        <div className="flex items-center gap-4">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => { setIsAdding(false); setEditingCategory(null); }}
            className="hover:bg-muted"
          >
            <ChevronLeft className="w-6 h-6" />
          </Button>
          <div className="space-y-1">
            <h2 className="text-3xl font-serif font-bold tracking-tight">
              {editingCategory ? 'Ubah Kategori' : 'Kategori Baru'}
            </h2>
            <p className="text-sm text-muted-foreground">
              {editingCategory ? `Memperbarui: ${editingCategory.name}` : 'Buat pengelompokan produk baru.'}
            </p>
          </div>
        </div>

        <CategoryForm 
          initialData={editingCategory}
          onSuccess={() => {
            setIsAdding(false);
            setEditingCategory(null);
            fetchData();
          }}
          onCancel={() => {
            setIsAdding(false);
            setEditingCategory(null);
          }}
        />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-end">
        <div className="space-y-2">
          <h2 className="text-3xl font-serif font-bold tracking-tight">Kategori</h2>
          <p className="text-sm text-muted-foreground">Atur katalog Anda ke dalam pengelompokan yang logis.</p>
        </div>
        <Button 
          onClick={() => setIsAdding(true)}
          className="bg-secondary text-primary font-bold tracking-widest text-[10px] uppercase h-12 px-8 hover:bg-primary hover:text-white transition-all duration-300"
        >
          <Plus className="w-4 h-4 mr-2" />
          Tambah Kategori Baru
        </Button>
      </div>

      <div className="bg-white border rounded-xl overflow-hidden shadow-sm">
        <Table>
          <TableHeader className="bg-muted/50">
            <TableRow>
              <TableHead className="font-bold tracking-widest uppercase text-[10px]">Nama</TableHead>
              <TableHead className="font-bold tracking-widest uppercase text-[10px]">Slug</TableHead>
              <TableHead className="font-bold tracking-widest uppercase text-[10px]">Produk</TableHead>
              <TableHead className="font-bold tracking-widest uppercase text-[10px]">Deskripsi</TableHead>
              <TableHead className="font-bold tracking-widest uppercase text-[10px]">Dibuat Pada</TableHead>
              <TableHead className="text-right font-bold tracking-widest uppercase text-[10px]">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {categories.map((category) => {
              const hasProducts = (category.product_count || 0) > 0;
              return (
                <TableRow key={category.id} className="hover:bg-muted/20 transition-colors">
                  <TableCell>
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-muted rounded-lg overflow-hidden flex items-center justify-center border">
                        {category.image_url ? (
                          <img src={category.image_url || undefined} alt={category.name} className="w-full h-full object-cover" />
                        ) : (
                          <Layers className="w-5 h-5 text-muted-foreground" />
                        )}
                      </div>
                      <p className="font-bold text-sm">{category.name}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="text-[10px] font-bold tracking-widest uppercase">
                      {category.slug}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <span className={`text-sm font-bold ${hasProducts ? 'text-primary' : 'text-muted-foreground'}`}>
                        {category.product_count || 0}
                      </span>
                      {hasProducts && <Lock className="w-3 h-3 text-muted-foreground opacity-50" />}
                    </div>
                  </TableCell>
                  <TableCell className="max-w-xs truncate text-sm text-muted-foreground">
                    {category.description || '-'}
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    {category.created_at ? new Date(category.created_at).toLocaleDateString() : '-'}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={() => setEditingCategory(category)}
                        className="hover:text-secondary"
                      >
                        <Edit2 className="w-4 h-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={() => setCategoryToDelete(category)}
                        className={`hover:text-destructive ${hasProducts ? 'opacity-50' : ''}`}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
            {categories.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="h-32 text-center text-muted-foreground">
                  Kategori tidak ditemukan. Tambahkan kategori pertama Anda untuk memulai.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Delete Confirmation Modal */}
      <Dialog open={!!categoryToDelete} onOpenChange={(open) => !open && setCategoryToDelete(null)}>
        <DialogContent className="bg-background border-none shadow-2xl rounded-3xl p-8 max-w-md">
          <DialogHeader className="space-y-4">
            <div className="w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center mx-auto">
              <AlertTriangle className="w-8 h-8 text-destructive" />
            </div>
            <DialogTitle className="text-3xl font-serif font-bold tracking-tight text-center">
              Hapus Kategori?
            </DialogTitle>
            <DialogDescription className="text-center text-muted-foreground leading-relaxed">
              Apakah Anda yakin ingin menghapus <span className="font-bold text-primary">"{categoryToDelete?.name}"</span>? 
              Tindakan ini tidak dapat dibatalkan.
            </DialogDescription>
          </DialogHeader>

          {(categoryToDelete?.product_count || 0) > 0 && (
            <div className="bg-destructive/10 border border-destructive/20 p-4 rounded-2xl space-y-2">
              <div className="flex items-center gap-2 text-destructive font-bold text-xs uppercase tracking-widest">
                <Lock className="w-4 h-4" />
                Tindakan Diblokir
              </div>
              <p className="text-xs text-destructive/80 leading-relaxed">
                Kategori ini berisi <span className="font-bold">{categoryToDelete?.product_count} produk aktif</span>. 
                Anda harus memindahkan atau menghapus produk-produk ini sebelum kategori ini dapat dihapus.
              </p>
            </div>
          )}

          <DialogFooter className="flex flex-col sm:flex-row gap-3 mt-8">
            <Button
              variant="ghost"
              onClick={() => setCategoryToDelete(null)}
              className="flex-1 h-12 font-bold tracking-widest uppercase text-[10px] rounded-xl"
            >
              Batal
            </Button>
            <Button
              onClick={handleDeleteCategory}
              disabled={isDeleting || (categoryToDelete?.product_count || 0) > 0}
              variant="destructive"
              className="flex-1 h-12 font-bold tracking-widest uppercase text-[10px] rounded-xl shadow-lg shadow-destructive/20"
            >
              {isDeleting ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                'Hapus Kategori'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
