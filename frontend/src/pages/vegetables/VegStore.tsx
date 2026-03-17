import { useState, useRef, useEffect } from 'react';
import { Search, ShoppingBag, Star, Clock, MousePointer2, Loader2 } from 'lucide-react';
import { motion, useScroll, useTransform } from 'framer-motion';
import StoreLayout from '@/components/store/StoreLayout';
import ProductCard from '@/components/store/ProductCard';
import { CartProvider } from '@/context/CartContext';
import { allCategories, Product } from '@/lib/products';
import vegHero from '@/assets/veg-hero.jpg';

const VegStoreInner = () => {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const heroRef = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"]
  });

  const y = useTransform(scrollYProgress, [0, 1], ["0%", "30%"]);
  const opacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);
  const scale = useTransform(scrollYProgress, [0, 1], [1, 1.1]);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5040/api'}/products?shopType=vegetable`);
        if (response.ok) {
          const data = await response.json();
          const mappedData = data.map((p: any) => ({
            id: p._id,
            name: p.name,
            price: p.price,
            category: p.category || 'Vegetables',
            description: p.description,
            image: p.images && p.images.length > 0 ? (p.images[0].startsWith('http') ? p.images[0] : (import.meta.env.VITE_API_URL || 'http://localhost:5040').replace('/api', '') + p.images[0]) : '',
            store: 'vegetables'
          }));
          setProducts(mappedData);
        }
      } catch (error) {
        console.error('Error fetching products:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  const categories = ['All', ...new Set(products.map(p => p.category))];

  const filtered = products.filter(p => {
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase());
    const matchCat = category === 'All' || p.category === category;
    return matchSearch && matchCat;
  });

  const titleWords = "Freshly Picked, Daily for You.".split(" ");

  return (
    <StoreLayout store="vegetables" storeName="KHAN VEGETABLES">

      <div
        ref={heroRef}
        className="relative -mx-4 md:-mx-8 mt-4 md:mt-12 mb-20 h-[85vh] md:h-[90vh] overflow-hidden flex items-center justify-center"
      >
        {/* Parallax Background */}
        <motion.div style={{ y, scale }} className="absolute inset-0 z-0">
          <img
            src={vegHero}
            alt="Fresh vegetables"
            className="w-full h-full object-cover"
          />
        </motion.div>


        {/* Editorial Content Layout */}
        <div className="relative z-30 max-w-7xl w-full px-8 md:px-16 flex flex-col justify-end pb-32 h-full">
          <motion.div
            style={{ opacity }}
            className="flex flex-col md:flex-row items-end gap-12"
          >
            {/* Left Column: Vertical Signature Line & Labels */}
            <div className="hidden md:flex flex-col items-center gap-8 pb-4">
              <span className="text-[10px] uppercase tracking-[0.5em] text-emerald-400 font-bold rotate-180 [writing-mode:vertical-lr]">
                PREMIUM COLLECTION
              </span>
              <div className="h-24 w-[1px] bg-gradient-to-b from-emerald-500/50 to-transparent" />
              <span className="text-[10px] uppercase tracking-[0.5em] text-white/30 font-medium rotate-180 [writing-mode:vertical-lr]">
                ESTD 2024
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
                  className="text-6xl md:text-8xl lg:text-[7.5rem] font-thin text-white leading-[0.85] mb-10 tracking-tight drop-shadow-[0_4px_12px_rgba(0,0,0,0.5)]"
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
                        className={`inline-block mr-[0.25em] ${isCalligraphy ? 'text-emerald-100/90 text-7xl md:text-9xl lg:text-[9.5rem] -ml-4 font-normal drop-shadow-2xl' : ''}`}
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
                  A curated selection of the season's finest organic produce,
                  <span className="text-white font-medium"> hand-picked </span> and delivered with absolute care.
                </p>

                <div className="flex items-center gap-6 pb-2">
                  <div className="flex flex-col gap-1">
                    <span className="text-[9px] uppercase tracking-[0.3em] text-emerald-400 font-bold">Quality</span>
                    <span className="text-xs text-white/40 uppercase tracking-widest font-medium">Certified</span>
                  </div>
                  <div className="w-[1px] h-8 bg-white/10" />
                  <div className="flex flex-col gap-1">
                    <span className="text-[9px] uppercase tracking-[0.3em] text-emerald-400 font-bold">Harvest</span>
                    <span className="text-xs text-white/40 uppercase tracking-widest font-medium">Daily</span>
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
          <span className="text-white/30 text-[9px] uppercase tracking-[0.4em] font-medium">Discover</span>
          <div className="w-[1px] h-12 bg-gradient-to-b from-emerald-500/50 to-transparent" />
        </motion.div>
      </div>

      {/* Modern Search & Visual Categories */}
      <div className="flex flex-col gap-12 mb-16 px-4 md:px-0">
        <div className="flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="flex flex-col gap-2">
            <h2 style={{ fontFamily: '"Playfair Display", serif' }} className="text-3xl md:text-4xl font-light">Our Collection</h2>
            <div className="h-[1px] w-20 bg-emerald-500/50" />
          </div>

          <div className="relative w-full md:w-[400px]">
            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" />
            <input
              type="text"
              placeholder="Searching for something fresh?"
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-12 pr-6 py-4 bg-zinc-100 dark:bg-white/5 border border-zinc-200 dark:border-white/10 rounded-2xl text-foreground placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all font-light"
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
                  ? 'bg-zinc-900 dark:bg-white text-white dark:text-black shadow-xl shadow-emerald-500/10'
                  : 'bg-zinc-100 dark:bg-white/5 text-zinc-500 dark:text-zinc-400 border border-zinc-200 dark:border-white/10 hover:border-emerald-500/30'}
              `}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Featured Products Grid */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-32 animate-pulse">
          <Loader2 className="w-12 h-12 text-emerald-500 animate-spin mb-4" />
          <p className="text-[10px] font-black tracking-[0.3em] text-zinc-400 uppercase">Gathering Today's Harvest...</p>
        </div>
      ) : (
        <>
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
              <div className="w-20 h-20 bg-emerald-50 dark:bg-emerald-950/20 rounded-full flex items-center justify-center text-3xl mb-4">🔍</div>
              <h3 style={{ fontFamily: '"Playfair Display", serif' }} className="text-xl font-medium mb-1">No Results Found</h3>
              <p className="text-zinc-500 font-light">Try adjusting your search or filters.</p>
            </div>
          )}
        </>
      )}
    </StoreLayout>
  );
};

const VegStore = () => (
  <CartProvider store="vegetables">
    <VegStoreInner />
  </CartProvider>
);

export default VegStore;
