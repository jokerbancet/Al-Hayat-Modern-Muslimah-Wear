import { useState } from 'react';
import { LayoutDashboard, Package, Image as ImageIcon, Settings, LogOut, ChevronRight, Menu, ShoppingBag, User, Ticket, Layers } from 'lucide-react';
import { Button } from '../ui/button';
import InventoryManager from './InventoryManager';
import OrderManager from './OrderManager';
import VoucherManager from './VoucherManager';
import CategoryManager from './CategoryManager';
import BannerManager from './BannerManager';
import { useAuth } from '../../hooks/useAuth';

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('inventory');
  const { user, signOut } = useAuth();

  const sidebarLinks = [
    { id: 'dashboard', name: 'Dashboard', icon: LayoutDashboard },
    { id: 'banners', name: 'Banners', icon: ImageIcon },
    { id: 'categories', name: 'Categories', icon: Layers },
    { id: 'inventory', name: 'Inventory Control', icon: Package },
    { id: 'orders', name: 'Orders', icon: ShoppingBag },
    { id: 'vouchers', name: 'Vouchers', icon: Ticket },
    { id: 'settings', name: 'Settings', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-muted/30 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r hidden md:flex flex-col">
        <div className="p-8 border-b">
          <h1 className="text-2xl font-serif font-bold tracking-tighter">AL-HAYAT</h1>
          <p className="text-[10px] font-bold tracking-widest text-muted-foreground uppercase mt-2">Admin Panel</p>
        </div>
        
        <div className="p-6 border-b bg-muted/10">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
              <User className="w-5 h-5" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[10px] font-bold tracking-widest uppercase truncate">{user?.email?.split('@')[0]}</p>
              <p className="text-[8px] font-bold tracking-widest uppercase text-muted-foreground">Administrator</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-6 space-y-2">
          {sidebarLinks.map((link) => (
            <button
              key={link.id}
              onClick={() => setActiveTab(link.id)}
              className={`w-full flex items-center justify-between p-4 rounded-xl transition-all duration-300 ${
                activeTab === link.id
                  ? 'bg-primary text-white shadow-lg'
                  : 'text-muted-foreground hover:bg-muted hover:text-primary'
              }`}
            >
              <div className="flex items-center gap-4">
                <link.icon className="w-5 h-5" />
                <span className="text-xs font-bold tracking-widest uppercase">{link.name}</span>
              </div>
              {activeTab === link.id && <ChevronRight className="w-4 h-4" />}
            </button>
          ))}
        </nav>

        <div className="p-6 border-t">
          <Button 
            variant="ghost" 
            onClick={() => signOut()}
            className="w-full justify-start gap-4 text-muted-foreground hover:text-destructive"
          >
            <LogOut className="w-5 h-5" />
            <span className="text-xs font-bold tracking-widest uppercase">Sign Out</span>
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8 md:p-12 overflow-y-auto">
        <div className="max-w-6xl mx-auto">
          {activeTab === 'banners' && <BannerManager />}
          {activeTab === 'categories' && <CategoryManager />}
          {activeTab === 'inventory' && <InventoryManager />}
          {activeTab === 'orders' && <OrderManager />}
          {activeTab === 'vouchers' && <VoucherManager />}
          {activeTab === 'dashboard' && (
            <div className="flex flex-col items-center justify-center h-[60vh] space-y-6 text-center">
              <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center text-muted-foreground">
                <LayoutDashboard className="w-8 h-8" />
              </div>
              <div className="space-y-2">
                <h2 className="text-3xl font-serif font-bold tracking-tight">Welcome back, {user?.email?.split('@')[0]}</h2>
                <p className="text-sm text-muted-foreground">Your store is performing well. You have 12 new orders today.</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full max-w-2xl mt-8">
                <Button 
                  onClick={() => setActiveTab('inventory')}
                  className="h-24 bg-white border border-primary/10 text-primary hover:bg-primary hover:text-white transition-all duration-500 flex flex-col gap-2 rounded-2xl shadow-sm"
                >
                  <Package className="w-6 h-6" />
                  <span className="text-[10px] font-bold tracking-widest uppercase">Add Product</span>
                </Button>
                <Button 
                  onClick={() => setActiveTab('orders')}
                  className="h-24 bg-white border border-primary/10 text-primary hover:bg-primary hover:text-white transition-all duration-500 flex flex-col gap-2 rounded-2xl shadow-sm"
                >
                  <ShoppingBag className="w-6 h-6" />
                  <span className="text-[10px] font-bold tracking-widest uppercase">View Orders</span>
                </Button>
                <Button 
                  onClick={() => setActiveTab('vouchers')}
                  className="h-24 bg-white border border-primary/10 text-primary hover:bg-primary hover:text-white transition-all duration-500 flex flex-col gap-2 rounded-2xl shadow-sm"
                >
                  <Ticket className="w-6 h-6" />
                  <span className="text-[10px] font-bold tracking-widest uppercase">New Voucher</span>
                </Button>
              </div>
            </div>
          )}
          {activeTab === 'media' && (
            <div className="space-y-8">
              <div className="space-y-2">
                <h2 className="text-3xl font-serif font-bold tracking-tight">Media Manager</h2>
                <p className="text-sm text-muted-foreground">Drag and drop images to upload to your product gallery.</p>
              </div>
              <div className="border-2 border-dashed border-primary/10 rounded-3xl h-96 flex flex-col items-center justify-center space-y-6 bg-white/50">
                <div className="w-16 h-16 rounded-full bg-secondary/10 flex items-center justify-center text-secondary">
                  <ImageIcon className="w-8 h-8" />
                </div>
                <div className="text-center space-y-2">
                  <p className="font-bold text-sm">Drop your images here</p>
                  <p className="text-xs text-muted-foreground">Supports JPG, PNG, WEBP up to 5MB</p>
                </div>
                <Button className="bg-secondary text-primary font-bold tracking-widest text-[10px] uppercase h-12 px-8 hover:bg-hover hover:text-white transition-all duration-300">
                  Browse Files
                </Button>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
