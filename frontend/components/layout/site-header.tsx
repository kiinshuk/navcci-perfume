"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Heart, Search, ShoppingBag, User, Menu, X, LogIn } from "lucide-react";

import { useAuthStore } from "@/store/auth";
import { useCartStore } from "@/store/cart";
import { useUIStore } from "@/store/ui";
import { NAV, SITE } from "@/lib/site";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function SiteHeader() {
  const [scrolled, setScrolled] = useState(false);
  const user = useAuthStore((s) => s.user);
  const cartCount = useCartStore((s) => s.cart?.itemCount ?? 0);
  const openCart = useCartStore((s) => s.openCart);
  const mobileOpen = useUIStore((s) => s.mobileNavOpen);
  const setMobileOpen = useUIStore((s) => s.setMobileNav);
  const setSearch = useUIStore((s) => s.setSearch);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={cn(
        "sticky top-0 z-40 transition-all duration-500",
        scrolled
          ? "border-b border-border bg-background/85 backdrop-blur-xl"
          : "bg-background/0"
      )}
    >
      <AnnouncementBar />
      <div className="luxe-container flex h-20 items-center justify-between gap-4">
        <button
          className="lg:hidden"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Toggle menu"
        >
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>

        <Link href="/" className="flex items-center gap-2" aria-label={SITE.name}>
          <span className="font-serif text-2xl font-medium tracking-wide md:text-[28px]">
            Luxe
          </span>
          <span className="hidden font-serif text-2xl italic text-gold-500 md:inline">Perfume</span>
        </Link>

        <nav className="hidden items-center gap-8 lg:flex" aria-label="Main">
          {NAV.map((item) => (
            <Link key={item.href} href={item.href} className="luxe-link">
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-1 md:gap-2">
          <button
            onClick={() => setSearch(true)}
            className="rounded-full p-2 text-foreground/80 transition-colors hover:bg-muted hover:text-foreground"
            aria-label="Search"
          >
            <Search className="h-5 w-5" />
          </button>
          <Link
            href={user ? "/account/wishlist" : "/auth/login"}
            className="rounded-full p-2 text-foreground/80 transition-colors hover:bg-muted hover:text-foreground"
            aria-label="Wishlist"
          >
            <Heart className="h-5 w-5" />
          </Link>
          <Link
            href={user ? "/account/profile" : "/auth/login"}
            className="hidden rounded-full p-2 text-foreground/80 transition-colors hover:bg-muted hover:text-foreground sm:inline-flex"
            aria-label="Account"
          >
            {user ? <User className="h-5 w-5" /> : <LogIn className="h-5 w-5" />}
          </Link>
          <button
            onClick={openCart}
            className="relative rounded-full p-2 text-foreground/80 transition-colors hover:bg-muted hover:text-foreground"
            aria-label="Open cart"
          >
            <ShoppingBag className="h-5 w-5" />
            {cartCount > 0 && (
              <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-gold-500 px-1 text-[10px] font-medium text-background">
                {cartCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div className="border-t border-border bg-background lg:hidden">
          <nav className="luxe-container flex flex-col py-4" aria-label="Mobile">
            {NAV.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className="border-b border-border py-3 text-sm uppercase tracking-[0.18em]"
              >
                {item.label}
              </Link>
            ))}
            <Link
              href={user ? "/account/profile" : "/auth/login"}
              onClick={() => setMobileOpen(false)}
              className="border-b border-border py-3 text-sm uppercase tracking-[0.18em]"
            >
              {user ? "My Account" : "Sign In"}
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
}

function AnnouncementBar() {
  return (
    <div className="bg-ink-900 py-2 text-center text-[10px] uppercase tracking-[0.3em] text-background">
      <span className="opacity-90">Complimentary shipping on orders above ₹1,500</span>
      <span className="mx-3 text-gold-500">·</span>
      <span className="opacity-90">Discovery sets from ₹1,499</span>
    </div>
  );
}
