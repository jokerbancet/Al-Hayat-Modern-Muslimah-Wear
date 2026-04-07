import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { motion } from 'motion/react';
import { useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { toast } from 'sonner';
import { ArrowRight, Lock, Mail, Loader2 } from 'lucide-react';

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function Login() {
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || '/admin';

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (values: LoginFormValues) => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: values.email,
        password: values.password,
      });

      if (error) {
        if (error.message === 'Invalid login credentials') {
          throw new Error('Invalid email or password. Please check your credentials in the Supabase Auth dashboard.');
        }
        throw error;
      }

      // Check if user has admin role
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', data.user.id)
        .single();

      if (profileError) {
        if (profileError.code === 'PGRST116') {
          await supabase.auth.signOut();
          throw new Error('Profile not found. Please ensure the "profiles" table and trigger are set up in Supabase.');
        }
        throw profileError;
      }

      if (profile?.role !== 'admin') {
        await supabase.auth.signOut();
        throw new Error('Access Denied: You do not have administrative privileges.');
      }

      toast.success('Login successful');
      navigate(from, { replace: true });
    } catch (error: any) {
      toast.error(error.message || 'Failed to login');
      console.error('Login error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSeedAdmin = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/admin/seed', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'admin@al-hayat.com',
          password: 'password123',
        }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to seed admin');

      toast.success(data.message);
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-background">
      {/* Left Side: Visual/Editorial */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-muted">
        <img
          src="https://images.unsplash.com/photo-1567401893414-76b7b1e5a7a5?auto=format&fit=crop&q=80&w=1200"
          alt="Management Suite"
          className="absolute inset-0 w-full h-full object-cover opacity-60 grayscale hover:grayscale-0 transition-all duration-1000"
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-primary/20 backdrop-blur-[2px]" />
        <div className="relative z-10 p-16 flex flex-col justify-between h-full text-white">
          <div className="space-y-4">
            <h1 className="text-8xl font-serif font-bold tracking-tighter leading-none">
              AL-HAYAT
            </h1>
            <p className="text-[10px] font-bold tracking-[0.5em] uppercase opacity-80">
              Management Suite
            </p>
          </div>
          <div className="max-w-md">
            <p className="text-4xl font-serif italic leading-tight">
              "Excellence is not an act, but a habit."
            </p>
            <p className="mt-8 text-[10px] font-bold tracking-widest uppercase opacity-50">
              EST. 2026 — INTERNAL ACCESS ONLY
            </p>
          </div>
        </div>
      </div>

      {/* Right Side: Login Form */}
      <div className="flex-1 flex items-center justify-center p-8 lg:p-24">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className="w-full max-w-md space-y-12"
        >
          <div className="space-y-4">
            <h2 className="text-5xl font-serif font-bold tracking-tight text-primary">
              Sign In
            </h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Enter your credentials to access the administrative dashboard.
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-bold tracking-widest uppercase text-primary/60 flex items-center gap-2">
                  <Mail className="w-3 h-3" />
                  Email Address
                </label>
                <Input
                  {...register('email')}
                  type="email"
                  placeholder="admin@al-hayat.com"
                  className={`h-14 bg-transparent border-primary/20 focus:border-primary transition-colors rounded-none px-4 ${
                    errors.email ? 'border-red-500' : ''
                  }`}
                />
                {errors.email && (
                  <p className="text-[10px] font-bold text-red-500 uppercase tracking-widest mt-1">
                    {errors.email.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <label className="text-[10px] font-bold tracking-widest uppercase text-primary/60 flex items-center gap-2">
                    <Lock className="w-3 h-3" />
                    Password
                  </label>
                  <a
                    href="#"
                    className="text-[10px] font-bold tracking-widest uppercase text-secondary hover:text-secondary/80 transition-colors"
                  >
                    Forgot Password?
                  </a>
                </div>
                <Input
                  {...register('password')}
                  type="password"
                  placeholder="••••••••"
                  className={`h-14 bg-transparent border-primary/20 focus:border-primary transition-colors rounded-none px-4 ${
                    errors.password ? 'border-red-500' : ''
                  }`}
                />
                {errors.password && (
                  <p className="text-[10px] font-bold text-red-500 uppercase tracking-widest mt-1">
                    {errors.password.message}
                  </p>
                )}
              </div>
            </div>

            <div className="space-y-4">
              <Button
                type="submit"
                disabled={isLoading}
                className="w-full h-16 bg-primary text-white font-bold tracking-[0.2em] uppercase hover:bg-primary/90 transition-all duration-300 rounded-none group relative overflow-hidden"
              >
                {isLoading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    <span className="relative z-10">Authorize Access</span>
                    <ArrowRight className="w-5 h-5 ml-3 group-hover:translate-x-2 transition-transform relative z-10" />
                  </>
                )}
              </Button>

              <button
                type="button"
                onClick={handleSeedAdmin}
                disabled={isLoading}
                className="w-full text-[10px] font-bold tracking-widest uppercase text-primary/40 hover:text-primary transition-colors py-2"
              >
                {isLoading ? 'Processing...' : 'Seed Demo Admin Account'}
              </button>
            </div>
          </form>

          <div className="pt-12 border-t border-primary/5">
            <p className="text-[10px] font-bold tracking-widest uppercase text-primary/30 text-center">
              Secure SSL Encrypted Connection
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
