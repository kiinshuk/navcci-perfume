"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import Image from "next/image";
import { Heart } from "lucide-react";

import { wishlistApi } from "@/lib/services";
import { formatCurrency, getImageUrl } from "@/lib/utils";
import { ProductCard } from "@/components/product/product-card";
import type { Product } from "@/types";

export default function WishlistPage() {
  const { data, isLoading } = useQuery({
    queryKey: ["wishlist"],
    queryFn: () => wishlistApi.get(),
  });

  if (isLoading) return <p className="text-muted-foreground">Loading your wishlist…</p>;

  const products: Product[] = (data?.products as unknown as Product[]) ?? [];

  if (products.length === 0) {
    return (
      <div>
        <h1 className="font-serif text-3xl">Wishlist</h1>
        <div className="mt-12 text-center">
          <Heart className="mx-auto h-10 w-10 text-muted-foreground" />
          <p className="mt-4 text-muted-foreground">Your wishlist is empty.</p>
          <Link href="/shop" className="luxe-link mt-3 inline-flex">Browse the collection →</Link>
        </div>
      </div>
    );
  }

  return (
    <div>
      <h1 className="font-serif text-3xl">Wishlist</h1>
      <p className="mt-1 text-sm text-muted-foreground">{products.length} saved fragrance(s).</p>
      <div className="mt-8 grid grid-cols-2 gap-4 md:grid-cols-3 md:gap-8">
        {products.map((p) => (
          <ProductCard key={p.id} product={p} />
        ))}
      </div>
    </div>
  );
}
