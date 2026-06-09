import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap font-medium tracking-wide transition-all duration-300 disabled:pointer-events-none disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
  {
    variants: {
      variant: {
        default:
          "bg-foreground text-background hover:bg-foreground/90 hover:shadow-[0_8px_30px_rgba(0,0,0,0.18)]",
        outline:
          "border border-foreground/30 text-foreground hover:border-foreground hover:bg-foreground hover:text-background",
        ghost: "text-foreground/80 hover:text-foreground hover:bg-muted",
        link: "text-foreground underline-offset-4 hover:underline",
        gold: "bg-gold-500 text-background hover:bg-gold-600 hover:shadow-[0_8px_30px_rgba(168,124,47,0.35)]",
        soft: "bg-muted text-foreground hover:bg-foreground/10",
      },
      size: {
        sm: "h-9 px-4 text-xs uppercase tracking-[0.18em]",
        default: "h-11 px-7 text-[11px] uppercase tracking-[0.24em]",
        lg: "h-14 px-10 text-xs uppercase tracking-[0.28em]",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: { variant: "default", size: "default" },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />;
  }
);
Button.displayName = "Button";

export { buttonVariants };
