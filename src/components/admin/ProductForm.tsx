import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Plus, Trash2, X, Upload, Loader2 } from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { toast } from 'sonner';

const productSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  slug: z.string().min(2, 'Slug must be at least 2 characters'),
  base_price: z.number().min(0, 'Price must be positive'),
  category_id: z.string().min(1, 'Category is required'),
  age_category: z.enum(['Adult', 'Teen', 'Kids']),
  motif: z.string().min(1, 'Motif is required'),
  material: z.string().min(1, 'Material is required'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  images: z.array(z.object({
    url: z.string().url('Invalid image URL'),
  })).min(1, 'Minimum 1 image required').max(10, 'Maximum 10 images allowed'),
  variants: z.array(z.object({
    color_option: z.string().min(1, 'Color is required'),
    size_option: z.string().min(1, 'Size is required'),
    stock_quantity: z.number().min(0, 'Stock must be 0 or more'),
  })).min(1, 'At least one variant is required'),
});

type ProductFormValues = z.infer<typeof productSchema>;

interface ProductFormProps {
  onSuccess: () => void;
  onCancel: () => void;
  initialData?: any;
}

export default function ProductForm({ onSuccess, onCancel, initialData }: ProductFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [imageUrl, setImageUrl] = useState('');
  const [categories, setCategories] = useState<any[]>([]);

  useEffect(() => {
    const fetchCategories = async () => {
      const { data, error } = await supabase.from('categories').select('*').order('name');
      if (!error && data) setCategories(data);
    };
    fetchCategories();
  }, []);

  const {
    register,
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema),
    defaultValues: initialData ? {
      ...initialData,
      images: initialData.images?.map((img: any) => ({ url: img.image_url })) || [],
      variants: initialData.variants || [{ color_option: '', size_option: '', stock_quantity: 0 }],
    } : {
      name: '',
      slug: '',
      base_price: 0,
      category_id: '',
      age_category: 'Adult',
      motif: '',
      material: '',
      description: '',
      images: [],
      variants: [{ color_option: '', size_option: '', stock_quantity: 0 }],
    },
  });

  const { fields: imageFields, append: appendImage, remove: removeImage } = useFieldArray({
    control,
    name: 'images',
  });

  const { fields: variantFields, append: appendVariant, remove: removeVariant } = useFieldArray({
    control,
    name: 'variants',
  });

  const productName = watch('name');
  useEffect(() => {
    if (productName && !initialData) {
      setValue('slug', productName.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, ''));
    }
  }, [productName, setValue, initialData]);

  const onSubmit = async (values: ProductFormValues) => {
    setIsSubmitting(true);
    try {
      // 1. Insert/Update Product
      const productData = {
        name: values.name,
        slug: values.slug,
        base_price: values.base_price,
        category_id: values.category_id,
        age_category: values.age_category,
        motif: values.motif,
        material: values.material,
        description: values.description,
      };

      let productId = initialData?.id;

      if (productId) {
        const { error: updateError } = await supabase
          .from('products')
          .update(productData)
          .eq('id', productId);
        if (updateError) {
          if (updateError.code === '23505' && updateError.message.includes('slug')) {
            throw new Error('This product slug is already taken. Please try a different name or modify the slug.');
          }
          throw updateError;
        }
      } else {
        const { data: newProduct, error: insertError } = await supabase
          .from('products')
          .insert([productData])
          .select()
          .single();
        if (insertError) {
          if (insertError.code === '23505' && insertError.message.includes('slug')) {
            throw new Error('This product slug is already taken. Please try a different name or modify the slug.');
          }
          throw insertError;
        }
        productId = newProduct.id;
      }

      // 2. Handle Images (Delete existing and re-insert for simplicity in this update)
      if (initialData) {
        await supabase.from('product_images').delete().eq('product_id', productId);
      }
      const { error: imgError } = await supabase
        .from('product_images')
        .insert(values.images.map((img, index) => ({
          product_id: productId,
          image_url: img.url,
          display_order: index,
        })));
      if (imgError) throw imgError;

      // 3. Handle Variants
      if (initialData) {
        await supabase.from('variants').delete().eq('product_id', productId);
      }
      const { error: varError } = await supabase
        .from('variants')
        .insert(values.variants.map(v => ({
          product_id: productId,
          color_option: v.color_option,
          size_option: v.size_option,
          stock_quantity: v.stock_quantity,
        })));
      if (varError) throw varError;

      toast.success(initialData ? 'Product updated successfully' : 'Product created successfully');
      onSuccess();
    } catch (error: any) {
      toast.error('Error saving product: ' + error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const addImage = () => {
    if (imageUrl && imageUrl.startsWith('http')) {
      appendImage({ url: imageUrl });
      setImageUrl('');
    } else {
      toast.error('Please enter a valid image URL');
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);
    try {
      for (const file of Array.from(files)) {
        const fileExt = file.name.split('.').pop();
        const fileName = `${Math.random().toString(36).substring(2)}-${Date.now()}.${fileExt}`;
        const filePath = `products/${fileName}`;

        const { data, error: uploadError } = await supabase.storage
          .from('product-images')
          .upload(filePath, file);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('product-images')
          .getPublicUrl(filePath);

        appendImage({ url: publicUrl });
      }
      toast.success('Images uploaded successfully');
    } catch (error: any) {
      console.error('Upload error:', error);
      toast.error('Error uploading image: ' + error.message);
      toast.info('Make sure you have created a public bucket named "product-images" in Supabase Storage.');
    } finally {
      setIsUploading(false);
      // Reset input
      e.target.value = '';
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-12">
      {/* Basic Info Section */}
      <div className="bg-white p-8 border rounded-xl shadow-sm space-y-6">
        <h3 className="text-xl font-serif font-bold border-b pb-4">Basic Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label className="text-[10px] font-bold tracking-widest uppercase">Product Name</Label>
            <Input {...register('name')} placeholder="e.g. Luxury Silk Abaya" className="h-12" />
            {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
          </div>
          <div className="space-y-2">
            <Label className="text-[10px] font-bold tracking-widest uppercase">Slug</Label>
            <Input {...register('slug')} placeholder="luxury-silk-abaya" className="h-12" />
            {errors.slug && <p className="text-xs text-destructive">{errors.slug.message}</p>}
          </div>
          <div className="space-y-2">
            <Label className="text-[10px] font-bold tracking-widest uppercase">Base Price (IDR)</Label>
            <Input type="number" {...register('base_price', { valueAsNumber: true })} className="h-12" />
            {errors.base_price && <p className="text-xs text-destructive">{errors.base_price.message}</p>}
          </div>
          <div className="space-y-2">
            <Label className="text-[10px] font-bold tracking-widest uppercase">Category</Label>
            <select 
              {...register('category_id')}
              className="w-full h-12 px-4 border rounded-md bg-transparent text-sm focus:ring-2 focus:ring-primary/20 transition-all"
            >
              <option value="">Select Category</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
            {errors.category_id && <p className="text-xs text-destructive">{errors.category_id.message}</p>}
          </div>
          <div className="space-y-2">
            <Label className="text-[10px] font-bold tracking-widest uppercase">Age Category</Label>
            <select 
              {...register('age_category')}
              className="w-full h-12 px-4 border rounded-md bg-transparent text-sm focus:ring-2 focus:ring-primary/20 transition-all"
            >
              <option value="Adult">Adult</option>
              <option value="Teen">Teen</option>
              <option value="Kids">Kids</option>
            </select>
          </div>
          <div className="space-y-2">
            <Label className="text-[10px] font-bold tracking-widest uppercase">Motif</Label>
            <Input {...register('motif')} placeholder="e.g. Plain, Floral" className="h-12" />
            {errors.motif && <p className="text-xs text-destructive">{errors.motif.message}</p>}
          </div>
          <div className="space-y-2">
            <Label className="text-[10px] font-bold tracking-widest uppercase">Material</Label>
            <Input {...register('material')} placeholder="e.g. Premium Silk" className="h-12" />
            {errors.material && <p className="text-xs text-destructive">{errors.material.message}</p>}
          </div>
          <div className="md:col-span-2 space-y-2">
            <Label className="text-[10px] font-bold tracking-widest uppercase">Description</Label>
            <textarea 
              {...register('description')}
              className="w-full min-h-[120px] p-4 border rounded-md bg-transparent text-sm focus:ring-2 focus:ring-primary/20 transition-all"
              placeholder="Tell the story of this product..."
            />
            {errors.description && <p className="text-xs text-destructive">{errors.description.message}</p>}
          </div>
        </div>
      </div>

      {/* Media Uploader Section */}
      <div className="bg-white p-8 border rounded-xl shadow-sm space-y-6">
        <div className="flex justify-between items-center border-b pb-4">
          <h3 className="text-xl font-serif font-bold">Media Gallery</h3>
          <span className="text-[10px] font-bold tracking-widest uppercase text-muted-foreground">
            {imageFields.length} / 10 Images (Min 1)
          </span>
        </div>
        
        <div className="space-y-4">
          <div className="flex gap-2">
            <Input 
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              placeholder="Paste image URL here..." 
              className="h-12"
            />
            <Button type="button" onClick={addImage} className="h-12 px-6">
              <Plus className="w-4 h-4 mr-2" /> Add
            </Button>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {imageFields.map((field, index) => (
              <div key={field.id} className="relative group aspect-[3/4] bg-muted rounded-lg overflow-hidden border">
                <img 
                  src={watch(`images.${index}.url`)} 
                  alt={`Product ${index + 1}`} 
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
                <button
                  type="button"
                  onClick={() => removeImage(index)}
                  className="absolute top-2 right-2 p-1 bg-destructive text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X className="w-3 h-3" />
                </button>
                <div className="absolute bottom-0 left-0 right-0 bg-black/60 text-white text-[8px] py-1 text-center font-bold uppercase tracking-widest">
                  {index === 0 ? 'Primary' : `Image ${index + 1}`}
                </div>
              </div>
            ))}
            {imageFields.length < 10 && (
              <label className="aspect-[3/4] border-2 border-dashed rounded-lg flex flex-col items-center justify-center text-muted-foreground hover:bg-muted/50 transition-colors cursor-pointer relative">
                {isUploading ? (
                  <Loader2 className="w-6 h-6 mb-2 animate-spin" />
                ) : (
                  <Upload className="w-6 h-6 mb-2" />
                )}
                <span className="text-[8px] font-bold uppercase tracking-widest">
                  {isUploading ? 'Uploading...' : 'Upload Image'}
                </span>
                <input 
                  type="file" 
                  multiple 
                  accept="image/*" 
                  className="absolute inset-0 opacity-0 cursor-pointer" 
                  onChange={handleFileUpload}
                  disabled={isUploading}
                />
              </label>
            )}
          </div>
          {errors.images && <p className="text-xs text-destructive">{errors.images.message}</p>}
        </div>
      </div>

      {/* Variant Manager Section */}
      <div className="bg-white p-8 border rounded-xl shadow-sm space-y-6">
        <div className="flex justify-between items-center border-b pb-4">
          <h3 className="text-xl font-serif font-bold">Inventory & Variants</h3>
          <Button 
            type="button" 
            variant="outline" 
            onClick={() => appendVariant({ color_option: '', size_option: '', stock_quantity: 0 })}
            className="h-10 text-[10px] font-bold tracking-widest uppercase"
          >
            <Plus className="w-3 h-3 mr-2" /> Add Variant
          </Button>
        </div>

        <div className="space-y-4">
          {variantFields.map((field, index) => (
            <div key={field.id} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end p-4 border rounded-lg bg-muted/20">
              <div className="space-y-2">
                <Label className="text-[10px] font-bold tracking-widest uppercase">Color</Label>
                <Input {...register(`variants.${index}.color_option`)} placeholder="e.g. Midnight Blue" className="h-10 bg-white" />
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] font-bold tracking-widest uppercase">Size</Label>
                <select 
                  {...register(`variants.${index}.size_option`)}
                  className="w-full h-10 px-4 border rounded-md bg-white text-sm focus:ring-2 focus:ring-primary/20 transition-all"
                >
                  <option value="">Select Size</option>
                  <option value="XS">XS</option>
                  <option value="S">S</option>
                  <option value="M">M</option>
                  <option value="L">L</option>
                  <option value="XL">XL</option>
                  <option value="XXL">XXL</option>
                  <option value="One Size">One Size</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] font-bold tracking-widest uppercase">Stock Quantity</Label>
                <Input type="number" {...register(`variants.${index}.stock_quantity`, { valueAsNumber: true })} className="h-10 bg-white" />
              </div>
              <div className="flex gap-2">
                <Button 
                  type="button" 
                  variant="ghost" 
                  onClick={() => removeVariant(index)}
                  className="h-10 text-destructive hover:bg-destructive/10"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          ))}
          {errors.variants && <p className="text-xs text-destructive">{errors.variants.message}</p>}
        </div>
      </div>

      <div className="flex justify-end gap-4">
        <Button type="button" variant="outline" onClick={onCancel} className="h-12 px-8 font-bold tracking-widest uppercase text-[10px]">
          Cancel
        </Button>
        <Button 
          type="submit" 
          disabled={isSubmitting}
          className="h-12 px-12 bg-primary text-white font-bold tracking-widest uppercase text-[10px] min-w-[200px]"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Saving...
            </>
          ) : (
            initialData ? 'Update Product' : 'Create Product'
          )}
        </Button>
      </div>
    </form>
  );
}
