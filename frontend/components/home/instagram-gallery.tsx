import Link from "next/link";
import Image from "next/image";

import { Button } from "@/components/ui/button";

const GALLERY = [
  "https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?w=600&q=80",
  "https://images.unsplash.com/photo-1594035910387-fea47794261f?w=600&q=80",
  "https://images.unsplash.com/photo-1615634260167-c8cdede054de?w=600&q=80",
  "https://images.unsplash.com/photo-1617897903246-719242758050?w=600&q=80",
  "https://images.unsplash.com/photo-1588405748880-12d1d2a59d75?w=600&q=80",
  "https://images.unsplash.com/photo-1547887538-e3a2f32cb1cc?w=600&q=80",
];

export function InstagramGallery() {
  return (
    <section className="navcci-container py-20">
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="navcci-eyebrow text-gold-600">@navcciperfume</p>
          <h2 className="mt-2 navcci-heading text-3xl md:text-4xl">The Atelier in the Wild</h2>
        </div>
        <Button asChild variant="outline" size="sm">
          <Link href="https://instagram.com/navcciperfume" target="_blank">
            Follow on Instagram
          </Link>
        </Button>
      </div>
      <div className="grid grid-cols-2 gap-2 md:grid-cols-3 lg:grid-cols-6">
        {GALLERY.map((src, idx) => (
          <Link
            key={src}
            href="https://instagram.com/navcciperfume"
            target="_blank"
            className="group relative aspect-square overflow-hidden"
          >
            <Image
              src={src}
              alt={`Instagram post ${idx + 1}`}
              fill
              sizes="(max-width: 768px) 50vw, 16vw"
              className="object-cover transition-transform duration-700 group-hover:scale-110"
            />
          </Link>
        ))}
      </div>
    </section>
  );
}
