"use client";

import { useQuery } from "@tanstack/react-query";
import Image from "next/image";
import Link from "next/link";
import { useParams, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { useEffect } from "react";
import { Truck, Package, CheckCircle2, XCircle, Clock } from "lucide-react";

import { orderApi } from "@/lib/services";
import { formatCurrency, formatDate, getImageUrl } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

const TIMELINE: Record<string, { icon: any; label: string }> = {
  pending: { icon: Clock, label: "Pending" },
  paid: { icon: CheckCircle2, label: "Paid" },
  processing: { icon: Package, label: "Processing" },
  shipped: { icon: Truck, label: "Shipped" },
  out_for_delivery: { icon: Truck, label: "Out for Delivery" },
  delivered: { icon: CheckCircle2, label: "Delivered" },
  cancelled: { icon: XCircle, label: "Cancelled" },
  refunded: { icon: XCircle, label: "Refunded" },
};

export default function OrderDetailPage() {
  const params = useParams<{ orderNumber: string }>();
  const searchParams = useSearchParams();
  const isNew = searchParams.get("new") === "1";

  const { data, isLoading, error } = useQuery({
    queryKey: ["order", params.orderNumber],
    queryFn: () => orderApi.detail(params.orderNumber),
  });

  useEffect(() => {
    if (isNew) toast.success("Your order has been placed successfully!");
  }, [isNew]);

  if (isLoading) return <p className="text-muted-foreground">Loading…</p>;
  if (error || !data) return <p className="text-muted-foreground">Order not found.</p>;

  return (
    <div>
      <Link href="/account/orders" className="text-xs uppercase tracking-widest text-muted-foreground hover:text-foreground">
        ← Back to orders
      </Link>
      <div className="mt-3 flex flex-wrap items-baseline justify-between gap-3">
        <h1 className="font-serif text-3xl">{data.orderNumber}</h1>
        <Badge className="border-foreground">{data.statusDisplay}</Badge>
      </div>
      <p className="mt-1 text-sm text-muted-foreground">
        Placed on {formatDate(data.createdAt)} · {data.items.length} item(s)
      </p>

      <div className="mt-10 grid gap-10 lg:grid-cols-[1fr_360px]">
        <div className="space-y-8">
          <section>
            <h2 className="font-serif text-xl">Order Timeline</h2>
            <ol className="mt-4 space-y-3">
              {data.timeline.map((t) => {
                const cfg = TIMELINE[t.status] ?? TIMELINE.pending;
                const Icon = cfg.icon;
                return (
                  <li key={t.id} className="flex items-start gap-3 border-l-2 border-gold-500 pl-4">
                    <Icon className="mt-0.5 h-4 w-4 text-gold-600" />
                    <div>
                      <p className="text-sm font-medium">{cfg.label}</p>
                      <p className="text-xs text-muted-foreground">
                        {formatDate(t.createdAt)} · {t.note}
                      </p>
                    </div>
                  </li>
                );
              })}
            </ol>
          </section>

          <section>
            <h2 className="font-serif text-xl">Items</h2>
            <ul className="mt-4 divide-y divide-border border-y border-border">
              {data.items.map((item) => (
                <li key={item.id} className="flex items-center gap-4 py-4">
                  <div className="relative h-20 w-16 overflow-hidden bg-muted">
                    {item.productImage && (
                      <Image src={getImageUrl(item.productImage)} alt={item.productName} fill className="object-cover" sizes="64px" />
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">{item.productName}</p>
                    <p className="text-xs text-muted-foreground">SKU {item.productSku} · Qty {item.quantity}</p>
                  </div>
                  <p className="text-sm">{formatCurrency(item.lineTotal)}</p>
                </li>
              ))}
            </ul>
          </section>

          {data.trackingNumber && (
            <section className="border border-border p-4">
              <p className="text-xs uppercase tracking-widest text-muted-foreground">Tracking</p>
              <p className="mt-1 font-medium">{data.trackingNumber}</p>
              {data.trackingUrl && (
                <a href={data.trackingUrl} target="_blank" rel="noreferrer" className="navcci-link mt-1 inline-flex">
                  Track shipment →
                </a>
              )}
            </section>
          )}
        </div>

        <aside className="space-y-6">
          <div className="border border-border p-5">
            <h3 className="font-serif text-lg">Shipping Address</h3>
            <p className="mt-2 text-sm">
              {data.shippingFullName}<br />
              {data.shippingLine1}{data.shippingLine2 ? `, ${data.shippingLine2}` : ""}<br />
              {data.shippingCity}, {data.shippingState} {data.shippingPostalCode}<br />
              {data.shippingCountry} · {data.shippingPhone}
            </p>
          </div>
          <div className="border border-border p-5 text-sm">
            <h3 className="font-serif text-lg">Payment Summary</h3>
            <dl className="mt-3 space-y-2">
              <Row label="Subtotal" value={formatCurrency(data.subtotal)} />
              {data.discount ? <Row label="Discount" value={`- ${formatCurrency(data.discount)}`} accent /> : null}
              <Row label="Shipping" value={data.shippingCost ? formatCurrency(data.shippingCost) : "Free"} />
              {data.tax ? <Row label="Tax" value={formatCurrency(data.tax)} /> : null}
              <div className="my-2 h-px bg-border" />
              <Row label="Total" value={formatCurrency(data.total)} bold />
            </dl>
            <p className="mt-3 text-xs uppercase tracking-widest text-muted-foreground">
              Payment: <span className="capitalize">{data.paymentStatus}</span>
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
}

function Row({ label, value, bold, accent }: { label: string; value: string; bold?: boolean; accent?: boolean }) {
  return (
    <div className="flex justify-between">
      <dt className={bold ? "font-medium" : "text-muted-foreground"}>{label}</dt>
      <dd className={accent ? "text-gold-600" : bold ? "font-medium" : ""}>{value}</dd>
    </div>
  );
}
