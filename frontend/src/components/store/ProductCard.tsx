import { motion } from 'framer-motion';
import { Plus, Minus } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Product } from '@/lib/products';
import { useCart } from '@/context/CartContext';
import { toast } from 'sonner';

const ProductCard = ({ product }: { product: Product }) => {
  const { items, addToCart, updateQuantity, serviceType } = useCart();
  const cartItem = items.find(i => i.product.id === product.id);

  const handleAdd = () => {
    addToCart(product);
    toast.success(`${product.name} added to cart!`);
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -8 }}
      transition={{ duration: 0.5 }}
      className="group relative bg-white dark:bg-zinc-900 rounded-3xl overflow-hidden border border-zinc-100 dark:border-white/5 shadow-sm hover:shadow-2xl hover:shadow-emerald-500/10 transition-all duration-500"
    >
      {/* Visual Asset Container */}
      <Link to={`/${product.store}/product/${product.id}`} className="block relative h-48 md:h-56 overflow-hidden bg-zinc-100 dark:bg-white/5 flex items-center justify-center group/img">
        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 bg-gradient-to-tr from-emerald-500/10 to-transparent transition-opacity duration-1000 z-10" />
        <motion.img
          src={product.image}
          alt={product.name}
          className="w-full h-full object-cover transition-transform duration-1000 ease-out group-hover/img:scale-110"
        />

        {/* Subtle Emoji Overlay - optional but keeps that 'Twin Store' vibe */}
        <div className="absolute top-4 right-4 z-20 opacity-0 group-hover/img:opacity-100 transition-opacity">
          <span className="text-2xl">{product.emoji}</span>
        </div>

        {/* Subtle Badge */}
        <div className="absolute top-4 left-4 z-20">
          <span className="px-3 py-1 bg-white/80 dark:bg-black/50 backdrop-blur-md rounded-full text-[10px] uppercase tracking-widest font-semibold text-emerald-700 dark:text-emerald-400 border border-emerald-100 dark:border-white/10">
            Fresh Pick
          </span>
        </div>
      </Link>

      <div className="p-5 md:p-6 flex flex-col h-full">
        <Link to={`/${product.store}/product/${product.id}`} className="block mb-4 hover:opacity-80 transition-opacity">
          <h3
            style={{ fontFamily: '"Playfair Display", serif' }}
            className="text-xl md:text-2xl font-semibold text-zinc-800 dark:text-zinc-100 mb-1"
          >
            {product.name}
          </h3>
          <p className="text-zinc-500 dark:text-zinc-400 text-xs md:text-sm line-clamp-2 font-light">
            {product.description}
          </p>
        </Link>

        <div className="mt-auto flex items-center justify-between gap-4">
          <div className="flex flex-col">
            <span className="text-[10px] text-zinc-400 uppercase tracking-wider font-medium">Price</span>
            <span className="text-xl font-bold text-emerald-600 dark:text-emerald-400">₹{product.price}</span>
          </div>

          {serviceType === 'Dining' ? null : cartItem ? (
            <div className="flex items-center gap-3 bg-zinc-100 dark:bg-white/5 rounded-2xl p-1 px-2 border border-zinc-200 dark:border-white/10">
              <button
                onClick={() => updateQuantity(product.id, cartItem.quantity - 1)}
                className="w-8 h-8 flex items-center justify-center text-zinc-500 hover:text-emerald-600 transition-colors"
              >
                <Minus size={16} />
              </button>
              <span className="text-sm font-bold w-4 text-center text-zinc-800 dark:text-white">{cartItem.quantity}</span>
              <button
                onClick={() => updateQuantity(product.id, cartItem.quantity + 1)}
                className="w-8 h-8 flex items-center justify-center text-emerald-600 hover:bg-emerald-500 hover:text-white rounded-xl transition-all"
              >
                <Plus size={16} />
              </button>
            </div>
          ) : (
            <button
              onClick={handleAdd}
              className="flex items-center gap-2 bg-zinc-900 dark:bg-white text-white dark:text-black px-5 py-2.5 rounded-2xl text-xs font-bold hover:scale-105 active:scale-95 transition-all shadow-lg shadow-black/10"
            >
              Add To Cart
              <Plus size={14} />
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default ProductCard;
