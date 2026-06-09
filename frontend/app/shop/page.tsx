import type { Metadata } from "next";
import { Suspense } from "react";

import { productsApi } from "@/lib/services";
import { ProductCard } from "@/components/product/product-card";
import { ShopFilters } from "@/components/product/shop-filters";
import { ShopSort } from "@/components/product/shop-sort";
import { Pagination } from "@/components/product/pagination";

export const metadata: Metadata = {
  title: "Shop the Collection",
  description: "Discover the complete Navcci Perfume collection — hand-crafted niche fragrances.",
  alternates: { canonical: "/shop" },
};

interface PageProps {
  searchParams: Record<string, string | string[] | undefined>;
}

function toQuery(value: string | string[] | undefined): string | undefined {
  if (Array.isArray(value)) return value[0];
  return value;
}

export default async function ShopPage({ searchParams }: PageProps) {
  const params: Record<string, string> = {};
  const page = toQuery(searchParams.page) ?? "1";
  const ordering = toQuery(searchParams.sort) ?? "";
  const minPrice = toQuery(searchParams.min_price);
  const maxPrice = toQuery(searchParams.max_price);
  const gender = toQuery(searchParams.gender);
  const fragranceFamily = toQuery(searchParams.fragrance_family);
  const brand = toQuery(searchParams.brand);
  const minRating = toQuery(searchParams.min_rating);
  const filter = toQuery(searchParams.filter);
  const search = toQuery(searchParams.q);

  if (page) params.page = page;
  if (ordering) params.ordering = ordering;
  if (minPrice) params.min_price = minPrice;
  if (maxPrice) params.max_price = maxPrice;
  if (gender) params.gender = gender;
  if (fragranceFamily) params.fragrance_family = fragranceFamily;
  if (brand) params.brand = brand;
  if (minRating) params.min_rating = minRating;
  if (search) params.search = search;
  if (filter === "new") params.is_new_arrival = "true";
  if (filter === "bestseller") params.is_bestseller = "true";
  if (filter === "featured") params.is_featured = "true";

  const data = await productsApi.list(params).catch(() => ({ results: [], count: 0, totalPages: 1, page: 1 } as any));

  return (
    <div className="navcci-container py-12">
      <header className="border-b border-border pb-8">
        <p className="navcci-eyebrow text-gold-600">The Collection</p>
        <h1 className="mt-2 navcci-heading text-4xl md:text-5xl">Shop All Fragrances</h1>
        <p className="mt-3 max-w-2xl text-muted-foreground">
          Explore our hand-curated world of niche perfumery. Filter by family, mood or house
          to find your next signature.
        </p>
      </header>

      <div className="grid gap-10 pt-10 lg:grid-cols-[280px_1fr]">
        <aside>
          <Suspense>
            <ShopFilters />
          </Suspense>
        </aside>

        <section>
          <div className="mb-6 flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              Showing <strong>{data.results.length}</strong> of {data.count} fragrances
            </p>
            <Suspense>
              <ShopSort />
            </Suspense>
          </div>

          {data.results.length === 0 ? (
            <div className="border border-dashed border-border p-12 text-center">
              <p className="font-serif text-2xl">No fragrances match your selection.</p>
              <p className="mt-2 text-sm text-muted-foreground">Try adjusting your filters.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4 md:grid-cols-3 md:gap-8">
              {data.results.map((product, idx) => (
                <ProductCard key={product.id} product={product} priority={idx < 3} />
              ))}
            </div>
          )}

          <Pagination page={data.page} totalPages={data.totalPages} />
        </section>
      </div>
    </div>
  );
}
