"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const GENDERS = [
  { value: "women", label: "Women" },
  { value: "men", label: "Men" },
  { value: "unisex", label: "Unisex" },
];
const FAMILIES = [
  "floral",
  "oriental",
  "woody",
  "fresh",
  "citrus",
  "gourmand",
  "leather",
  "aquatic",
];

export function ShopFilters() {
  const router = useRouter();
  const params = useSearchParams();

  const update = useCallback(
    (key: string, value: string | null) => {
      const next = new URLSearchParams(params.toString());
      if (value === null || value === "") next.delete(key);
      else next.set(key, value);
      next.delete("page");
      router.push(`/shop?${next.toString()}`);
    },
    [params, router]
  );

  const toggle = (key: string, value: string) => {
    const current = params.get(key);
    if (current === value) update(key, null);
    else update(key, value);
  };

  const reset = () => router.push("/shop");

  return (
    <div className="space-y-8">
      <div>
        <h3 className="luxe-eyebrow">Price (₹)</h3>
        <div className="mt-3 grid grid-cols-2 gap-2">
          <Input
            type="number"
            placeholder="Min"
            defaultValue={params.get("min_price") ?? ""}
            onBlur={(e) => update("min_price", e.target.value)}
          />
          <Input
            type="number"
            placeholder="Max"
            defaultValue={params.get("max_price") ?? ""}
            onBlur={(e) => update("max_price", e.target.value)}
          />
        </div>
      </div>

      <div>
        <h3 className="luxe-eyebrow">Gender</h3>
        <ul className="mt-3 space-y-2 text-sm">
          {GENDERS.map((g) => (
            <li key={g.value} className="flex items-center gap-2">
              <Checkbox
                id={`gender-${g.value}`}
                checked={params.get("gender") === g.value}
                onCheckedChange={() => toggle("gender", g.value)}
              />
              <Label htmlFor={`gender-${g.value}`} className="cursor-pointer normal-case tracking-normal text-sm">
                {g.label}
              </Label>
            </li>
          ))}
        </ul>
      </div>

      <div>
        <h3 className="luxe-eyebrow">Fragrance Family</h3>
        <ul className="mt-3 grid grid-cols-2 gap-2 text-sm">
          {FAMILIES.map((f) => (
            <li key={f} className="flex items-center gap-2">
              <Checkbox
                id={`fam-${f}`}
                checked={params.get("fragrance_family") === f}
                onCheckedChange={() => toggle("fragrance_family", f)}
              />
              <Label htmlFor={`fam-${f}`} className="cursor-pointer capitalize normal-case tracking-normal text-sm">
                {f}
              </Label>
            </li>
          ))}
        </ul>
      </div>

      <div>
        <h3 className="luxe-eyebrow">Minimum Rating</h3>
        <div className="mt-3 flex flex-wrap gap-2">
          {[4, 4.5].map((r) => (
            <button
              key={r}
              onClick={() => toggle("min_rating", String(r))}
              className={`border px-3 py-1 text-xs uppercase tracking-widest ${
                params.get("min_rating") === String(r) ? "border-foreground bg-foreground text-background" : "border-border"
              }`}
            >
              {r}★ +
            </button>
          ))}
        </div>
      </div>

      <Button variant="outline" size="sm" onClick={reset} className="w-full">
        Reset Filters
      </Button>
    </div>
  );
}
