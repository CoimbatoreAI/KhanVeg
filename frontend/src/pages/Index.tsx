import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { User, LogIn, LayoutDashboard, Coffee } from 'lucide-react';
import vegHero from '@/assets/veg-hero.jpg';
import coffeeHero from '@/assets/coffee-hero.jpg';
import { useAuth } from '@/context/AuthContext';

const Index = () => {
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();
  const [isOpening, setIsOpening] = useState(false);
  const [isClosing, setIsClosing] = useState(true);

  useEffect(() => {
    // Initial "Door Closing" animation on mount
    const timer = setTimeout(() => {
      setIsClosing(false);
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  const handleEnterStore = (path: string) => {
    setIsOpening(true);
    // Wait for animation to finish before navigating
    setTimeout(() => {
      navigate(path);
    }, 1200);
  };

  const doors = [
    {
      title: 'KHAN',
      subtitle: 'VEGETABLES',
      tagline: 'Fresh Farm Produce • Premium Quality',
      image: vegHero,
      path: '/vegetables',
      side: 'left',
      gradient: 'from-black/40 via-transparent to-transparent',
      accent: 'border-white/10',
    },
    {
      title: 'DAILY',
      subtitle: 'DELIGHTS',
      tagline: 'Artisan Coffee • Gourmet Snacks',
      image: coffeeHero,
      path: '/coffee',
      side: 'right',
      gradient: 'from-black/40 via-transparent to-transparent',
      accent: 'border-white/10',
    },
  ];

  return (
    <div className="theme-dark relative h-screen w-full overflow-hidden bg-zinc-950 flex flex-col md:flex-row">
      {/* Top Header */}
      <motion.div
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ delay: 1, duration: 0.8 }}
        className="absolute top-0 left-0 right-0 z-[60] px-6 py-8 flex items-center justify-between pointer-events-none"
      >
        <div className="pointer-events-auto">
          {/* Logo or placeholder if needed, current design relies on center text */}
        </div>

        <div className="flex items-center gap-4 pointer-events-auto">
          {/* Staff & Admin subtle links */}
          <div className="hidden md:flex items-center gap-6 mr-4">
            <Link to="/staff" className="text-[10px] text-white/30 hover:text-white uppercase tracking-[0.2em] font-black transition-colors">Staff Portal</Link>
            <Link to="/admin/login" className="text-[10px] text-white/30 hover:text-white uppercase tracking-[0.2em] font-black transition-colors">Admin</Link>
          </div>

          <Link
            to={isAuthenticated ? "/profile" : "/login"}
            className="w-12 h-12 rounded-full bg-white/5 backdrop-blur-md border border-white/10 flex items-center justify-center text-white hover:bg-white hover:text-black transition-all group"
            title={isAuthenticated ? `Profile (${user?.name})` : "Customer Login"}
          >
            <User size={20} strokeWidth={1.5} className="group-hover:scale-110 transition-transform" />
          </Link>
        </div>
      </motion.div>
      {/* Background Revealed when doors open */}
      <div className="absolute inset-0 flex items-center justify-center bg-zinc-900 overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-white/5 blur-[100px] animate-pulse" />
        </div>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center z-0"
        >
          <h2 style={{ fontFamily: '"Playfair Display", serif' }} className="text-2xl md:text-4xl font-light text-white/20 tracking-[1em] uppercase">
            Twin Stores
          </h2>
        </motion.div>
      </div>

      <AnimatePresence>
        {doors.map((door) => (
          <motion.div
            key={door.side}
            initial={{
              x: door.side === 'left' ? '-100%' : '100%',
              y: 0
            }}
            animate={{
              x: window.innerWidth >= 768
                ? (isOpening ? (door.side === 'left' ? '-100%' : '100%') : '0%')
                : '0%',
              y: window.innerWidth < 768
                ? (isOpening ? (door.side === 'left' ? '-100%' : '100%') : '0%')
                : '0%'
            }}
            transition={{
              duration: 1.4,
              ease: [0.65, 0, 0.35, 1],
              delay: isOpening ? 0 : 0.2
            }}
            onClick={() => !isOpening && handleEnterStore(door.path)}
            className={`
              relative h-1/2 w-full md:h-full md:w-1/2 cursor-pointer group flex flex-col items-center justify-center p-8
              overflow-hidden z-20
            `}
          >
            {/* Background Image */}
            <div className="absolute inset-0 z-0">
              <motion.img
                src={door.image}
                alt={door.title}
                className="w-full h-full object-cover opacity-70 group-hover:opacity-100 transition-opacity duration-1000 ease-in-out"
                style={{ filter: 'contrast(0.9) brightness(0.8)' }}
                whileHover={{ scale: 1.05 }}
              />
              <div className={`absolute inset-0 bg-gradient-to-b ${door.gradient}`} />
              {/* Subtle Darkening Overlay instead of heavy mask */}
              <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors duration-700" />
            </div>

            {/* Content Container (inspired by 'Timeless' screenshot) */}
            <div className="relative z-10 flex flex-col items-center text-center">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.8, duration: 1.2 }}
                className="flex flex-col items-center"
              >
                <span className="text-white/50 text-[10px] md:text-xs tracking-[0.5em] font-medium uppercase mb-2">
                  ESTD 2024
                </span>
                <h2
                  style={{ fontFamily: '"Playfair Display", serif' }}
                  className="text-4xl md:text-6xl lg:text-8xl font-thin text-white tracking-[0.1em] leading-none mb-2 select-none group-hover:tracking-[0.15em] transition-all duration-1000"
                >
                  {door.title}
                  <span className="block text-xl md:text-3xl lg:text-4xl mt-2 font-light opacity-80">
                    {door.subtitle}
                  </span>
                </h2>
                <div className="h-[1px] w-12 md:w-20 bg-white/30 mx-auto my-6 overflow-hidden">
                  <motion.div
                    className="h-full bg-white/80"
                    initial={{ x: '-100%' }}
                    animate={{ x: '0%' }}
                    transition={{ delay: 1.5, duration: 1 }}
                  />
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.2, duration: 0.8 }}
                className="mt-2"
              >
                <p style={{ fontFamily: '"Inter", sans-serif' }} className="text-white/60 text-xs md:text-sm tracking-[0.2em] font-light italic mb-8">
                  {door.tagline}
                </p>

                <motion.div
                  className="mt-8 relative group/btn"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <div className="absolute -inset-1 bg-gradient-to-r from-white/10 to-white/5 rounded-full blur opacity-0 group-hover/btn:opacity-100 transition duration-1000 group-hover/btn:duration-200" />
                  <button
                    style={{ fontFamily: '"Inter", sans-serif' }}
                    className="relative px-8 py-3 bg-white/5 backdrop-blur-md border border-white/20 rounded-full text-white text-xs md:text-sm tracking-[0.3em] uppercase font-light hover:bg-white hover:text-black transition-all duration-500 ease-out"
                  >
                    Explore Now
                  </button>
                </motion.div>
              </motion.div>
            </div>

            {/* Door Edge Line */}
            <div className={`
              absolute z-30 transition-all duration-1000 group-hover:bg-white/40 bg-white/10
              hidden md:block top-0 bottom-0 w-[1px] ${door.side === 'left' ? 'right-0' : 'left-0'}
              md:hidden left-0 right-0 h-[1px] ${door.side === 'left' ? 'bottom-0' : 'top-0'}
            `} />
          </motion.div>
        ))}
      </AnimatePresence>

      {/* Center Line Shadow */}
      <div className="absolute left-1/2 top-0 bottom-0 w-[1px] -translate-x-1/2 bg-white/5 z-30 pointer-events-none hidden md:block" />
      <div className="absolute top-1/2 left-0 right-0 h-[1px] -translate-y-1/2 bg-white/5 z-30 pointer-events-none md:hidden" />

      <div className="absolute top-1/2 left-0 right-0 h-[1px] -translate-y-1/2 bg-white/5 z-30 pointer-events-none md:hidden" />

      {/* Scroll indicator (Bottom corner aesthetic) */}
      <div className="absolute bottom-8 left-8 z-40 hidden md:block">
        <div className="flex items-center gap-4">
          <div className="w-8 h-[1px] bg-white/30" />
          <span className="text-white/30 text-[10px] tracking-[0.4em] uppercase font-light">
            Luxury Dining & Retail
          </span>
        </div>
      </div>
    </div>
  );
};

export default Index;
