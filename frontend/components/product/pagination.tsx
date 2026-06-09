"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

export function Pagination({ page, totalPages }: { page: number; totalPages: number }) {
  const pathname = usePathname();
  const params = useSearchParams();
  if (totalPages <= 1) return null;

  const makeHref = (p: number) => {
    const next = new URLSearchParams(params.toString());
    next.set("page", String(p));
    return `${pathname}?${next.toString()}`;
  };

  const pages = Array.from({ length: totalPages }, (_, i) => i + 1).slice(0, 7);

  return (
    <nav className="mt-12 flex items-center justify-center gap-1" aria-label="Pagination">
      <Link
        href={makeHref(Math.max(1, page - 1))}
        className={cn("flex h-10 w-10 items-center justify-center border border-border", page === 1 && "pointer-events-none opacity-40")}
        aria-label="Previous page"
      >
        <ChevronLeft className="h-4 w-4" />
      </Link>
      {pages.map((p) => (
        <Link
          key={p}
          href={makeHref(p)}
          className={cn(
            "flex h-10 w-10 items-center justify-center border border-border text-sm",
            p === page ? "bg-foreground text-background" : "hover:bg-muted"
          )}
        >
          {p}
        </Link>
      ))}
      <Link
        href={makeHref(Math.min(totalPages, page + 1))}
        className={cn("flex h-10 w-10 items-center justify-center border border-border", page === totalPages && "pointer-events-none opacity-40")}
        aria-label="Next page"
      >
        <ChevronRight className="h-4 w-4" />
      </Link>
    </nav>
  );
}
