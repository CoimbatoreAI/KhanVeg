import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { User, Package, MapPin, Phone, LogOut, Edit3, Save, ShoppingBag, Clock, CheckCircle2, Truck, XCircle, ArrowLeft } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';

interface Order {
    _id: string;
    items: { name: string; quantity: number; price: number; image?: string }[];
    totalPrice: number;
    status: string;
    createdAt: string;
    shippingAddress: string;
}

const Profile = () => {
    const { user, token, logout, updateUser } = useAuth();
    const navigate = useNavigate();
    const [orders, setOrders] = useState<Order[]>([]);
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({
        name: user?.name || '',
        phone: user?.phone || '',
        address: user?.address || ''
    });
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (!user) {
            navigate('/login');
            return;
        }
        fetchOrders();
    }, [user]);

    const fetchOrders = async () => {
        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5040/api'}/orders/my-orders`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (response.ok) {
                const data = await response.json();
                setOrders(data);
            }
        } catch (error) {
            console.error('Failed to fetch orders');
        }
    };

    const handleUpdate = async () => {
        setLoading(true);
        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5040/api'}/auth/profile`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(formData),
            });

            if (response.ok) {
                const data = await response.json();
                updateUser(data.user);
                setIsEditing(false);
                toast.success('Profile updated successfully');
            } else {
                toast.error('Failed to update profile');
            }
        } catch (error) {
            toast.error('Connection error');
        } finally {
            setLoading(false);
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'Pending': return <Clock className="text-amber-500" size={16} />;
            case 'Confirmed': return <ShoppingBag className="text-blue-500" size={16} />;
            case 'Shipped': return <Package className="text-purple-500" size={16} />;
            case 'Out for Delivery': return <Truck className="text-emerald-500" size={16} />;
            case 'Delivered': return <CheckCircle2 className="text-emerald-600" size={16} />;
            case 'Cancelled': return <XCircle className="text-red-500" size={16} />;
            default: return <Clock size={16} />;
        }
    };

    if (!user) return null;

    return (
        <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 pb-20">
            {/* Header */}
            <div className="bg-zinc-900 border-b border-white/5 pt-12 pb-24 text-white">
                <div className="max-w-4xl mx-auto px-6">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
                        <div className="flex items-center gap-6">
                            <div className="w-24 h-24 bg-emerald-500 rounded-[2rem] flex items-center justify-center text-4xl shadow-2xl shadow-emerald-500/20">
                                {user.name.charAt(0)}
                            </div>
                            <div>
                                <h1 style={{ fontFamily: '"Playfair Display", serif' }} className="text-4xl font-bold tracking-tight">My Profile</h1>
                                <p className="text-zinc-400 font-light mt-1">{user.email}</p>
                            </div>
                        </div>
                        <div className="flex gap-3">
                            <button
                                onClick={logout}
                                className="flex items-center gap-2 px-6 py-3 bg-white/10 hover:bg-white/20 rounded-2xl transition-all text-xs font-bold uppercase tracking-widest border border-white/10"
                            >
                                <LogOut size={16} /> Sign Out
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-4xl mx-auto px-6 -mt-12 space-y-8">
                {/* Profile Details Card */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white dark:bg-zinc-900 rounded-[2.5rem] p-8 shadow-xl shadow-zinc-200/50 dark:shadow-black/50 border border-zinc-100 dark:border-white/5">
                    <div className="flex justify-between items-center mb-8">
                        <h2 className="text-xl font-bold flex items-center gap-3">
                            <User className="text-emerald-500" /> Account Information
                        </h2>
                        {!isEditing ? (
                            <button onClick={() => setIsEditing(true)} className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-zinc-400 hover:text-emerald-500 transition-colors">
                                <Edit3 size={16} /> Edit Info
                            </button>
                        ) : (
                            <button onClick={handleUpdate} disabled={loading} className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-emerald-500 hover:text-emerald-600 transition-colors">
                                <Save size={16} /> {loading ? 'Saving...' : 'Save Info'}
                            </button>
                        )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-1">
                            <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-400">Full Name</label>
                            {isEditing ? (
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    className="w-full bg-zinc-50 dark:bg-white/5 border border-zinc-100 dark:border-white/5 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-emerald-500/50"
                                />
                            ) : (
                                <p className="text-lg font-medium">{user.name}</p>
                            )}
                        </div>
                        <div className="space-y-1">
                            <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-400">Phone</label>
                            {isEditing ? (
                                <input
                                    type="tel"
                                    value={formData.phone}
                                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                    className="w-full bg-zinc-50 dark:bg-white/5 border border-zinc-100 dark:border-white/5 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-emerald-500/50"
                                />
                            ) : (
                                <p className="text-lg font-medium flex items-center gap-2"><Phone size={14} className="text-zinc-400" /> {user.phone || 'Not set'}</p>
                            )}
                        </div>
                        <div className="space-y-1 md:col-span-2">
                            <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-400">Standard Address</label>
                            {isEditing ? (
                                <textarea
                                    value={formData.address}
                                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                    className="w-full bg-zinc-50 dark:bg-white/5 border border-zinc-100 dark:border-white/5 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-emerald-500/50 min-h-[100px]"
                                />
                            ) : (
                                <p className="text-lg font-medium flex items-start gap-2"><MapPin size={16} className="text-zinc-400 mt-1" /> {user.address || 'Address not provided'}</p>
                            )}
                        </div>
                    </div>
                </motion.div>

                {/* Orders History Card */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="space-y-6">
                    <div className="flex items-center justify-between">
                        <h2 className="text-2xl font-bold flex items-center gap-3">
                            <ShoppingBag className="text-emerald-500" /> Order History
                        </h2>
                        <Link to="/" className="text-xs font-bold uppercase tracking-widest text-emerald-500 hover:underline">Continue Shopping</Link>
                    </div>

                    {orders.length === 0 ? (
                        <div className="bg-white dark:bg-zinc-900 rounded-[2.5rem] p-16 text-center border border-dashed border-zinc-200 dark:border-white/10">
                            <p className="text-zinc-500 font-light">You haven't placed any orders yet.</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {orders.map((order) => (
                                <div key={order._id} className="bg-white dark:bg-zinc-900 rounded-[1.5rem] p-6 shadow-sm border border-zinc-100 dark:border-white/5 hover:border-emerald-500/30 transition-all group">
                                    <div className="flex flex-col md:flex-row justify-between gap-6">
                                        <div className="flex-1 space-y-4">
                                            <div className="flex items-center justify-between">
                                                <div className="bg-zinc-100 dark:bg-white/5 px-4 py-1.5 rounded-full text-[10px] font-mono font-bold text-zinc-500 tracking-tighter">
                                                    ID: {order._id.substring(order._id.length - 8).toUpperCase()}
                                                </div>
                                                <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-50 dark:bg-white/5 border border-zinc-100 dark:border-white/5 text-[10px] font-bold uppercase tracking-widest">
                                                    {getStatusIcon(order.status)}
                                                    <span className={order.status === 'Delivered' ? 'text-emerald-500' : 'text-amber-500'}>{order.status}</span>
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-4 overflow-x-auto pb-2 scrollbar-none">
                                                {order.items.map((item, idx) => (
                                                    <div key={idx} className="relative shrink-0 group">
                                                        <div className="w-12 h-12 bg-zinc-100 dark:bg-white/5 rounded-xl border border-zinc-100 dark:border-white/5 overflow-hidden">
                                                            <img src={item.image || 'https://via.placeholder.com/150'} className="w-full h-full object-cover" />
                                                        </div>
                                                        <div className="absolute -top-1 -right-1 bg-zinc-900 text-white dark:bg-white dark:text-black w-4 h-4 rounded-full flex items-center justify-center text-[8px] font-bold">
                                                            {item.quantity}
                                                        </div>
                                                    </div>
                                                ))}
                                                {order.items.length > 3 && (
                                                    <span className="text-[10px] font-bold text-zinc-400">+{order.items.length - 3} more</span>
                                                )}
                                            </div>

                                            <div className="flex items-center justify-between text-xs text-zinc-400">
                                                <div className="flex items-center gap-1 font-light">
                                                    <Clock size={12} /> Ordered on {new Date(order.createdAt).toLocaleDateString()}
                                                </div>
                                                <div className="font-bold text-lg text-zinc-900 dark:text-white">₹{order.totalPrice}</div>
                                            </div>
                                        </div>

                                        <div className="shrink-0 flex md:flex-col justify-end gap-2">
                                            <Link
                                                to={`/track?id=${order._id}`}
                                                className="flex-1 md:w-32 bg-zinc-100 dark:bg-white/5 hover:bg-zinc-900 hover:text-white dark:hover:bg-white dark:hover:text-black px-4 py-3 rounded-xl text-[10px] font-bold uppercase tracking-widest text-center transition-all"
                                            >
                                                Track
                                            </Link>
                                            <button className="flex-1 md:w-32 border border-zinc-200 dark:border-white/10 hover:border-emerald-500/50 px-4 py-3 rounded-xl text-[10px] font-bold uppercase tracking-widest text-center transition-all">Details</button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </motion.div>
            </div>
            <Link to="/" className="fixed bottom-8 left-8 bg-zinc-900 text-white dark:bg-white dark:text-black p-4 rounded-2xl shadow-2xl hover:scale-110 transition-all z-10 group">
                <ArrowLeft className="group-hover:-translate-x-1 transition-transform" />
            </Link>
        </div>
    );
};

export default Profile;
