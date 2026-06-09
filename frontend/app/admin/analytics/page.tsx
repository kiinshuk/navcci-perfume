"use client";

import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";

export default function AnalyticsPage() {
  const { data, isLoading } = useQuery({
    queryKey: ["analytics"],
    queryFn: async () => (await api.get("/orders/orders/stats/")).data,
  });

  if (isLoading) return <p>Loading…</p>;

  return (
    <div>
      <h1 className="font-serif text-4xl">Analytics</h1>
      <p className="mt-1 text-sm text-muted-foreground">Sales performance and key metrics.</p>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Tile label="Revenue (30d)" value={`₹${(data?.revenue_30d || 0).toLocaleString("en-IN")}`} />
        <Tile label="Paid Orders" value={data?.paid_orders ?? 0} />
        <Tile label="Total Orders" value={data?.total_orders ?? 0} />
        <Tile label="Customers" value={data?.total_customers ?? 0} />
      </div>

      <div className="mt-12">
        <h2 className="font-serif text-2xl">Sales Trend (30d)</h2>
        <div className="mt-4 h-72 border border-border bg-muted/30 p-4">
          <p className="text-sm text-muted-foreground">Connect a charting library (Recharts / Tremor) to render here.</p>
        </div>
      </div>
    </div>
  );
}

function Tile({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="border border-border p-5">
      <p className="luxe-eyebrow">{label}</p>
      <p className="mt-2 font-serif text-3xl">{value}</p>
    </div>
  );
}
