import * as React from "react";
import { cn } from "@/lib/utils";

const Badge = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        "inline-flex items-center gap-1 border border-border bg-background px-2.5 py-1 text-[10px] uppercase tracking-[0.2em] text-foreground/80",
        className
      )}
      {...props}
    />
  )
);
Badge.displayName = "Badge";

export { Badge };
