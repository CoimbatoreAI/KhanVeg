export type OrderStatus = 'Confirmed' | 'Shipped' | 'Out for Delivery' | 'Delivered' | 'Cancelled';

export interface Order {
    id: string;
    customerName: string;
    address: string;
    items: { name: string; quantity: number; price: number }[];
    totalPrice: number;
    status: OrderStatus;
    timestamp: string;
    store: 'vegetables' | 'coffee';
    lastUpdated: string;
    courierLocation?: { lat: number; lng: number };
}

const ORDERS_KEY = 'twin-store-orders';

export const updateCourierLocation = (orderId: string, lat: number, lng: number) => {
    const orders = getOrders();
    const updated = orders.map(o =>
        o.id === orderId ? { ...o, courierLocation: { lat, lng }, lastUpdated: new Date().toISOString() } : o
    );
    localStorage.setItem(ORDERS_KEY, JSON.stringify(updated));
    // Dispatch custom event for real-time update between tabs
    window.dispatchEvent(new Event('orderUpdate'));
};

export const getOrders = (): Order[] => {
    const saved = localStorage.getItem(ORDERS_KEY);
    return saved ? JSON.parse(saved) : [];
};

export const saveOrder = (order: Order) => {
    const orders = getOrders();
    localStorage.setItem(ORDERS_KEY, JSON.stringify([order, ...orders]));
};

export const updateOrderStatus = (orderId: string, status: OrderStatus) => {
    const orders = getOrders();
    const updated = orders.map(o =>
        o.id === orderId ? { ...o, status, lastUpdated: new Date().toISOString() } : o
    );
    localStorage.setItem(ORDERS_KEY, JSON.stringify(updated));
};

export const getOrderById = (orderId: string): Order | undefined => {
    return getOrders().find(o => o.id === orderId);
};
