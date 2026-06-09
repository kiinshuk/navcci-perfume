import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

export function formatCurrency(value: number, currency = "INR", locale = "en-IN"): string {
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(value);
}

export function formatDate(value: string | Date, locale = "en-IN"): string {
  return new Intl.DateTimeFormat(locale, {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(value));
}

export function formatDateTime(value: string | Date, locale = "en-IN"): string {
  return new Intl.DateTimeFormat(locale, {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

export function discountPercent(price: number, sale: number | null): number {
  if (!sale || sale >= price) return 0;
  return Math.round(((price - sale) / price) * 100);
}

export function slugify(value: string): string {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-");
}

export function truncate(value: string, max = 120): string {
  if (!value) return "";
  return value.length > max ? `${value.slice(0, max).trim()}…` : value;
}

export function wait(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function getImageUrl(path?: string | null, fallback = "/placeholder.svg"): string {
  if (!path) return fallback;
  if (path.startsWith("http")) return path;
  const cdn = process.env.NEXT_PUBLIC_CDN_URL || "";
  return `${cdn}${path.startsWith("/") ? "" : "/"}${path}`;
}

export function isClient(): boolean {
  return typeof window !== "undefined";
}
