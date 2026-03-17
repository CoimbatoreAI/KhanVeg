import { useParams, Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, Minus, ArrowLeft, ShoppingBag, ShieldCheck, Clock, Award } from 'lucide-react';
import StoreLayout from '@/components/store/StoreLayout';
import { CartProvider, useCart } from '@/context/CartContext';
import ProductCard from '@/components/store/ProductCard';
import { toast } from 'sonner';

const CoffeeProductDetailInner = () => {
    const { id } = useParams();
    const { items, addToCart, updateQuantity } = useCart();
    const [product, setProduct] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5040/api';
    const baseUrl = apiUrl.replace('/api', '');

    useEffect(() => {
        const fetchProduct = async () => {
            try {
                const response = await fetch(`${apiUrl}/products/${id}`);
                if (response.ok) {
                    const data = await response.json();
                    setProduct(data);
                }
            } catch (error) {
                console.error('Failed to fetch product');
            } finally {
                setLoading(false);
            }
        };
        fetchProduct();
    }, [id, apiUrl]);

    if (loading) return (
        <StoreLayout store="coffee" storeName="Daily Delights">
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="animate-pulse text-zinc-400 uppercase tracking-widest text-xs">Aroma incoming...</div>
            </div>
        </StoreLayout>
    );

    if (!product) return (
        <StoreLayout store="coffee" storeName="Daily Delights">
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="text-zinc-400 uppercase tracking-widest text-xs">Product not found</div>
            </div>
        </StoreLayout>
    );

    const cartItem = items.find(i => i.product._id === product._id);

    const handleAdd = () => {
        addToCart({
            id: product._id,
            name: product.name,
            price: product.price,
            image: product.images?.[0],
            category: product.category,
            store: 'coffee'
        } as any);
        toast.success(`${product.name} added to cart!`);
    };

    return (
        <StoreLayout store="coffee" storeName="Daily Delights">
            <div className="max-w-7xl mx-auto px-4 py-8">
                <Link
                    to="/coffee"
                    className="inline-flex items-center gap-2 text-[10px] uppercase tracking-[0.3em] text-zinc-400 hover:text-foreground transition-all mb-12"
                >
                    <ArrowLeft size={14} />
                    Back to Menu
                </Link>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 xl:gap-24">
                    {/* Left: Product Showcase */}
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="relative h-[400px] md:h-[600px] bg-zinc-100 dark:bg-white/5 rounded-[40px] flex items-center justify-center border border-zinc-100 dark:border-white/5 shadow-2xl shadow-black/5 group overflow-hidden"
                    >
                        <div className="absolute inset-0 bg-gradient-to-tr from-amber-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-1000 z-10" />
                        <motion.img
                            src={product.images?.[0]?.startsWith('http') ? product.images[0] : `${baseUrl}${product.images?.[0]}`}
                            alt={product.name}
                            initial={{ scale: 1.2, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ duration: 1.5, ease: "easeOut" }}
                            className="w-full h-full object-cover transition-transform duration-2000 group-hover:scale-110"
                        />

                        {/* Floating Emoji Detail */}
                        <div className="absolute top-12 right-12 z-20 bg-white/80 dark:bg-black/50 backdrop-blur-xl w-16 h-16 rounded-full flex items-center justify-center shadow-xl border border-white/20">
                            <span className="text-3xl">☕</span>
                        </div>

                        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-2 z-20">
                            <div className="w-2 h-2 rounded-full bg-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.5)]" />
                            <div className="w-2 h-2 rounded-full bg-zinc-200 dark:bg-white/10" />
                            <div className="w-2 h-2 rounded-full bg-zinc-200 dark:bg-white/10" />
                        </div>
                    </motion.div>

                    {/* Right: Product Info */}
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="flex flex-col justify-center"
                    >
                        <div className="mb-8">
                            <span className="text-amber-600 text-xs md:text-sm tracking-[0.5em] uppercase font-bold mb-4 block">
                                {product.category} Selection
                            </span>
                            <h1
                                style={{ fontFamily: '"Playfair Display", serif' }}
                                className="text-5xl md:text-7xl font-thin text-foreground leading-tight mb-4"
                            >
                                {product.name}
                            </h1>
                            <div className="h-[2px] w-20 bg-amber-500/50 mb-8" />
                            <p className="text-zinc-500 dark:text-zinc-400 text-lg md:text-xl font-light leading-relaxed mb-8 max-w-xl">
                                {product.description}. Hand-selected beans, expertly roasted in small batches to preserve the delicate aroma and complex flavor profile.
                            </p>
                            <div className="flex items-center gap-4">
                                <span className="text-4xl md:text-5xl font-serif font-medium">₹{product.price}</span>
                                <span className="text-xs text-zinc-400 uppercase tracking-widest font-medium border-l border-zinc-200 dark:border-white/10 pl-4 py-1">
                                    Incl. of all taxes<br />Freshly Brewed
                                </span>
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-6 mb-12">
                            {cartItem ? (
                                <div className="flex items-center gap-4 bg-zinc-100 dark:bg-white/5 rounded-3xl p-2 px-4 shadow-inner border border-zinc-200 dark:border-white/10">
                                    <button
                                        onClick={() => updateQuantity(product._id, cartItem.quantity - 1)}
                                        className="w-10 h-10 flex items-center justify-center text-zinc-500 hover:text-amber-600 transition-colors"
                                    >
                                        <Minus size={20} />
                                    </button>
                                    <span className="text-xl font-bold w-8 text-center">{cartItem.quantity}</span>
                                    <button
                                        onClick={() => updateQuantity(product._id, cartItem.quantity + 1)}
                                        className="w-10 h-10 flex items-center justify-center text-amber-600 hover:bg-amber-500 hover:text-white rounded-2xl transition-all"
                                    >
                                        <Plus size={20} />
                                    </button>
                                </div>
                            ) : (
                                <button
                                    onClick={handleAdd}
                                    className="flex-1 bg-zinc-900 dark:bg-white text-white dark:text-black px-12 py-5 rounded-3xl text-sm font-bold tracking-[0.2em] uppercase hover:scale-[1.02] active:scale-[0.98] transition-all shadow-2xl shadow-black/20 flex items-center justify-center gap-4 group"
                                >
                                    Order Now
                                    <Plus size={18} className="group-hover:rotate-90 transition-transform duration-500" />
                                </button>
                            )}

                            <Link
                                to="/coffee/cart"
                                className="flex items-center justify-center w-16 h-16 rounded-3xl border border-zinc-200 dark:border-white/10 hover:bg-zinc-100 dark:hover:bg-white/5 transition-all"
                            >
                                <ShoppingBag size={24} className="text-zinc-400 group-hover:text-amber-600" />
                            </Link>
                        </div>

                        {/* Premium Badges */}
                        <div className="grid grid-cols-3 gap-4 py-8 border-y border-zinc-100 dark:border-white/5">
                            <div className="flex flex-col items-center text-center gap-2">
                                <Award className="text-amber-500" size={24} />
                                <span className="text-[10px] uppercase tracking-widest font-bold text-zinc-400">Award Winning</span>
                            </div>
                            <div className="flex flex-col items-center text-center gap-2">
                                <Clock className="text-zinc-400" size={24} />
                                <span className="text-[10px] uppercase tracking-widest font-bold text-zinc-400">Freshly Roasted</span>
                            </div>
                            <div className="flex flex-col items-center text-center gap-2">
                                <ShieldCheck className="text-zinc-400" size={24} />
                                <span className="text-[10px] uppercase tracking-widest font-bold text-zinc-400">Ethically Sourced</span>
                            </div>
                        </div>
                    </motion.div>
                </div>

                {/* Detailed Info Sections */}
                <div className="mt-24 grid grid-cols-1 md:grid-cols-3 gap-12">
                    <div className="space-y-4">
                        <h3 style={{ fontFamily: '"Playfair Display", serif' }} className="text-2xl font-light">Bean Story</h3>
                        <p className="text-zinc-500 dark:text-zinc-400 font-light leading-relaxed">
                            Single-origin beans sourced from altitude-controlled estates. Each batch is roasted with precision to highlight its unique flavor notes, from chocolatey undertones to floral finishes.
                        </p>
                    </div>
                    <div className="space-y-4">
                        <h3 style={{ fontFamily: '"Playfair Display", serif' }} className="text-2xl font-light">Roast & Body</h3>
                        <ul className="text-zinc-500 dark:text-zinc-400 font-light space-y-2 text-sm">
                            <li className="flex justify-between border-b border-zinc-50 dark:border-white/5 pb-1"><span>Roast Level</span><span>Medium-Dark</span></li>
                            <li className="flex justify-between border-b border-zinc-50 dark:border-white/5 pb-1"><span>Body</span><span>Full & Velvety</span></li>
                            <li className="flex justify-between border-b border-zinc-50 dark:border-white/5 pb-1"><span>Flavor Profile</span><span>Nutty & Bold</span></li>
                        </ul>
                    </div>
                    <div className="space-y-4">
                        <h3 style={{ fontFamily: '"Playfair Display", serif' }} className="text-2xl font-light">Brewing Advice</h3>
                        <p className="text-zinc-500 dark:text-zinc-400 font-light leading-relaxed">
                            Best enjoyed when freshly prepared. We recommend a temperature of 92°C for optimal extraction. Perfect for espresso, pour-over, or your favorite milk-based beverage.
                        </p>
                    </div>
                </div>

                {/* Recommended Section */}
                <div className="mt-32">
                    <div className="flex flex-col gap-2 mb-12 text-center md:text-left">
                        <h2
                            style={{ fontFamily: '"Playfair Display", serif' }}
                            className="text-4xl md:text-5xl font-light text-foreground"
                        >
                            The Perfect Pairing
                        </h2>
                        <div className="h-[1px] w-20 bg-amber-500/50 mx-auto md:mx-0" />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8">
                        <p className="text-zinc-400 text-xs italic py-10 col-span-full text-center">Curating best matches...</p>
                    </div>
                </div>
            </div>
        </StoreLayout>
    );
};

const CoffeeProductDetail = () => (
    <CartProvider store="coffee">
        <CoffeeProductDetailInner />
    </CartProvider>
);

export default CoffeeProductDetail;
