"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";

import { orderApi } from "@/lib/services";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

const STATUS_COLORS: Record<string, string> = {
  pending: "border-muted-foreground/30 text-muted-foreground",
  paid: "border-gold-500 text-gold-700",
  processing: "border-blue-500 text-blue-700",
  shipped: "border-purple-500 text-purple-700",
  out_for_delivery: "border-indigo-500 text-indigo-700",
  delivered: "border-green-500 text-green-700",
  cancelled: "border-red-500 text-red-700",
  refunded: "border-red-500 text-red-700",
};

export default function OrdersPage() {
  const { data, isLoading } = useQuery({
    queryKey: ["orders"],
    queryFn: () => orderApi.list(),
  });

  if (isLoading) return <p className="text-muted-foreground">Loading orders…</p>;
  if (!data || data.length === 0) {
    return (
      <div>
        <h1 className="font-serif text-3xl">Orders</h1>
        <p className="mt-6 text-muted-foreground">You haven't placed any orders yet.</p>
        <Link href="/shop" className="navcci-link mt-3 inline-flex">Browse the collection →</Link>
      </div>
    );
  }

  return (
    <div>
      <h1 className="font-serif text-3xl">Orders</h1>
      <p className="mt-1 text-sm text-muted-foreground">{data.length} order(s) placed.</p>

      <div className="mt-8 divide-y divide-border border-y border-border">
        {data.map((o) => (
          <Link
            key={o.id}
            href={`/account/orders/${o.orderNumber}`}
            className="grid grid-cols-2 gap-3 py-5 transition-colors hover:bg-muted/50 md:grid-cols-5"
          >
            <div>
              <p className="text-xs uppercase tracking-widest text-muted-foreground">Order</p>
              <p className="font-medium">{o.orderNumber}</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-widest text-muted-foreground">Date</p>
              <p>{formatDate(o.createdAt)}</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-widest text-muted-foreground">Total</p>
              <p>{formatCurrency(o.total)}</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-widest text-muted-foreground">Payment</p>
              <p className="capitalize">{o.paymentStatus}</p>
            </div>
            <div>
              <Badge className={STATUS_COLORS[o.status] ?? ""}>{o.statusDisplay}</Badge>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
