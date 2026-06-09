"use client";

import { useState } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";

import { cn, getImageUrl } from "@/lib/utils";
import type { ProductImage } from "@/types";

export function ProductGallery({ images, name }: { images: ProductImage[]; name: string }) {
  const safe = images.length ? images : [];
  const [active, setActive] = useState(0);

  if (!safe.length) {
    return (
      <div className="aspect-[3/4] w-full bg-muted">
        <div className="flex h-full items-center justify-center luxe-eyebrow">Luxe Perfume</div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-[80px_1fr] gap-4">
      <div className="flex flex-col gap-3">
        {safe.map((img, idx) => (
          <button
            key={img.id}
            onClick={() => setActive(idx)}
            className={cn(
              "relative aspect-square w-full overflow-hidden border bg-muted",
              active === idx ? "border-foreground" : "border-transparent opacity-60 hover:opacity-100"
            )}
          >
            <Image src={getImageUrl(img.image)} alt={img.altText || name} fill sizes="80px" className="object-cover" />
          </button>
        ))}
      </div>

      <div className="relative aspect-[3/4] overflow-hidden bg-muted">
        <Image
          src={getImageUrl(safe[active].image)}
          alt={safe[active].altText || name}
          fill
          priority
          sizes="(max-width: 1024px) 100vw, 50vw"
          className="object-cover"
        />
        {safe.length > 1 && (
          <>
            <button
              onClick={() => setActive((active - 1 + safe.length) % safe.length)}
              className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full bg-background/80 p-2 backdrop-blur hover:bg-background"
              aria-label="Previous image"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              onClick={() => setActive((active + 1) % safe.length)}
              className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full bg-background/80 p-2 backdrop-blur hover:bg-background"
              aria-label="Next image"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </>
        )}
      </div>
    </div>
  );
}
