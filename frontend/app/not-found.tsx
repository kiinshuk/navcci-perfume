import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="navcci-container flex flex-col items-center justify-center py-32 text-center">
      <p className="navcci-eyebrow text-gold-600">404</p>
      <h1 className="mt-3 navcci-heading text-5xl">This page slipped between the bottles.</h1>
      <p className="mt-3 max-w-md text-muted-foreground">
        The page you were looking for could not be found. Return to our atelier.
      </p>
      <Button asChild size="lg" className="mt-8">
        <Link href="/">Return Home</Link>
      </Button>
    </div>
  );
}
