"use client";

import { Trash2, Minus, Plus } from "lucide-react";
import { toast } from "sonner";

import { useCartStore } from "@/store/cart";
import { Button } from "@/components/ui/button";

export function CartActions({ itemId, quantity }: { itemId: string; quantity: number }) {
  const update = useCartStore((s) => s.updateItem);
  const remove = useCartStore((s) => s.removeItem);
  const save = useCartStore((s) => s.saveForLater);

  return (
    <div className="mt-4 flex flex-wrap items-center gap-3">
      <div className="flex items-center border border-border">
        <button onClick={() => update(itemId, Math.max(1, quantity - 1))} className="px-3 py-1.5 hover:bg-muted" aria-label="Decrease">
          <Minus className="h-3 w-3" />
        </button>
        <span className="w-10 text-center text-sm">{quantity}</span>
        <button onClick={() => update(itemId, Math.min(20, quantity + 1))} className="px-3 py-1.5 hover:bg-muted" aria-label="Increase">
          <Plus className="h-3 w-3" />
        </button>
      </div>
      <Button
        variant="ghost"
        size="sm"
        onClick={async () => {
          await save(itemId);
          toast.success("Saved for later.");
        }}
      >
        Save for later
      </Button>
    </div>
  );
}

CartActions.RemoveButton = function RemoveButton({ itemId }: { itemId: string }) {
  const remove = useCartStore((s) => s.removeItem);
  return (
    <button
      className="mt-3 inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
      onClick={() => remove(itemId)}
    >
      <Trash2 className="h-3.5 w-3.5" /> Remove
    </button>
  );
};
