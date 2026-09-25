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
          return { success: true, user };
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
          if (accessToken) {
            localStorage.setItem('accessToken', accessToken);
            set({ user, accessToken, isAuthenticated: true, isLoading: false });
          } else {
            set({ isLoading: false });
          }
          return {
            success: true,
            message: res.data.message,
            user,
          };
        } catch (err) {
          const message = err.response?.data?.message || 'Registration failed';
          set({ isLoading: false, error: message });
          return { success: false, message };
        }
      },

      googleLogin: async (credential, extraData = {}) => {
        set({ isLoading: true, error: null });
        try {
          const res = await api.post('/auth/google', { credential, ...extraData });
          const { accessToken, user } = res.data;
          localStorage.setItem('accessToken', accessToken);
          set({ user, accessToken, isAuthenticated: true, isLoading: false });
          return { success: true, user };
        } catch (err) {
          const message = err.response?.data?.message || 'Google Sign-In failed';
          set({ isLoading: false, error: message });
          return { success: false, message };
        }
      },

      verifyOtp: async (email, otp) => {
        set({ isLoading: true, error: null });
        try {
          const res = await api.post('/auth/verify-otp', { email, otp });
          const { accessToken, user } = res.data;
          if (accessToken) {
            localStorage.setItem('accessToken', accessToken);
            set({ user, accessToken, isAuthenticated: true, isLoading: false });
          } else {
            set({ isLoading: false });
          }
          return { success: true, user };
        } catch (err) {
          const message = err.response?.data?.message || 'Verification failed';
          set({ isLoading: false, error: message });
          return { success: false, message };
        }
      },

      resendOtp: async (email) => {
        try {
          const res = await api.post('/auth/resend-otp', { email });
          return { success: true, message: res.data.message };
        } catch (err) {
          const message = err.response?.data?.message || 'Failed to resend code';
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

      updateProfile: async (profileData) => {
        set({ isLoading: true, error: null });
        try {
          const res = await api.patch('/auth/me', profileData);
          const updatedUser = res.data.user;
          set({ user: updatedUser, isLoading: false });
          return { success: true, user: updatedUser };
        } catch (err) {
          const message = err.response?.data?.message || 'Failed to update profile';
          set({ isLoading: false, error: message });
          return { success: false, message };
        }
      },

      fetchMe: async () => {
        try {
          const res = await api.get('/auth/me');
          if (res.data?.user) {
            set({ user: res.data.user });
          }
        } catch {}
      },

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
