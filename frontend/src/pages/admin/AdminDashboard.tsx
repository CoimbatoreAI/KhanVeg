import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from '@/components/ui/table';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogFooter
} from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { Plus, Edit, Trash2, LayoutDashboard, Coffee, Leaf, ShoppingBag, User, CheckCircle2, Clock, Package, Truck, AlertCircle, MapPin, Navigation, LogOut } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

interface Product {
    _id?: string;
    name: string;
    description: string;
    price: number;
    unit: string;
    images: string[];
    shopType: 'vegetable' | 'coffee';
    category?: string;
    inStock: boolean;
}

interface Order {
    _id: string;
    customer: { name: string; email: string; phone: string };
    items: { name: string; quantity: number; price: number }[];
    totalPrice: number;
    status: string;
    deliveryPartner?: { _id: string; name: string; phone: string };
    shippingAddress: string;
    createdAt: string;
    courierLocation?: { lat: number; lng: number };
}

interface DeliveryBoy {
    _id: string;
    name: string;
    phone: string;
    isActive: boolean;
}

const AdminDashboard = () => {
    const { token, user, isAuthenticated, logout } = useAuth();
    const navigate = useNavigate();

    const [activeTab, setActiveTab] = useState<'products' | 'orders' | 'staff' | 'fleet'>('products');
    const [products, setProducts] = useState<Product[]>([]);
    const [orders, setOrders] = useState<Order[]>([]);
    const [deliveryBoys, setDeliveryBoys] = useState<DeliveryBoy[]>([]);
    const [loading, setLoading] = useState(true);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [isStaffDialogOpen, setIsStaffDialogOpen] = useState(false);
    const [editingProduct, setEditingProduct] = useState<Product | null>(null);
    const [newOrderCount, setNewOrderCount] = useState(0);

    // Form State for Product
    const [formData, setFormData] = useState<Product>({
        name: '',
        description: '',
        price: 0,
        unit: 'kg',
        images: [],
        shopType: 'vegetable',
        category: '',
        inStock: true
    });
    const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
    const [previews, setPreviews] = useState<string[]>([]);

    // Form State for Staff
    const [staffFormData, setStaffFormData] = useState({
        name: '',
        userId: '', // used as email/id
        password: '',
        phone: ''
    });



    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5040/api';
    const baseUrl = apiUrl.replace('/api', '');

    const fetchProducts = useCallback(async () => {
        try {
            const response = await fetch(`${apiUrl}/products`);
            if (response.ok) {
                const data = await response.json();
                setProducts(data);
            }
        } catch (error) {
            toast.error('Failed to fetch products');
        }
    }, [apiUrl]);

    const fetchOrders = useCallback(async () => {
        if (!token) return;
        try {
            const response = await fetch(`${apiUrl}/orders/all`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (response.ok) {
                const data = await response.json();
                setOrders(data);
                const pending = data.filter((o: Order) => o.status === 'Pending').length;
                setNewOrderCount(prev => {
                    if (pending > prev) {
                        toast.info(`You have ${pending} pending orders!`, { icon: <AlertCircle className="text-amber-500" /> });
                    }
                    return pending;
                });
            }
        } catch (error) {
            console.error('Failed to fetch orders');
        }
    }, [apiUrl, token]);

    const fetchDeliveryBoys = useCallback(async () => {
        if (!token) return;
        try {
            const response = await fetch(`${apiUrl}/auth/delivery-boys`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (response.ok) {
                const data = await response.json();
                setDeliveryBoys(data);
            }
        } catch (error) {
            console.error('Failed to fetch delivery boys');
        }
    }, [apiUrl, token]);



    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            await Promise.all([fetchProducts(), fetchOrders(), fetchDeliveryBoys()]);
        } finally {
            setLoading(false);
        }
    }, [fetchProducts, fetchOrders, fetchDeliveryBoys]);

    useEffect(() => {
        if (!isAuthenticated) {
            navigate('/admin/login');
            return;
        }
        if (user?.role !== 'admin') {
            toast.error('Restricted access: Administrators only');
            navigate('/');
            return;
        }

        fetchData();
        const interval = setInterval(fetchOrders, 10000); // Poll for updates every 10s
        return () => clearInterval(interval);
    }, [isAuthenticated, user, navigate, fetchData, fetchOrders]);


    const handleAssignOrder = async (orderId: string, deliveryPartnerId: string) => {
        try {
            const response = await fetch(`${apiUrl}/orders/assign`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ orderId, deliveryPartnerId }),
            });

            if (response.ok) {
                toast.success('Order assigned successfully');
                fetchOrders();
            } else {
                toast.error('Failed to assign order');
            }
        } catch (error) {
            toast.error('Connection error');
        }
    };

    const handleCreateStaff = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const response = await fetch(`${apiUrl}/auth/staff`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    name: staffFormData.name,
                    email: staffFormData.userId,
                    password: staffFormData.password,
                    phone: staffFormData.phone
                })
            });
            if (response.ok) {
                toast.success('Staff account created');
                setIsStaffDialogOpen(false);
                setStaffFormData({ name: '', userId: '', password: '', phone: '' });
                fetchDeliveryBoys();
            } else {
                const err = await response.json();
                toast.error(err.message || 'Creation failed');
            }
        } catch (error) {
            toast.error('Connection error');
        }
    };

    const handleDeleteStaff = async (staffId: string) => {
        if (!confirm('Are you sure you want to remove this staff member?')) return;
        try {
            const response = await fetch(`${apiUrl}/auth/staff/${staffId}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (response.ok) {
                toast.success('Staff member removed');
                fetchDeliveryBoys();
            }
        } catch (error) {
            toast.error('Deletion failed');
        }
    };



    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: name === 'price' ? parseFloat(value) || 0 : value
        }));
    };

    const handleShopTypeChange = (value: string) => {
        setFormData(prev => ({ ...prev, shopType: value as 'vegetable' | 'coffee' }));
    };

    const resetForm = () => {
        setFormData({
            name: '',
            description: '',
            price: 0,
            unit: 'kg',
            images: [],
            shopType: 'vegetable',
            category: '',
            inStock: true
        });
        setSelectedFiles([]);
        setPreviews([]);
        setEditingProduct(null);
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const files = Array.from(e.target.files);
            setSelectedFiles(prev => [...prev, ...files]);

            const newPreviews = files.map(file => URL.createObjectURL(file));
            setPreviews(prev => [...prev, ...newPreviews]);
        }
    };

    const removeSelectedFile = (index: number) => {
        setSelectedFiles(prev => prev.filter((_, i) => i !== index));
        setPreviews(prev => prev.filter((_, i) => i !== index));
    };

    const removeExistingImage = (index: number) => {
        setFormData(prev => ({
            ...prev,
            images: prev.images.filter((_, i) => i !== index)
        }));
    };

    const handleProductSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const url = editingProduct
            ? `${apiUrl}/products/${editingProduct._id}`
            : `${apiUrl}/products`;

        const method = editingProduct ? 'PUT' : 'POST';

        const data = new FormData();
        data.append('name', formData.name);
        data.append('description', formData.description);
        data.append('price', formData.price.toString());
        data.append('unit', formData.unit);
        data.append('shopType', formData.shopType);
        data.append('category', formData.category || '');
        data.append('inStock', formData.inStock.toString());

        data.append('images', JSON.stringify(formData.images));

        selectedFiles.forEach(file => {
            data.append('images', file);
        });

        try {
            const response = await fetch(url, {
                method,
                body: data,
            });

            if (response.ok) {
                toast.success(editingProduct ? 'Product updated' : 'Product added');
                setIsDialogOpen(false);
                resetForm();
                fetchProducts();
            } else {
                toast.error('Failed to save product');
            }
        } catch (error) {
            toast.error('Connection error');
        }
    };

    const handleEdit = (product: Product) => {
        setEditingProduct(product);
        setFormData(product);
        setIsDialogOpen(true);
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this product?')) return;

        try {
            const response = await fetch(`${apiUrl}/products/${id}`, {
                method: 'DELETE',
            });

            if (response.ok) {
                toast.success('Product deleted');
                fetchProducts();
            }
        } catch (error) {
            toast.error('Failed to delete');
        }
    };

    return (
        <div className="p-8 pb-16 bg-gray-50/50 min-h-screen">
            <div className="max-w-7xl mx-auto space-y-8">
                <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="space-y-1">
                        <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 dark:text-zinc-100 flex items-center gap-3">
                            <LayoutDashboard className="w-9 h-9 text-emerald-600" />
                            Admin Central
                        </h1>
                        <div className="flex items-center gap-4">
                            <p className="text-gray-500 dark:text-gray-400 font-medium italic">Premium Store Control Panel</p>
                            <span className="w-1 h-1 bg-zinc-300 dark:bg-zinc-700 rounded-full" />
                            <button
                                onClick={logout}
                                className="text-[10px] font-black uppercase tracking-widest text-red-500 hover:text-red-600 transition-colors flex items-center gap-1.5"
                            >
                                <LogOut size={12} />
                                Logout Securely
                            </button>
                        </div>
                    </div>

                    <div className="flex bg-white p-1 rounded-2xl shadow-sm border border-gray-100">
                        <button
                            onClick={() => setActiveTab('products')}
                            className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all flex items-center gap-2 ${activeTab === 'products' ? 'bg-zinc-900 text-white shadow-lg' : 'text-gray-400 hover:text-gray-600'}`}
                        >
                            <Package size={18} /> Products
                        </button>
                        <button
                            onClick={() => setActiveTab('orders')}
                            className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all flex items-center gap-2 relative ${activeTab === 'orders' ? 'bg-zinc-900 text-white shadow-lg' : 'text-gray-400 hover:text-gray-600'}`}
                        >
                            <ShoppingBag size={18} /> Orders
                            {newOrderCount > 0 && (
                                <span className="absolute -top-1 -right-1 w-5 h-5 bg-emerald-500 text-white text-[10px] rounded-full flex items-center justify-center border-2 border-white animate-bounce">
                                    {newOrderCount}
                                </span>
                            )}
                        </button>
                        <button
                            onClick={() => setActiveTab('staff')}
                            className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all flex items-center gap-2 ${activeTab === 'staff' ? 'bg-zinc-900 text-white shadow-lg' : 'text-gray-400 hover:text-gray-600'}`}
                        >
                            <User size={18} /> Staff
                        </button>
                        <button
                            onClick={() => setActiveTab('fleet')}
                            className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all flex items-center gap-2 ${activeTab === 'fleet' ? 'bg-zinc-900 text-white shadow-lg' : 'text-gray-400 hover:text-gray-600'}`}
                        >
                            <Truck size={18} /> Fleet Monitor
                        </button>

                    </div>

                    {activeTab !== 'orders' && activeTab !== 'fleet' && (
                        <div className="flex gap-2">
                            {activeTab === 'products' ? (
                                <Dialog open={isDialogOpen} onOpenChange={(v) => { setIsDialogOpen(v); if (!v) resetForm(); }}>
                                    <DialogTrigger asChild>
                                        <Button size="lg" className="rounded-full px-6 shadow-md hover:shadow-lg transition-all h-12 text-lg bg-emerald-600 hover:bg-emerald-700">
                                            <Plus className="mr-2 h-5 w-5" /> Add Product
                                        </Button>
                                    </DialogTrigger>
                                    <DialogContent className="sm:max-w-[550px] max-h-[90vh] overflow-y-auto rounded-3xl">
                                        <DialogHeader className="pb-4 border-b">
                                            <DialogTitle className="text-2xl font-bold flex items-center gap-2">
                                                {editingProduct ? <Edit className="w-6 h-6" /> : <Plus className="w-6 h-6" />}
                                                {editingProduct ? 'Edit Product' : 'Add New Premium Product'}
                                            </DialogTitle>
                                        </DialogHeader>
                                        <form onSubmit={handleProductSubmit} className="space-y-6 pt-6">
                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="space-y-2 col-span-2 sm:col-span-1">
                                                    <Label className="text-sm font-bold text-gray-700 dark:text-gray-200">Store Type</Label>
                                                    <Select value={formData.shopType} onValueChange={handleShopTypeChange}>
                                                        <SelectTrigger className="bg-white dark:bg-zinc-950 border-gray-300 dark:border-zinc-800 text-gray-900 dark:text-zinc-100">
                                                            <SelectValue placeholder="Select shop" />
                                                        </SelectTrigger>
                                                        <SelectContent className="bg-white dark:bg-zinc-950 border-gray-300 dark:border-zinc-800">
                                                            <SelectItem value="vegetable">🥦 Vegetable Store</SelectItem>
                                                            <SelectItem value="coffee">☕ Coffee Store</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                </div>
                                                <div className="space-y-2 col-span-2 sm:col-span-1">
                                                    <Label className="text-sm font-bold text-gray-700 dark:text-gray-200">Category</Label>
                                                    <Input name="category" value={formData.category} onChange={handleInputChange} placeholder="e.g. Organic, Brews" className="bg-white dark:bg-zinc-950 border-gray-300 dark:border-zinc-800 text-gray-900 dark:text-zinc-100 font-semibold" />
                                                </div>
                                                <div className="space-y-2 col-span-2">
                                                    <Label className="text-sm font-bold text-gray-700 dark:text-gray-200">Product Name</Label>
                                                    <Input name="name" value={formData.name} onChange={handleInputChange} required placeholder="High Quality Name" className="bg-white dark:bg-zinc-950 border-gray-300 dark:border-zinc-800 text-gray-900 dark:text-zinc-100 font-semibold" />
                                                </div>
                                                <div className="space-y-2 col-span-2">
                                                    <Label className="text-sm font-bold text-gray-700 dark:text-gray-200">Description</Label>
                                                    <textarea
                                                        name="description"
                                                        value={formData.description}
                                                        onChange={handleInputChange}
                                                        className="w-full flex min-h-[100px] rounded-md border border-gray-300 dark:border-zinc-800 bg-white dark:bg-zinc-950 px-3 py-2 text-sm text-gray-900 dark:text-zinc-100 font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                                                        placeholder="Describe the premium quality..."
                                                        required
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <Label className="text-sm font-bold text-gray-700 dark:text-gray-200">Price (₹)</Label>
                                                    <Input name="price" type="number" step="0.01" value={formData.price} onChange={handleInputChange} required className="bg-white dark:bg-zinc-950 border-gray-300 dark:border-zinc-800 text-gray-900 dark:text-zinc-100 font-semibold" />
                                                </div>
                                                <div className="space-y-2">
                                                    <Label className="text-sm font-bold text-gray-700 dark:text-gray-200">Unit</Label>
                                                    <Input name="unit" value={formData.unit} onChange={handleInputChange} required placeholder="kg / 250g / unit" className="bg-white dark:bg-zinc-950 border-gray-300 dark:border-zinc-800 text-gray-900 dark:text-zinc-100 font-semibold" />
                                                </div>
                                                <div className="space-y-4 col-span-2">
                                                    <Label className="text-sm font-semibold text-gray-900">Product Images</Label>
                                                    <div className="flex flex-wrap gap-2 mb-2">
                                                        {formData.images.map((img, idx) => (
                                                            <div key={idx} className="relative w-20 h-20 group">
                                                                <img src={img.startsWith('http') ? img : `${baseUrl}${img}`} className="w-full h-full object-cover rounded-xl border shadow-sm" />
                                                                <button type="button" onClick={() => removeExistingImage(idx)} className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"><Trash2 size={10} /></button>
                                                            </div>
                                                        ))}
                                                        {previews.map((preview, idx) => (
                                                            <div key={idx} className="relative w-20 h-20 group">
                                                                <img src={preview} className="w-full h-full object-cover rounded-xl border border-emerald-400 shadow-sm" />
                                                                <button type="button" onClick={() => removeSelectedFile(idx)} className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"><Trash2 size={10} /></button>
                                                            </div>
                                                        ))}
                                                    </div>
                                                    <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 dark:border-zinc-700 border-dashed rounded-2xl cursor-pointer bg-gray-50 dark:bg-zinc-900/50 hover:bg-gray-100 dark:hover:bg-zinc-900 transition-colors">
                                                        <div className="flex flex-col items-center justify-center pt-5 pb-6 text-gray-500 dark:text-zinc-400">
                                                            <Plus className="w-8 h-8 mb-2" />
                                                            <p className="text-xs font-bold uppercase tracking-widest">Upload Media</p>
                                                        </div>
                                                        <input type="file" className="hidden" multiple onChange={handleFileChange} accept="image/*" />
                                                    </label>
                                                </div>
                                            </div>
                                            <DialogFooter className="pt-4 border-t gap-2">
                                                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)} className="rounded-xl px-6">Cancel</Button>
                                                <Button type="submit" className="rounded-xl px-8 shadow-md bg-zinc-900 hover:bg-black text-white">
                                                    {editingProduct ? 'Save Changes' : 'Create Product'}
                                                </Button>
                                            </DialogFooter>
                                        </form>
                                    </DialogContent>
                                </Dialog>
                            ) : (
                                <Dialog open={isStaffDialogOpen} onOpenChange={setIsStaffDialogOpen}>
                                    <DialogTrigger asChild>
                                        <Button size="lg" className="rounded-full px-6 shadow-md hover:shadow-lg transition-all h-12 text-lg bg-emerald-600 hover:bg-emerald-700">
                                            <Plus className="mr-2 h-5 w-5" /> Add Staff
                                        </Button>
                                    </DialogTrigger>
                                    <DialogContent className="sm:max-w-[450px] rounded-3xl">
                                        <DialogHeader className="pb-4 border-b">
                                            <DialogTitle className="text-2xl font-bold flex items-center gap-2">
                                                <User className="w-6 h-6" /> Add Delivery Staff
                                            </DialogTitle>
                                        </DialogHeader>
                                        <form onSubmit={handleCreateStaff} className="space-y-6 pt-6">
                                            <div className="space-y-4">
                                                <div className="space-y-2">
                                                    <Label className="text-sm font-bold text-gray-700 dark:text-gray-200">Staff Name</Label>
                                                    <Input
                                                        value={staffFormData.name}
                                                        onChange={(e) => setStaffFormData(prev => ({ ...prev, name: e.target.value }))}
                                                        placeholder="Full Name"
                                                        required
                                                        className="bg-white dark:bg-zinc-950 border-gray-300 dark:border-zinc-800 text-gray-900 dark:text-zinc-100 font-semibold"
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <Label className="text-sm font-bold text-gray-700 dark:text-gray-200">Login ID (Email/UserID)</Label>
                                                    <Input
                                                        value={staffFormData.userId}
                                                        onChange={(e) => setStaffFormData(prev => ({ ...prev, userId: e.target.value }))}
                                                        placeholder="staff@example.com"
                                                        required
                                                        className="bg-white dark:bg-zinc-950 border-gray-300 dark:border-zinc-800 text-gray-900 dark:text-zinc-100 font-mono font-semibold"
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <Label className="text-sm font-bold text-gray-700 dark:text-gray-200">Login Password</Label>
                                                    <Input
                                                        type="password"
                                                        value={staffFormData.password}
                                                        onChange={(e) => setStaffFormData(prev => ({ ...prev, password: e.target.value }))}
                                                        placeholder="Create a strong password"
                                                        required
                                                        className="bg-white dark:bg-zinc-950 border-gray-300 dark:border-zinc-800 text-gray-900 dark:text-zinc-100 font-semibold"
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <Label className="text-sm font-bold text-gray-700 dark:text-gray-200">Contact Phone</Label>
                                                    <Input
                                                        value={staffFormData.phone}
                                                        onChange={(e) => setStaffFormData(prev => ({ ...prev, phone: e.target.value }))}
                                                        placeholder="+91 XXXXX XXXXX"
                                                        required
                                                        className="bg-white dark:bg-zinc-950 border-gray-300 dark:border-zinc-800 text-gray-900 dark:text-zinc-100 font-semibold"
                                                    />
                                                </div>
                                            </div>
                                            <DialogFooter className="pt-4 border-t">
                                                <Button type="button" variant="outline" onClick={() => setIsStaffDialogOpen(false)}>Cancel</Button>
                                                <Button type="submit" className="bg-zinc-900 text-white hover:bg-black">Create Account</Button>
                                            </DialogFooter>
                                        </form>
                                    </DialogContent>
                                </Dialog>
                            )}

                        </div>
                    )}
                </header>

                {activeTab === 'products' ? (
                    <Card className="border-none shadow-xl shadow-gray-200/50 rounded-[2.5rem] overflow-hidden">
                        <CardHeader className="bg-white dark:bg-zinc-950 border-b border-gray-100 dark:border-zinc-800 px-8 py-6">
                            <CardTitle className="text-2xl font-bold text-gray-800 dark:text-zinc-100">Available Inventory</CardTitle>
                        </CardHeader>
                        <CardContent className="p-0">
                            <div className="overflow-x-auto">
                                <Table>
                                    <TableHeader className="bg-gray-50/50">
                                        <TableRow>
                                            <TableHead className="w-[100px] px-8 py-4">Image</TableHead>
                                            <TableHead className="py-4">Name</TableHead>
                                            <TableHead className="py-4 text-center">Store</TableHead>
                                            <TableHead className="py-4 text-right">Price</TableHead>
                                            <TableHead className="py-4 text-right pr-8">Actions</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {loading ? (
                                            <TableRow><TableCell colSpan={5} className="text-center py-20 text-gray-400">Synchronizing inventory...</TableCell></TableRow>
                                        ) : products.length === 0 ? (
                                            <TableRow><TableCell colSpan={5} className="text-center py-20 text-gray-400">No products found.</TableCell></TableRow>
                                        ) : (
                                            products.map((product) => (
                                                <TableRow key={product._id} className="hover:bg-gray-50/80 transition-colors group">
                                                    <TableCell className="px-8 py-4">
                                                        <div className="w-14 h-14 rounded-2xl border border-gray-100 overflow-hidden shadow-sm bg-gray-50">
                                                            <img src={product.images?.[0]?.startsWith('http') ? product.images[0] : `${baseUrl}${product.images?.[0]}`} className="w-full h-full object-cover" />
                                                        </div>
                                                    </TableCell>
                                                    <TableCell className="py-4">
                                                        <div className="font-bold text-gray-900 dark:text-zinc-100">{product.name}</div>
                                                        <div className="text-[10px] text-gray-400 dark:text-gray-500 uppercase font-black tracking-widest">{product.category || 'General'}</div>
                                                    </TableCell>
                                                    <TableCell className="py-4 text-center">
                                                        <span className={`px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5 w-fit mx-auto ${product.shopType === 'vegetable' ? 'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400' : 'bg-orange-50 dark:bg-orange-950/30 text-orange-700 dark:text-orange-400'}`}>
                                                            {product.shopType === 'vegetable' ? <Leaf size={12} /> : <Coffee size={12} />} {product.shopType}
                                                        </span>
                                                    </TableCell>
                                                    <TableCell className="py-4 text-right font-bold text-gray-900 dark:text-zinc-100">₹{product.price} <span className="text-[10px] text-gray-400 dark:text-gray-500">/{product.unit}</span></TableCell>
                                                    <TableCell className="py-4 text-right pr-8">
                                                        <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                            <Button variant="ghost" size="icon" onClick={() => handleEdit(product)} className="w-10 h-10 rounded-full hover:bg-emerald-50 text-emerald-600"><Edit size={16} /></Button>
                                                            <Button variant="ghost" size="icon" onClick={() => handleDelete(product._id!)} className="w-10 h-10 rounded-full hover:bg-red-50 text-red-600"><Trash2 size={16} /></Button>
                                                        </div>
                                                    </TableCell>
                                                </TableRow>
                                            ))
                                        )}
                                    </TableBody>
                                </Table>
                            </div>
                        </CardContent>
                    </Card>
                ) : activeTab === 'staff' ? (
                    <Card className="border-none shadow-xl shadow-gray-200/50 rounded-[2.5rem] overflow-hidden">
                        <CardHeader className="bg-white border-b border-gray-100 px-8 py-6">
                            <CardTitle className="text-2xl font-bold text-gray-800">Delivery Personnel</CardTitle>
                        </CardHeader>
                        <CardContent className="p-0">
                            <Table>
                                <TableHeader className="bg-gray-50/50">
                                    <TableRow>
                                        <TableHead className="px-8 py-4">Name</TableHead>
                                        <TableHead className="py-4">Phone</TableHead>
                                        <TableHead className="py-4">Login ID</TableHead>
                                        <TableHead className="py-4 text-right pr-8">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {loading ? (
                                        <TableRow><TableCell colSpan={4} className="text-center py-20 text-gray-400">Fetching staff list...</TableCell></TableRow>
                                    ) : deliveryBoys.length === 0 ? (
                                        <TableRow><TableCell colSpan={4} className="text-center py-20 text-gray-400">No staff accounts found.</TableCell></TableRow>
                                    ) : (
                                        deliveryBoys.map((boy) => (
                                            <TableRow key={boy._id} className="hover:bg-gray-50/80 transition-colors group">
                                                <TableCell className="px-8 py-6 font-bold text-gray-900">{boy.name}</TableCell>
                                                <TableCell className="py-6 font-medium text-gray-600">{boy.phone}</TableCell>
                                                <TableCell className="py-6 font-mono text-xs text-gray-400">{(boy as any).email}</TableCell>
                                                <TableCell className="py-6 text-right pr-8">
                                                    <Button variant="ghost" size="icon" onClick={() => handleDeleteStaff(boy._id)} className="w-10 h-10 rounded-full hover:bg-red-50 text-red-600 opacity-0 group-hover:opacity-100 transition-opacity">
                                                        <Trash2 size={18} />
                                                    </Button>
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                ) : activeTab === 'fleet' ? (
                    <div className="space-y-8">
                        <div className="flex items-center justify-between">
                            <h2 className="text-2xl font-bold text-gray-800">Live Delivery Feed</h2>
                            <div className="flex gap-4">
                                <div className="bg-white px-4 py-2 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-2">
                                    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                                    <span className="text-[10px] font-black uppercase tracking-widest text-emerald-600">
                                        {orders.filter(o => ['Shipped', 'Out for Delivery'].includes(o.status)).length} Active Riders
                                    </span>
                                </div>
                            </div>
                        </div>

                        {orders.filter(o => ['Shipped', 'Out for Delivery'].includes(o.status)).length === 0 ? (
                            <div className="bg-white rounded-[2.5rem] p-20 text-center shadow-sm border border-dashed border-gray-200">
                                <Truck className="w-12 h-12 text-gray-200 mx-auto mb-4" />
                                <p className="text-gray-400 font-medium">No live deliveries at the moment.</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {orders.filter(o => ['Shipped', 'Out for Delivery'].includes(o.status)).map(order => (
                                    <Card key={order._id} className="border-none shadow-xl shadow-gray-200/50 rounded-[2rem] overflow-hidden group hover:scale-[1.02] transition-all">
                                        <div className="p-6 space-y-4">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 bg-zinc-900 rounded-xl flex items-center justify-center text-white font-bold text-xs">
                                                        {order.deliveryPartner?.name.charAt(0)}
                                                    </div>
                                                    <div>
                                                        <h3 className="text-sm font-bold text-gray-900">{order.deliveryPartner?.name}</h3>
                                                        <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest">{order.status}</p>
                                                    </div>
                                                </div>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => navigate(`/track?id=${order._id}`)}
                                                    className="w-10 h-10 rounded-full hover:bg-emerald-50 text-emerald-600 shadow-sm"
                                                >
                                                    <Navigation size={16} />
                                                </Button>
                                            </div>

                                            <div className="h-40 bg-gray-100 rounded-2xl relative overflow-hidden border border-gray-50">
                                                {order.courierLocation ? (
                                                    <iframe
                                                        width="100%"
                                                        height="100%"
                                                        frameBorder="0"
                                                        style={{ border: 0 }}
                                                        src={`https://maps.google.com/maps?q=${order.courierLocation.lat},${order.courierLocation.lng}&z=14&output=embed`}
                                                    />
                                                ) : (
                                                    <div className="w-full h-full flex flex-col items-center justify-center text-center p-4">
                                                        <Clock className="w-8 h-8 text-gray-300 animate-pulse mb-2" />
                                                        <p className="text-[9px] font-black uppercase tracking-widest text-gray-400">Waiting for GPS Ping</p>
                                                    </div>
                                                )}
                                            </div>

                                            <div className="pt-2 flex justify-between items-center text-[10px] font-bold text-gray-500 uppercase tracking-widest">
                                                <span className="flex items-center gap-1"><MapPin size={12} className="text-emerald-500" /> {order.shippingAddress.split(',')[0]}</span>
                                                <span className="text-zinc-400">#{order._id.slice(-6)}</span>
                                            </div>
                                        </div>
                                    </Card>
                                ))}
                            </div>
                        )}
                    </div>

                ) : (
                    <div className="space-y-6">
                        {orders.length === 0 ? (
                            <div className="bg-white rounded-[2.5rem] p-20 text-center shadow-sm border border-dashed border-gray-200">
                                <p className="text-gray-400 font-medium">No order activity recorded.</p>
                            </div>
                        ) : (
                            orders.map(order => (
                                <Card key={order._id} className="border-none shadow-xl shadow-gray-200/50 rounded-[2rem] overflow-hidden group">
                                    <div className="p-8 flex flex-col lg:flex-row gap-8">
                                        <div className="flex-1 space-y-6">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-12 h-12 bg-zinc-900 text-white rounded-2xl flex items-center justify-center font-bold">
                                                        {order.customer.name.charAt(0)}
                                                    </div>
                                                    <div>
                                                        <h3 className="text-lg font-bold text-gray-900 dark:text-zinc-100">{order.customer.name}</h3>
                                                        <div className="flex gap-4 text-xs text-gray-500 dark:text-gray-400 font-medium">
                                                            <span className="flex items-center gap-1"><Clock size={14} /> {new Date(order.createdAt).toLocaleTimeString()}</span>
                                                            <span className="flex items-center gap-1 uppercase tracking-tighter">ID: #{order._id.substring(order._id.length - 6)}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-2 ${order.status === 'Pending' ? 'bg-amber-100 dark:bg-amber-950/30 text-amber-700 dark:text-amber-400' :
                                                    order.status === 'Delivered' ? 'bg-emerald-100 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400' : 'bg-blue-100 dark:bg-blue-950/30 text-blue-700 dark:text-blue-400'
                                                    }`}>
                                                    {order.status === 'Pending' ? <Clock size={12} /> :
                                                        order.status === 'Out for Delivery' ? <Truck size={12} /> : <CheckCircle2 size={12} />}
                                                    {order.status}
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6 bg-gray-50/50 rounded-3xl border border-gray-100">
                                                <div className="space-y-3">
                                                    <label className="text-[10px] font-black uppercase text-gray-600 tracking-widest">Delivery Details</label>
                                                    <div className="space-y-2 text-sm text-gray-900 font-bold">
                                                        <p className="flex items-start gap-2"><MapPin size={16} className="text-emerald-600 shrink-0 mt-0.5" /> {order.shippingAddress}</p>
                                                        <p className="flex items-center gap-2"><User size={16} className="text-emerald-600 shrink-0" /> {order.customer.phone}</p>
                                                    </div>
                                                </div>
                                                <div className="space-y-3">
                                                    <label className="text-[10px] font-black uppercase text-gray-600 tracking-widest">Items ({order.items.length})</label>
                                                    <div className="max-h-24 overflow-y-auto pr-2 space-y-1 scrollbar-none">
                                                        {order.items.map((item, idx) => (
                                                            <div key={idx} className="flex justify-between text-xs font-bold text-gray-500">
                                                                <span>• {item.name} x{item.quantity}</span>
                                                                <span>₹{item.price * item.quantity}</span>
                                                            </div>
                                                        ))}
                                                    </div>
                                                    <div className="pt-2 border-t border-gray-200 flex justify-between font-extrabold text-sm">
                                                        <span>Total Payable</span>
                                                        <span className="text-emerald-600">₹{order.totalPrice}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="lg:w-72 bg-gray-50/80 p-6 rounded-3xl border border-gray-100 flex flex-col justify-center gap-6">
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-black uppercase text-center block text-gray-400 tracking-widest">Order Assignment</label>
                                                {order.deliveryPartner ? (
                                                    <div className="p-4 bg-white rounded-2xl border border-emerald-100 shadow-sm text-center">
                                                        <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mb-1">Rider Assigned</p>
                                                        <p className="font-extrabold text-gray-900 border-b border-gray-50 pb-2 mb-2">{order.deliveryPartner.name}</p>
                                                        <p className="text-[10px] font-medium text-emerald-600 flex items-center justify-center gap-1"><Truck size={12} /> On the move</p>
                                                    </div>
                                                ) : (
                                                    <div className="space-y-3">
                                                        <Select onValueChange={(val) => handleAssignOrder(order._id, val)}>
                                                            <SelectTrigger className="bg-white rounded-xl h-12 border-amber-200 text-amber-900 font-bold">
                                                                <SelectValue placeholder="Assign Rider" />
                                                            </SelectTrigger>
                                                            <SelectContent>
                                                                {deliveryBoys.map(boy => (
                                                                    <SelectItem key={boy._id} value={boy._id} className="font-bold">
                                                                        {boy.name} ({boy.phone})
                                                                    </SelectItem>
                                                                ))}
                                                            </SelectContent>
                                                        </Select>
                                                        <p className="text-[9px] text-center text-amber-600 font-black uppercase tracking-widest animate-pulse">Critical: Action Required</p>
                                                    </div>
                                                )}
                                            </div>

                                            <button
                                                onClick={() => navigate(`/track?id=${order._id}`)}
                                                className="w-full py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest border border-emerald-200 hover:bg-emerald-50 transition-all text-emerald-600 bg-white shadow-sm flex items-center justify-center gap-2"
                                            >
                                                <Truck size={14} /> Track Order
                                            </button>
                                        </div>
                                    </div>
                                </Card>
                            ))
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminDashboard;
