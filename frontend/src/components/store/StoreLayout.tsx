import { ReactNode } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ShoppingCart, Home, LayoutGrid, Settings, ShoppingBag, Instagram, Linkedin, ArrowLeft, Package, User } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { motion } from 'framer-motion';
import { useAuth } from '@/context/AuthContext';

interface StoreLayoutProps {
  children: ReactNode;
  store: 'vegetables' | 'coffee';
  storeName: string;
}

const StoreLayout = ({ children, store, storeName }: StoreLayoutProps) => {
  const { totalItems, serviceType } = useCart();
  const { isAuthenticated, user } = useAuth();
  const location = useLocation();
  const base = store === 'vegetables' ? '/vegetables' : '/coffee';
  const theme = store === 'vegetables' ? 'theme-vegetables' : 'theme-coffee';

  const links = [
    { to: base, icon: Home, label: 'Home' },
    ...(serviceType !== 'Dining' ? [{ to: `${base}/cart`, icon: ShoppingBag, label: 'Cart', badge: totalItems }] : []),
  ];

  return (
    <div className={`${theme} relative min-h-screen bg-zinc-50 dark:bg-zinc-950 text-foreground selection:bg-emerald-500/20`}>
      {/* Navbar */}
      <nav className="sticky top-0 z-50 bg-white/70 dark:bg-zinc-950/70 backdrop-blur-xl border-b border-zinc-100 dark:border-white/5">
        <div className="max-w-7xl mx-auto px-4 md:px-6 h-20 flex items-center justify-between">
          <Link
            to="/"
            className="group flex items-center gap-2 text-[10px] uppercase tracking-[0.3em] text-zinc-400 hover:text-foreground transition-all duration-300"
          >
            <div className="w-8 h-[1px] bg-zinc-200 dark:bg-white/10 group-hover:w-12 group-hover:bg-emerald-500 transition-all" />
            <span className="hidden md:inline">Exit Store</span>
            <ArrowLeft className="md:hidden" size={18} />
          </Link>

          <Link
            to={base}
            style={{ fontFamily: '"Playfair Display", serif' }}
            className="absolute left-1/2 -translate-x-1/2 text-lg md:text-2xl font-medium tracking-tight hover:opacity-80 transition-opacity whitespace-nowrap"
          >
            {storeName}
          </Link>

          <div className="flex items-center gap-4">
            {links.map(link => {
              const active = location.pathname === link.to;
              return (
                <Link
                  key={link.to}
                  to={link.to}
                  className={`relative p-2 rounded-xl transition-all duration-300 ${active ? 'text-emerald-600' : 'text-zinc-400 hover:text-zinc-800 dark:hover:text-white'}`}
                >
                  <link.icon size={22} strokeWidth={1.5} />
                  {link.badge ? (
                    <span className="absolute -top-1 -right-1 bg-emerald-500 text-white text-[9px] font-black w-5 h-5 rounded-full flex items-center justify-center shadow-lg shadow-emerald-500/20 border-2 border-white dark:border-zinc-950">
                      {link.badge}
                    </span>
                  ) : null}
                </Link>
              );
            })}

            <Link
              to={isAuthenticated ? "/profile" : "/login"}
              className={`p-2 rounded-xl transition-all duration-300 ${location.pathname === '/profile' || location.pathname === '/login' ? 'text-emerald-600' : 'text-zinc-400 hover:text-zinc-800 dark:hover:text-white'}`}
              title={isAuthenticated ? `Profile (${user?.name})` : "Login"}
            >
              <User size={22} strokeWidth={1.5} />
            </Link>
          </div>
        </div>
      </nav>

      {/* Page content */}
      <motion.main
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
        className="max-w-7xl mx-auto px-4 py-6"
      >
        {children}
      </motion.main>

      {/* Footer */}
      <footer className="mt-20 border-t border-zinc-100 dark:border-white/5 py-12 bg-white/50 dark:bg-zinc-950/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex flex-col items-center md:items-start gap-2">
            <span style={{ fontFamily: '"Playfair Display", serif' }} className="text-xl font-medium tracking-tight">
              {storeName}
            </span>
            <p className="text-xs text-zinc-400 uppercase tracking-widest font-medium">
              Premium Quality • Fresh Daily
            </p>
          </div>

          <div className="flex items-center gap-8">
            {store === 'vegetables' ? (
              <>
                <a
                  href="https://www.instagram.com/khan_vegetables_?igsh=MWNvNDlwN2NtbHlrNA%3D%3D&utm_source=qr"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex items-center gap-2 text-zinc-400 hover:text-emerald-600 transition-all duration-300"
                >
                  <Instagram size={20} className="group-hover:scale-110 transition-transform" />
                  <span className="text-[10px] uppercase tracking-[0.2em] font-bold">Instagram</span>
                </a>
                <a
                  href="https://www.linkedin.com/in/khan-vegetables-in?utm_source=share&utm_campaign=share_via&utm_content=profile&utm_medium=ios_app"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex items-center gap-2 text-zinc-400 hover:text-emerald-600 transition-all duration-300"
                >
                  <Linkedin size={20} className="group-hover:scale-110 transition-transform" />
                  <span className="text-[10px] uppercase tracking-[0.2em] font-bold">LinkedIn</span>
                </a>
              </>
            ) : null}
            <Link
              to="/track"
              className="group flex items-center gap-2 text-zinc-400 hover:text-emerald-600 transition-all duration-300"
            >
              <Package size={20} className="group-hover:scale-110 transition-transform" />
              <span className="text-[10px] uppercase tracking-[0.2em] font-bold">Track Order</span>
            </Link>
          </div>

          <div className="text-[10px] text-zinc-400 uppercase tracking-[0.3em] font-medium">
            Sourced with care
          </div>
        </div>
      </footer>

      {/* Floating WhatsApp */}
      <a
        href="https://wa.me/919025207959"
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-6 right-6 z-50 bg-green-500 hover:bg-green-600 text-primary-foreground w-14 h-14 rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-transform text-2xl"
      >
        💬
      </a>
    </div>
  );
};

export default StoreLayout;
