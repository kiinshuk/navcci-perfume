import type { MetadataRoute } from "next";
import { productsApi } from "@/lib/services";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = process.env.NEXT_PUBLIC_SITE_URL || "https://luxeperfume.in";
  const data = await productsApi.list().catch(() => ({ results: [] } as any));
  const staticRoutes = ["", "/shop", "/about", "/contact", "/privacy", "/terms", "/shipping", "/returns"];

  return [
    ...staticRoutes.map((p) => ({ url: `${base}${p}`, lastModified: new Date(), changeFrequency: "weekly" as const, priority: 0.8 })),
    ...(data.results ?? []).map((p) => ({ url: `${base}/product/${p.slug}`, lastModified: new Date(p.createdAt), changeFrequency: "daily" as const, priority: 0.7 })),
  ];
}
