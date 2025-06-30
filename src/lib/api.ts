// frontend/src/lib/api.ts
import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
});

export const getProducts = async (searchQuery?: string, categoryId?: number | null) => {
  const response = await api.get('/products', {
    params: {
      search: searchQuery,
      categoryId: categoryId,
    },
  });
  return response.data;
};

export const getProductById = async (id: number) => {
  const response = await api.get(`/products/${id}`);
  return response.data;
};

export const createProduct = async (productData: any) => {
  const response = await api.post('/products', productData);
  return response.data;
};

export const getCategories = async () => {
  const response = await api.get('/categories');
  return response.data;
};

// Mock user ID for cart functionality (replace with actual auth in production)
const MOCK_USER_ID = 'user123';

export const getCartItems = async () => {
  const response = await api.get(`/cart/${MOCK_USER_ID}`);
  return response.data;
};

export const addCartItem = async (productId: number, quantity: number = 1) => {
  const response = await api.post('/cart', {
    productId,
    quantity,
    userId: MOCK_USER_ID,
  });
  return response.data;
};

export const removeCartItem = async (productId: number) => {
  const response = await api.delete(`/cart/${MOCK_USER_ID}/${productId}`);
  return response.data;
};

export default api;