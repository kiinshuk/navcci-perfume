"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { Product, Review } from "@/types";
import { StarRating } from "./star-rating";
import { formatDate } from "@/lib/utils";

function asNoteList(value: Product["topNotes"]): string[] {
  if (!value) return [];
  if (Array.isArray(value) && value.length === 0) return [];
  if (typeof value[0] === "string") return value as string[];
  return (value as { name: string }[]).map((n) => n.name);
}

export function ProductDetails({ product, reviews }: { product: Product; reviews: Review[] }) {
  return (
    <Tabs defaultValue="description" className="mt-16">
      <TabsList>
        <TabsTrigger value="description">Description</TabsTrigger>
        <TabsTrigger value="notes">Fragrance Notes</TabsTrigger>
        <TabsTrigger value="ingredients">Ingredients</TabsTrigger>
        <TabsTrigger value="reviews">Reviews ({product.reviewCount})</TabsTrigger>
      </TabsList>

      <TabsContent value="description" className="prose max-w-none text-base leading-relaxed text-muted-foreground">
        <p className="whitespace-pre-line">{product.description}</p>
        {product.story && (
          <blockquote className="mt-6 border-l-2 border-gold-500 pl-6 font-serif text-xl italic text-foreground/90">
            {product.story}
          </blockquote>
        )}
      </TabsContent>

      <TabsContent value="notes">
        <div className="grid gap-8 md:grid-cols-3">
          <NoteColumn label="Top Notes" notes={asNoteList(product.topNotes)} description="The first impression — 15 minutes." />
          <NoteColumn label="Heart Notes" notes={asNoteList(product.heartNotes)} description="The signature — 3 to 4 hours." />
          <NoteColumn label="Base Notes" notes={asNoteList(product.baseNotes)} description="The lasting impression — 8+ hours." />
        </div>
      </TabsContent>

      <TabsContent value="ingredients">
        <p className="max-w-3xl whitespace-pre-line text-sm leading-relaxed text-muted-foreground">
          {product.ingredients || "Crafted with the highest-grade essential oils, absolutes and natural isolates."}
        </p>
      </TabsContent>

      <TabsContent value="reviews">
        {reviews.length === 0 ? (
          <p className="text-sm text-muted-foreground">Be the first to share your experience with this fragrance.</p>
        ) : (
          <div className="grid gap-6">
            {reviews.map((r) => (
              <div key={r.id} className="border-b border-border pb-6 last:border-0">
                <div className="flex items-center justify-between">
                  <div>
                    <StarRating value={r.rating} />
                    <p className="mt-2 font-serif text-lg">{r.title || "Untitled"}</p>
                  </div>
                  <p className="text-xs uppercase tracking-widest text-muted-foreground">
                    {r.userName} · {formatDate(r.createdAt)}
                  </p>
                </div>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{r.body}</p>
                {r.isVerifiedPurchase && (
                  <p className="mt-2 text-[10px] uppercase tracking-[0.2em] text-gold-600">Verified Purchase</p>
                )}
              </div>
            ))}
          </div>
        )}
      </TabsContent>
    </Tabs>
  );
}

function NoteColumn({ label, notes, description }: { label: string; notes: string[]; description: string }) {
  return (
    <div>
      <p className="luxe-eyebrow text-gold-600">{label}</p>
      <p className="mt-2 font-serif text-2xl">{notes.join(" · ") || "—"}</p>
      <p className="mt-2 text-sm text-muted-foreground">{description}</p>
    </div>
  );
}
