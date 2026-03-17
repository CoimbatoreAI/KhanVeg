import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Package, Truck, CheckCircle2, Search, Clock, ArrowLeft, Phone, MapPin, AlertCircle, Loader2, Lock, User } from 'lucide-react';
import { toast } from 'sonner';

interface Order {
    _id: string;
    customer: { name: string; email: string; phone: string };
    items: { name: string; quantity: number; price: number }[];
    totalPrice: number;
    status: string;
    shippingAddress: string;
    deliveryPartner?: { name: string; phone: string };
    courierLocation?: { lat: number; lng: number };
    orderType: string;
    outlet?: { name: string };
}

const OrderTracking = () => {
    const { user, isAuthenticated } = useAuth();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const [orderId, setOrderId] = useState(searchParams.get('id') || '');
    const [order, setOrder] = useState<Order | undefined>();
    const [loading, setLoading] = useState(false);
    const [eta, setEta] = useState(12);

    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5040/api';

    const handleSearch = useCallback(async () => {
        if (!orderId) return;
        setLoading(true);
        try {
            const response = await fetch(`${apiUrl}/orders/track/${orderId}`);
            if (response.ok) {
                const data = await response.json();
                setOrder(data);
                toast.success('Current Status Retrieved');
            } else {
                setOrder(undefined);
                toast.error('Invalid Order ID');
            }
        } catch (error) {
            toast.error('Connection failed');
        } finally {
            setLoading(false);
        }
    }, [apiUrl, orderId]);

    const refreshUpdate = useCallback(async () => {
        if (!orderId) return;
        try {
            const response = await fetch(`${apiUrl}/orders/track/${orderId}`);
            if (response.ok) {
                const data = await response.json();
                setOrder(data);
            }
        } catch (e) { /* silent update */ }
    }, [apiUrl, orderId]);

    useEffect(() => {
        if (orderId) {
            handleSearch();
            const interval = setInterval(refreshUpdate, 10000); // Pulse every 10s for live data
            return () => clearInterval(interval);
        }
    }, [orderId, handleSearch, refreshUpdate]);

    const steps = [
        { status: 'Pending', icon: Clock, label: 'Received' },
        { status: 'Confirmed', icon: User, label: 'Assigned' },
        { status: 'Shipped', icon: Package, label: 'Picked Up' },
        { status: 'Out for Delivery', icon: Truck, label: 'On its way' },
        { status: 'Delivered', icon: CheckCircle2, label: 'Delivered' },
    ];

    const currentStep = steps.findIndex(s => s.status === order?.status);

    return (
        <div className="min-h-screen bg-white dark:bg-zinc-950 pb-20">
            <div className="bg-zinc-900 text-white p-6 pb-24 rounded-b-[4rem] shadow-2xl relative overflow-hidden">
                <div className="absolute inset-0 bg-emerald-500/5 blur-[120px] rounded-full translate-x-1/2 -translate-y-1/2" />

                <div className="max-w-2xl mx-auto flex flex-col gap-8 relative z-10">
                    <Link to="/" className="inline-flex items-center gap-2 text-[10px] uppercase font-black tracking-[0.4em] opacity-40 hover:opacity-100 transition-all">
                        <ArrowLeft size={16} /> Return to Store
                    </Link>

                    <div className="flex justify-between items-end">
                        <div className="flex-1">
                            <h1 style={{ fontFamily: '"Playfair Display", serif' }} className="text-4xl font-bold tracking-tight mb-3">Live Tracker</h1>
                            <p className="text-zinc-500 text-[10px] uppercase font-black tracking-widest font-mono truncate max-w-[200px]">ID: {orderId || 'Waiting for entry'}</p>
                        </div>
                        {order && (order.status === 'Shipped' || order.status === 'Out for Delivery') && (
                            <div className="bg-emerald-500/10 border border-emerald-500/20 backdrop-blur-xl px-4 py-2.5 rounded-[2rem] flex flex-col items-center shrink-0 shadow-xl">
                                <span className="text-[9px] font-black uppercase tracking-[0.2em] text-emerald-400">ETA</span>
                                <span className="text-xl font-black text-emerald-500 mt-0.5">{eta} MINS</span>
                            </div>
                        )}
                    </div>

                    <div className="relative group">
                        <input
                            type="text"
                            placeholder="PASTE TRACKING ID HERE"
                            value={orderId}
                            onChange={(e) => setOrderId(e.target.value.toUpperCase())}
                            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                            className="w-full pl-8 pr-16 py-5 bg-white/5 border border-white/10 rounded-3xl focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all font-mono tracking-[0.3em] text-sm text-white placeholder:text-zinc-600 group-hover:bg-white/10"
                        />
                        <button onClick={handleSearch} className="absolute right-3 top-3 bottom-3 px-5 bg-emerald-500 text-white rounded-2xl flex items-center justify-center hover:scale-105 active:scale-95 transition-all shadow-lg shadow-emerald-500/20">
                            <Search size={18} strokeWidth={3} />
                        </button>
                    </div>
                </div>
            </div>

            <div className="max-w-2xl mx-auto px-4 -mt-12">
                {loading ? (
                    <div className="flex flex-col items-center py-32 animate-pulse">
                        <Loader2 className="w-12 h-12 text-emerald-500 animate-spin mb-4" />
                        <p className="text-[10px] font-black tracking-[0.3em] text-zinc-400 uppercase">Synchronizing with GPS...</p>
                    </div>
                ) : order ? (
                    <div className="space-y-8 pb-20">
                        {/* Map View */}
                        {(order.status === 'Shipped' || order.status === 'Out for Delivery') && (
                            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="group bg-zinc-100 dark:bg-zinc-900 h-96 rounded-[3rem] relative overflow-hidden border-[12px] border-white dark:border-zinc-950 shadow-2xl">
                                {order.courierLocation ? (
                                    <iframe
                                        width="100%"
                                        height="100%"
                                        frameBorder="0"
                                        style={{ border: 0 }}
                                        src={`https://maps.google.com/maps?q=${order.courierLocation.lat},${order.courierLocation.lng}&z=15&output=embed`}
                                        key={`${order.courierLocation.lat}-${order.courierLocation.lng}`}
                                    />
                                ) : (
                                    <div className="w-full h-full bg-zinc-200 dark:bg-zinc-800 flex flex-col items-center justify-center gap-6 p-12 text-center">
                                        <div className="relative">
                                            <div className="absolute inset-0 bg-emerald-500/20 rounded-full animate-ping scale-150" />
                                            <div className="w-20 h-20 bg-white dark:bg-zinc-700 rounded-[2rem] shadow-2xl flex items-center justify-center relative z-10 border-4 border-emerald-500">
                                                <Truck size={32} className="text-emerald-500" />
                                            </div>
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-zinc-800 dark:text-white uppercase tracking-widest text-xs">Waiting for GPS Ping</h4>
                                            <p className="text-zinc-500 dark:text-zinc-400 text-[10px] mt-2 font-medium leading-relaxed uppercase tracking-tighter">Your delivery partner hasn't enabled <br /> live tracking yet</p>
                                        </div>
                                    </div>
                                )}
                                <div className="absolute bottom-6 left-6 right-6">
                                    <div className="bg-white/90 dark:bg-zinc-900/90 backdrop-blur-xl px-6 py-4 rounded-3xl shadow-2xl flex justify-between items-center border border-white/20">
                                        <div className="flex items-center gap-3">
                                            <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                                            <span className="text-[10px] font-black uppercase tracking-widest">{order.courierLocation ? 'Rider at Main Road' : 'Connecting...'}</span>
                                        </div>
                                        <span className="text-[10px] font-black text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full uppercase">Live</span>
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {/* Delivery Partner Profile */}
                        {order.deliveryPartner && (
                            <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="bg-white dark:bg-zinc-900 p-8 rounded-[2.5rem] border border-zinc-100 dark:border-white/5 shadow-xl flex items-center justify-between group">
                                <div className="flex items-center gap-5">
                                    <div className="relative">
                                        <div className="w-16 h-16 bg-zinc-50 dark:bg-black/20 rounded-3xl flex items-center justify-center text-3xl group-hover:scale-110 transition-transform">R</div>
                                        <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-emerald-500 border-4 border-white dark:border-zinc-900 rounded-full flex items-center justify-center shadow-lg">
                                            <CheckCircle2 size={12} className="text-white" />
                                        </div>
                                    </div>
                                    <div>
                                        <h4 className="text-xl font-bold text-zinc-900 dark:text-white">{order.deliveryPartner.name}</h4>
                                        <p className="text-[10px] text-zinc-400 uppercase font-black tracking-[0.2em] mt-1">Verified Delivery Expert</p>
                                    </div>
                                </div>
                                <div className="flex gap-3">
                                    <a href={`tel:${order.deliveryPartner.phone}`} className="w-14 h-14 bg-zinc-50 dark:bg-white/5 rounded-2xl flex items-center justify-center text-zinc-400 hover:text-emerald-500 transition-all border border-zinc-100 dark:border-white/10 hover:shadow-lg">
                                        <Phone size={22} />
                                    </a>
                                    <a href={`https://wa.me/${order.deliveryPartner.phone}`} className="w-14 h-14 bg-emerald-500 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-emerald-500/30 hover:scale-105 active:scale-95 transition-all">
                                        <span className="text-2xl">💬</span>
                                    </a>
                                </div>
                            </motion.div>
                        )}

                        <div className="bg-white dark:bg-zinc-900 rounded-[3rem] border border-zinc-100 dark:border-white/5 p-10 shadow-sm relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 blur-3xl -translate-y-1/2 translate-x-1/2" />
                            <div className="flex justify-between items-center mb-12 pb-8 border-b border-zinc-50 dark:border-white/5 relative z-10">
                                <div className={`flex items-center gap-2 px-4 py-1.5 rounded-full border text-[10px] font-black uppercase tracking-widest ${order.status === 'Delivered' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-zinc-50 text-zinc-600 border-zinc-100'
                                    }`}>
                                    <span className={`w-2 h-2 rounded-full ${order.status === 'Delivered' ? 'bg-emerald-500' : 'bg-emerald-400 animate-pulse'}`} />
                                    {order.status}
                                </div>
                            </div>

                            <div className="flex gap-4 mb-10 px-4">
                                <div className="flex flex-col gap-1">
                                    <span className="text-[8px] font-black uppercase tracking-widest text-zinc-400">Service</span>
                                    <span className="text-xs font-bold text-zinc-900 dark:text-white uppercase tracking-widest">{order.orderType}</span>
                                </div>
                                {order.outlet && (
                                    <>
                                        <div className="w-[1px] h-8 bg-zinc-100 dark:bg-white/5" />
                                        <div className="flex flex-col gap-1">
                                            <span className="text-[8px] font-black uppercase tracking-widest text-zinc-400">Location</span>
                                            <span className="text-xs font-bold text-zinc-900 dark:text-white uppercase tracking-widest">{order.outlet.name}</span>
                                        </div>
                                    </>
                                )}
                            </div>

                            <div className="relative px-4">
                                <div className="absolute left-[2.5rem] top-0 bottom-0 w-[3px] bg-zinc-50 dark:bg-black" />
                                <div className="space-y-12">
                                    {steps.map((step, i) => {
                                        const isCompleted = i <= currentStep;
                                        const isCurrent = i === currentStep;
                                        const isNext = i === currentStep + 1;

                                        return (
                                            <div key={step.status} className="relative flex items-center gap-10 pl-14">
                                                <div className={`absolute left-0 w-12 h-12 rounded-[1.25rem] flex items-center justify-center transition-all duration-1000 ${isCompleted
                                                    ? 'bg-emerald-500 text-white scale-110 shadow-xl shadow-emerald-500/20'
                                                    : isNext
                                                        ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-500 animate-pulse border-2 border-emerald-500/20'
                                                        : 'bg-zinc-50 dark:bg-zinc-800 text-zinc-300'
                                                    }`}>
                                                    <step.icon size={20} strokeWidth={isCurrent ? 3 : 2} />
                                                </div>
                                                <div className="flex-1">
                                                    <h4 className={`text-xs font-black uppercase tracking-[0.2em] transition-colors duration-500 ${isCompleted ? 'text-zinc-900 dark:text-white' : 'text-zinc-300'}`}>{step.label}</h4>
                                                    <p className={`text-[9px] font-bold uppercase tracking-widest mt-1.5 transition-colors duration-500 ${isCurrent ? 'text-emerald-500' : 'text-zinc-400'}`}>
                                                        {isCurrent ? 'Active Now' : isCompleted ? (step.status === 'Delivered' ? 'Verified' : 'Completed') : 'Upcoming'}
                                                    </p>
                                                    {isCurrent && step.status === 'Out for Delivery' && (
                                                        <div className="mt-3 flex items-center gap-2">
                                                            <div className="flex -space-x-1">
                                                                {[1, 2, 3].map(dot => (
                                                                    <div key={dot} className="w-1 h-1 bg-emerald-500 rounded-full animate-ping" style={{ animationDelay: `${dot * 0.2}s` }} />
                                                                ))}
                                                            </div>
                                                            <span className="text-[8px] font-black text-emerald-600 uppercase tracking-tighter">Live GPS Pinged</span>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>

                        <div className="bg-zinc-900 dark:bg-white rounded-[3rem] p-10 text-white dark:text-zinc-900 shadow-2xl relative overflow-hidden">
                            <div className="absolute bottom-0 right-0 w-40 h-40 bg-emerald-500/20 blur-3xl translate-y-1/2 translate-x-1/2" />
                            <h4 className="text-[10px] uppercase font-black tracking-[0.4em] text-zinc-500 dark:text-zinc-400 mb-8 border-b border-white/10 dark:border-black/5 pb-4">Job Payload</h4>
                            <div className="space-y-6 relative z-10">
                                {order.items.map((item, i) => (
                                    <div key={i} className="flex justify-between items-center group">
                                        <div className="flex flex-col">
                                            <span className="text-sm font-bold tracking-tight">{item.name}</span>
                                            <span className="text-[10px] text-zinc-500 font-black uppercase mt-1">Qty: {item.quantity} units</span>
                                        </div>
                                        <span className="font-mono text-zinc-400">₹{item.price * item.quantity}</span>
                                    </div>
                                ))}
                                <div className="flex justify-between items-end pt-8 mt-4 border-t border-white/10 dark:border-black/5">
                                    <div>
                                        <p className="text-[9px] uppercase font-black tracking-[0.3em] text-zinc-500 mb-1">Total Impact</p>
                                        <span className="text-3xl font-black font-serif">₹{order.totalPrice}</span>
                                    </div>
                                    <div className="px-5 py-2.5 bg-emerald-500 rounded-full text-zinc-900 font-black text-[10px] tracking-widest uppercase shadow-lg shadow-emerald-500/20">
                                        Paid / COD
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                ) : orderId && !loading && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-32 bg-zinc-50/50 dark:bg-white/5 rounded-[3rem] border-2 border-dashed border-zinc-200 dark:border-white/10 mx-4">
                        <AlertCircle size={48} className="mx-auto text-zinc-200 mb-6" />
                        <h4 className="font-bold text-zinc-400 uppercase tracking-widest text-xs">No Parcel Found</h4>
                        <p className="text-zinc-400 text-[10px] font-medium mt-2 uppercase tracking-tighter">Double check that tracking ID <br /> and try scanning again</p>
                    </motion.div>
                )}
            </div>
        </div>
    );
};

export default OrderTracking;
