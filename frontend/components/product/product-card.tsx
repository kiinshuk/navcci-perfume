"use client";

import Image from "next/image";
import Link from "next/link";
import { Heart, ShoppingBag } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useCartStore } from "@/store/cart";
import { useAuthStore } from "@/store/auth";
import { wishlistApi } from "@/lib/services";
import { cn, discountPercent, formatCurrency, getImageUrl } from "@/lib/utils";
import { toast } from "sonner";
import type { Product } from "@/types";
import { useState } from "react";

export function ProductCard({ product, priority = false }: { product: Product; priority?: boolean }) {
  const addItem = useCartStore((s) => s.addItem);
  const user = useAuthStore((s) => s.user);
  const [isHover, setIsHover] = useState(false);
  const [adding, setAdding] = useState(false);

  const onAdd = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (!user) {
      toast.message("Please sign in to add items to your cart.");
      window.location.href = "/auth/login?next=/product/" + product.slug;
      return;
    }
    setAdding(true);
    try {
      await addItem(product.id, 1);
      toast.success(`${product.name} added to your cart.`);
    } catch (err) {
      toast.error("Could not add to cart. Please try again.");
    } finally {
      setAdding(false);
    }
  };

  const onWishlist = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (!user) {
      toast.message("Sign in to save favourites.");
      return;
    }
    try {
      await wishlistApi.add(product.id);
      toast.success(`${product.name} saved to your wishlist.`);
    } catch {
      toast.error("Could not update wishlist.");
    }
  };

  const off = discountPercent(product.price, product.salePrice);

  return (
    <Link
      href={`/product/${product.slug}`}
      className="group block"
      onMouseEnter={() => setIsHover(true)}
      onMouseLeave={() => setIsHover(false)}
    >
      <div className="relative aspect-[3/4] overflow-hidden bg-muted">
        {product.primaryImage ? (
          <Image
            src={getImageUrl(product.primaryImage)}
            alt={product.name}
            fill
            priority={priority}
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
            className={cn(
              "object-cover transition-transform duration-[1500ms] ease-out group-hover:scale-105"
            )}
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-muted-foreground">
            <span className="navcci-eyebrow">Navcci Perfume</span>
          </div>
        )}

        <div className="absolute left-3 top-3 flex flex-col gap-2">
          {product.isNewArrival && <Badge>New</Badge>}
          {off > 0 && <Badge className="bg-foreground text-background">-{off}%</Badge>}
          {product.isBestseller && <Badge className="border-gold-500 text-gold-600">Bestseller</Badge>}
        </div>

        <button
          onClick={onWishlist}
          aria-label="Save to wishlist"
          className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full bg-background/80 text-foreground/80 backdrop-blur transition hover:text-foreground"
        >
          <Heart className="h-4 w-4" />
        </button>

        <div
          className={cn(
            "absolute inset-x-0 bottom-0 flex justify-center p-3 transition-all duration-500",
            isHover ? "translate-y-0 opacity-100" : "translate-y-3 opacity-0"
          )}
        >
          <Button
            variant="default"
            size="sm"
            onClick={onAdd}
            disabled={adding || !product.inStock}
            className="w-full"
          >
            <ShoppingBag className="h-4 w-4" />
            {product.inStock ? (adding ? "Adding…" : "Add to Cart") : "Sold Out"}
          </Button>
        </div>
      </div>

      <div className="px-1 pt-4">
        <p className="navcci-eyebrow">{product.brand?.name}</p>
        <h3 className="mt-1 font-serif text-lg leading-tight">{product.name}</h3>
        <p className="mt-1 line-clamp-1 text-xs text-muted-foreground">{product.shortDescription}</p>
        <div className="mt-2 flex items-baseline gap-2">
          <span className="text-sm font-medium">{formatCurrency(product.displayPrice)}</span>
          {off > 0 && (
            <span className="text-xs text-muted-foreground line-through">
              {formatCurrency(product.price)}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
