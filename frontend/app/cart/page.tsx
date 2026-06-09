import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Minus, Plus, Trash2, ShoppingBag, Tag } from "lucide-react";

import { getCart } from "@/lib/server-cart";
import { formatCurrency, getImageUrl } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CartActions } from "@/components/cart/cart-actions";

export const metadata: Metadata = { title: "Cart", robots: { index: false } };

export default async function CartPage() {
  const cart = await getCart();

  if (!cart || cart.items.length === 0) {
    return (
      <div className="luxe-container py-24 text-center">
        <ShoppingBag className="mx-auto h-12 w-12 text-muted-foreground" />
        <h1 className="mt-6 luxe-heading text-4xl">Your cart is empty</h1>
        <p className="mt-3 text-muted-foreground">Begin your fragrance journey.</p>
        <Button asChild size="lg" className="mt-8">
          <Link href="/shop">Explore the Collection <ArrowRight className="h-4 w-4" /></Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="luxe-container py-12">
      <h1 className="luxe-heading text-4xl">Your Cart</h1>

      <div className="mt-10 grid gap-10 lg:grid-cols-[1fr_400px]">
        <ul className="divide-y divide-border border-y border-border">
          {cart.items.filter((i) => !i.savedForLater).map((item) => (
            <li key={item.id} className="grid grid-cols-[100px_1fr_auto] gap-4 py-6">
              <Link href={`/product/${item.productSlug}`} className="relative aspect-[3/4] w-full overflow-hidden bg-muted">
                {item.productImage && (
                  <Image src={getImageUrl(item.productImage)} alt={item.productName} fill className="object-cover" sizes="100px" />
                )}
              </Link>
              <div className="flex flex-col justify-between">
                <div>
                  <Link href={`/product/${item.productSlug}`} className="font-serif text-xl hover:underline">
                    {item.productName}
                  </Link>
                  <p className="mt-1 text-sm text-muted-foreground">{formatCurrency(item.unitPrice)}</p>
                </div>
                <CartActions itemId={item.id} quantity={item.quantity} />
              </div>
              <div className="text-right">
                <p className="font-medium">{formatCurrency(item.lineTotal)}</p>
                <CartActions.RemoveButton itemId={item.id} />
              </div>
            </li>
          ))}
        </ul>

        <aside className="h-fit border border-border p-6">
          <h2 className="font-serif text-2xl">Order Summary</h2>
          <dl className="mt-6 space-y-3 text-sm">
            <Row label="Subtotal" value={formatCurrency(cart.subtotal)} />
            {cart.discount ? <Row label="Discount" value={`- ${formatCurrency(cart.discount)}`} accent /> : null}
            <Row label="Shipping" value={cart.shipping ? formatCurrency(cart.shipping) : "Free"} />
            <div className="my-2 h-px bg-border" />
            <Row label="Total" value={formatCurrency(cart.total)} bold />
          </dl>

          <div className="mt-6 flex items-center gap-2 border border-border px-3 py-2 text-sm">
            <Tag className="h-4 w-4 text-gold-600" />
            <span className="text-muted-foreground">Coupon applied at checkout.</span>
          </div>

          <Button asChild size="lg" className="mt-6 w-full">
            <Link href="/checkout">Proceed to Checkout <ArrowRight className="h-4 w-4" /></Link>
          </Button>
          <p className="mt-3 text-center text-[11px] uppercase tracking-widest text-muted-foreground">
            Secure payments by Razorpay
          </p>
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
