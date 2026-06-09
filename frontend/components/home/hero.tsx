import Image from "next/image";
import Link from "next/link";

import { Button } from "@/components/ui/button";

export function Hero() {
  return (
    <section className="relative overflow-hidden bg-ink-50 dark:bg-ink-900">
      <div className="luxe-container grid items-center gap-12 py-20 md:grid-cols-2 md:py-32">
        <div className="space-y-7">
          <p className="luxe-eyebrow text-gold-600">Autumn / Winter 2025</p>
          <h1 className="luxe-heading text-5xl md:text-6xl lg:text-7xl">
            The Art of <span className="italic text-gold-500">Fine</span> Fragrance
          </h1>
          <p className="max-w-md text-base leading-relaxed text-muted-foreground">
            An atelier of hand-crafted niche perfumes, sourced from the world's most
            prestigious houses and bottled in our Mumbai atelier.
          </p>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Button asChild size="lg">
              <Link href="/shop">Explore the Collection</Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link href="/shop?category=oud-collection">Discover Oud</Link>
            </Button>
          </div>
        </div>

        <div className="relative aspect-[4/5] w-full overflow-hidden">
          <Image
            src="https://images.unsplash.com/photo-1541643600914-78b084683601?w=1200&q=80"
            alt="Luxury perfume bottle"
            fill
            priority
            sizes="(max-width: 768px) 100vw, 50vw"
            className="object-cover"
          />
          <div className="absolute inset-x-6 bottom-6 flex items-center justify-between bg-background/85 px-5 py-4 backdrop-blur">
            <div>
              <p className="luxe-eyebrow">Bestseller</p>
              <p className="font-serif text-lg">Noir Velours</p>
            </div>
            <Link href="/product/noir-velours" className="luxe-link">Shop →</Link>
          </div>
        </div>
      </div>
    </section>
  );
}
