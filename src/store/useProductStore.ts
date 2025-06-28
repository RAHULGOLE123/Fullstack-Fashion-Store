// frontend/src/store/useProductStore.ts
import { create } from 'zustand';

interface ProductState {
  searchQuery: string;
  categoryId: number | null;
  setSearchQuery: (query: string) => void;
  setCategoryId: (id: number | null) => void;
}

export const useProductStore = create<ProductState>((set) => ({
  searchQuery: '',
  categoryId: null,
  setSearchQuery: (query) => set({ searchQuery: query }),
  setCategoryId: (id) => set({ categoryId: id }),
}));