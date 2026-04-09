import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Loader2, ChevronLeft, ImageIcon, Eye, EyeOff, MoveVertical } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Button } from '../ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Badge } from '../ui/badge';
import { supabase } from '../../lib/supabase';
import { HeroBanner } from '../../types';
import { toast } from 'sonner';
import BannerForm from './BannerForm';

export default function BannerManager() {
  const { t } = useTranslation();
  const [banners, setBanners] = useState<HeroBanner[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [editingBanner, setEditingBanner] = useState<HeroBanner | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('hero_banners')
        .select('*')
        .order('display_order', { ascending: true });
      
      if (error) throw error;
      setBanners(data || []);
    } catch (error: any) {
      toast.error('Error fetching banners: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteBanner = async (id: string) => {
    if (!confirm(t('common.messages.are_you_sure'))) return;
    try {
      const { error } = await supabase
        .from('hero_banners')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      toast.success('Banner dihapus');
      fetchData();
    } catch (error: any) {
      toast.error('Gagal menghapus banner: ' + error.message);
    }
  };

  const toggleStatus = async (banner: HeroBanner) => {
    try {
      const { error } = await supabase
        .from('hero_banners')
        .update({ is_active: !banner.is_active })
        .eq('id', banner.id);

      if (error) throw error;
      fetchData();
    } catch (error: any) {
      toast.error('Error updating status: ' + error.message);
    }
  };

  if (loading && banners.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (isAdding || editingBanner) {
    return (
      <div className="space-y-8">
        <div className="flex items-center gap-4">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => { setIsAdding(false); setEditingBanner(null); }}
            className="hover:bg-muted"
          >
            <ChevronLeft className="w-6 h-6" />
          </Button>
          <div className="space-y-1">
            <h2 className="text-3xl font-serif font-bold tracking-tight">
              {editingBanner ? 'Ubah Banner' : 'Banner Hero Baru'}
            </h2>
            <p className="text-sm text-muted-foreground">
              {editingBanner ? `Memperbarui: ${editingBanner.main_title}` : 'Buat slide bagian hero baru.'}
            </p>
          </div>
        </div>

        <BannerForm 
          initialData={editingBanner}
          onSuccess={() => {
            setIsAdding(false);
            setEditingBanner(null);
            fetchData();
          }}
          onCancel={() => {
            setIsAdding(false);
            setEditingBanner(null);
          }}
        />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-end">
        <div className="space-y-2">
          <h2 className="text-3xl font-serif font-bold tracking-tight">Banner Hero</h2>
          <p className="text-sm text-muted-foreground">Kelola slider gambar di halaman beranda Anda.</p>
        </div>
        <Button 
          onClick={() => setIsAdding(true)}
          className="bg-secondary text-primary font-bold tracking-widest text-[10px] uppercase h-12 px-8 hover:bg-primary hover:text-white transition-all duration-300"
        >
          <Plus className="w-4 h-4 mr-2" />
          Tambah Banner Baru
        </Button>
      </div>

      <div className="bg-white border rounded-xl overflow-hidden shadow-sm">
        <Table>
          <TableHeader className="bg-muted/50">
            <TableRow>
              <TableHead className="w-12"></TableHead>
              <TableHead className="font-bold tracking-widest uppercase text-[10px]">Pratinjau</TableHead>
              <TableHead className="font-bold tracking-widest uppercase text-[10px]">Konten</TableHead>
              <TableHead className="font-bold tracking-widest uppercase text-[10px]">Urutan</TableHead>
              <TableHead className="font-bold tracking-widest uppercase text-[10px]">Status</TableHead>
              <TableHead className="text-right font-bold tracking-widest uppercase text-[10px]">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {banners.map((banner) => (
              <TableRow key={banner.id} className="hover:bg-muted/20 transition-colors">
                <TableCell>
                  <MoveVertical className="w-4 h-4 text-muted-foreground cursor-move" />
                </TableCell>
                <TableCell>
                  <div className="w-24 aspect-video bg-muted rounded-lg overflow-hidden border">
                    <img src={banner.image_url || undefined} alt="" className="w-full h-full object-cover" />
                  </div>
                </TableCell>
                <TableCell>
                  <div className="space-y-1">
                    <p className="font-bold text-sm">{banner.main_title}</p>
                    <p className="text-xs text-muted-foreground truncate max-w-[200px]">{banner.sub_title}</p>
                    {banner.show_button && (
                      <Badge variant="secondary" className="text-[8px] font-bold tracking-widest uppercase mt-1">
                        CTA: {banner.button_text}
                      </Badge>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <span className="text-sm font-bold">{banner.display_order}</span>
                </TableCell>
                <TableCell>
                  <button onClick={() => toggleStatus(banner)}>
                    {banner.is_active ? (
                      <Badge className="bg-green-100 text-green-700 hover:bg-green-200 border-none flex items-center gap-1">
                        <Eye className="w-3 h-3" />
                        Aktif
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="text-muted-foreground flex items-center gap-1">
                        <EyeOff className="w-3 h-3" />
                        Tidak Aktif
                      </Badge>
                    )}
                  </button>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      onClick={() => setEditingBanner(banner)}
                      className="hover:text-secondary"
                    >
                      <Edit2 className="w-4 h-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      onClick={() => handleDeleteBanner(banner.id)}
                      className="hover:text-destructive"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
            {banners.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="h-32 text-center text-muted-foreground">
                  Banner tidak ditemukan. Tambahkan banner hero pertama Anda untuk memulai.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
