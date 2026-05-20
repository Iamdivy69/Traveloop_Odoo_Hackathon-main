import { create } from 'zustand';
import api from '../lib/api';

export interface User {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  city?: string;
  country?: string;
  photo_url?: string;
  bio?: string;
  language: string;
  is_admin: boolean;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  error: string | null;

  login: (email: string, password: string) => Promise<void>;
  register: (data: any) => Promise<void>;
  logout: () => void;
  fetchMe: () => Promise<void>;
  initialize: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  token: localStorage.getItem('traveloop_token'),
  isLoading: true,
  error: null,

  login: async (email, password) => {
    try {
      set({ isLoading: true, error: null });
      const res = await api.post('/auth/login', { email, password });
      const { token, user } = res.data.data;
      
      localStorage.setItem('traveloop_token', token);
      set({ token, user, isLoading: false });
    } catch (err: any) {
      const errMsg = err.response?.data?.error?.message || err.response?.data?.error || 'Login failed';
      set({ 
        error: typeof errMsg === 'object' ? JSON.stringify(errMsg) : errMsg, 
        isLoading: false 
      });
      throw err;
    }
  },

  register: async (data) => {
    try {
      set({ isLoading: true, error: null });
      const res = await api.post('/auth/register', data);
      const { token, user } = res.data.data;
      
      localStorage.setItem('traveloop_token', token);
      set({ token, user, isLoading: false });
    } catch (err: any) {
      const errMsg = err.response?.data?.error?.message || err.response?.data?.error || 'Registration failed';
      set({ 
        error: typeof errMsg === 'object' ? JSON.stringify(errMsg) : errMsg, 
        isLoading: false 
      });
      throw err;
    }
  },

  logout: () => {
    localStorage.removeItem('traveloop_token');
    set({ user: null, token: null, error: null });
    // api interceptor will redirect to login if we make an auth call
  },

  fetchMe: async () => {
    try {
      const res = await api.get('/users/me');
      set({ user: res.data.data });
    } catch (err) {
      get().logout();
    }
  },

  initialize: async () => {
    set({ isLoading: true });
    const { token, fetchMe } = get();
    if (token) {
      await fetchMe();
    }
    set({ isLoading: false });
  }
}));
