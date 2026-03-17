import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Truck, CheckCircle, Package, Clock, LogOut, Search, MapPin, User, Phone, Navigation, AlertCircle } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

interface Order {
    _id: string;
    customer: { name: string; email: string; phone: string };
    items: { name: string; quantity: number; price: number }[];
    totalPrice: number;
    status: string;
    shippingAddress: string;
    createdAt: string;
    verificationCode?: string;
}

const StaffPortal = () => {
    const { user, token, logout, isAuthenticated } = useAuth();
    const navigate = useNavigate();
    const [orders, setOrders] = useState<Order[]>([]);
    const [filter, setFilter] = useState<'Active' | 'Delivered'>('Active');
    const [trackingOrder, setTrackingOrder] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [verificationCode, setVerificationCode] = useState('');
    const [isVerifying, setIsVerifying] = useState<string | null>(null); // orderId being verified

    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5040/api';

    const fetchJobs = useCallback(async () => {
        if (!token) return;
        setLoading(true);
        try {
            const response = await fetch(`${apiUrl}/orders/assigned`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (response.ok) {
                const data = await response.json();
                setOrders(data);
            }
        } catch (error) {
            toast.error('Failed to load delivery jobs');
        } finally {
            setLoading(false);
        }
    }, [apiUrl, token]);

    const handleStatusUpdate = useCallback(async (orderId: string, status: string, code?: string) => {
        try {
            const body: any = { orderId, status };
            if (code) body.verificationCode = code;

            const response = await fetch(`${apiUrl}/orders/status`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(body),
            });

            if (response.ok) {
                toast.success(`Order marked as ${status}`);
                fetchJobs();
                setIsVerifying(null);
                setVerificationCode('');
            } else {
                const err = await response.json();
                toast.error(err.message || 'Failed to update status');
            }
        } catch (error) {
            toast.error('Connection error');
        }
    }, [apiUrl, token, fetchJobs]);

    useEffect(() => {
        if (!isAuthenticated) {
            navigate('/login');
            return;
        }
        if (user?.role !== 'delivery' && user?.role !== 'admin') {
            toast.error('Access restricted to delivery personnel');
            navigate('/profile');
            return;
        }
        fetchJobs();
    }, [isAuthenticated, user, navigate, fetchJobs]);

    useEffect(() => {
        let watchId: number | null = null;

        if (trackingOrder) {
            if ("geolocation" in navigator) {
                watchId = navigator.geolocation.watchPosition(
                    async (position) => {
                        const { latitude, longitude } = position.coords;
                        try {
                            await fetch(`${apiUrl}/orders/status`, {
                                method: 'PATCH',
                                headers: {
                                    'Content-Type': 'application/json',
                                    'Authorization': `Bearer ${token}`
                                },
                                body: JSON.stringify({
                                    orderId: trackingOrder,
                                    courierLocation: { lat: latitude, lng: longitude }
                                }),
                            });
                        } catch (e) {
                            console.error("GPS Update failed", e);
                        }
                    },
                    (error) => {
                        toast.error("GPS Access Denied. Please enable location.");
                        setTrackingOrder(null);
                    },
                    { enableHighAccuracy: true, timeout: 5040, maximumAge: 0 }
                );
            } else {
                toast.error("Geolocation not supported by this browser");
            }
        }

        return () => {
            if (watchId !== null) navigator.geolocation.clearWatch(watchId);
        };
    }, [trackingOrder]);

    const shareLocation = (orderId: string) => {
        if (trackingOrder === orderId) {
            setTrackingOrder(null);
            toast.info('GPS Tracking stopped');
        } else {
            setTrackingOrder(orderId);
            toast.success('Live GPS Tracking started!');
        }
    };

    const filteredOrders = orders.filter(o =>
        filter === 'Active' ? (o.status !== 'Delivered') : o.status === 'Delivered'
    );

    if (loading) {
        return (
            <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
                <div className="flex flex-col items-center gap-4 text-white">
                    <Truck className="w-12 h-12 animate-bounce text-emerald-500" />
                    <p className="font-medium tracking-widest text-xs uppercase animate-pulse">Assigning Jobs...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 p-4 md:p-8">
            <div className="max-w-4xl mx-auto">
                <header className="flex justify-between items-center mb-12">
                    <div className="space-y-1">
                        <h1 style={{ fontFamily: '"Playfair Display", serif' }} className="text-3xl md:text-4xl font-light">Delivery Hub</h1>
                        <div className="flex items-center gap-2 text-zinc-500 text-xs font-bold uppercase tracking-widest">
                            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                            {user?.name} (Rider) • Active Session
                        </div>
                    </div>
                    <button onClick={logout} className="p-4 bg-zinc-100 dark:bg-white/5 rounded-2xl text-zinc-500 hover:text-red-500 transition-all hover:rotate-12">
                        <LogOut size={20} />
                    </button>
                </header>

                <div className="flex bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-white/5 p-1.5 rounded-3xl mb-12">
                    <button
                        onClick={() => setFilter('Active')}
                        className={`flex-1 py-4 rounded-2xl text-[10px] font-black tracking-[0.2em] transition-all ${filter === 'Active' ? 'bg-zinc-800 dark:bg-white text-white dark:text-black shadow-xl' : 'text-zinc-400 hover:text-zinc-600'}`}
                    >
                        PENDING JOBS
                    </button>
                    <button
                        onClick={() => setFilter('Delivered')}
                        className={`flex-1 py-4 rounded-2xl text-[10px] font-black tracking-[0.2em] transition-all ${filter === 'Delivered' ? 'bg-zinc-800 dark:bg-white text-white dark:text-black shadow-xl' : 'text-zinc-400 hover:text-zinc-600'}`}
                    >
                        PAST DELIVERIES
                    </button>
                </div>

                <div className="space-y-8">
                    <AnimatePresence mode="popLayout">
                        {filteredOrders.length === 0 ? (
                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-20">
                                <AlertCircle size={48} className="mx-auto text-zinc-300 mb-4" />
                                <p className="text-zinc-400 font-medium tracking-widest text-xs uppercase">No active jobs found.</p>
                            </motion.div>
                        ) : (
                            filteredOrders.map(order => (
                                <motion.div
                                    key={order._id}
                                    layout
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, scale: 0.95 }}
                                    className="bg-white dark:bg-zinc-900 rounded-[2.5rem] border border-zinc-100 dark:border-white/5 p-8 shadow-sm hover:shadow-xl transition-all group"
                                >
                                    <div className="flex flex-col md:flex-row justify-between gap-8">
                                        <div className="flex-1 space-y-6">
                                            <div className="flex justify-between items-start">
                                                <div>
                                                    <p className="text-[10px] uppercase font-black tracking-[0.3em] text-emerald-600 mb-2">Order Assignment</p>
                                                    <h3 className="text-2xl font-bold font-serif text-zinc-900 dark:text-white">#{order._id.substring(order._id.length - 6).toUpperCase()}</h3>
                                                </div>
                                                <div className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border ${order.status === 'Confirmed' ? 'bg-amber-50 text-amber-600 border-amber-100' :
                                                        order.status === 'Shipped' ? 'bg-blue-50 text-blue-600 border-blue-100' :
                                                            order.status === 'Out for Delivery' ? 'bg-indigo-50 text-indigo-600 border-indigo-100' :
                                                                order.status === 'Delivered' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                                                                    'bg-zinc-50 text-zinc-600 border-zinc-100'
                                                    }`}>
                                                    {order.status}
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 p-6 bg-zinc-50 dark:bg-black/20 rounded-3xl">
                                                <div className="space-y-4">
                                                    <div className="flex items-start gap-4">
                                                        <MapPin size={18} className="text-emerald-500 shrink-0 mt-1" />
                                                        <div>
                                                            <p className="text-[9px] uppercase font-black text-zinc-400 tracking-widest mb-1">Destination</p>
                                                            <p className="text-sm font-bold text-zinc-700 dark:text-zinc-300 leading-relaxed">{order.shippingAddress}</p>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-4">
                                                        <User size={18} className="text-emerald-500 shrink-0" />
                                                        <div>
                                                            <p className="text-[9px] uppercase font-black text-zinc-400 tracking-widest mb-1">Customer</p>
                                                            <p className="text-sm font-bold text-zinc-700 dark:text-zinc-300">{order.customer.name}</p>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="space-y-4">
                                                    <div className="flex items-center gap-4">
                                                        <Package size={18} className="text-emerald-500 shrink-0" />
                                                        <div>
                                                            <p className="text-[9px] uppercase font-black text-zinc-400 tracking-widest mb-1">Items Summary</p>
                                                            <p className="text-sm font-bold text-zinc-700 dark:text-zinc-300">{order.items.length} Packages • ₹{order.totalPrice}</p>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-4">
                                                        <Phone size={18} className="text-emerald-500 shrink-0" />
                                                        <a href={`tel:${order.customer.phone}`} className="text-sm font-black text-emerald-600 underline underline-offset-4 decoration-emerald-200">Contact Now</a>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex md:flex-col gap-3 shrink-0 md:min-w-[200px] justify-center">
                                            {order.status === 'Confirmed' && (
                                                <button
                                                    onClick={() => handleStatusUpdate(order._id, 'Shipped')}
                                                    className="w-full bg-zinc-900 text-white dark:bg-white dark:text-black py-5 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] shadow-lg shadow-black/10 hover:scale-[1.02] transition-all"
                                                >
                                                    Pick Up Parcel
                                                </button>
                                            )}
                                            {order.status === 'Shipped' && (
                                                <button
                                                    onClick={() => handleStatusUpdate(order._id, 'Out for Delivery')}
                                                    className="w-full bg-amber-500 text-white py-5 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] shadow-lg shadow-amber-500/20 hover:scale-[1.02] transition-all"
                                                >
                                                    Start Delivery
                                                </button>
                                            )}
                                            {order.status === 'Out for Delivery' && (
                                                <div className="space-y-3">
                                                    <button
                                                        onClick={() => shareLocation(order._id)}
                                                        className={`w-full py-5 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] border flex items-center justify-center gap-2 transition-all ${trackingOrder === order._id ? 'bg-red-500 border-red-200 text-white animate-pulse' : 'bg-white border-zinc-200 text-zinc-500'}`}
                                                    >
                                                        <Navigation size={14} />
                                                        {trackingOrder === order._id ? 'Stop GPS' : 'Share Location'}
                                                    </button>

                                                    {isVerifying === order._id ? (
                                                        <div className="space-y-3 bg-zinc-50 dark:bg-black p-4 rounded-2xl animate-in fade-in zoom-in duration-300">
                                                            <p className="text-[9px] font-black uppercase text-center text-zinc-500 tracking-widest mb-2">Enter 4-Digit Code</p>
                                                            <input
                                                                type="text"
                                                                maxLength={4}
                                                                value={verificationCode}
                                                                onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, ''))}
                                                                placeholder="● ● ● ●"
                                                                className="w-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-white/10 rounded-xl py-4 text-center text-2xl font-black tracking-[0.5em] focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                                                autoFocus
                                                            />
                                                            <div className="flex gap-2">
                                                                <button
                                                                    onClick={() => setIsVerifying(null)}
                                                                    className="flex-1 py-3 text-[10px] font-black uppercase text-zinc-400"
                                                                >
                                                                    Cancel
                                                                </button>
                                                                <button
                                                                    onClick={() => handleStatusUpdate(order._id, 'Delivered', verificationCode)}
                                                                    className="flex-[2] bg-emerald-500 text-white py-3 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-emerald-500/20"
                                                                >
                                                                    Verify & Finish
                                                                </button>
                                                            </div>
                                                        </div>
                                                    ) : (
                                                        <button
                                                            onClick={async () => {
                                                                if (order.verificationCode) {
                                                                    setIsVerifying(order._id);
                                                                } else {
                                                                    await handleStatusUpdate(order._id, 'Delivered');
                                                                }
                                                            }}
                                                            className="w-full bg-emerald-500 text-white py-5 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] shadow-lg shadow-emerald-500/20 hover:scale-[1.02] transition-all flex items-center justify-center gap-2"
                                                        >
                                                            <CheckCircle size={14} /> Finish Job
                                                        </button>
                                                    )}
                                                </div>
                                            )}
                                            {order.status === 'Delivered' && (
                                                <div className="bg-emerald-50 dark:bg-emerald-900/10 border border-emerald-100 dark:border-emerald-500/20 p-4 rounded-2xl text-center">
                                                    <p className="text-emerald-600 dark:text-emerald-400 font-black text-[10px] uppercase tracking-widest">Job Completed</p>
                                                    <p className="text-[10px] text-emerald-400 mt-1 font-medium">{new Date(order.createdAt).toLocaleDateString()}</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </motion.div>
                            ))
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
};

export default StaffPortal;
