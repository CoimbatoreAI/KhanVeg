import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Pencil, Trash2, X, Upload, BarChart3, Package, ClipboardList } from 'lucide-react';
import { vegetableProducts, coffeeProducts, Product } from '@/lib/products';
import { toast } from 'sonner';

const STORAGE_KEYS = { vegetables: 'admin-veg-products', coffee: 'admin-coffee-products' };
const ORDER_KEYS = { vegetables: 'admin-veg-orders', coffee: 'admin-coffee-orders' };

interface DummyOrder {
  id: string;
  items: string;
  total: number;
  status: string;
  date: string;
}

const AdminPanel = () => {
  const [storeType, setStoreType] = useState<'vegetables' | 'coffee'>('vegetables');
  const isVeg = storeType === 'vegetables';
  const theme = isVeg ? 'theme-vegetables' : 'theme-coffee';
  const storeName = isVeg ? 'KHAN VEGETABLES' : 'Daily Delights';

  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<DummyOrder[]>([]);

  useEffect(() => {
    const defaultProducts = isVeg ? vegetableProducts : coffeeProducts;
    const savedProducts = localStorage.getItem(STORAGE_KEYS[storeType]);
    setProducts(savedProducts ? JSON.parse(savedProducts) : defaultProducts);

    const savedOrders = localStorage.getItem(ORDER_KEYS[storeType]);
    if (savedOrders) {
      setOrders(JSON.parse(savedOrders));
    } else {
      const dummy: DummyOrder[] = [
        { id: 'ORD001', items: `${defaultProducts[0]?.name} x2, ${defaultProducts[1]?.name} x1`, total: defaultProducts[0]?.price * 2 + defaultProducts[1]?.price, status: 'Delivered', date: '2026-02-23' },
        { id: 'ORD002', items: `${defaultProducts[2]?.name} x3`, total: defaultProducts[2]?.price * 3, status: 'Pending', date: '2026-02-24' },
        { id: 'ORD003', items: `${defaultProducts[3]?.name} x1, ${defaultProducts[4]?.name} x2`, total: defaultProducts[3]?.price + defaultProducts[4]?.price * 2, status: 'Processing', date: '2026-02-24' },
      ];
      setOrders(dummy);
      localStorage.setItem(ORDER_KEYS[storeType], JSON.stringify(dummy));
    }
  }, [storeType]);

  useEffect(() => { localStorage.setItem(STORAGE_KEYS[storeType], JSON.stringify(products)); }, [products, storeType]);

  const [tab, setTab] = useState<'dashboard' | 'products' | 'orders'>('dashboard');
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Product | null>(null);
  const [form, setForm] = useState({ name: '', price: '', category: '', emoji: '', description: '' });

  const openAdd = () => { setEditing(null); setForm({ name: '', price: '', category: '', emoji: '📦', description: '' }); setShowModal(true); };
  const openEdit = (p: Product) => { setEditing(p); setForm({ name: p.name, price: String(p.price), category: p.category, emoji: p.emoji, description: p.description }); setShowModal(true); };

  const saveProduct = () => {
    if (!form.name || !form.price) { toast.error('Fill required fields'); return; }
    if (editing) {
      setProducts(prev => prev.map(p => p.id === editing.id ? { ...p, name: form.name, price: Number(form.price), category: form.category, emoji: form.emoji, description: form.description } : p));
      toast.success('Product updated!');
    } else {
      const newP: Product = { id: `${storeType[0]}${Date.now()}`, name: form.name, price: Number(form.price), category: form.category, emoji: form.emoji, description: form.description, store: storeType, image: 'https://images.unsplash.com/photo-1518977676601-b53f02ac6d31?auto=format&fit=crop&w=800&q=80' };
      setProducts(prev => [...prev, newP]);
      toast.success('Product added!');
    }
    setShowModal(false);
  };

  const deleteProduct = (id: string) => { setProducts(prev => prev.filter(p => p.id !== id)); toast.info('Product deleted'); };

  const tabs = [
    { id: 'dashboard' as const, label: 'Dashboard', icon: BarChart3 },
    { id: 'products' as const, label: 'Products', icon: Package },
    { id: 'orders' as const, label: 'Orders', icon: ClipboardList },
  ];

  return (
    <div className={`${theme} min-h-screen bg-background text-foreground`}>
      {/* Admin Nav */}
      <nav className="sticky top-0 z-50 bg-card/80 backdrop-blur-lg border-b border-border">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link to="/" className="text-sm text-muted-foreground hover:text-foreground">← Home</Link>
            <div className="h-4 w-[1px] bg-border hidden sm:block" />
            <div className="flex bg-muted p-1 rounded-lg">
              <button
                onClick={() => setStoreType('vegetables')}
                className={`px-3 py-1 text-xs font-bold rounded-md transition-all ${isVeg ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
              >
                VEGETABLES
              </button>
              <button
                onClick={() => setStoreType('coffee')}
                className={`px-3 py-1 text-xs font-bold rounded-md transition-all ${!isVeg ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
              >
                COFFEE
              </button>
            </div>
          </div>

          <span className="font-bold text-foreground hidden md:block">Unified Admin</span>

          <div className="flex gap-1">
            {tabs.map(t => (
              <button key={t.id} onClick={() => setTab(t.id)} className={`flex items-center gap-1 px-3 py-2 rounded-lg text-sm transition-colors ${tab === t.id ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:text-foreground'}`}>
                <t.icon size={16} /> <span className="hidden sm:inline">{t.label}</span>
              </button>
            ))}
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Dashboard */}
        {tab === 'dashboard' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-card border border-border rounded-xl p-6">
              <p className="text-muted-foreground text-sm">Total Products</p>
              <p className="text-3xl font-bold text-foreground mt-1">{products.length}</p>
            </div>
            <div className="bg-card border border-border rounded-xl p-6">
              <p className="text-muted-foreground text-sm">Total Orders</p>
              <p className="text-3xl font-bold text-foreground mt-1">{orders.length}</p>
            </div>
            <div className="bg-card border border-border rounded-xl p-6">
              <p className="text-muted-foreground text-sm">Revenue (est.)</p>
              <p className="text-3xl font-bold text-foreground mt-1">₹{orders.reduce((s, o) => s + o.total, 0)}</p>
            </div>
          </motion.div>
        )}

        {/* Products */}
        {tab === 'products' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-foreground">Products</h2>
              <button onClick={openAdd} className="bg-primary text-primary-foreground px-4 py-2 rounded-xl text-sm font-semibold flex items-center gap-1 hover:opacity-90 transition-opacity">
                <Plus size={16} /> Add Product
              </button>
            </div>
            <div className="bg-card border border-border rounded-xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border bg-muted/50">
                      <th className="text-left p-3 text-muted-foreground font-medium">Product</th>
                      <th className="text-left p-3 text-muted-foreground font-medium">Category</th>
                      <th className="text-left p-3 text-muted-foreground font-medium">Price</th>
                      <th className="text-right p-3 text-muted-foreground font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {products.map(p => (
                      <tr key={p.id} className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors">
                        <td className="p-3 flex items-center gap-2"><span className="text-2xl">{p.emoji}</span> <span className="font-medium text-foreground">{p.name}</span></td>
                        <td className="p-3 text-muted-foreground">{p.category}</td>
                        <td className="p-3 text-foreground font-semibold">₹{p.price}</td>
                        <td className="p-3 text-right">
                          <button onClick={() => openEdit(p)} className="text-primary hover:bg-primary/10 p-2 rounded-lg transition-colors"><Pencil size={14} /></button>
                          <button onClick={() => deleteProduct(p.id)} className="text-destructive hover:bg-destructive/10 p-2 rounded-lg transition-colors ml-1"><Trash2 size={14} /></button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </motion.div>
        )}

        {/* Orders */}
        {tab === 'orders' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <h2 className="text-xl font-bold text-foreground mb-4">Orders</h2>
            <div className="bg-card border border-border rounded-xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border bg-muted/50">
                      <th className="text-left p-3 text-muted-foreground font-medium">Order ID</th>
                      <th className="text-left p-3 text-muted-foreground font-medium">Items</th>
                      <th className="text-left p-3 text-muted-foreground font-medium">Total</th>
                      <th className="text-left p-3 text-muted-foreground font-medium">Status</th>
                      <th className="text-left p-3 text-muted-foreground font-medium">Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.map(o => (
                      <tr key={o.id} className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors">
                        <td className="p-3 font-medium text-foreground">{o.id}</td>
                        <td className="p-3 text-muted-foreground max-w-[200px] truncate">{o.items}</td>
                        <td className="p-3 text-foreground font-semibold">₹{o.total}</td>
                        <td className="p-3">
                          <span className={`px-2 py-1 rounded-lg text-xs font-medium ${o.status === 'Delivered' ? 'bg-primary/10 text-primary' : o.status === 'Pending' ? 'bg-accent text-accent-foreground' : 'bg-secondary text-secondary-foreground'}`}>
                            {o.status}
                          </span>
                        </td>
                        <td className="p-3 text-muted-foreground">{o.date}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </motion.div>
        )}
      </div>

      {/* Add/Edit Modal */}
      <AnimatePresence>
        {showModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/20 backdrop-blur-sm p-4">
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="bg-card border border-border rounded-2xl p-6 w-full max-w-md shadow-2xl">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-bold text-foreground">{editing ? 'Edit Product' : 'Add Product'}</h3>
                <button onClick={() => setShowModal(false)} className="text-muted-foreground hover:text-foreground"><X size={20} /></button>
              </div>
              <div className="space-y-3">
                <input placeholder="Product name *" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} className="w-full px-4 py-3 bg-background border border-border rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring" />
                <input placeholder="Price *" type="number" value={form.price} onChange={e => setForm(f => ({ ...f, price: e.target.value }))} className="w-full px-4 py-3 bg-background border border-border rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring" />
                <input placeholder="Category" value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))} className="w-full px-4 py-3 bg-background border border-border rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring" />
                <input placeholder="Emoji (e.g. 🍅)" value={form.emoji} onChange={e => setForm(f => ({ ...f, emoji: e.target.value }))} className="w-full px-4 py-3 bg-background border border-border rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring" />
                <input placeholder="Description" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} className="w-full px-4 py-3 bg-background border border-border rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring" />
                {/* Image upload preview placeholder */}
                <div className="border-2 border-dashed border-border rounded-xl p-4 text-center text-muted-foreground text-sm flex items-center justify-center gap-2 cursor-pointer hover:border-primary transition-colors">
                  <Upload size={16} /> Upload Image (preview only)
                </div>
              </div>
              <button onClick={saveProduct} className="mt-4 w-full bg-primary text-primary-foreground py-3 rounded-xl font-semibold hover:opacity-90 transition-opacity">
                {editing ? 'Save Changes' : 'Add Product'}
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdminPanel;
