import { useState, useEffect } from 'react';
import { Plus, Trash2, Ticket, Calendar, Percent, DollarSign, Loader2 } from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Badge } from '../ui/badge';
import { supabase } from '../../lib/supabase';
import { toast } from 'sonner';

export default function VoucherManager() {
  const [vouchers, setVouchers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [newVoucher, setNewVoucher] = useState({
    code: '',
    discount_type: 'percentage',
    discount_value: 0,
    min_spend: 0,
    is_active: true
  });

  useEffect(() => {
    fetchVouchers();
  }, []);

  const fetchVouchers = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('vouchers')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      setVouchers(data || []);
    } catch (error: any) {
      toast.error('Error fetching vouchers: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAddVoucher = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const { error } = await supabase
        .from('vouchers')
        .insert([newVoucher]);

      if (error) throw error;
      
      toast.success('Voucher created successfully');
      setIsAdding(false);
      setNewVoucher({ code: '', discount_type: 'percentage', discount_value: 0, min_spend: 0, is_active: true });
      fetchVouchers();
    } catch (error: any) {
      toast.error('Error creating voucher: ' + error.message);
    }
  };

  const handleDeleteVoucher = async (id: string) => {
    try {
      const { error } = await supabase
        .from('vouchers')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      toast.success('Voucher deleted');
      fetchVouchers();
    } catch (error: any) {
      toast.error('Error deleting voucher: ' + error.message);
    }
  };

  if (loading && vouchers.length === 0) {
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
          <h2 className="text-3xl font-serif font-bold tracking-tight">Voucher Management</h2>
          <p className="text-sm text-muted-foreground">Create and manage discount codes for your customers.</p>
        </div>
        <Button 
          onClick={() => setIsAdding(!isAdding)}
          className="bg-secondary text-primary font-bold tracking-widest text-[10px] uppercase h-12 px-8 hover:bg-hover hover:text-white transition-all duration-300"
        >
          {isAdding ? 'Cancel' : (
            <>
              <Plus className="w-4 h-4 mr-2" />
              Create Voucher
            </>
          )}
        </Button>
      </div>

      {isAdding && (
        <div className="bg-white p-8 border rounded-xl shadow-sm animate-in fade-in slide-in-from-top-4 duration-500">
          <form onSubmit={handleAddVoucher} className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label className="text-[10px] font-bold tracking-widest uppercase">Voucher Code</Label>
              <Input 
                required
                value={newVoucher.code}
                onChange={(e) => setNewVoucher({ ...newVoucher, code: e.target.value.toUpperCase() })}
                placeholder="e.g. WELCOME10" 
                className="h-12 font-mono"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-[10px] font-bold tracking-widest uppercase">Discount Type</Label>
              <select 
                value={newVoucher.discount_type}
                onChange={(e) => setNewVoucher({ ...newVoucher, discount_type: e.target.value })}
                className="w-full h-12 px-4 border rounded-md bg-transparent text-sm focus:ring-2 focus:ring-primary/20 transition-all"
              >
                <option value="percentage">Percentage (%)</option>
                <option value="fixed">Fixed Amount ($)</option>
              </select>
            </div>
            <div className="space-y-2">
              <Label className="text-[10px] font-bold tracking-widest uppercase">Discount Value</Label>
              <div className="relative">
                <Input 
                  required
                  type="number"
                  value={newVoucher.discount_value}
                  onChange={(e) => setNewVoucher({ ...newVoucher, discount_value: parseFloat(e.target.value) })}
                  placeholder="0.00" 
                  className="h-12 pl-10"
                />
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                  {newVoucher.discount_type === 'percentage' ? <Percent className="w-4 h-4" /> : <DollarSign className="w-4 h-4" />}
                </div>
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-[10px] font-bold tracking-widest uppercase">Minimum Spend ($)</Label>
              <Input 
                type="number"
                value={newVoucher.min_spend}
                onChange={(e) => setNewVoucher({ ...newVoucher, min_spend: parseFloat(e.target.value) })}
                placeholder="0.00" 
                className="h-12"
              />
            </div>
            <div className="md:col-span-2">
              <Button type="submit" className="w-full h-12 bg-primary text-white font-bold tracking-widest uppercase text-[10px]">
                Create Voucher
              </Button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white border rounded-xl overflow-hidden shadow-sm">
        <Table>
          <TableHeader className="bg-muted/50">
            <TableRow>
              <TableHead className="font-bold tracking-widest uppercase text-[10px]">Code</TableHead>
              <TableHead className="font-bold tracking-widest uppercase text-[10px]">Discount</TableHead>
              <TableHead className="font-bold tracking-widest uppercase text-[10px]">Min. Spend</TableHead>
              <TableHead className="font-bold tracking-widest uppercase text-[10px]">Usage</TableHead>
              <TableHead className="font-bold tracking-widest uppercase text-[10px]">Status</TableHead>
              <TableHead className="text-right font-bold tracking-widest uppercase text-[10px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {vouchers.map((voucher) => (
              <TableRow key={voucher.id} className="hover:bg-muted/20 transition-colors">
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Ticket className="w-4 h-4 text-secondary" />
                    <span className="font-mono font-bold">{voucher.code}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <span className="font-medium">
                    {voucher.discount_type === 'percentage' ? `${voucher.discount_value}%` : `$${voucher.discount_value}`}
                  </span>
                </TableCell>
                <TableCell className="text-muted-foreground">${voucher.min_spend}</TableCell>
                <TableCell>
                  <span className="text-sm">{voucher.times_used} / {voucher.usage_limit || '∞'}</span>
                </TableCell>
                <TableCell>
                  {voucher.is_active ? (
                    <Badge className="bg-sage text-primary border-none text-[10px] font-bold tracking-widest uppercase">Active</Badge>
                  ) : (
                    <Badge variant="outline" className="text-[10px] font-bold tracking-widest uppercase">Inactive</Badge>
                  )}
                </TableCell>
                <TableCell className="text-right">
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={() => handleDeleteVoucher(voucher.id)}
                    className="hover:text-destructive"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
            {vouchers.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="h-32 text-center text-muted-foreground">
                  No vouchers found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
