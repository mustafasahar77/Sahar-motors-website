import { OPTIONS } from "@/lib/site";
import type {
  BodyType,
  Drivetrain,
  FilterState,
  FuelType,
  InventoryFacets,
  SortKey,
  Transmission,
  Vehicle,
} from "@/lib/types";

const BODY_SET = new Set<string>(OPTIONS.bodyType);
const FUEL_SET = new Set<string>(OPTIONS.fuelType);
const TRANS_SET = new Set<string>(OPTIONS.transmission);
const DRIVE_SET = new Set<string>(OPTIONS.drivetrain);

export const SORT_OPTIONS: { value: SortKey; label: string }[] = [
  { value: "curated", label: "Recommended" },
  { value: "newest", label: "Newest Arrivals" },
  { value: "price-asc", label: "Price: Low to High" },
  { value: "price-desc", label: "Price: High to Low" },
  { value: "year-desc", label: "Year: Newest" },
  { value: "year-asc", label: "Year: Oldest" },
  { value: "mileage-asc", label: "Mileage: Lowest" },
];

const SORT_KEYS = new Set<string>(SORT_OPTIONS.map((o) => o.value));

export function defaultFilterState(): FilterState {
  return {
    query: "",
    makes: [],
    bodyTypes: [],
    fuelTypes: [],
    transmissions: [],
    drivetrains: [],
    minPrice: null,
    maxPrice: null,
    minYear: null,
    maxYear: null,
    maxMileage: null,
    includeSold: false,
    sort: "curated",
  };
}

/** True when no shopper-facing filter is narrowing the list. */
export function isDefaultFilter(s: FilterState): boolean {
  return (
    s.query.trim() === "" &&
    s.makes.length === 0 &&
    s.bodyTypes.length === 0 &&
    s.fuelTypes.length === 0 &&
    s.transmissions.length === 0 &&
    s.drivetrains.length === 0 &&
    s.minPrice === null &&
    s.maxPrice === null &&
    s.minYear === null &&
    s.maxYear === null &&
    s.maxMileage === null &&
    !s.includeSold
  );
}

/** Number of active narrowing filters (drives the "Clear (n)" control). */
export function countActiveFilters(s: FilterState): number {
  let n = 0;
  if (s.query.trim() !== "") n++;
  n += s.makes.length;
  n += s.bodyTypes.length;
  n += s.fuelTypes.length;
  n += s.transmissions.length;
  n += s.drivetrains.length;
  if (s.minPrice !== null) n++;
  if (s.maxPrice !== null) n++;
  if (s.minYear !== null) n++;
  if (s.maxYear !== null) n++;
  if (s.maxMileage !== null) n++;
  if (s.includeSold) n++;
  return n;
}

function matchesQuery(v: Vehicle, query: string): boolean {
  const q = query.trim().toLowerCase();
  if (!q) return true;
  // Match every whitespace-separated term against a combined haystack so
  // "honda suv awd" progressively narrows results.
  const haystack = [
    v.make,
    v.model,
    v.trim ?? "",
    String(v.year),
    v.bodyType,
    v.fuelType,
    v.drivetrain,
    v.exteriorColor,
    ...v.features,
  ]
    .join(" ")
    .toLowerCase();
  return q.split(/\s+/).every((term) => haystack.includes(term));
}

