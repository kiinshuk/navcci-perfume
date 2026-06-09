import { create } from "zustand";
import { persist } from "zustand/middleware";

import { cartApi } from "@/lib/services";
import type { Cart, CartItem } from "@/types";
import { isClient } from "@/lib/utils";

interface CartState {
  cart: Cart | null;
  isLoading: boolean;
  isOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
  toggleCart: () => void;
  fetchCart: () => Promise<void>;
  addItem: (productId: string, quantity?: number) => Promise<void>;
  updateItem: (itemId: string, quantity: number) => Promise<void>;
  removeItem: (itemId: string) => Promise<void>;
  clearCart: () => Promise<void>;
  applyCoupon: (code: string) => Promise<{ ok: boolean; error?: string }>;
  removeCoupon: () => Promise<void>;
  saveForLater: (itemId: string) => Promise<void>;
  moveToCart: (itemId: string) => Promise<void>;
  getItem: (productId: string) => CartItem | undefined;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      cart: null,
      isLoading: false,
      isOpen: false,

      openCart: () => set({ isOpen: true }),
      closeCart: () => set({ isOpen: false }),
      toggleCart: () => set((s) => ({ isOpen: !s.isOpen })),

      fetchCart: async () => {
        if (!isClient()) return;
        set({ isLoading: true });
        try {
          const cart = await cartApi.get();
          set({ cart });
        } catch {
          set({ cart: null });
        } finally {
          set({ isLoading: false });
        }
      },

      addItem: async (productId, quantity = 1) => {
        set({ isLoading: true });
        try {
          const cart = await cartApi.add(productId, quantity);
          set({ cart, isOpen: true });
        } finally {
          set({ isLoading: false });
        }
      },

      updateItem: async (itemId, quantity) => {
        set({ isLoading: true });
        try {
          const cart = await cartApi.update(itemId, quantity);
          set({ cart });
        } finally {
          set({ isLoading: false });
        }
      },

      removeItem: async (itemId) => {
        set({ isLoading: true });
        try {
          const cart = await cartApi.remove(itemId);
          set({ cart });
        } finally {
          set({ isLoading: false });
        }
      },

      clearCart: async () => {
        try {
          const cart = await cartApi.clear();
          set({ cart });
        } catch {
          /* noop */
        }
      },

      applyCoupon: async (code) => {
        try {
          const cart = await cartApi.applyCoupon(code);
          set({ cart });
          return { ok: true };
        } catch (err: any) {
          const message = err?.response?.data?.error?.message ?? "Invalid coupon.";
          return { ok: false, error: message };
        }
      },

      removeCoupon: async () => {
        try {
          const cart = await cartApi.removeCoupon();
          set({ cart });
        } catch {
          /* noop */
        }
      },

      saveForLater: async (itemId) => {
        const cart = await cartApi.saveForLater(itemId);
        set({ cart });
      },

      moveToCart: async (itemId) => {
        const cart = await cartApi.moveToCart(itemId);
        set({ cart });
      },

      getItem: (productId) => get().cart?.items.find((i) => i.product === productId),
    }),
    {
      name: "luxe.cart",
      partialize: (state) => ({ cart: state.cart }),
    }
  )
);
