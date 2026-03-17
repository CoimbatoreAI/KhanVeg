import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, ShoppingBag, MapPin, User, Phone, CreditCard, Loader2, CheckCircle2, X } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import StoreLayout from '@/components/store/StoreLayout';
import { CartProvider, useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';
import qrImg from '@/assets/qr.JPG';

const WHATSAPP_NUMBER = '919025207959';

const CoffeeCheckoutInner = () => {
    const { items, totalPrice, clearCart, serviceType } = useCart();
    const { user, token, isAuthenticated } = useAuth();
    const navigate = useNavigate();

    const [name, setName] = useState(user?.name || '');
    const [email, setEmail] = useState(user?.email || '');
    const [phone, setPhone] = useState(user?.phone || '');
    const [address, setAddress] = useState(user?.address || '');
    const [paymentMethod, setPaymentMethod] = useState<'Cash on Delivery' | 'Online Payment'>('Cash on Delivery');
    const [loading, setLoading] = useState(false);
    const [showQR, setShowQR] = useState(false);

    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5040/api';
    const baseUrl = apiUrl.replace('/api', '');

    useEffect(() => {
        if (!isAuthenticated) {
            toast.info('Please login to checkout');
            navigate('/login?redirect=/coffee/checkout');
        }
        if (items.length === 0) {
            navigate('/coffee/cart');
        }
    }, [isAuthenticated, items]);

    const handleConfirmOrder = async () => {
        if (!name || (serviceType === 'Delivery' && !address) || !phone) {
            toast.error('Please fill in all delivery details');
            return;
        }

        setLoading(true);
        try {
            const orderItems = items.map(i => ({
                product: i.product.id,
                name: i.product.name,
                quantity: i.quantity,
                price: i.product.price,
                image: i.product.image
            }));

            const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5040/api'}/orders`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    items: orderItems,
                    totalPrice,
                    shippingAddress: serviceType === 'Dining' ? 'Dining' : (address || 'Takeaway'),
                    customerPhone: phone,
                    paymentMethod: paymentMethod,
                    orderType: serviceType
                }),
            });

            if (response.ok) {
                const orderData = await response.json();
                const orderId = orderData.order._id;
                toast.success('Order placed successfully!');

                // WhatsApp Notification
                const itemLines = items.map(i => `• ${i.product.name} x${i.quantity} = ₹${i.product.price * i.quantity}`);
                const msg = `🛒 *New Order - Daily Delights*\n\nOrder ID: ${orderId}\nCustomer: ${name}\nPhone: ${phone}\nService: ${serviceType}\n\n${itemLines.join('\n')}\n\n*Total: ₹${totalPrice}*\n\nTrack here: ${window.location.origin}/track?id=${orderId}`;
                window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(msg)}`, '_blank');

                clearCart();
                navigate(`/track?id=${orderId}`);
            } else {
                const error = await response.json();
                toast.error(error.message || 'Failed to submit order');
            }
        } catch (error) {
            toast.error('Network error during checkout');
        } finally {
            setLoading(false);
        }
    };

    return (
        <StoreLayout store="coffee" storeName="Daily Delights">
            <div className="max-w-4xl mx-auto px-4 py-8">
                <div className="flex items-center gap-4 mb-12 text-zinc-900 dark:text-white">
                    <button onClick={() => navigate(-1)} className="p-2 hover:bg-zinc-100 dark:hover:bg-white/5 rounded-full transition-colors">
                        <ArrowLeft size={20} />
                    </button>
                    <h1 style={{ fontFamily: '"Playfair Display", serif' }} className="text-3xl font-bold">Secure Checkout</h1>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                    {/* Left: Delivery Details */}
                    <div className="space-y-8">
                        <section className="bg-white dark:bg-zinc-900 rounded-[2.5rem] p-8 border border-zinc-100 dark:border-white/5 shadow-sm">
                            <h2 className="text-xs font-black uppercase tracking-[0.3em] text-amber-600 mb-8 flex items-center gap-2">
                                <MapPin size={14} /> Shipping Information
                            </h2>

                            <div className="space-y-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 ml-4">Full Name</label>
                                    <div className="relative">
                                        <User className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" size={16} />
                                        <input
                                            type="text"
                                            value={name}
                                            onChange={(e) => setName(e.target.value)}
                                            placeholder="Receiver's Name"
                                            className="w-full pl-12 pr-6 py-4 bg-zinc-50 dark:bg-black/20 border border-zinc-100 dark:border-white/5 rounded-2xl focus:outline-none focus:ring-2 focus:ring-amber-500/50 transition-all font-medium"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 ml-4">Contact Phone</label>
                                    <div className="relative">
                                        <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" size={16} />
                                        <input
                                            type="tel"
                                            value={phone}
                                            onChange={(e) => setPhone(e.target.value)}
                                            placeholder="+91 XXXXX XXXXX"
                                            className="w-full pl-12 pr-6 py-4 bg-zinc-50 dark:bg-black/20 border border-zinc-100 dark:border-white/5 rounded-2xl focus:outline-none focus:ring-2 focus:ring-amber-500/50 transition-all font-medium"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 ml-4">Full Address</label>
                                    <div className="relative">
                                        <MapPin className="absolute left-4 top-4 text-zinc-400" size={16} />
                                        <textarea
                                            value={address}
                                            onChange={(e) => setAddress(e.target.value)}
                                            rows={3}
                                            placeholder="Street, City, Pincode, Landmark"
                                            className="w-full pl-12 pr-6 py-4 bg-zinc-50 dark:bg-black/20 border border-zinc-100 dark:border-white/5 rounded-2xl focus:outline-none focus:ring-2 focus:ring-amber-500/50 transition-all font-medium resize-none"
                                        />
                                    </div>
                                </div>
                            </div>
                        </section>

                        <section className="bg-white dark:bg-zinc-900 rounded-[2.5rem] p-8 border border-zinc-100 dark:border-white/5 shadow-sm">
                            <h2 className="text-xs font-black uppercase tracking-[0.3em] text-amber-600 mb-8 flex items-center gap-2">
                                <CreditCard size={14} /> Settlement Method
                            </h2>
                            <div className="space-y-4">
                                <button
                                    onClick={() => setPaymentMethod('Cash on Delivery')}
                                    className={`w-full p-4 rounded-2xl border transition-all flex items-center justify-between ${paymentMethod === 'Cash on Delivery' ? 'bg-amber-50 dark:bg-amber-500/5 border-amber-100 dark:border-amber-500/10' : 'bg-transparent border-zinc-100 dark:border-white/5 opacity-60'}`}
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-amber-100 dark:bg-amber-500/20 rounded-xl flex items-center justify-center text-amber-600">
                                            💸
                                        </div>
                                        <span className="text-sm font-bold text-amber-700 dark:text-amber-400 uppercase tracking-widest">Cash on Delivery</span>
                                    </div>
                                    {paymentMethod === 'Cash on Delivery' && <CheckCircle2 className="text-amber-500" size={20} />}
                                </button>

                                <button
                                    onClick={() => {
                                        setPaymentMethod('Online Payment');
                                        setShowQR(true);
                                    }}
                                    className={`w-full p-4 rounded-2xl border transition-all flex items-center justify-between ${paymentMethod === 'Online Payment' ? 'bg-amber-50 dark:bg-amber-500/5 border-amber-100 dark:border-amber-500/10' : 'bg-transparent border-zinc-100 dark:border-white/5 opacity-60'}`}
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-amber-100 dark:bg-amber-500/20 rounded-xl flex items-center justify-center text-amber-600">
                                            💳
                                        </div>
                                        <span className="text-sm font-bold text-amber-700 dark:text-amber-400 uppercase tracking-widest">Online Payment</span>
                                    </div>
                                    {paymentMethod === 'Online Payment' && <CheckCircle2 className="text-amber-500" size={20} />}
                                </button>

                                {paymentMethod === 'Online Payment' && (
                                    <div className="mt-4 p-4 bg-amber-50/50 dark:bg-amber-500/5 rounded-2xl border border-amber-100 dark:border-amber-500/10 flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <div className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                                            <span className="text-[10px] font-black text-amber-600 uppercase tracking-widest">Online Payment Selected</span>
                                        </div>
                                        <button onClick={() => setShowQR(true)} className="text-[10px] font-black text-amber-500 uppercase tracking-widest hover:underline">View QR Code</button>
                                    </div>
                                )}
                            </div>
                        </section>
                    </div>

                    {/* Right: Order Summary */}
                    <div className="space-y-8">
                        <section className="bg-zinc-900 text-white rounded-[2.5rem] p-8 shadow-2xl relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 blur-3xl rounded-full" />
                            <h2 className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-500 mb-8 border-b border-white/5 pb-4 relative z-10">Experience Summary</h2>

                            <div className="space-y-6 relative z-10">
                                {items.map((item, idx) => (
                                    <div key={idx} className="flex justify-between items-center">
                                        <div className="flex gap-4 items-center">
                                            <div className="w-12 h-12 bg-white/5 rounded-xl border border-white/10 overflow-hidden">
                                                <img
                                                    src={item.product.image?.startsWith('http') ? item.product.image : `${baseUrl}${item.product.image}`}
                                                    className="w-full h-full object-cover"
                                                />
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="text-sm font-bold truncate max-w-[150px]">{item.product.name}</span>
                                                <span className="text-[10px] text-zinc-500 font-bold uppercase">Qty: {item.quantity}</span>
                                            </div>
                                        </div>
                                        <span className="font-mono text-amber-500">₹{item.product.price * item.quantity}</span>
                                    </div>
                                ))}

                                <div className="pt-8 border-t border-white/5 space-y-4">
                                    <div className="flex justify-between text-zinc-400 text-xs uppercase tracking-widest">
                                        <span>Subtotal</span>
                                        <span>₹{totalPrice}</span>
                                    </div>
                                    <div className="flex justify-between text-zinc-400 text-xs uppercase tracking-widest">
                                        <span>Service Charge</span>
                                        <span className="text-amber-400">₹0</span>
                                    </div>
                                    <div className="flex justify-between pt-6 mt-4 border-t border-white/10 text-2xl font-black font-serif">
                                        <span>Total</span>
                                        <span className="text-amber-500">₹{totalPrice}</span>
                                    </div>
                                </div>

                                <motion.button
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={handleConfirmOrder}
                                    disabled={loading}
                                    className="w-full bg-white text-black py-5 rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-xl hover:bg-amber-500 hover:text-white transition-all flex items-center justify-center gap-3 disabled:opacity-50 mt-8"
                                >
                                    {loading ? <Loader2 className="animate-spin" /> : <>Complete Order <ShoppingBag size={18} /></>}
                                </motion.button>
                            </div>
                        </section>

                        <div className="p-6 bg-zinc-50 dark:bg-white/5 rounded-3xl border border-dashed border-zinc-200 dark:border-white/10 text-center">
                            <p className="text-[10px] text-zinc-400 uppercase font-black tracking-widest leading-relaxed">
                                Your order will be prepared and <br /> delivered by our expert partners.
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* QR Code Popup */}
            <AnimatePresence>
                {showQR && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md"
                        onClick={() => setShowQR(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.9, opacity: 0, y: 20 }}
                            className="bg-white dark:bg-zinc-900 w-full max-w-sm rounded-[3rem] overflow-hidden shadow-2xl"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="p-8 relative">
                                <button
                                    onClick={() => setShowQR(false)}
                                    className="absolute top-6 right-6 p-2 bg-zinc-100 dark:bg-white/5 rounded-full text-zinc-500 hover:text-foreground transition-colors"
                                >
                                    <X size={20} />
                                </button>

                                <div className="text-center space-y-6 mt-4">
                                    <div className="w-16 h-16 bg-amber-100 dark:bg-amber-500/20 rounded-2xl flex items-center justify-center text-amber-600 mx-auto mb-6">
                                        <CreditCard size={32} />
                                    </div>
                                    <div>
                                        <h2 style={{ fontFamily: '"Playfair Display", serif' }} className="text-3xl font-bold mb-2">Scan & Pay</h2>
                                        <p className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em]">UPI Payment Gateway</p>
                                    </div>

                                    <div className="bg-white p-6 rounded-[2.5rem] shadow-inner border-4 border-zinc-50 mx-auto max-w-[240px]">
                                        <img src={qrImg} alt="Payment QR" className="w-full h-auto rounded-xl shadow-lg" />
                                    </div>

                                    <div className="space-y-4">
                                        <div className="bg-amber-50 dark:bg-amber-500/5 p-4 rounded-2xl border border-amber-100 dark:border-amber-500/10">
                                            <p className="text-[10px] text-amber-600 font-black uppercase tracking-widest">Verification Needed</p>
                                            <p className="text-xs text-zinc-500 mt-1 italic">Please complete transaction before finalizing order</p>
                                        </div>

                                        <button
                                            onClick={() => setShowQR(false)}
                                            className="w-full py-5 bg-zinc-900 dark:bg-white text-white dark:text-black rounded-2xl font-black text-xs uppercase tracking-[0.3em] shadow-xl hover:bg-amber-500 hover:text-white transition-all"
                                        >
                                            I've Paid Successfully
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </StoreLayout>
    );
};

const CoffeeCheckout = () => (
    <CartProvider store="coffee">
        <CoffeeCheckoutInner />
    </CartProvider>
);

export default CoffeeCheckout;
