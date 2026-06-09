import { create } from "zustand";

interface UIState {
  mobileNavOpen: boolean;
  searchOpen: boolean;
  setMobileNav: (open: boolean) => void;
  setSearch: (open: boolean) => void;
}

export const useUIStore = create<UIState>((set) => ({
  mobileNavOpen: false,
  searchOpen: false,
  setMobileNav: (open) => set({ mobileNavOpen: open }),
  setSearch: (open) => set({ searchOpen: open }),
}));
