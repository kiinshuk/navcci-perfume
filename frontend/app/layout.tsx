import type { Metadata, Viewport } from "next";
import { Cormorant_Garamond, Inter, Playfair_Display } from "next/font/google";

import { Providers } from "./providers";
import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";
import { CartDrawer } from "@/components/cart/cart-drawer";
import { WhatsAppButton } from "@/components/layout/whatsapp-button";

import "@/styles/globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-cormorant",
  display: "swap",
});

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
  display: "swap",
});

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#F6F1E9" },
    { media: "(prefers-color-scheme: dark)", color: "#0E0D0C" },
  ],
  width: "device-width",
  initialScale: 1,
};

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "https://luxeperfume.in"),
  title: {
    default: "Luxe Perfume — The Art of Fine Fragrance",
    template: "%s | Luxe Perfume",
  },
  description:
    "Discover hand-crafted niche perfumes from the world's most prestigious houses. Complimentary shipping across India on orders above ₹1,500.",
  applicationName: "Luxe Perfume",
  authors: [{ name: "Luxe Perfume" }],
  keywords: [
    "luxury perfume",
    "niche fragrance",
    "oud perfume",
    "parfum",
    "eau de parfum",
    "Indian luxury perfume",
  ],
  openGraph: {
    type: "website",
    siteName: "Luxe Perfume",
    title: "Luxe Perfume — The Art of Fine Fragrance",
    description:
      "Discover hand-crafted niche perfumes from the world's most prestigious houses.",
    url: "/",
    locale: "en_IN",
  },
  twitter: {
    card: "summary_large_image",
    title: "Luxe Perfume — The Art of Fine Fragrance",
    description: "Discover hand-crafted niche perfumes from the world's most prestigious houses.",
  },
  robots: {
    index: true,
    follow: true,
  },
  alternates: {
    canonical: "/",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${cormorant.variable} ${playfair.variable}`} suppressHydrationWarning>
      <body>
        <Providers>
          <a
            href="#main"
            className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-md focus:bg-foreground focus:px-4 focus:py-2 focus:text-background"
          >
            Skip to content
          </a>
          <SiteHeader />
          <main id="main" className="min-h-[60vh]">
            {children}
          </main>
          <SiteFooter />
          <CartDrawer />
          <WhatsAppButton />
        </Providers>
      </body>
    </html>
  );
}
