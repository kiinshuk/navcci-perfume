"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
// import Script from "next/script"; // Razorpay — temporarily disabled
import Image from "next/image";
import { toast } from "sonner";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { formatCurrency, getImageUrl } from "@/lib/utils";
import { useAuthStore } from "@/store/auth";
import { orderApi } from "@/lib/services";
import type { Cart } from "@/types";

const schema = z.object({
  shippingFullName: z.string().min(2),
  shippingPhone: z.string().min(10),
  shippingLine1: z.string().min(3),
  shippingLine2: z.string().optional(),
  shippingCity: z.string().min(2),
  shippingState: z.string().min(2),
  shippingPostalCode: z.string().min(4),
  billingSameAsShipping: z.boolean().default(true),
  notes: z.string().optional(),
  couponCode: z.string().optional(),
});
type FormData = z.infer<typeof schema>;

// Razorpay types — temporarily disabled; will be re-enabled once the
// payment gateway is configured for production.
// declare global {
//   interface Window {
//     Razorpay?: any;
//   }
// }

export function CheckoutForm({ initialCart }: { initialCart: Cart }) {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const [cart, setCart] = useState<Cart>(initialCart);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!user) router.replace(`/auth/login?next=/checkout`);
  }, [user, router]);

  const form = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { billingSameAsShipping: true },
  });

  // TEMPORARY: Razorpay checkout flow is disabled. The order is still
  // created via the backend and marked as Pending payment, then we
  // navigate the customer to the order detail page.
  const onSubmit = async (data: FormData) => {
    setSubmitting(true);
    try {
      const response = await orderApi.checkout(data);
      setCart(response.order as any);
      toast.success("Order placed. Complete payment to confirm.");
      router.replace(`/account/orders/${response.order.orderNumber}?new=1`);
    } catch (err: any) {
      toast.error(err?.response?.data?.error?.message ?? "Checkout failed. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  // TEMPORARY: Razorpay integration will be re-enabled once payment
  // gateway is configured.
  // const openRazorpay = (orderNumber: string, razorpay: { id: string; amount: number; currency: string; key_id: string }) => {
  //   if (!window.Razorpay) {
  //     toast.error("Razorpay failed to load.");
  //     return;
  //   }
  //   const options = {
  //     key: razorpay.key_id,
  //     amount: razorpay.amount,
  //     currency: razorpay.currency,
  //     name: "Luxe Perfume",
  //     description: `Order ${orderNumber}`,
  //     order_id: razorpay.id,
  //     prefill: { name: user?.fullName, email: user?.email, contact: user?.phone },
  //     theme: { color: "#A87C2F" },
  //     handler: async (resp: any) => {
  //       try {
  //         await orderApi.capturePayment({
  //           orderId: orderNumber,
  //           paymentId: resp.razorpay_payment_id,
  //           signature: resp.razorpay_signature,
  //         });
  //         toast.success("Payment successful! Order placed.");
  //         router.replace(`/account/orders/${orderNumber}?new=1`);
  //       } catch (err: any) {
  //         toast.error("Payment captured but verification failed. Our team will assist.");
  //         router.replace(`/account/orders/${orderNumber}`);
  //       }
  //     },
  //     modal: {
  //       ondismiss: () => {
  //         toast.message("Checkout cancelled.");
  //         router.replace(`/account/orders/${orderNumber}`);
  //       },
  //     },
  //   };
  //   const rzp = new window.Razorpay(options);
  //   rzp.open();
  // };

  const items = useMemo(() => cart.items.filter((i) => !i.savedForLater), [cart]);

  return (
    <>
      {/* <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="lazyOnload" /> */}
      <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-10 lg:grid-cols-[1fr_400px]">
        <div className="space-y-10">
          <Section title="Contact">
            <p className="text-sm text-muted-foreground">{user?.email}</p>
          </Section>

          <Section title="Shipping Address">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Full Name" error={form.formState.errors.shippingFullName?.message}>
                <Input {...form.register("shippingFullName")} />
              </Field>
              <Field label="Phone" error={form.formState.errors.shippingPhone?.message}>
                <Input {...form.register("shippingPhone")} />
              </Field>
              <Field label="Address line 1" className="sm:col-span-2" error={form.formState.errors.shippingLine1?.message}>
                <Input {...form.register("shippingLine1")} />
              </Field>
              <Field label="Address line 2 (optional)" className="sm:col-span-2">
                <Input {...form.register("shippingLine2")} />
              </Field>
              <Field label="City" error={form.formState.errors.shippingCity?.message}>
                <Input {...form.register("shippingCity")} />
              </Field>
              <Field label="State" error={form.formState.errors.shippingState?.message}>
                <Input {...form.register("shippingState")} />
              </Field>
              <Field label="Postal Code" error={form.formState.errors.shippingPostalCode?.message}>
                <Input {...form.register("shippingPostalCode")} />
              </Field>
            </div>
            <div className="mt-4 flex items-center gap-2">
              <Checkbox
                id="billing-same"
                checked={form.watch("billingSameAsShipping")}
                onCheckedChange={(v) => form.setValue("billingSameAsShipping", Boolean(v))}
              />
              <Label htmlFor="billing-same" className="cursor-pointer normal-case tracking-normal text-sm">
                Billing address is the same as shipping
              </Label>
            </div>
          </Section>

          <Section title="Order Notes (optional)">
            <textarea
              {...form.register("notes")}
              rows={3}
              className="w-full border border-input bg-background px-4 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              placeholder="Gift wrap, delivery instructions…"
            />
          </Section>
        </div>

        <aside className="h-fit border border-border p-6">
          <h2 className="font-serif text-2xl">Your Order</h2>
          <ul className="mt-6 space-y-4">
            {items.map((item) => (
              <li key={item.id} className="flex items-center gap-3">
                <div className="relative h-16 w-14 flex-shrink-0 overflow-hidden bg-muted">
                  {item.productImage && (
                    <Image src={getImageUrl(item.productImage)} alt={item.productName} fill className="object-cover" sizes="56px" />
                  )}
                </div>
                <div className="flex-1 text-sm">
                  <p className="font-medium leading-tight">{item.productName}</p>
                  <p className="text-muted-foreground">Qty {item.quantity}</p>
                </div>
                <p className="text-sm font-medium">{formatCurrency(item.lineTotal)}</p>
              </li>
            ))}
          </ul>
          <div className="my-6 h-px bg-border" />
          <dl className="space-y-2 text-sm">
            <Row label="Subtotal" value={formatCurrency(cart.subtotal)} />
            {cart.discount ? <Row label="Discount" value={`- ${formatCurrency(cart.discount)}`} accent /> : null}
            <Row label="Shipping" value={cart.shipping ? formatCurrency(cart.shipping) : "Free"} />
            <div className="my-2 h-px bg-border" />
            <Row label="Total" value={formatCurrency(cart.total)} bold />
          </dl>
          <Button type="submit" size="lg" disabled={submitting} className="mt-6 w-full">
            {submitting ? "Placing order…" : "Place Order"}
          </Button>
          <p className="mt-3 text-center text-[11px] uppercase tracking-widest text-muted-foreground">
            Online payments coming soon
          </p>
        </aside>
      </form>
    </>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h2 className="font-serif text-2xl">{title}</h2>
      <div className="mt-4">{children}</div>
    </section>
  );
}

function Field({
  label,
  children,
  className,
  error,
}: {
  label: string;
  children: React.ReactNode;
  className?: string;
  error?: string;
}) {
  return (
    <div className={className}>
      <Label className="mb-2 block normal-case tracking-normal text-xs text-foreground/80">{label}</Label>
      {children}
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
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
