import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { ProductCard } from "@/components/product/product-card";
import type { Product } from "@/types";

export function ProductSection({
  eyebrow,
  title,
  link,
  products,
}: {
  eyebrow: string;
  title: string;
  link?: { label: string; href: string };
  products: Product[];
}) {
  if (!products.length) return null;
  return (
    <section className="navcci-container py-20">
      <div className="mb-10 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="navcci-eyebrow text-gold-600">{eyebrow}</p>
          <h2 className="mt-2 navcci-heading text-3xl md:text-4xl">{title}</h2>
        </div>
        {link && (
          <Link href={link.href} className="navcci-link flex items-center gap-2">
            {link.label} <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        )}
      </div>
      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4 md:gap-8">
        {products.slice(0, 4).map((product, idx) => (
          <ProductCard key={product.id} product={product} priority={idx < 2} />
        ))}
      </div>
    </section>
  );
}
