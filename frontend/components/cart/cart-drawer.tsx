"use client";

import Link from "next/link";
import Image from "next/image";
import { X, Minus, Plus, ShoppingBag, ArrowRight } from "lucide-react";
import { toast } from "sonner";

import { useCartStore } from "@/store/cart";
import { useAuthStore } from "@/store/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn, formatCurrency, getImageUrl } from "@/lib/utils";
import { useState } from "react";

export function CartDrawer() {
  const isOpen = useCartStore((s) => s.isOpen);
  const close = useCartStore((s) => s.closeCart);
  const cart = useCartStore((s) => s.cart);
  const updateItem = useCartStore((s) => s.updateItem);
  const removeItem = useCartStore((s) => s.removeItem);
  const applyCoupon = useCartStore((s) => s.applyCoupon);
  const removeCoupon = useCartStore((s) => s.removeCoupon);
  const user = useAuthStore((s) => s.user);
  const [code, setCode] = useState("");
  const [couponLoading, setCouponLoading] = useState(false);

  const onApply = async () => {
    if (!code.trim()) return;
    setCouponLoading(true);
    const res = await applyCoupon(code.trim());
    setCouponLoading(false);
    if (res.ok) {
      toast.success("Coupon applied.");
      setCode("");
    } else {
      toast.error(res.error || "Invalid coupon.");
    }
  };

  const items = cart?.items?.filter((i) => !i.savedForLater) ?? [];
  const saved = cart?.items?.filter((i) => i.savedForLater) ?? [];

  return (
    <>
      <div
        className={cn(
          "fixed inset-0 z-40 bg-black/50 transition-opacity duration-300",
          isOpen ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0"
        )}
        onClick={close}
        aria-hidden
      />
      <aside
        className={cn(
          "fixed right-0 top-0 z-50 flex h-full w-full max-w-md flex-col border-l border-border bg-background transition-transform duration-500",
          isOpen ? "translate-x-0" : "translate-x-full"
        )}
        role="dialog"
        aria-label="Shopping cart"
      >
        <header className="flex items-center justify-between border-b border-border px-6 py-5">
          <h2 className="font-serif text-2xl">Your Cart ({items.length})</h2>
          <button onClick={close} aria-label="Close cart">
            <X className="h-5 w-5" />
          </button>
        </header>

        {!user && (
          <div className="border-b border-border bg-muted/50 px-6 py-3 text-xs">
            <Link href="/auth/login" className="navcci-link" onClick={close}>
              Sign in
            </Link>{" "}
            to sync your cart & unlock member rewards.
          </div>
        )}

        <div className="flex-1 overflow-y-auto px-6 py-4">
          {items.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center text-center">
              <ShoppingBag className="h-10 w-10 text-muted-foreground" />
              <p className="mt-4 font-serif text-xl">Your cart is empty</p>
              <p className="mt-2 text-sm text-muted-foreground">Begin your fragrance journey.</p>
              <Button asChild className="mt-6" onClick={close}>
                <Link href="/shop">Discover the Collection</Link>
              </Button>
            </div>
          ) : (
            <ul className="space-y-4">
              {items.map((item) => (
                <li key={item.id} className="flex gap-3 border-b border-border pb-4">
                  <div className="relative h-24 w-20 flex-shrink-0 overflow-hidden bg-muted">
                    {item.productImage && (
                      <Image src={getImageUrl(item.productImage)} alt={item.productName} fill className="object-cover" sizes="80px" />
                    )}
                  </div>
                  <div className="flex flex-1 flex-col justify-between">
                    <div>
                      <Link
                        href={`/product/${item.productSlug}`}
                        className="font-serif text-base leading-tight hover:underline"
                        onClick={close}
                      >
                        {item.productName}
                      </Link>
                      <p className="mt-1 text-xs text-muted-foreground">{formatCurrency(item.unitPrice)}</p>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center border border-border">
                        <button
                          className="px-2 py-1 hover:bg-muted"
                          onClick={() => updateItem(item.id, Math.max(1, item.quantity - 1))}
                          aria-label="Decrease"
                        >
                          <Minus className="h-3 w-3" />
                        </button>
                        <span className="w-8 text-center text-xs">{item.quantity}</span>
                        <button
                          className="px-2 py-1 hover:bg-muted"
                          onClick={() => updateItem(item.id, Math.min(20, item.quantity + 1))}
                          aria-label="Increase"
                        >
                          <Plus className="h-3 w-3" />
                        </button>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-medium">{formatCurrency(item.lineTotal)}</span>
                        <button
                          onClick={() => removeItem(item.id)}
                          className="text-xs text-muted-foreground underline-offset-4 hover:underline"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}

          {saved.length > 0 && (
            <div className="mt-8">
              <p className="navcci-eyebrow text-gold-600">Saved for Later</p>
              <ul className="mt-3 space-y-3">
                {saved.map((item) => (
                  <li key={item.id} className="flex items-center gap-3 text-sm">
                    <div className="relative h-14 w-12 flex-shrink-0 overflow-hidden bg-muted">
                      {item.productImage && (
                        <Image src={getImageUrl(item.productImage)} alt={item.productName} fill className="object-cover" sizes="48px" />
                      )}
                    </div>
                    <span className="flex-1">{item.productName}</span>
                    <span>{formatCurrency(item.unitPrice)}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {items.length > 0 && (
          <div className="border-t border-border bg-background px-6 py-5">
            {cart?.coupon ? (
              <div className="mb-3 flex items-center justify-between rounded-sm bg-muted px-3 py-2 text-xs">
                <span>
                  Coupon <strong>{cart.coupon.code}</strong> applied
                </span>
                <button onClick={removeCoupon} className="text-muted-foreground hover:underline">
                  Remove
                </button>
              </div>
            ) : (
              user && (
                <div className="mb-3 flex gap-2">
                  <Input
                    placeholder="Coupon code"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    className="h-10"
                  />
                  <Button size="sm" onClick={onApply} disabled={couponLoading}>
                    {couponLoading ? "…" : "Apply"}
                  </Button>
                </div>
              )
            )}
            <dl className="space-y-1 text-sm">
              <Row label="Subtotal" value={formatCurrency(cart?.subtotal ?? 0)} />
              {cart?.discount ? <Row label="Discount" value={`- ${formatCurrency(cart.discount)}`} accent /> : null}
              <Row label="Shipping" value={cart?.shipping ? formatCurrency(cart.shipping) : "Free"} />
              <div className="my-2 h-px bg-border" />
              <Row label="Total" value={formatCurrency(cart?.total ?? 0)} bold />
            </dl>
            <Button asChild size="lg" className="mt-5 w-full" onClick={close}>
              <Link href="/checkout">
                Checkout <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        )}
      </aside>
    </>
  );
}

function Row({ label, value, bold, accent }: { label: string; value: string; bold?: boolean; accent?: boolean }) {
  return (
    <div className="flex justify-between">
      <dt className={cn("text-muted-foreground", bold && "font-medium text-foreground")}>{label}</dt>
      <dd className={cn(accent && "text-gold-600", bold && "font-medium")}>{value}</dd>
    </div>
  );
}
