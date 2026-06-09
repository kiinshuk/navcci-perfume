"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LogOut, User, MapPin, ShoppingBag, Heart, ShieldCheck } from "lucide-react";

import { useAuthStore } from "@/store/auth";
import { cn } from "@/lib/utils";

const ITEMS = [
  { href: "/account/profile", label: "Profile", icon: User },
  { href: "/account/orders", label: "Orders", icon: ShoppingBag },
  { href: "/account/wishlist", label: "Wishlist", icon: Heart },
  { href: "/account/addresses", label: "Addresses", icon: MapPin },
];

export function AccountSidebar() {
  const pathname = usePathname();
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const isAdmin = user?.role === "admin" || user?.role === "staff";

  return (
    <aside className="space-y-6">
      <div className="border border-border p-5">
        <p className="text-xs uppercase tracking-widest text-muted-foreground">Hello,</p>
        <p className="mt-1 font-serif text-2xl">{user?.fullName || user?.username}</p>
        <p className="text-xs text-muted-foreground">{user?.email}</p>
        {isAdmin && (
          <Link
            href="/admin/analytics"
            className="mt-4 inline-flex items-center gap-2 border border-gold-500 px-3 py-1.5 text-xs uppercase tracking-widest text-gold-700 hover:bg-gold-50"
          >
            <ShieldCheck className="h-3.5 w-3.5" /> Admin Dashboard
          </Link>
        )}
      </div>
      <nav className="border border-border">
        {ITEMS.map(({ href, label, icon: Icon }) => {
          const active = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-3 border-b border-border px-5 py-4 text-sm transition-colors last:border-0 hover:bg-muted",
                active && "bg-muted font-medium"
              )}
            >
              <Icon className="h-4 w-4" />
              {label}
            </Link>
          );
        })}
        <button
          onClick={() => logout()}
          className="flex w-full items-center gap-3 px-5 py-4 text-sm text-muted-foreground hover:bg-muted hover:text-foreground"
        >
          <LogOut className="h-4 w-4" /> Sign out
        </button>
      </nav>
    </aside>
  );
}
