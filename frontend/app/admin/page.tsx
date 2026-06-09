import type { Metadata } from "next";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Package, ShoppingBag, Users, Tag, BarChart3, MessageSquare } from "lucide-react";

import { api, getAccessToken } from "@/lib/api";

export const metadata: Metadata = { title: "Admin Dashboard", robots: { index: false } };

const TILES = [
  { href: "/admin/products", label: "Products", icon: Package, desc: "Manage catalogue & inventory" },
  { href: "/admin/orders", label: "Orders", icon: ShoppingBag, desc: "Process, ship, refund" },
  { href: "/admin/customers", label: "Customers", icon: Users, desc: "Members & segments" },
  { href: "/admin/coupons", label: "Coupons", icon: Tag, desc: "Discounts & free shipping" },
  { href: "/admin/reviews", label: "Reviews", icon: MessageSquare, desc: "Moderation queue" },
  { href: "/admin/analytics", label: "Analytics", icon: BarChart3, desc: "Sales & conversion" },
];

export default async function AdminHome() {
  if (!getAccessToken()) redirect("/auth/login?next=/admin/analytics");

  let stats: any = {};
  try {
    const { data } = await api.get("/orders/orders/stats/");
    stats = data;
  } catch {}

  return (
    <div className="luxe-container py-12">
      <h1 className="font-serif text-4xl">Admin Dashboard</h1>
      <p className="mt-1 text-sm text-muted-foreground">Welcome back. Here's the snapshot.</p>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Stat label="Revenue (30d)" value={`₹${(stats.revenue_30d || 0).toLocaleString("en-IN")}`} />
        <Stat label="Total Orders" value={stats.total_orders ?? 0} />
        <Stat label="Pending" value={stats.pending_orders ?? 0} />
        <Stat label="Customers" value={stats.total_customers ?? 0} />
      </div>

      <h2 className="mt-12 font-serif text-2xl">Modules</h2>
      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {TILES.map(({ href, label, icon: Icon, desc }) => (
          <Link
            key={href}
            href={href}
            className="group block border border-border p-6 transition hover:border-foreground hover:shadow-[0_8px_30px_rgba(0,0,0,0.06)]"
          >
            <Icon className="h-5 w-5 text-gold-600" />
            <h3 className="mt-4 font-serif text-xl">{label}</h3>
            <p className="mt-1 text-sm text-muted-foreground">{desc}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="border border-border p-5">
      <p className="luxe-eyebrow">{label}</p>
      <p className="mt-2 font-serif text-3xl">{value}</p>
    </div>
  );
}