export function filterVehicles(
  vehicles: Vehicle[],
  s: FilterState,
): Vehicle[] {
  // Normalize swapped numeric ranges so a min greater than max can't silently
  // hide everything.
  const minPrice =
    s.minPrice !== null && s.maxPrice !== null
      ? Math.min(s.minPrice, s.maxPrice)
      : s.minPrice;
  const maxPrice =
    s.minPrice !== null && s.maxPrice !== null
      ? Math.max(s.minPrice, s.maxPrice)
      : s.maxPrice;
  const minYear =
    s.minYear !== null && s.maxYear !== null
      ? Math.min(s.minYear, s.maxYear)
      : s.minYear;
  const maxYear =
    s.minYear !== null && s.maxYear !== null
      ? Math.max(s.minYear, s.maxYear)
      : s.maxYear;

  const priceFilterActive = minPrice !== null || maxPrice !== null;

  return vehicles.filter((v) => {
    if (!s.includeSold && v.status === "sold") return false;
    // Make is matched case-insensitively so hand-edited/shared URLs like
    // ?make=honda still work.
    if (
      s.makes.length &&
      !s.makes.some((m) => m.toLowerCase() === v.make.toLowerCase())
    )
      return false;
    if (s.bodyTypes.length && !s.bodyTypes.includes(v.bodyType)) return false;
    if (s.fuelTypes.length && !s.fuelTypes.includes(v.fuelType)) return false;
    if (s.transmissions.length && !s.transmissions.includes(v.transmission))
      return false;
    if (s.drivetrains.length && !s.drivetrains.includes(v.drivetrain))
      return false;

    // "Call for price" cars (price === null) can't be range-matched, so they
    // are excluded only when the shopper has set an explicit price filter.
    if (priceFilterActive) {
      if (v.price === null) return false;
      if (minPrice !== null && v.price < minPrice) return false;
      if (maxPrice !== null && v.price > maxPrice) return false;
    }

    if (minYear !== null && v.year < minYear) return false;
    if (maxYear !== null && v.year > maxYear) return false;
    if (s.maxMileage !== null && v.mileage > s.maxMileage) return false;

    if (!matchesQuery(v, s.query)) return false;
    return true;
  });
}

export function sortVehicles(vehicles: Vehicle[], sort: SortKey): Vehicle[] {
  const out = [...vehicles];
  // Cars with no price sort to the end of price sorts rather than as $0.
  const priceOrNull = (v: Vehicle, hi: boolean) =>
    v.price === null ? (hi ? -Infinity : Infinity) : v.price;

  switch (sort) {
    case "price-asc":
      out.sort((a, b) => priceOrNull(a, false) - priceOrNull(b, false));
      break;
    case "price-desc":
      out.sort((a, b) => priceOrNull(b, true) - priceOrNull(a, true));
      break;
    case "year-desc":
      out.sort((a, b) => b.year - a.year);
      break;
    case "year-asc":
      out.sort((a, b) => a.year - b.year);
      break;
    case "mileage-asc":
      out.sort((a, b) => a.mileage - b.mileage);
      break;
    case "newest":
      out.sort((a, b) => b.dateAdded.localeCompare(a.dateAdded));
      break;
    case "curated":
    default:
      // The dealer's manual order (set via up/down in the admin); newest breaks ties.
      out.sort((a, b) => a.sortOrder - b.sortOrder || b.dateAdded.localeCompare(a.dateAdded));
      break;
  }
  return out;
}

export function filterAndSort(
  vehicles: Vehicle[],
  s: FilterState,
): Vehicle[] {
  return sortVehicles(filterVehicles(vehicles, s), s.sort);
}

function countBy<T extends string>(
  vehicles: Vehicle[],
  pick: (v: Vehicle) => T,
): { value: T; count: number }[] {
  const map = new Map<T, number>();
  for (const v of vehicles) {
    const key = pick(v);
    map.set(key, (map.get(key) ?? 0) + 1);
  }
  return [...map.entries()]
    .map(([value, count]) => ({ value, count }))
    .sort((a, b) => b.count - a.count || a.value.localeCompare(b.value));
}

/**
 * Build the option lists + numeric ranges that drive the filter UI, derived
 * from the actual inventory so empty/irrelevant options never appear.
 * Ranges are computed over the full set so they stay stable when the shopper
 * toggles the "include sold" option.
 */
