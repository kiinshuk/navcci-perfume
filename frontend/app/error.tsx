"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function Error({ reset }: { error: Error; reset: () => void }) {
  return (
    <div className="navcci-container flex flex-col items-center justify-center py-32 text-center">
      <p className="navcci-eyebrow text-gold-600">Unexpected</p>
      <h1 className="mt-3 navcci-heading text-4xl">Something went wrong.</h1>
      <p className="mt-3 max-w-md text-muted-foreground">
        An unexpected error occurred. Please try again.
      </p>
      <div className="mt-6 flex gap-3">
        <Button onClick={reset}>Try Again</Button>
        <Button asChild variant="outline">
          <Link href="/">Return Home</Link>
        </Button>
      </div>
    </div>
  );
}
