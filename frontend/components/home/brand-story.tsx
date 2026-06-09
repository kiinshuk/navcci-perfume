import Link from "next/link";
import { Sparkles, Truck, ShieldCheck, Award } from "lucide-react";

const PILLARS = [
  { icon: Sparkles, title: "Niche Curation", body: "Only 1 in 200 submissions makes it onto our shelves." },
  { icon: Truck, title: "Complimentary Shipping", body: "Free across India on orders above ₹1,500." },
  { icon: ShieldCheck, title: "Authenticity Guaranteed", body: "Every bottle is batch-tested and sealed at the atelier." },
  { icon: Award, title: "Atelier Service", body: "Personalised fragrance consultations, by appointment." },
];

export function BrandStory() {
  return (
    <section className="bg-ink-50 dark:bg-ink-900">
      <div className="luxe-container grid gap-12 py-24 md:grid-cols-2 md:items-center">
        <div>
          <p className="luxe-eyebrow text-gold-600">Our Story</p>
          <h2 className="mt-3 luxe-heading text-4xl md:text-5xl">
            Crafted slowly. <br />
            Bottled with intention.
          </h2>
          <p className="mt-6 max-w-lg text-base leading-relaxed text-muted-foreground">
            Luxe Perfume began in a small Mumbai atelier with a single conviction — fine
            fragrance is one of the most intimate forms of art. Today we partner with
            independent perfumers and storied houses to bring you bottles with soul.
          </p>
          <Link href="/about" className="luxe-link mt-6 inline-flex">
            Read our story →
          </Link>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          {PILLARS.map(({ icon: Icon, title, body }) => (
            <div key={title} className="border border-border bg-background p-6">
              <Icon className="h-5 w-5 text-gold-600" />
              <h3 className="mt-4 font-serif text-xl">{title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
