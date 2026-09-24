import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import api from '../api/axios';

const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      accessToken: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      login: async (email, password) => {
        set({ isLoading: true, error: null });
        try {
          const res = await api.post('/auth/login', { email, password });
          const { accessToken, user } = res.data;
          localStorage.setItem('accessToken', accessToken);
          set({ user, accessToken, isAuthenticated: true, isLoading: false });
          return { success: true };
        } catch (err) {
          const message = err.response?.data?.message || 'Login failed';
          set({ isLoading: false, error: message });
          return { success: false, message };
        }
      },

      register: async (data) => {
        set({ isLoading: true, error: null });
        try {
          const res = await api.post('/auth/register', data);
          const { accessToken, user } = res.data;
          localStorage.setItem('accessToken', accessToken);
          set({ user, accessToken, isAuthenticated: true, isLoading: false });
          return { success: true };
        } catch (err) {
          const message = err.response?.data?.message || 'Registration failed';
          set({ isLoading: false, error: message });
          return { success: false, message };
        }
      },

      logout: async () => {
        try {
          await api.post('/auth/logout');
        } catch {}
        localStorage.removeItem('accessToken');
        set({ user: null, accessToken: null, isAuthenticated: false, error: null });
      },

      updateUser: (userData) => set({ user: { ...get().user, ...userData } }),

      clearError: () => set({ error: null }),
    }),
    {
      name: 'unisphere-auth',
      partialize: (state) => ({ user: state.user, isAuthenticated: state.isAuthenticated }),
    }
  )
);

export { useAuthStore };
export default useAuthStore;
