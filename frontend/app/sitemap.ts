import type { MetadataRoute } from "next";
import { productsApi } from "@/lib/services";
import type { Product } from "@/types";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = process.env.NEXT_PUBLIC_SITE_URL || "https://navcciperfume.in";
  const data = await productsApi.list().catch(() => ({ results: [] as Product[] }));
  const staticRoutes = ["", "/shop", "/about", "/contact", "/privacy", "/terms", "/shipping", "/returns"];

  return [
    ...staticRoutes.map((p) => ({ url: `${base}${p}`, lastModified: new Date(), changeFrequency: "weekly" as const, priority: 0.8 })),
    ...(data.results ?? []).map((p) => ({ url: `${base}/product/${p.slug}`, lastModified: new Date(), changeFrequency: "daily" as const, priority: 0.7 })),
  ];
}
