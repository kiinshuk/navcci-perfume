"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { ThemeProvider } from "next-themes";
import { useEffect, useState } from "react";
import { Toaster } from "sonner";

import { useAuthStore } from "@/store/auth";
import { useCartStore } from "@/store/cart";

export function Providers({ children }: { children: React.ReactNode }) {
  const [client] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60_000,
            gcTime: 5 * 60_000,
            retry: 1,
            refetchOnWindowFocus: false,
          },
        },
      })
  );

  const initializeAuth = useAuthStore((s) => s.initialize);
  const fetchCart = useCartStore((s) => s.fetchCart);

  useEffect(() => {
    initializeAuth();
    fetchCart();
  }, [initializeAuth, fetchCart]);

  return (
    <QueryClientProvider client={client}>
      <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
        {children}
        <Toaster
          position="top-right"
          toastOptions={{
            className: "font-sans",
            style: { background: "hsl(var(--background))", color: "hsl(var(--foreground))" },
          }}
        />
      </ThemeProvider>
      {process.env.NODE_ENV === "development" && <ReactQueryDevtools initialIsOpen={false} />}
    </QueryClientProvider>
  );
}
