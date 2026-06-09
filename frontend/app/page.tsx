import type { Metadata } from "next";
import { Suspense } from "react";

import { productsApi } from "@/lib/services";
import { Hero } from "@/components/home/hero";
import { ProductSection } from "@/components/home/product-section";
import { Testimonials } from "@/components/home/testimonials";
import { InstagramGallery } from "@/components/home/instagram-gallery";
import { BrandStory } from "@/components/home/brand-story";
import { Marquee } from "@/components/home/marquee";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Navcci Perfume — The Art of Fine Fragrance",
  description:
    "Discover hand-crafted niche perfumes from the world's most prestigious houses. Complimentary shipping across India on orders above ₹1,500.",
  alternates: { canonical: "/" },
  openGraph: {
    title: "Navcci Perfume — The Art of Fine Fragrance",
    description: "Hand-crafted niche perfumes from the world's most prestigious houses.",
  },
};

export default async function HomePage() {
  const [featured, bestsellers, newArrivals] = await Promise.all([
    productsApi.featured().catch(() => []),
    productsApi.bestsellers().catch(() => []),
    productsApi.newArrivals().catch(() => []),
  ]);

  return (
    <>
      <Hero />
      <Marquee />
      <Suspense>
        <ProductSection
          eyebrow="Editor's Picks"
          title="Featured Fragrances"
          link={{ label: "View all", href: "/shop" }}
          products={featured}
        />
        <ProductSection
          eyebrow="Most Loved"
          title="Bestsellers"
          link={{ label: "View all bestsellers", href: "/shop?filter=bestseller" }}
          products={bestsellers}
        />
        <BrandStory />
        <ProductSection
          eyebrow="New This Season"
          title="New Arrivals"
          link={{ label: "View all new", href: "/shop?filter=new" }}
          products={newArrivals}
        />
        <Testimonials />
        <InstagramGallery />
      </Suspense>
    </>
  );
}
