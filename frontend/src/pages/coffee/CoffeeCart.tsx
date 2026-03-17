import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Trash2, ArrowLeft, ShoppingBag, Plus, Minus, Loader2 } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import StoreLayout from '@/components/store/StoreLayout';
import { CartProvider, useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';

const WHATSAPP_NUMBER = '919025207959';

const CoffeeCartInner = () => {
  const { items, updateQuantity, removeFromCart, clearCart, totalPrice } = useCart();
  const { user, token, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState(user?.name || '');
  const [address, setAddress] = useState(user?.address || '');
  const [loading, setLoading] = useState(false);

  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5040/api';
  const baseUrl = apiUrl.replace('/api', '');

  useEffect(() => {
    if (user) {
      setName(user.name);
      setAddress(user.address || '');
    }
  }, [user]);

  const handleCheckout = async () => {
    if (items.length === 0) { toast.error('Cart is empty!'); return; }
    if (!isAuthenticated) {
      toast.info('Please login to place an order');
      navigate('/login');
      return;
    }
    if (!name || !address) { toast.error('Please enter name and address!'); return; }

    setLoading(true);
    try {
      // 1. Save to Backend
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
          shippingAddress: address,
          customerPhone: user?.phone,
          paymentMethod: 'Cash'
        }),
      });

      if (response.ok) {
        const orderData = await response.json();
        const orderId = orderData.order._id;
        toast.success('Order placed successfully!');

        // 2. WhatsApp Notify
        const lines = items.map(i => `• ${i.product.name} x${i.quantity} = ₹${i.product.price * i.quantity}`);
        const msg = `☕ *Order Confirmed - Daily Delights*\n\nOrder ID: ${orderId}\nCustomer: ${name}\nAddress: ${address}\n\n${lines.join('\n')}\n\n*Total: ₹${totalPrice}*\n\nTracking link: ${window.location.origin}/track?id=${orderId}`;
        window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(msg)}`, '_blank');

        clearCart();
        navigate('/profile');
      } else {
        toast.error('Failed to sync order with server');
      }
    } catch (error) {
      toast.error('Connection error during checkout');
    } finally {
      setLoading(false);
    }
  };

  return (
    <StoreLayout store="coffee" storeName="Daily Delights">
      <div className="max-w-2xl mx-auto px-4">
        <div className="flex flex-col gap-2 mb-12 text-center md:text-left">
          <h1
            style={{ fontFamily: '"Playfair Display", serif' }}
            className="text-4xl md:text-5xl font-light text-foreground"
          >
            Your Selection
          </h1>
          <div className="h-[1px] w-20 bg-amber-500/50 mx-auto md:mx-0" />
        </div>

        {items.length === 0 ? (
          <div className="text-center py-20 flex flex-col items-center">
            <div className="w-24 h-24 bg-zinc-100 dark:bg-white/5 rounded-full flex items-center justify-center text-4xl mb-6">🛒</div>
            <p className="text-zinc-500 text-lg font-light mb-8">Your cart is currently empty</p>
            <Link
              to="/coffee"
              className="px-8 py-3 bg-zinc-900 dark:bg-white text-white dark:text-black rounded-full text-xs font-bold tracking-widest uppercase hover:scale-105 transition-all"
            >
              Browse Menu
            </Link>
          </div>
        ) : (
          <>
            <div className="space-y-6 mb-12">
              {items.map(item => (
                <motion.div
                  layout
                  key={item.product.id}
                  className="group bg-white dark:bg-white/5 rounded-2xl border border-zinc-100 dark:border-white/10 p-5 flex items-center gap-6 hover:shadow-xl hover:shadow-black/5 transition-all"
                >
                  <div className="w-16 h-16 bg-zinc-100 dark:bg-white/5 rounded-2xl overflow-hidden shrink-0">
                    <img
                      src={item.product.image?.startsWith('http') ? item.product.image : `${baseUrl}${item.product.image}`}
                      alt={item.product.name}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  <div className="flex-1 min-w-0">
                    <h3 style={{ fontFamily: '"Playfair Display", serif' }} className="text-xl font-medium text-foreground truncate">
                      {item.product.name}
                    </h3>
                    <p className="text-sm text-zinc-500 font-light">
                      ₹{item.product.price} <span className="text-[10px] uppercase tracking-widest ml-2 opacity-50">per serving</span>
                    </p>
                  </div>

                  <div className="flex items-center gap-3 bg-zinc-100 dark:bg-white/5 rounded-xl p-1 border border-zinc-200 dark:border-white/10">
                    <button
                      onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                      className="w-8 h-8 flex items-center justify-center text-zinc-500 hover:text-amber-600 transition-colors"
                    >
                      <Minus size={14} />
                    </button>
                    <span className="text-sm font-bold w-4 text-center">{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                      className="w-8 h-8 flex items-center justify-center text-amber-600 hover:bg-amber-500 hover:text-white rounded-lg transition-all"
                    >
                      <Plus size={14} />
                    </button>
                  </div>

                  <div className="flex flex-col items-end gap-1">
                    <span className="font-bold text-foreground">₹{item.product.price * item.quantity}</span>
                    <button
                      onClick={() => { removeFromCart(item.product.id); toast.info('Removed'); }}
                      className="text-zinc-400 hover:text-red-500 transition-colors"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>

            <div className="bg-white dark:bg-white/5 rounded-3xl border border-zinc-100 dark:border-white/10 p-8 shadow-2xl shadow-black/5">
              <div className="flex justify-between items-center mb-8 pb-8 border-b border-zinc-100 dark:border-white/5">
                <div className="flex flex-col">
                  <span className="text-sm text-zinc-400 uppercase tracking-widest font-medium">Subtotal</span>
                  <span className="text-3xl font-bold font-serif">₹{totalPrice}</span>
                </div>
                <ShoppingBag className="text-amber-500" size={32} />
              </div>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => navigate('/coffee/checkout')}
                className="w-full bg-zinc-900 dark:bg-white text-white dark:text-black py-4 rounded-2xl font-bold text-sm tracking-[0.2em] uppercase shadow-lg shadow-black/20 hover:opacity-90 transition-all flex items-center justify-center gap-3"
              >
                Proceed to Checkout
                <ArrowLeft className="rotate-180" size={18} />
              </motion.button>

              <button
                onClick={() => { clearCart(); toast.info('Cart cleared'); }}
                className="w-full mt-4 text-[10px] text-zinc-400 uppercase tracking-[0.3em] hover:text-red-500 transition-colors py-2"
              >
                Clear All Selection
              </button>
            </div>
          </>
        )}
      </div>
    </StoreLayout>
  );
};

const CoffeeCart = () => (
  <CartProvider store="coffee">
    <CoffeeCartInner />
  </CartProvider>
);

export default CoffeeCart;
