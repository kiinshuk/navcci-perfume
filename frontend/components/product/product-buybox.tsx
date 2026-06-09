"use client";

import { useState } from "react";
import { Heart, Minus, Plus, ShoppingBag, Truck, ShieldCheck } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { StarRating } from "./star-rating";
import { useAuthStore } from "@/store/auth";
import { useCartStore } from "@/store/cart";
import { wishlistApi } from "@/lib/services";
import { cn, discountPercent, formatCurrency } from "@/lib/utils";
import type { Product } from "@/types";

export function ProductBuyBox({ product }: { product: Product }) {
  const [quantity, setQuantity] = useState(1);
  const user = useAuthStore((s) => s.user);
  const addItem = useCartStore((s) => s.addItem);
  const cartItem = useCartStore((s) => s.getItem(product.id));
  const [loading, setLoading] = useState(false);
  const off = discountPercent(product.price, product.salePrice);

  const onAdd = async () => {
    if (!user) {
      toast.message("Please sign in to add items to your cart.");
      window.location.href = `/auth/login?next=/product/${product.slug}`;
      return;
    }
    setLoading(true);
    try {
      await addItem(product.id, quantity);
      toast.success(`${product.name} added to your cart.`);
    } catch {
      toast.error("Could not add to cart.");
    } finally {
      setLoading(false);
    }
  };

  const onWishlist = async () => {
    if (!user) {
      toast.message("Sign in to save favourites.");
      return;
    }
    try {
      await wishlistApi.add(product.id);
      toast.success(`${product.name} saved.`);
    } catch {
      toast.error("Could not update wishlist.");
    }
  };

  return (
    <div className="space-y-7">
      <div>
        <p className="navcci-eyebrow">{product.brand?.name}</p>
        <h1 className="mt-2 navcci-heading text-3xl md:text-4xl">{product.name}</h1>
        <p className="mt-2 text-sm text-muted-foreground">{product.shortDescription}</p>

        <div className="mt-4 flex items-center gap-3">
          <StarRating value={product.averageRating} />
          <span className="text-xs text-muted-foreground">
            {product.averageRating.toFixed(1)} · {product.reviewCount} reviews
          </span>
        </div>
      </div>

      <div className="flex items-baseline gap-3">
        <span className="font-serif text-3xl">{formatCurrency(product.displayPrice)}</span>
        {off > 0 && (
          <>
            <span className="text-base text-muted-foreground line-through">
              {formatCurrency(product.price)}
            </span>
            <Badge className="border-foreground bg-foreground text-background">Save {off}%</Badge>
          </>
        )}
        <span className="text-xs text-muted-foreground">incl. of all taxes</span>
      </div>

      <div className="grid grid-cols-3 gap-2 border-y border-border py-4 text-center text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
        <div>
          <p className="text-foreground/90">Concentration</p>
          <p>{product.concentration}</p>
        </div>
        <div className="border-x border-border">
          <p className="text-foreground/90">Volume</p>
          <p>{product.volumeMl}ml</p>
        </div>
        <div>
          <p className="text-foreground/90">For</p>
          <p className="capitalize">{product.gender}</p>
        </div>
      </div>

      <div className="flex flex-col gap-4">
        {product.inStock ? (
          <div className="flex items-center gap-4">
            <span className="navcci-eyebrow">Quantity</span>
            <div className="flex items-center border border-border">
              <button
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="px-3 py-2 hover:bg-muted"
                aria-label="Decrease quantity"
              >
                <Minus className="h-4 w-4" />
              </button>
              <span className="w-10 text-center text-sm">{quantity}</span>
              <button
                onClick={() => setQuantity(Math.min(20, quantity + 1))}
                className="px-3 py-2 hover:bg-muted"
                aria-label="Increase quantity"
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>
            {cartItem && (
              <span className="text-xs text-muted-foreground">{cartItem.quantity} in your cart</span>
            )}
          </div>
        ) : (
          <p className="text-sm uppercase tracking-widest text-muted-foreground">Out of stock</p>
        )}

        <div className="flex flex-col gap-3 sm:flex-row">
          <Button
            size="lg"
            variant="default"
            onClick={onAdd}
            disabled={loading || !product.inStock}
            className="flex-1"
          >
            <ShoppingBag className="h-4 w-4" />
            {loading ? "Adding…" : product.inStock ? "Add to Cart" : "Notify Me"}
          </Button>
          <Button size="lg" variant="outline" onClick={onWishlist}>
            <Heart className="h-4 w-4" />
            Save
          </Button>
        </div>
      </div>

      <div className="grid gap-3 border-t border-border pt-6 text-sm">
        <div className="flex items-center gap-3 text-muted-foreground">
          <Truck className="h-4 w-4 text-foreground" />
          Complimentary shipping above ₹1,500 · 2–5 day delivery across India.
        </div>
        <div className="flex items-center gap-3 text-muted-foreground">
          <ShieldCheck className="h-4 w-4 text-foreground" />
          100% authentic · Batch-tested · Sealed at the atelier.
        </div>
      </div>
    </div>
  );
}
