import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { getCart } from "@/lib/server-cart";
import { CheckoutForm } from "@/components/checkout/checkout-form";

export const metadata: Metadata = { title: "Checkout", robots: { index: false } };

export default async function CheckoutPage() {
  // Authentication check is performed client-side; render the page which will redirect.
  const cart = await getCart();
  if (!cart || cart.itemCount === 0) redirect("/cart");

  return (
    <div className="luxe-container py-12">
      <h1 className="luxe-heading text-4xl">Checkout</h1>
      <p className="mt-2 text-muted-foreground">Complete your order — secure payments by Razorpay.</p>
      <div className="mt-10">
        <CheckoutForm initialCart={cart} />
      </div>
    </div>
  );
}
