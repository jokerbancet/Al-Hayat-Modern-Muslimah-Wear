import { useState, useEffect } from 'react';
import { ShoppingBag, Eye, CheckCircle2, XCircle, Clock, Package } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { supabase } from '../../lib/supabase';
import { toast } from 'sonner';
import { formatCurrency } from '../../lib/utils';

export default function OrderManager() {
  const [orders, setOrders] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setOrders(data || []);
    } catch (error: any) {
      console.error('Fetch Orders Error:', error);
      toast.error('Failed to load orders');
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'paid':
        return <Badge className="bg-sage text-primary border-none text-[10px] font-bold tracking-widest uppercase">Dibayar</Badge>;
      case 'pending':
        return <Badge className="bg-gold text-primary border-none text-[10px] font-bold tracking-widest uppercase">Menunggu</Badge>;
      case 'cancelled':
        return <Badge className="bg-destructive text-white border-none text-[10px] font-bold tracking-widest uppercase">Dibatalkan</Badge>;
      default:
        return <Badge variant="outline" className="text-[10px] font-bold tracking-widest uppercase">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <h2 className="text-3xl font-serif font-bold tracking-tight">Manajemen Pesanan</h2>
        <p className="text-sm text-muted-foreground">Pantau dan proses pesanan pelanggan.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 border rounded-xl space-y-2">
          <p className="text-[10px] font-bold tracking-widest text-muted-foreground uppercase">Total Pesanan</p>
          <p className="text-3xl font-serif font-bold">{orders.length}</p>
        </div>
        <div className="bg-white p-6 border rounded-xl space-y-2">
          <p className="text-[10px] font-bold tracking-widest text-muted-foreground uppercase">Pembayaran Tertunda</p>
          <p className="text-3xl font-serif font-bold text-gold">{orders.filter(o => o.status === 'pending').length}</p>
        </div>
        <div className="bg-white p-6 border rounded-xl space-y-2">
          <p className="text-[10px] font-bold tracking-widest text-muted-foreground uppercase">Pendapatan</p>
          <p className="text-3xl font-serif font-bold text-sage">
            {formatCurrency(orders.filter(o => o.status === 'paid').reduce((sum, o) => sum + o.total_amount, 0))}
          </p>
        </div>
      </div>

      <div className="bg-white border rounded-xl overflow-hidden">
        <Table>
          <TableHeader className="bg-muted/50">
            <TableRow>
              <TableHead className="font-bold tracking-widest uppercase text-[10px]">ID Pesanan</TableHead>
              <TableHead className="font-bold tracking-widest uppercase text-[10px]">Pelanggan</TableHead>
              <TableHead className="font-bold tracking-widest uppercase text-[10px]">Tanggal</TableHead>
              <TableHead className="font-bold tracking-widest uppercase text-[10px]">Jumlah</TableHead>
              <TableHead className="font-bold tracking-widest uppercase text-[10px]">Status</TableHead>
              <TableHead className="text-right font-bold tracking-widest uppercase text-[10px]">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-12 text-muted-foreground">Memuat pesanan...</TableCell>
              </TableRow>
            ) : orders.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-12 text-muted-foreground">Pesanan tidak ditemukan.</TableCell>
              </TableRow>
            ) : (
              orders.map((order) => (
                <TableRow key={order.id} className="hover:bg-muted/20 transition-colors">
                  <TableCell className="font-bold text-xs">{order.id}</TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <p className="text-sm font-medium">{order.customer_email}</p>
                      <p className="text-[10px] text-muted-foreground uppercase tracking-widest">{order.shipping_address?.city}</p>
                    </div>
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    {new Date(order.created_at).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="font-bold">{formatCurrency(order.final_amount)}</TableCell>
                  <TableCell>{getStatusBadge(order.status)}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="ghost" size="icon" className="hover:text-secondary" title="Lihat Detail">
                        <Eye className="w-4 h-4" />
                      </Button>
                      {order.status === 'pending' && (
                        <Button variant="ghost" size="icon" className="hover:text-destructive" title="Batalkan Pesanan">
                          <XCircle className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
