/* 
  SUPABASE SQL SCHEMA FOR ORDERS TABLE
  
  CREATE TABLE orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    customer_name TEXT,
    customer_email TEXT,
    total_amount DECIMAL(10, 2),
    status TEXT DEFAULT 'pending', -- 'pending', 'paid', 'cancelled', 'shipped'
    payment_id TEXT, -- Stripe Checkout Session ID or Payment Intent ID
    shipping_address JSONB,
    items JSONB, -- Array of items purchased
    user_id UUID REFERENCES auth.users(id) -- Optional: link to auth user
  );

  -- Enable Row Level Security
  ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

  -- Policies
  CREATE POLICY "Users can view their own orders" ON orders
    FOR SELECT USING (auth.uid() = user_id);
    
  CREATE POLICY "Admins can view all orders" ON orders
    FOR ALL USING (
      EXISTS (
        SELECT 1 FROM users_roles 
        WHERE user_id = auth.uid() AND role = 'admin'
      )
    );
*/

import { supabase } from './supabase';
import { CartItem } from '../types';

export interface Order {
  id?: string;
  created_at?: string;
  customer_name: string;
  customer_email: string;
  total_amount: number;
  status: 'pending' | 'paid' | 'cancelled' | 'shipped';
  payment_id?: string;
  shipping_address: {
    line1: string;
    city: string;
    postal_code: string;
    country: string;
  };
  items: CartItem[];
  user_id?: string;
}

export async function createOrder(order: Order) {
  const { data, error } = await supabase
    .from('orders')
    .insert([order])
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updateOrderStatus(orderId: string, status: Order['status'], paymentId?: string) {
  const { data, error } = await supabase
    .from('orders')
    .update({ status, payment_id: paymentId })
    .eq('id', orderId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function getOrders() {
  const { data, error } = await supabase
    .from('orders')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
}
