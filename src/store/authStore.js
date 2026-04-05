import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      
      login: (userData, authToken) => set({ user: userData, token: authToken }),
      logout: () => {
        set({ user: null, token: null });
        localStorage.removeItem('vquest-auth');
      },
      updateUser: (data) => set({ user: { ...get().user, ...data } })
    }),
    {
      name: 'vquest-auth',
      partialize: (state) => ({ user: state.user, token: state.token })
    }
  )
);
