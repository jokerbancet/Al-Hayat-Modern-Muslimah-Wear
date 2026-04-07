import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Package, Image as ImageIcon, LayoutDashboard, Loader2 } from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Badge } from '../ui/badge';
import { supabase } from '../../lib/supabase';
import { Product, Category, Variant } from '../../types';
import { toast } from 'sonner';

export default function InventoryManager() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [newProduct, setNewProduct] = useState({
    name: '',
    slug: '',
    description: '',
    base_price: 0,
    category_id: '',
    is_featured: false
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Fetch Categories
      const { data: catData, error: catError } = await supabase
        .from('categories')
        .select('*');
      if (catError) throw catError;
      setCategories(catData || []);

      // Fetch Products with related data
      const { data: prodData, error: prodError } = await supabase
        .from('products')
        .select(`
          *,
          category:categories(*),
          images:product_images(*),
          variants(*)
        `)
        .order('created_at', { ascending: false });
      
      if (prodError) throw prodError;
      setProducts(prodData || []);
    } catch (error: any) {
      toast.error('Error fetching data: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const { data, error } = await supabase
        .from('products')
        .insert([newProduct])
        .select()
        .single();

      if (error) throw error;
      
      toast.success('Product added successfully');
      setIsAdding(false);
      setNewProduct({ name: '', slug: '', description: '', base_price: 0, category_id: '', is_featured: false });
      fetchData();
    } catch (error: any) {
      toast.error('Error adding product: ' + error.message);
    }
  };

  const handleDeleteProduct = async (id: string) => {
    try {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      toast.success('Product deleted');
      fetchData();
    } catch (error: any) {
      toast.error('Error deleting product: ' + error.message);
    }
  };

  const getTotalStock = (variants: Variant[] = []) => {
    return variants.reduce((sum, v) => sum + v.stock, 0);
  };

  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [newVariant, setNewVariant] = useState({
    size: '',
    color: '',
    stock: 0,
    price_override: 0,
    sku: ''
  });

  const handleAddVariant = async (productId: string) => {
    try {
      const { error } = await supabase
        .from('variants')
        .insert([{ ...newVariant, product_id: productId }]);

      if (error) throw error;
      
      toast.success('Variant added');
      setNewVariant({ size: '', color: '', stock: 0, price_override: 0, sku: '' });
      fetchData();
    } catch (error: any) {
      toast.error('Error adding variant: ' + error.message);
    }
  };

  const handleDeleteVariant = async (variantId: string) => {
    try {
      const { error } = await supabase
        .from('variants')
        .delete()
        .eq('id', variantId);

      if (error) throw error;
      
      toast.success('Variant deleted');
      fetchData();
    } catch (error: any) {
      toast.error('Error deleting variant: ' + error.message);
    }
  };

  if (loading && products.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-end">
        <div className="space-y-2">
          <h2 className="text-3xl font-serif font-bold tracking-tight">Inventory Control</h2>
          <p className="text-sm text-muted-foreground">Manage your products, stock levels, and variants.</p>
        </div>
        <Button 
          onClick={() => setIsAdding(!isAdding)}
          className="bg-secondary text-primary font-bold tracking-widest text-[10px] uppercase h-12 px-8 hover:bg-hover hover:text-white transition-all duration-300"
        >
          {isAdding ? 'Cancel' : (
            <>
              <Plus className="w-4 h-4 mr-2" />
              Add New Product
            </>
          )}
        </Button>
      </div>

      {isAdding && (
        <div className="bg-white p-8 border rounded-xl shadow-sm animate-in fade-in slide-in-from-top-4 duration-500">
          <form onSubmit={handleAddProduct} className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label className="text-[10px] font-bold tracking-widest uppercase">Product Name</Label>
              <Input 
                required
                value={newProduct.name}
                onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value, slug: e.target.value.toLowerCase().replace(/ /g, '-') })}
                placeholder="e.g. Silk Abaya" 
                className="h-12"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-[10px] font-bold tracking-widest uppercase">Slug</Label>
              <Input 
                required
                value={newProduct.slug}
                onChange={(e) => setNewProduct({ ...newProduct, slug: e.target.value })}
                placeholder="e.g. silk-abaya" 
                className="h-12"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-[10px] font-bold tracking-widest uppercase">Base Price ($)</Label>
              <Input 
                required
                type="number"
                value={newProduct.base_price}
                onChange={(e) => setNewProduct({ ...newProduct, base_price: parseFloat(e.target.value) })}
                placeholder="0.00" 
                className="h-12"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-[10px] font-bold tracking-widest uppercase">Category</Label>
              <select 
                value={newProduct.category_id}
                onChange={(e) => setNewProduct({ ...newProduct, category_id: e.target.value })}
                className="w-full h-12 px-4 border rounded-md bg-transparent text-sm focus:ring-2 focus:ring-primary/20 transition-all"
              >
                <option value="">Select Category</option>
                {categories.map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            </div>
            <div className="md:col-span-2 space-y-2">
              <Label className="text-[10px] font-bold tracking-widest uppercase">Description</Label>
              <textarea 
                value={newProduct.description}
                onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })}
                className="w-full min-h-[100px] p-4 border rounded-md bg-transparent text-sm focus:ring-2 focus:ring-primary/20 transition-all"
                placeholder="Enter product details..."
              />
            </div>
            <div className="md:col-span-2">
              <Button type="submit" className="w-full h-12 bg-primary text-white font-bold tracking-widest uppercase text-[10px]">
                Save Product
              </Button>
            </div>
          </form>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 border rounded-xl space-y-2">
          <p className="text-[10px] font-bold tracking-widest text-muted-foreground uppercase">Total Products</p>
          <p className="text-3xl font-serif font-bold">{products.length}</p>
        </div>
        <div className="bg-white p-6 border rounded-xl space-y-2">
          <p className="text-[10px] font-bold tracking-widest text-muted-foreground uppercase">Low Stock Items</p>
          <p className="text-3xl font-serif font-bold text-destructive">
            {products.filter(p => getTotalStock(p.variants) < 10).length}
          </p>
        </div>
        <div className="bg-white p-6 border rounded-xl space-y-2">
          <p className="text-[10px] font-bold tracking-widest text-muted-foreground uppercase">Total Categories</p>
          <p className="text-3xl font-serif font-bold">{categories.length}</p>
        </div>
      </div>

      <div className="bg-white border rounded-xl overflow-hidden shadow-sm">
        <Table>
          <TableHeader className="bg-muted/50">
            <TableRow>
              <TableHead className="font-bold tracking-widest uppercase text-[10px]">Product</TableHead>
              <TableHead className="font-bold tracking-widest uppercase text-[10px]">Category</TableHead>
              <TableHead className="font-bold tracking-widest uppercase text-[10px]">Price</TableHead>
              <TableHead className="font-bold tracking-widest uppercase text-[10px]">Stock</TableHead>
              <TableHead className="font-bold tracking-widest uppercase text-[10px]">Status</TableHead>
              <TableHead className="text-right font-bold tracking-widest uppercase text-[10px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {products.map((product) => (
              <TableRow key={product.id} className="hover:bg-muted/20 transition-colors">
                <TableCell>
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-16 bg-muted rounded overflow-hidden flex items-center justify-center">
                      {product.images && product.images.length > 0 ? (
                        <img src={product.images.find(img => img.is_primary)?.url || product.images[0].url} alt={product.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
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
                    {product.category?.name || 'Uncategorized'}
                  </Badge>
                </TableCell>
                <TableCell className="font-medium">${product.base_price}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Package className="w-3 h-3 text-muted-foreground" />
                    <span className="text-sm">{getTotalStock(product.variants)} units</span>
                  </div>
                </TableCell>
                <TableCell>
                  {getTotalStock(product.variants) === 0 ? (
                    <Badge className="bg-destructive/10 text-destructive border-none text-[10px] font-bold tracking-widest uppercase">
                      Out of Stock
                    </Badge>
                  ) : getTotalStock(product.variants) < 10 ? (
                    <Badge className="bg-amber-100 text-amber-700 border-none text-[10px] font-bold tracking-widest uppercase">
                      Low Stock
                    </Badge>
                  ) : (
                    <Badge className="bg-sage text-primary border-none text-[10px] font-bold tracking-widest uppercase">
                      In Stock
                    </Badge>
                  )}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      onClick={() => setEditingProduct(editingProduct?.id === product.id ? null : product)}
                      className={`hover:text-secondary ${editingProduct?.id === product.id ? 'text-secondary bg-secondary/10' : ''}`}
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
            {editingProduct && (
              <TableRow className="bg-muted/30">
                <TableCell colSpan={6} className="p-8">
                  <div className="space-y-6">
                    <div className="flex justify-between items-center">
                      <h3 className="text-lg font-serif font-bold">Manage Variants: {editingProduct.name}</h3>
                      <Button variant="ghost" size="sm" onClick={() => setEditingProduct(null)}>Close</Button>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-end bg-white p-6 border rounded-xl">
                      <div className="space-y-2">
                        <Label className="text-[10px] font-bold tracking-widest uppercase">Size</Label>
                        <Input 
                          value={newVariant.size}
                          onChange={(e) => setNewVariant({ ...newVariant, size: e.target.value })}
                          placeholder="e.g. M, L, XL" 
                          className="h-10"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-[10px] font-bold tracking-widest uppercase">Color</Label>
                        <Input 
                          value={newVariant.color}
                          onChange={(e) => setNewVariant({ ...newVariant, color: e.target.value })}
                          placeholder="e.g. Sage, Black" 
                          className="h-10"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-[10px] font-bold tracking-widest uppercase">Stock</Label>
                        <Input 
                          type="number"
                          value={newVariant.stock}
                          onChange={(e) => setNewVariant({ ...newVariant, stock: parseInt(e.target.value) })}
                          placeholder="0" 
                          className="h-10"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-[10px] font-bold tracking-widest uppercase">Price Override</Label>
                        <Input 
                          type="number"
                          value={newVariant.price_override}
                          onChange={(e) => setNewVariant({ ...newVariant, price_override: parseFloat(e.target.value) })}
                          placeholder="0.00" 
                          className="h-10"
                        />
                      </div>
                      <Button 
                        onClick={() => handleAddVariant(editingProduct.id)}
                        className="h-10 bg-primary text-white font-bold tracking-widest uppercase text-[10px]"
                      >
                        Add Variant
                      </Button>
                    </div>

                    <div className="bg-white border rounded-xl overflow-hidden">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead className="text-[10px] font-bold tracking-widest uppercase">Size</TableHead>
                            <TableHead className="text-[10px] font-bold tracking-widest uppercase">Color</TableHead>
                            <TableHead className="text-[10px] font-bold tracking-widest uppercase">Stock</TableHead>
                            <TableHead className="text-[10px] font-bold tracking-widest uppercase">Price Override</TableHead>
                            <TableHead className="text-right text-[10px] font-bold tracking-widest uppercase">Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {editingProduct.variants?.map((v) => (
                            <TableRow key={v.id}>
                              <TableCell className="font-bold">{v.size || '-'}</TableCell>
                              <TableCell>{v.color || '-'}</TableCell>
                              <TableCell>{v.stock}</TableCell>
                              <TableCell>{v.price_override ? `$${v.price_override}` : '-'}</TableCell>
                              <TableCell className="text-right">
                                <Button 
                                  variant="ghost" 
                                  size="icon" 
                                  onClick={() => handleDeleteVariant(v.id)}
                                  className="hover:text-destructive"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </div>
                </TableCell>
              </TableRow>
            )}
            {products.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="h-32 text-center text-muted-foreground">
                  No products found. Add your first product to get started.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
