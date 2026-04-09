import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Loader2, Upload, X, Image as ImageIcon } from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { useState } from 'react';
import { supabase } from '../../lib/supabase';
import { toast } from 'sonner';
import { HeroBanner } from '../../types';

const bannerSchema = z.object({
  main_title: z.string().min(2, 'Title must be at least 2 characters'),
  sub_title: z.string().min(2, 'Subtitle must be at least 2 characters'),
  button_text: z.string().min(1, 'Button text is required'),
  button_link: z.string().min(1, 'Button link is required'),
  show_button: z.boolean(),
  is_active: z.boolean(),
  image_url: z.string().min(1, 'Image is required'),
  display_order: z.number(),
});

type BannerFormValues = z.infer<typeof bannerSchema>;

interface BannerFormProps {
  onSuccess: () => void;
  onCancel: () => void;
  initialData?: HeroBanner | null;
}

export default function BannerForm({ onSuccess, onCancel, initialData }: BannerFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<BannerFormValues>({
    resolver: zodResolver(bannerSchema),
    defaultValues: {
      main_title: initialData?.main_title || '',
      sub_title: initialData?.sub_title || '',
      button_text: initialData?.button_text || 'Shop Now',
      button_link: initialData?.button_link || '/',
      show_button: initialData?.show_button ?? true,
      is_active: initialData?.is_active ?? true,
      image_url: initialData?.image_url || '',
      display_order: initialData?.display_order || 0,
    },
  });

  const imageUrl = watch('image_url');
  const showButton = watch('show_button');
  const isActive = watch('is_active');

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random().toString(36).substring(2)}-${Date.now()}.${fileExt}`;
      const filePath = `banners/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('product-images')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('product-images')
        .getPublicUrl(filePath);

      setValue('image_url', publicUrl);
      toast.success('Banner image uploaded successfully');
    } catch (error: any) {
      console.error('Upload error:', error);
      toast.error('Error uploading image: ' + error.message);
    } finally {
      setIsUploading(false);
      e.target.value = '';
    }
  };

  const onSubmit = async (values: BannerFormValues) => {
    setIsSubmitting(true);
    try {
      if (initialData?.id) {
        const { error } = await supabase
          .from('hero_banners')
          .update(values)
          .eq('id', initialData.id);
        if (error) throw error;
        toast.success('Banner updated successfully');
      } else {
        const { error } = await supabase
          .from('hero_banners')
          .insert([values]);
        if (error) throw error;
        toast.success('Banner created successfully');
      }
      onSuccess();
    } catch (error: any) {
      toast.error('Error saving banner: ' + error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
      <div className="bg-white p-8 border rounded-xl shadow-sm space-y-8">
        <h3 className="text-xl font-serif font-bold border-b pb-4">Konfigurasi Banner</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          {/* Image Upload Section */}
          <div className="space-y-4">
            <Label className="text-[10px] font-bold tracking-widest uppercase">Gambar Hero</Label>
            <div className="relative aspect-[16/9] md:aspect-[4/5] bg-muted/30 rounded-2xl border-2 border-dashed border-primary/10 flex flex-col items-center justify-center overflow-hidden group transition-all hover:border-primary/30">
              {imageUrl ? (
                <>
                  <img src={imageUrl || undefined} alt="Preview" className="w-full h-full object-cover" />
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
                    <p className="text-[10px] font-bold tracking-widest uppercase">Unggah Gambar Hero</p>
                    <p className="text-[8px] text-muted-foreground uppercase tracking-wider">Resolusi Tinggi Direkomendasikan</p>
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
            <div className="grid grid-cols-1 gap-6">
              <div className="space-y-2">
                <Label className="text-[10px] font-bold tracking-widest uppercase">Judul Utama</Label>
                <Input {...register('main_title')} placeholder="misal: KOLEKSI TERBARU" className="h-12" />
                {errors.main_title && <p className="text-xs text-destructive">{errors.main_title.message}</p>}
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] font-bold tracking-widest uppercase">Sub Judul</Label>
                <textarea 
                  {...register('sub_title')}
                  className="w-full min-h-[100px] p-4 border rounded-md bg-transparent text-sm focus:ring-2 focus:ring-primary/20 transition-all"
                  placeholder="Deskripsikan koleksi ini..."
                />
                {errors.sub_title && <p className="text-xs text-destructive">{errors.sub_title.message}</p>}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label className="text-[10px] font-bold tracking-widest uppercase">Tampilkan Tombol CTA</Label>
                  <button
                    type="button"
                    onClick={() => setValue('show_button', !showButton)}
                    className={`w-12 h-6 rounded-full transition-colors relative ${showButton ? 'bg-secondary' : 'bg-muted'}`}
                  >
                    <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${showButton ? 'left-7' : 'left-1'}`} />
                  </button>
                </div>
                {showButton && (
                  <div className="space-y-4 pt-2">
                    <div className="space-y-2">
                      <Label className="text-[10px] font-bold tracking-widest uppercase">Teks Tombol</Label>
                      <Input {...register('button_text')} placeholder="Belanja Sekarang" className="h-10" />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-[10px] font-bold tracking-widest uppercase">Link Tombol</Label>
                      <Input {...register('button_link')} placeholder="/category/new-arrival" className="h-10" />
                    </div>
                  </div>
                )}
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label className="text-[10px] font-bold tracking-widest uppercase">Aktif</Label>
                  <button
                    type="button"
                    onClick={() => setValue('is_active', !isActive)}
                    className={`w-12 h-6 rounded-full transition-colors relative ${isActive ? 'bg-secondary' : 'bg-muted'}`}
                  >
                    <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${isActive ? 'left-7' : 'left-1'}`} />
                  </button>
                </div>
                <div className="space-y-2 pt-2">
                  <Label className="text-[10px] font-bold tracking-widest uppercase">Urutan Tampilan</Label>
                  <Input 
                    type="number" 
                    {...register('display_order', { valueAsNumber: true })} 
                    className="h-10" 
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-end gap-4">
        <Button type="button" variant="outline" onClick={onCancel} className="h-12 px-8 font-bold tracking-widest uppercase text-[10px]">
          Batal
        </Button>
        <Button 
          type="submit" 
          disabled={isSubmitting || isUploading}
          className="h-12 px-12 bg-primary text-white font-bold tracking-widest uppercase text-[10px] min-w-[200px]"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Menyimpan...
            </>
          ) : (
            initialData ? 'Ubah Banner' : 'Buat Banner'
          )}
        </Button>
      </div>
    </form>
  );
}
