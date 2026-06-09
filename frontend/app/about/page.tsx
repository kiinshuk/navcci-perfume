import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Sparkles, Heart, Award, Leaf } from "lucide-react";

import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Our Story",
  description: "The story behind Luxe Perfume — an atelier of niche perfumery in Mumbai.",
  alternates: { canonical: "/about" },
};

const VALUES = [
  { icon: Sparkles, title: "Craft", body: "We partner with independent perfumers and storied houses. Every bottle is hand-finished at our atelier." },
  { icon: Heart, title: "Care", body: "From bespoke consultations to complimentary samples, we obsess over the smallest details." },
  { icon: Award, title: "Authenticity", body: "Every fragrance is batch-tested and sealed — guaranteed original." },
  { icon: Leaf, title: "Responsibility", body: "Carbon-neutral delivery, recyclable packaging, and a 1% pledge to environmental causes." },
];

const TIMELINE = [
  { year: "2014", title: "The first blend", body: "Founder Aanya Mehra blends her first oud in a Mumbai kitchen." },
  { year: "2017", title: "Atelier founded", body: "Luxe Perfume opens its first 200 sq ft studio in Kala Ghoda." },
  { year: "2020", title: "Going digital", body: "A small e-commerce store ships to 12 cities across India." },
  { year: "2023", title: "A bigger atelier", body: "We open a 4,000 sq ft atelier and partner with 14 niche houses." },
  { year: "2025", title: "Luxe 2.0", body: "A new flagship online — discovery sets, member benefits and same-day Mumbai delivery." },
];

export default function AboutPage() {
  return (
    <>
      <section className="relative bg-ink-900 py-24 text-background">
        <div className="luxe-container max-w-3xl text-center">
          <p className="luxe-eyebrow text-gold-500">Our Story</p>
          <h1 className="mt-3 luxe-heading text-5xl md:text-6xl">A quiet love letter to fine fragrance.</h1>
          <p className="mt-6 text-lg leading-relaxed text-background/80">
            Luxe Perfume is an Indian atelier dedicated to niche perfumery. We curate
            the world's most beautiful bottles, then finish them by hand at our Mumbai
            atelier — one order, one customer, one signature scent at a time.
          </p>
        </div>
      </section>

      <section className="luxe-container grid gap-12 py-20 md:grid-cols-2 md:items-center">
        <div className="relative aspect-[4/5] w-full overflow-hidden">
          <Image
            src="https://images.unsplash.com/photo-1612966809470-13ffaa6e2a1b?w=1000&q=80"
            alt="Founder"
            fill
            sizes="(max-width: 768px) 100vw, 50vw"
            className="object-cover"
          />
        </div>
        <div>
          <p className="luxe-eyebrow text-gold-600">Mission</p>
          <h2 className="mt-2 luxe-heading text-3xl">Make fine fragrance personal again.</h2>
          <p className="mt-4 leading-relaxed text-muted-foreground">
            For two decades the global fragrance market has been consolidating into
            four or five giant houses. The most beautiful compositions are increasingly
            hidden behind corporate decisions.
          </p>
          <p className="mt-4 leading-relaxed text-muted-foreground">
            Luxe Perfume exists to bring independent perfumery back into the hands of
            the people who love it most. We choose fragrance the way a sommelier
            chooses wine — by nose, by story, by the way it lives on the skin.
          </p>
          <Button asChild size="lg" className="mt-6">
            <Link href="/shop">Explore the Collection</Link>
          </Button>
        </div>
      </section>

      <section className="bg-ink-50 dark:bg-ink-900 py-20">
        <div className="luxe-container">
          <h2 className="luxe-heading text-3xl text-center">Our Values</h2>
          <div className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {VALUES.map(({ icon: Icon, title, body }) => (
              <div key={title} className="border border-border bg-background p-6">
                <Icon className="h-5 w-5 text-gold-600" />
                <h3 className="mt-4 font-serif text-xl">{title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="luxe-container py-20">
        <h2 className="luxe-heading text-3xl text-center">Our Journey</h2>
        <ol className="mx-auto mt-12 max-w-3xl space-y-8 border-l border-border pl-6">
          {TIMELINE.map((step) => (
            <li key={step.year}>
              <p className="luxe-eyebrow text-gold-600">{step.year}</p>
              <h3 className="mt-1 font-serif text-2xl">{step.title}</h3>
              <p className="mt-1 text-muted-foreground">{step.body}</p>
            </li>
          ))}
        </ol>
      </section>
    </>
  );
}
