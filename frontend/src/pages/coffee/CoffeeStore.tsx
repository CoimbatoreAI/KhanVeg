import { useState, useRef, useEffect } from 'react';
import { Search, Star, Clock, ShoppingBag, Loader2, MapPin, Coffee, Utensils, Package, Check, ArrowRight } from 'lucide-react';
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion';
import StoreLayout from '@/components/store/StoreLayout';
import ProductCard from '@/components/store/ProductCard';
import { CartProvider, useCart } from '@/context/CartContext';
import { allCategories, Product } from '@/lib/products';
import coffeeHero from '@/assets/coffee-hero.jpg';

const CoffeeStoreInner = () => {
  const { serviceType, setServiceType } = useCart();
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [products, setProducts] = useState<Product[]>([]);

  const [loading, setLoading] = useState(true);
  const [showModeSelection, setShowModeSelection] = useState(serviceType === 'Delivery');
  const [tempServiceType, setTempServiceType] = useState<'Dining' | 'Takeaway'>('Takeaway');

  const heroRef = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"]
  });

  const y = useTransform(scrollYProgress, [0, 1], ["0%", "30%"]);
  const opacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);
  const scale = useTransform(scrollYProgress, [0, 1], [1, 1.1]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const prodRes = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5040/api'}/products?shopType=coffee`);

        if (prodRes.ok) {
          const data = await prodRes.json();
          const mappedData = data.map((p: any) => ({
            id: p._id,
            name: p.name,
            price: p.price,
            category: p.category || 'Coffee',
            description: p.description,
            image: p.images && p.images.length > 0 ? (p.images[0].startsWith('http') ? p.images[0] : (import.meta.env.VITE_API_URL || 'http://localhost:5040').replace('/api', '') + p.images[0]) : '',
            store: 'coffee'
          }));
          setProducts(mappedData);
        }


      } catch (error) {
        console.error('Error fetching coffee data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleModeConfirm = () => {
    setServiceType(tempServiceType);
    setShowModeSelection(false);
  };

  const categories = ['All', ...new Set(products.map(p => p.category))];

  const filtered = products.filter(p => {
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase());
    const matchCat = category === 'All' || p.category === category;
    return matchSearch && matchCat;
  });

  const titleWords = "Crafted Daily, Roasted for Perfection.".split(" ");

  return (
    <StoreLayout store="coffee" storeName="Daily Delights">

      <div
        ref={heroRef}
        className="relative -mx-4 md:-mx-8 mt-4 md:mt-12 mb-20 h-[70vh] md:h-[75vh] overflow-hidden flex items-center justify-center"
      >
        {/* Parallax Background */}
        <motion.div style={{ y, scale }} className="absolute inset-0 z-0">
          <img
            src={coffeeHero}
            alt="Coffee shop"
            className="w-full h-full object-cover"
          />
        </motion.div>


        {/* Editorial Content Layout */}
        <div className="relative z-30 max-w-7xl w-full px-8 md:px-16 flex flex-col justify-end pb-24 h-full">
          <motion.div
            style={{ opacity }}
            className="flex flex-col md:flex-row items-end gap-12"
          >
            {/* Left Column: Vertical Signature Line */}
            <div className="hidden md:flex flex-col items-center gap-8 pb-4">
              <span style={{ fontFamily: '"Alex Brush", cursive' }} className="text-2xl text-amber-400 -rotate-90 origin-center translate-y-20 whitespace-nowrap">
                Daily Delights
              </span>
              <div className="h-32 w-[1px] bg-gradient-to-b from-amber-500/50 to-transparent mt-24" />
              <span className="text-[10px] uppercase tracking-[0.5em] text-white/30 font-medium rotate-180 [writing-mode:vertical-lr]">
                SINCE 2024
              </span>
            </div>

            {/* Main Column: Typography */}
            <div className="max-w-4xl">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 1, ease: "easeOut" }}
              >
                <h1
                  style={{ fontFamily: '"Playfair Display", serif' }}
                  className="text-6xl md:text-8xl lg:text-[5.5rem] font-thin text-white leading-[0.85] mb-10 tracking-tight drop-shadow-[0_4px_12px_rgba(0,0,0,0.5)]"
                >
                  {titleWords.map((word, i) => {
                    const isCalligraphy = i >= 2;
                    return (
                      <motion.span
                        key={word + i}
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 + (i * 0.1), duration: 1, ease: [0.22, 1, 0.36, 1] }}
                        style={isCalligraphy ? { fontFamily: '"Alex Brush", cursive' } : {}}
                        className={`inline-block mr-[0.25em] ${isCalligraphy ? 'text-amber-100/90 text-7xl md:text-9xl lg:text-[7rem] -ml-4 font-normal drop-shadow-2xl' : ''}`}
                      >
                        {word}
                      </motion.span>
                    );
                  })}
                </h1>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.2, duration: 1 }}
                className="flex flex-col md:flex-row md:items-center gap-8 md:gap-16"
              >
                <p className="text-white/70 text-lg md:text-xl max-w-xl font-light leading-relaxed">
                  Experience the art of the perfect roast. From bean to cup,
                  <span className="text-white font-medium"> precision </span> and passion in every pour.
                </p>

                <div className="flex items-center gap-6 pb-2">
                  <div className="flex flex-col gap-1">
                    <span className="text-[9px] uppercase tracking-[0.3em] text-amber-400 font-bold">Roast</span>
                    <span className="text-xs text-white/40 uppercase tracking-widest font-medium">Bespoke</span>
                  </div>
                  <div className="w-[1px] h-8 bg-white/10" />
                  <div className="flex flex-col gap-1">
                    <span className="text-[9px] uppercase tracking-[0.3em] text-amber-400 font-bold">Brew</span>
                    <span className="text-xs text-white/40 uppercase tracking-widest font-medium">Artisanal</span>
                  </div>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </div>

        {/* Scroll Indicator */}
        <motion.div
          animate={{ y: [0, 12, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          className="absolute bottom-12 left-1/2 -translate-x-1/2 z-30 flex flex-col items-center gap-2"
        >
          <span className="text-white/30 text-[9px] uppercase tracking-[0.4em] font-medium">Menu</span>
          <div className="w-[1px] h-12 bg-gradient-to-b from-amber-500/50 to-transparent" />
        </motion.div>
      </div>

      {/* Modern Search & Visual Categories */}
      <div className="flex flex-col gap-12 mb-16 px-4 md:px-0">
        <div className="flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="flex flex-col gap-2">
            <h2 style={{ fontFamily: '"Playfair Display", serif' }} className="text-3xl md:text-4xl font-light">The Menu</h2>
            <div className="h-[1px] w-20 bg-amber-500/50" />
          </div>

          <div className="relative w-full md:w-[400px]">
            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" />
            <input
              type="text"
              placeholder="What are you craving?"
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-12 pr-6 py-4 bg-zinc-100 dark:bg-white/5 border border-zinc-200 dark:border-white/10 rounded-2xl text-foreground placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-amber-500/50 transition-all font-light"
            />
          </div>
        </div>

        <div className="flex gap-4 overflow-x-auto pb-4 no-scrollbar -mx-4 px-4 md:mx-0 md:px-0">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              className={`
                whitespace-nowrap px-8 py-3 rounded-2xl text-xs font-semibold uppercase tracking-widest transition-all duration-300
                ${category === cat
                  ? 'bg-zinc-900 dark:bg-white text-white dark:text-black shadow-xl shadow-amber-500/10'
                  : 'bg-zinc-100 dark:bg-white/5 text-zinc-500 dark:text-zinc-400 border border-zinc-200 dark:border-white/10 hover:border-amber-500/30'}
              `}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Mode Selection Overlay */}
      <AnimatePresence>
        {showModeSelection && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              className="bg-white dark:bg-zinc-900 w-full max-w-xl rounded-[3rem] overflow-hidden shadow-2xl"
            >
              <div className="p-10">
                <div className="flex items-center gap-3 mb-8">
                  <div className="w-10 h-10 bg-amber-100 dark:bg-amber-500/20 rounded-xl flex items-center justify-center text-amber-600">
                    <Coffee size={20} />
                  </div>
                  <h2 style={{ fontFamily: '"Playfair Display", serif' }} className="text-3xl font-bold">How will you enjoy?</h2>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-8">
                  <button
                    onClick={() => setTempServiceType('Dining')}
                    className={`p-6 rounded-3xl border-2 transition-all text-left ${tempServiceType === 'Dining' ? 'border-amber-500 bg-amber-50 dark:bg-amber-500/5' : 'border-zinc-100 dark:border-white/5 bg-transparent'}`}
                  >
                    <Utensils className={tempServiceType === 'Dining' ? 'text-amber-600' : 'text-zinc-400'} size={24} />
                    <h3 className={`mt-4 font-bold ${tempServiceType === 'Dining' ? 'text-amber-900 dark:text-amber-100' : 'text-zinc-500'}`}>Dining</h3>
                    <p className="text-[10px] text-zinc-400 mt-1 uppercase tracking-widest font-bold">Experience in shop</p>
                  </button>

                  <button
                    onClick={() => {
                      setTempServiceType('Takeaway');
                    }}
                    className={`p-6 rounded-3xl border-2 transition-all text-left ${tempServiceType === 'Takeaway' ? 'border-amber-500 bg-amber-50 dark:bg-amber-500/5' : 'border-zinc-100 dark:border-white/5 bg-transparent'}`}
                  >
                    <Package className={tempServiceType === 'Takeaway' ? 'text-amber-600' : 'text-zinc-400'} size={24} />
                    <h3 className={`mt-4 font-bold ${tempServiceType === 'Takeaway' ? 'text-amber-900 dark:text-amber-100' : 'text-zinc-500'}`}>Takeaway</h3>
                    <p className="text-[10px] text-zinc-400 mt-1 uppercase tracking-widest font-bold">Grab and Go</p>
                  </button>
                </div>



                <button
                  onClick={handleModeConfirm}
                  className="w-full py-5 bg-zinc-900 dark:bg-white text-white dark:text-black rounded-2xl font-black text-xs uppercase tracking-[0.3em] shadow-xl hover:bg-amber-500 dark:hover:bg-amber-500 hover:text-white transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  Confirm Choice <ArrowRight size={16} />
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Featured Products Grid */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-32 animate-pulse">
          <Loader2 className="w-12 h-12 text-amber-500 animate-spin mb-4" />
          <p className="text-[10px] font-black tracking-[0.3em] text-zinc-400 uppercase">Brewing your selection...</p>
        </div>
      ) : (
        <>
          <div className="flex items-center justify-between mb-8 px-4 md:px-0">
            <div className="flex items-center gap-4">
              <span className="px-4 py-2 bg-amber-100 dark:bg-amber-500/10 text-amber-600 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-2">
                {serviceType === 'Dining' ? <Utensils size={12} /> : <Package size={12} />} {serviceType}
              </span>
              <span className="px-4 py-2 bg-amber-100 dark:bg-amber-500/10 text-amber-600 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-2">
                {serviceType === 'Dining' ? <Utensils size={12} /> : <Package size={12} />} {serviceType}
              </span>
            </div>
            <button onClick={() => setShowModeSelection(true)} className="text-[10px] font-black uppercase tracking-widest text-amber-500 hover:text-amber-600 transition-colors">
              Change Mode
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 md:gap-8 lg:gap-10">
            {filtered.map((p, i) => (
              <motion.div
                key={p.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                <ProductCard product={p} />
              </motion.div>
            ))}
          </div>

          {filtered.length === 0 && (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="w-20 h-20 bg-amber-50 dark:bg-amber-950/20 rounded-full flex items-center justify-center text-3xl mb-4">🔍</div>
              <h3 style={{ fontFamily: '"Playfair Display", serif' }} className="text-xl font-medium mb-1">No Selection Found</h3>
              <p className="text-zinc-500 font-light">Try adjusting your roasting preference.</p>
            </div>
          )}
        </>
      )}
    </StoreLayout>
  );
};

const CoffeeStore = () => (
  <CartProvider store="coffee">
    <CoffeeStoreInner />
  </CartProvider>
);

export default CoffeeStore;
