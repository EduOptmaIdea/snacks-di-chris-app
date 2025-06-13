import { create } from 'zustand';
import { ProductData } from '../type/product.ts';

interface ProductState {
  products: ProductData[];
  loading: boolean;
  error: string | null;
  fetchProducts: () => Promise<void>;
}

export const useProductStore = create<ProductState>((set) => ({
  products: [],
  loading: false,
  error: null,

  fetchProducts: async () => {
    set({ loading: true, error: null });
    try {
      const response = await fetch('/api/products');
      const data = await response.json();
      set({ products: data, loading: false });
    } catch {
      set({ error: 'Erro ao carregar produtos', loading: false });
    }
  }
}));