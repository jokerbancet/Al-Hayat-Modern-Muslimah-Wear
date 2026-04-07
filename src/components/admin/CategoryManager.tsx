import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Loader2, ChevronLeft, Layers } from 'lucide-react';
import { Button } from '../ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Badge } from '../ui/badge';
import { supabase } from '../../lib/supabase';
import { Category } from '../../types';
import { toast } from 'sonner';
import CategoryForm from './CategoryForm';

export default function CategoryManager() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('name', { ascending: true });
      
      if (error) throw error;
      setCategories(data || []);
    } catch (error: any) {
      toast.error('Error fetching categories: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteCategory = async (id: string) => {
    if (!confirm('Are you sure you want to delete this category? This may affect products linked to it.')) return;
    try {
      const { error } = await supabase
        .from('categories')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      toast.success('Category deleted');
      fetchData();
    } catch (error: any) {
      toast.error('Error deleting category: ' + error.message);
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
              {editingCategory ? 'Edit Category' : 'New Category'}
            </h2>
            <p className="text-sm text-muted-foreground">
              {editingCategory ? `Updating: ${editingCategory.name}` : 'Create a new product grouping.'}
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
          <h2 className="text-3xl font-serif font-bold tracking-tight">Categories</h2>
          <p className="text-sm text-muted-foreground">Organize your catalog into logical groupings.</p>
        </div>
        <Button 
          onClick={() => setIsAdding(true)}
          className="bg-secondary text-primary font-bold tracking-widest text-[10px] uppercase h-12 px-8 hover:bg-hover hover:text-white transition-all duration-300"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add New Category
        </Button>
      </div>

      <div className="bg-white border rounded-xl overflow-hidden shadow-sm">
        <Table>
          <TableHeader className="bg-muted/50">
            <TableRow>
              <TableHead className="font-bold tracking-widest uppercase text-[10px]">Name</TableHead>
              <TableHead className="font-bold tracking-widest uppercase text-[10px]">Slug</TableHead>
              <TableHead className="font-bold tracking-widest uppercase text-[10px]">Description</TableHead>
              <TableHead className="font-bold tracking-widest uppercase text-[10px]">Created At</TableHead>
              <TableHead className="text-right font-bold tracking-widest uppercase text-[10px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {categories.map((category) => (
              <TableRow key={category.id} className="hover:bg-muted/20 transition-colors">
                <TableCell>
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-muted rounded-lg overflow-hidden flex items-center justify-center border">
                      {category.image_url ? (
                        <img src={category.image_url} alt={category.name} className="w-full h-full object-cover" />
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
                      onClick={() => handleDeleteCategory(category.id)}
                      className="hover:text-destructive"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
            {categories.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="h-32 text-center text-muted-foreground">
                  No categories found. Add your first category to get started.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
