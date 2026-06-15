import type { Vehicle } from "@/lib/types";

const priceFormatter = new Intl.NumberFormat("en-CA", {
  style: "currency",
  currency: "CAD",
  maximumFractionDigits: 0,
});

const numberFormatter = new Intl.NumberFormat("en-CA");

/** "$24,995" — or "Call for Price" when price is null/invalid. */
export function formatPrice(price: number | null | undefined): string {
  if (
    price === null ||
    price === undefined ||
    !Number.isFinite(price) ||
    price <= 0
  ) {
    return "Call for Price";
  }
  return priceFormatter.format(price);
}

/** "84,500 km" — guards against missing/invalid odometer values. */
export function formatMileage(mileage: number | null | undefined): string {
  if (
    mileage === null ||
    mileage === undefined ||
    !Number.isFinite(mileage) ||
    mileage < 0
  ) {
    return "N/A";
  }
  return `${numberFormatter.format(Math.round(mileage))} km`;
}

/** Thousands-separated integer. */
export function formatNumber(value: number): string {
  return numberFormatter.format(value);
}

/** "2019 Honda Civic EX" — trim is optional. */
export function vehicleTitle(
  v: Pick<Vehicle, "year" | "make" | "model" | "trim">,
): string {
  return [v.year, v.make, v.model, v.trim].filter(Boolean).join(" ");
}

/** Lowercase, hyphenated, ASCII-safe slug fragment. */
export function slugify(input: string): string {
  return input
    .toString()
    .normalize("NFKD") // decompose accents; the [^a-z0-9] pass below drops the marks
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-{2,}/g, "-");
}

/** Friendly "Jun 2026" style date; falls back to the raw string if unparseable. */
export function formatDate(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString("en-CA", { year: "numeric", month: "short" });
}
