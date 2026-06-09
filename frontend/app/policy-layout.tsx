import type { ReactNode } from "react";

export default function Policy({ children }: { children: ReactNode }) {
  return (
    <div className="navcci-container max-w-3xl py-16">
      <article className="prose prose-neutral max-w-none text-base leading-relaxed text-foreground/90 [&_h1]:font-serif [&_h1]:text-4xl [&_h1]:font-medium [&_h2]:mt-10 [&_h2]:font-serif [&_h2]:text-2xl [&_p]:mt-4 [&_ul]:mt-4 [&_ul]:list-disc [&_ul]:pl-6">
        {children}
      </article>
    </div>
  );
}
