import rawData from "@/data/inventory.json";
import { OPTIONS } from "@/lib/site";
import { slugify, vehicleTitle } from "@/lib/format";
import type {
  BodyType,
  Condition,
  Drivetrain,
  FuelType,
  Transmission,
  Vehicle,
  VehicleStatus,
} from "@/lib/types";

/**
 * The inventory is authored in data/inventory.json (and edited via /admin).
 * Because that file is hand/tool-edited, we never trust it blindly: every entry
 * is normalized and sanitized here so a malformed *record* (bad enum, missing
 * field, wrong type, duplicate id) degrades gracefully instead of crashing the
 * build or the live site. Note: the file itself must remain valid JSON — a
 * syntax error fails at import time, before this runs. Editing via /admin
 * always emits valid JSON, so prefer that over hand-editing.
 */

const BODY_TYPES = new Set<string>(OPTIONS.bodyType);
const FUEL_TYPES = new Set<string>(OPTIONS.fuelType);
const TRANSMISSIONS = new Set<string>(OPTIONS.transmission);
const DRIVETRAINS = new Set<string>(OPTIONS.drivetrain);
const CONDITIONS = new Set<string>(OPTIONS.condition);
const STATUSES = new Set<string>(["available", "pending", "sold"]);

function str(value: unknown, fallback = ""): string {
  return typeof value === "string" ? value.trim() : fallback;
}

function optionalStr(value: unknown): string | undefined {
  const s = str(value);
  return s.length > 0 ? s : undefined;
}

function num(value: unknown, fallback: number): number {
  const n = typeof value === "string" ? Number(value) : value;
  return typeof n === "number" && Number.isFinite(n) ? n : fallback;
}

function optionalNum(value: unknown): number | undefined {
  if (value === null || value === undefined || value === "") return undefined;
  const n = typeof value === "string" ? Number(value) : value;
  return typeof n === "number" && Number.isFinite(n) ? n : undefined;
}

function enumValue<T extends string>(
  value: unknown,
  allowed: Set<string>,
  fallback: T,
): T {
  const s = str(value);
  return allowed.has(s) ? (s as T) : fallback;
}

function strArray(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value
    .map((item) => str(item))
    .filter((item) => item.length > 0);
}

function normalizeOne(raw: unknown): Vehicle | null {
  if (!raw || typeof raw !== "object") return null;
  const r = raw as Record<string, unknown>;

  const make = str(r.make);
  const model = str(r.model);
  // A listing with no make/model can't be rendered meaningfully — drop it.
  if (!make || !model) return null;

  const year = num(r.year, 0);
  const trim = optionalStr(r.trim);

  // Stable id: prefer the authored id, else derive from the title.
  const baseId =
    slugify(str(r.id)) ||
    slugify(vehicleTitle({ year, make, model, trim })) ||
    slugify(`${make}-${model}`);

  // Price: explicit null (or any non-positive/invalid number) means "call for price".
  const rawPrice = r.price;
  const price =
    rawPrice === null || rawPrice === undefined || rawPrice === ""
      ? null
      : (() => {
          const n = optionalNum(rawPrice);
          return n !== undefined && n > 0 ? n : null;
        })();

  return {
    id: baseId,
    make,
    model,
    trim,
    year,
    price,
    mileage: Math.max(0, Math.round(num(r.mileage, 0))),
    bodyType: enumValue<BodyType>(r.bodyType, BODY_TYPES, "Sedan"),
    fuelType: enumValue<FuelType>(r.fuelType, FUEL_TYPES, "Gasoline"),
    transmission: enumValue<Transmission>(r.transmission, TRANSMISSIONS, "Automatic"),
    drivetrain: enumValue<Drivetrain>(r.drivetrain, DRIVETRAINS, "FWD"),
    exteriorColor: str(r.exteriorColor, "—"),
    interiorColor: optionalStr(r.interiorColor),
    engine: optionalStr(r.engine),
    cylinders: optionalNum(r.cylinders),
    doors: optionalNum(r.doors),
    seats: optionalNum(r.seats),
    vin: optionalStr(r.vin),
    stockNumber: optionalStr(r.stockNumber),
    condition: enumValue<Condition>(r.condition, CONDITIONS, "Used"),
    status: enumValue<VehicleStatus>(r.status, STATUSES, "available"),
    featured: r.featured === true,
    description: str(r.description),
    features: strArray(r.features),
    images: strArray(r.images),
    carfaxUrl: optionalStr(r.carfaxUrl),
    dateAdded: str(r.dateAdded),
  };
}

function buildInventory(): Vehicle[] {
  const source = Array.isArray(rawData) ? rawData : [];
  const seen = new Map<string, number>();
  const out: Vehicle[] = [];

  for (const raw of source) {
    const v = normalizeOne(raw);
    if (!v) continue;

    // Guarantee globally-unique ids so detail-page routes never collide.
    const count = seen.get(v.id) ?? 0;
    seen.set(v.id, count + 1);
    if (count > 0) v.id = `${v.id}-${count + 1}`;

    out.push(v);
  }

  return out;
}

// Built once per process (build time for server components / bundle for client).
const VEHICLES: readonly Vehicle[] = Object.freeze(buildInventory());

/** Every valid listing, including sold ones (so detail links never 404). */
export function getAllVehicles(): Vehicle[] {
  return [...VEHICLES];
}

/** Listings shoppers should see by default (excludes sold). */
export function getAvailableVehicles(): Vehicle[] {
  return VEHICLES.filter((v) => v.status !== "sold");
}

export function getVehicleBySlug(slug: string): Vehicle | undefined {
  return VEHICLES.find((v) => v.id === slug);
}

export function getAllSlugs(): string[] {
  return VEHICLES.map((v) => v.id);
}

/**
 * Featured vehicles for the homepage. Prefers flagged + available cars and
 * tops up with the newest available cars so the section is never empty.
 */
export function getFeaturedVehicles(limit = 6): Vehicle[] {
  const available = getAvailableVehicles();
  const flagged = available.filter((v) => v.featured);
  const rest = available
    .filter((v) => !v.featured)
    .sort((a, b) => b.dateAdded.localeCompare(a.dateAdded));
  return [...flagged, ...rest].slice(0, limit);
}

export const totalVehicleCount = VEHICLES.length;
export const availableVehicleCount = getAvailableVehicles().length;
