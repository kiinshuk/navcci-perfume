"use client";

import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

export function StarRating({ value, size = 14, className }: { value: number; size?: number; className?: string }) {
  const rounded = Math.round(value * 2) / 2;
  return (
    <div className={cn("flex items-center gap-0.5", className)} aria-label={`${value} out of 5 stars`}>
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          size={size}
          className={cn(
            i <= rounded ? "fill-gold-500 text-gold-500" : "text-foreground/30"
          )}
        />
      ))}
    </div>
  );
}