export function computeFacets(vehicles: Vehicle[]): InventoryFacets {
  const prices = vehicles
    .map((v) => v.price)
    .filter((p): p is number => p !== null);
  const years = vehicles.map((v) => v.year).filter((y) => y > 0);
  const mileages = vehicles.map((v) => v.mileage);

  return {
    makes: countBy(vehicles, (v) => v.make),
    bodyTypes: countBy<BodyType>(vehicles, (v) => v.bodyType),
    fuelTypes: countBy<FuelType>(vehicles, (v) => v.fuelType),
    transmissions: countBy<Transmission>(vehicles, (v) => v.transmission),
    drivetrains: countBy<Drivetrain>(vehicles, (v) => v.drivetrain),
    priceMin: prices.length ? Math.min(...prices) : 0,
    priceMax: prices.length ? Math.max(...prices) : 0,
    yearMin: years.length ? Math.min(...years) : 0,
    yearMax: years.length ? Math.max(...years) : 0,
    mileageMax: mileages.length ? Math.max(...mileages) : 0,
  };
}

// --- URL <-> FilterState (client-side, static-export friendly) -------------
// We sync filters to the query string with the History API instead of
// `useSearchParams`, so the inventory page works as a pure static export and
// supports shareable, bookmarkable filtered URLs + browser back/forward.

export function filtersToParams(s: FilterState): URLSearchParams {
  const p = new URLSearchParams();
  if (s.query.trim()) p.set("q", s.query.trim());
  if (s.makes.length) p.set("make", s.makes.join(","));
  if (s.bodyTypes.length) p.set("body", s.bodyTypes.join(","));
  if (s.fuelTypes.length) p.set("fuel", s.fuelTypes.join(","));
  if (s.transmissions.length) p.set("trans", s.transmissions.join(","));
  if (s.drivetrains.length) p.set("drive", s.drivetrains.join(","));
  if (s.minPrice !== null) p.set("minPrice", String(s.minPrice));
  if (s.maxPrice !== null) p.set("maxPrice", String(s.maxPrice));
  if (s.minYear !== null) p.set("minYear", String(s.minYear));
  if (s.maxYear !== null) p.set("maxYear", String(s.maxYear));
  if (s.maxMileage !== null) p.set("maxKm", String(s.maxMileage));
  if (s.includeSold) p.set("sold", "1");
  if (s.sort !== "curated") p.set("sort", s.sort);
  return p;
}

function csv(value: string | null): string[] {
  if (!value) return [];
  return value
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

/** csv() values filtered to a known allow-set, so junk URL params are dropped. */
function csvEnum<T extends string>(
  value: string | null,
  allowed: Set<string>,
): T[] {
  return csv(value).filter((v) => allowed.has(v)) as T[];
}

/** All numeric filters are non-negative integers; reject anything else. */
function intParam(value: string | null): number | null {
  if (value === null) return null;
  const n = Math.round(Number(value));
  return Number.isFinite(n) && n >= 0 ? n : null;
}

export function filtersFromParams(
  params: URLSearchParams,
): FilterState {
  const sortRaw = params.get("sort");
  return {
    query: params.get("q") ?? "",
    makes: csv(params.get("make")),
    bodyTypes: csvEnum<BodyType>(params.get("body"), BODY_SET),
    fuelTypes: csvEnum<FuelType>(params.get("fuel"), FUEL_SET),
    transmissions: csvEnum<Transmission>(params.get("trans"), TRANS_SET),
    drivetrains: csvEnum<Drivetrain>(params.get("drive"), DRIVE_SET),
    minPrice: intParam(params.get("minPrice")),
    maxPrice: intParam(params.get("maxPrice")),
    minYear: intParam(params.get("minYear")),
    maxYear: intParam(params.get("maxYear")),
    maxMileage: intParam(params.get("maxKm")),
    includeSold: params.get("sold") === "1",
    sort: sortRaw && SORT_KEYS.has(sortRaw) ? (sortRaw as SortKey) : "curated",
  };
}
