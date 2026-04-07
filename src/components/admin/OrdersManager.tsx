import { useState, useEffect } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Badge } from '../ui/badge';
import { getOrders, Order } from '../../lib/orders';
import { Loader2, ExternalLink } from 'lucide-react';
import { Button } from '../ui/button';
import { formatCurrency } from '../../lib/utils';

export default function OrdersManager() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchOrders() {
      try {
        const data = await getOrders();
        setOrders(data);
      } catch (error) {
        console.error('Error fetching orders:', error);
      } finally {
        setIsLoading(false);
      }
    }
    fetchOrders();
  }, []);

  if (isLoading) {
    return (
      <div className="h-[60vh] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <h2 className="text-3xl font-serif font-bold tracking-tight">Order Management</h2>
        <p className="text-sm text-muted-foreground">Monitor and process customer orders.</p>
      </div>

      <div className="bg-white border rounded-xl overflow-hidden">
        <Table>
          <TableHeader className="bg-muted/50">
            <TableRow>
              <TableHead className="font-bold tracking-widest uppercase text-[10px]">Order ID</TableHead>
              <TableHead className="font-bold tracking-widest uppercase text-[10px]">Customer</TableHead>
              <TableHead className="font-bold tracking-widest uppercase text-[10px]">Total</TableHead>
              <TableHead className="font-bold tracking-widest uppercase text-[10px]">Status</TableHead>
              <TableHead className="font-bold tracking-widest uppercase text-[10px]">Date</TableHead>
              <TableHead className="text-right font-bold tracking-widest uppercase text-[10px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {orders.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-32 text-center text-muted-foreground">
                  No orders found.
                </TableCell>
              </TableRow>
            ) : (
              orders.map((order) => (
                <TableRow key={order.id} className="hover:bg-muted/20 transition-colors">
                  <TableCell className="font-mono text-[10px]">{order.id?.slice(0, 8)}...</TableCell>
                  <TableCell>
                    <div>
                      <p className="font-bold text-sm">{order.customer_name}</p>
                      <p className="text-[10px] text-muted-foreground">{order.customer_email}</p>
                    </div>
                  </TableCell>
                  <TableCell className="font-medium">{formatCurrency(order.total_amount)}</TableCell>
                  <TableCell>
                    <Badge className={`
                      border-none text-[10px] font-bold tracking-widest uppercase
                      ${order.status === 'paid' ? 'bg-sage text-primary' : 
                        order.status === 'pending' ? 'bg-gold text-primary' : 
                        'bg-destructive/10 text-destructive'}
                    `}>
                      {order.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    {new Date(order.created_at!).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon" className="hover:text-secondary">
                      <ExternalLink className="w-4 h-4" />
                    </Button>
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
