import { create } from "zustand";
import { persist } from "zustand/middleware";

import { authApi, persistAuth } from "@/lib/services";
import type { User } from "@/types";
import { isClient } from "@/lib/utils";

interface AuthState {
  user: User | null;
  access: string | null;
  refresh: string | null;
  isLoading: boolean;
  isInitialized: boolean;
  initialize: () => Promise<void>;
  login: (identifier: string, password: string) => Promise<User>;
  register: (payload: any) => Promise<User>;
  logout: () => Promise<void>;
  updateProfile: (payload: { firstName: string; lastName: string; phone: string }) => Promise<User>;
  setUser: (user: User) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      access: null,
      refresh: null,
      isLoading: false,
      isInitialized: false,

      initialize: async () => {
        if (!isClient() || get().isInitialized) return;
        set({ isInitialized: true });
        const { access, refresh } = get();
        if (!access) return;
        try {
          const user = await authApi.me();
          set({ user, access, refresh });
        } catch {
          set({ user: null, access: null, refresh: null });
        }
      },

      login: async (identifier, password) => {
        set({ isLoading: true });
        try {
          const data = await authApi.login(identifier, password);
          persistAuth(data.access, data.refresh);
          set({ user: data.user, access: data.access, refresh: data.refresh });
          return data.user;
        } finally {
          set({ isLoading: false });
        }
      },

      register: async (payload) => {
        set({ isLoading: true });
        try {
          const data = await authApi.register(payload);
          persistAuth(data.access, data.refresh);
          set({ user: data.user, access: data.access, refresh: data.refresh });
          return data.user;
        } finally {
          set({ isLoading: false });
        }
      },

      logout: async () => {
        try {
          await authApi.logout();
        } finally {
          set({ user: null, access: null, refresh: null });
        }
      },

      updateProfile: async (payload) => {
        const user = await authApi.updateProfile(payload);
        set({ user });
        return user;
      },

      setUser: (user) => set({ user }),
    }),
    {
      name: "navcci.auth",
      partialize: (state) => ({ user: state.user, access: state.access, refresh: state.refresh }),
    }
  )
);
