import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Loader2, Upload, X, Image as ImageIcon } from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { toast } from 'sonner';

const categorySchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  slug: z.string().min(2, 'Slug must be at least 2 characters'),
  description: z.string().optional(),
  image_url: z.string().optional(),
});

type CategoryFormValues = z.infer<typeof categorySchema>;

interface CategoryFormProps {
  onSuccess: () => void;
  onCancel: () => void;
  initialData?: any;
}

export default function CategoryForm({ onSuccess, onCancel, initialData }: CategoryFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<CategoryFormValues>({
    resolver: zodResolver(categorySchema),
    defaultValues: initialData ? {
      name: initialData.name || '',
      slug: initialData.slug || '',
      description: initialData.description || '',
      image_url: initialData.image_url || '',
    } : {
      name: '',
      slug: '',
      description: '',
      image_url: '',
    },
  });

  const categoryName = watch('name');
  const imageUrl = watch('image_url');

  useEffect(() => {
    if (categoryName && !initialData) {
      setValue('slug', categoryName.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, ''));
    }
  }, [categoryName, setValue, initialData]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random().toString(36).substring(2)}-${Date.now()}.${fileExt}`;
      const filePath = `categories/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('product-images')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('product-images')
        .getPublicUrl(filePath);

      setValue('image_url', publicUrl);
      toast.success('Image uploaded successfully');
    } catch (error: any) {
      console.error('Upload error:', error);
      toast.error('Error uploading image: ' + error.message);
    } finally {
      setIsUploading(false);
      e.target.value = '';
    }
  };

  const onSubmit = async (values: CategoryFormValues) => {
    setIsSubmitting(true);
    try {
      if (initialData?.id) {
        const { error } = await supabase
          .from('categories')
          .update(values)
          .eq('id', initialData.id);
        if (error) {
          if (error.code === '23505' && error.message.includes('slug')) {
            throw new Error('This category slug is already taken. Please try a different name or modify the slug.');
          }
          throw error;
        }
        toast.success('Category updated successfully');
      } else {
        const { error } = await supabase
          .from('categories')
          .insert([values]);
        if (error) {
          if (error.code === '23505' && error.message.includes('slug')) {
            throw new Error('This category slug is already taken. Please try a different name or modify the slug.');
          }
          throw error;
        }
        toast.success('Category created successfully');
      }
      onSuccess();
    } catch (error: any) {
      toast.error('Error saving category: ' + error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
      <div className="bg-white p-8 border rounded-xl shadow-sm space-y-8">
        <h3 className="text-xl font-serif font-bold border-b pb-4">Category Details</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          {/* Image Upload Section */}
          <div className="space-y-4">
            <Label className="text-[10px] font-bold tracking-widest uppercase">Category Image</Label>
            <div className="relative aspect-[4/5] bg-muted/30 rounded-2xl border-2 border-dashed border-primary/10 flex flex-col items-center justify-center overflow-hidden group transition-all hover:border-primary/30">
              {imageUrl ? (
                <>
                  <img src={imageUrl} alt="Preview" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <Button 
                      type="button" 
                      variant="destructive" 
                      size="icon" 
                      onClick={() => setValue('image_url', '')}
                      className="rounded-full"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                </>
              ) : (
                <div className="text-center p-6 space-y-4">
                  <div className="w-12 h-12 rounded-full bg-secondary/10 flex items-center justify-center text-secondary mx-auto">
                    {isUploading ? <Loader2 className="w-6 h-6 animate-spin" /> : <Upload className="w-6 h-6" />}
                  </div>
                  <div className="space-y-1">
                    <p className="text-[10px] font-bold tracking-widest uppercase">Upload Image</p>
                    <p className="text-[8px] text-muted-foreground uppercase tracking-wider">4:5 Aspect Ratio Recommended</p>
                  </div>
                  <input 
                    type="file" 
                    accept="image/*" 
                    onChange={handleFileUpload}
                    disabled={isUploading}
                    className="absolute inset-0 opacity-0 cursor-pointer"
                  />
                </div>
              )}
            </div>
            {errors.image_url && <p className="text-xs text-destructive">{errors.image_url.message}</p>}
          </div>

          <div className="md:col-span-2 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label className="text-[10px] font-bold tracking-widest uppercase">Category Name</Label>
                <Input {...register('name')} placeholder="e.g. Abaya" className="h-12" />
                {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] font-bold tracking-widest uppercase">Slug</Label>
                <Input {...register('slug')} placeholder="abaya" className="h-12" />
                {errors.slug && <p className="text-xs text-destructive">{errors.slug.message}</p>}
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-[10px] font-bold tracking-widest uppercase">Description</Label>
              <textarea 
                {...register('description')}
                className="w-full min-h-[150px] p-4 border rounded-md bg-transparent text-sm focus:ring-2 focus:ring-primary/20 transition-all"
                placeholder="Describe this category..."
              />
              {errors.description && <p className="text-xs text-destructive">{errors.description.message}</p>}
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-end gap-4">
        <Button type="button" variant="outline" onClick={onCancel} className="h-12 px-8 font-bold tracking-widest uppercase text-[10px]">
          Cancel
        </Button>
        <Button 
          type="submit" 
          disabled={isSubmitting || isUploading}
          className="h-12 px-12 bg-primary text-white font-bold tracking-widest uppercase text-[10px] min-w-[200px]"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Saving...
            </>
          ) : (
            initialData ? 'Update Category' : 'Create Category'
          )}
        </Button>
      </div>
    </form>
  );
}
