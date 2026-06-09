"use client";

import { useRouter, useSearchParams } from "next/navigation";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const OPTIONS = [
  { value: "-created_at", label: "Newest first" },
  { value: "price", label: "Price: Low → High" },
  { value: "-price", label: "Price: High → Low" },
  { value: "-average_rating", label: "Top rated" },
  { value: "-sales_count", label: "Bestselling" },
];

export function ShopSort() {
  const router = useRouter();
  const params = useSearchParams();

  return (
    <Select
      value={params.get("sort") ?? "-created_at"}
      onValueChange={(value) => {
        const next = new URLSearchParams(params.toString());
        if (value === "-created_at") next.delete("sort");
        else next.set("sort", value);
        router.push(`/shop?${next.toString()}`);
      }}
    >
      <SelectTrigger className="w-48">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {OPTIONS.map((opt) => (
          <SelectItem key={opt.value} value={opt.value}>
            {opt.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
