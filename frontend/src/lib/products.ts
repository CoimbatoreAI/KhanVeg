export interface Product {
  id: string;
  _id?: string;
  name: string;
  price: number;
  category: string;
  emoji?: string;
  image: string;
  images?: string[];
  description: string;
  store: 'vegetables' | 'coffee';
  unit?: string;
}

// These are now empty as we fetch from the backend.
export const vegetableProducts: Product[] = [];
export const coffeeProducts: Product[] = [];

export const allCategories = (store: 'vegetables' | 'coffee') => {
  // This will be handled dynamically in the store components now.
  return ['All'];
};
