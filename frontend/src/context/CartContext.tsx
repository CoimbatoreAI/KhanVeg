import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Product } from '@/lib/products';
import { saveOrder, Order } from '@/lib/orders';

export interface CartItem {
  product: Product;
  quantity: number;
}

interface CartContextType {
  items: CartItem[];
  addToCart: (product: Product) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  totalItems: number;
  totalPrice: number;
  checkoutWhatsApp: (phone: string, storeName: string, customerName: string, address: string) => void;
  serviceType: 'Dining' | 'Takeaway' | 'Delivery';
  setServiceType: (type: 'Dining' | 'Takeaway' | 'Delivery') => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const STORAGE_KEYS = {
  vegetables: 'khan-veg-cart',
  coffee: 'daily-delights-cart',
};

export const CartProvider = ({ children, store }: { children: ReactNode; store: 'vegetables' | 'coffee' }) => {
  const key = STORAGE_KEYS[store];
  const [items, setItems] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem(key);
      return saved ? JSON.parse(saved) : [];
    } catch { return []; }
  });

  useEffect(() => {
    localStorage.setItem(key, JSON.stringify(items));
  }, [items, key]);

  const [serviceType, setServiceType] = useState<'Dining' | 'Takeaway' | 'Delivery'>('Delivery');

  const addToCart = (product: Product) => {
    setItems(prev => {
      const existing = prev.find(i => i.product.id === product.id);
      if (existing) return prev.map(i => i.product.id === product.id ? { ...i, quantity: i.quantity + 1 } : i);
      return [...prev, { product, quantity: 1 }];
    });
  };

  const removeFromCart = (productId: string) => setItems(prev => prev.filter(i => i.product.id !== productId));
  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) return removeFromCart(productId);
    setItems(prev => prev.map(i => i.product.id === productId ? { ...i, quantity } : i));
  };
  const clearCart = () => {
    setItems([]);
    setServiceType('Delivery');
  };
  const totalItems = items.reduce((s, i) => s + i.quantity, 0);
  const totalPrice = items.reduce((s, i) => s + i.product.price * i.quantity, 0);

  const checkoutWhatsApp = (phone: string, storeName: string, customerName: string, address: string) => {
    const orderId = `TS-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
    const newOrder: Order = {
      id: orderId,
      customerName,
      address,
      items: items.map(i => ({ name: i.product.name, quantity: i.quantity, price: i.product.price })),
      totalPrice,
      status: 'Confirmed',
      timestamp: new Date().toISOString(),
      store: store === 'vegetables' ? 'vegetables' : 'coffee',
      lastUpdated: new Date().toISOString()
    };

    saveOrder(newOrder);

    const lines = items.map(i => `• ${i.product.name} x${i.quantity} = ₹${i.product.price * i.quantity}`);
    const msg = `🛒 *Order from ${storeName}*\n\nOrder ID: ${orderId}\nCustomer: ${customerName}\nAddress: ${address}\nService: ${serviceType}\n\n${lines.join('\n')}\n\n*Total: ₹${totalPrice}*\n\nPlease confirm my order! Tracking link: ${window.location.origin}/track?id=${orderId}`;
    window.open(`https://wa.me/${phone}?text=${encodeURIComponent(msg)}`, '_blank');
  };

  return (
    <CartContext.Provider value={{
      items, addToCart, removeFromCart, updateQuantity, clearCart,
      totalItems, totalPrice, checkoutWhatsApp,
      serviceType, setServiceType
    }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
};
