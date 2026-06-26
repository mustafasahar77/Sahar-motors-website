// Shared helpers for the Sahar Motors admin backend (Cloudflare Pages Functions).
// Files beginning with "_" are NOT routed — they're importable modules only.

export function json(data, status = 200, extra = {}) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "content-type": "application/json; charset=utf-8",
      "cache-control": "no-store",
      ...extra,
    },
  });
}

export function bad(message, status = 400) {
  return json({ error: message }, status);
}

// Writes require `Authorization: Bearer <ADMIN_PASSWORD>`. Reads are public.
// Compares fixed-length SHA-256 digests so neither the length nor the content of
// ADMIN_PASSWORD leaks via timing. Async because it uses WebCrypto.
export async function checkAuth(request, env) {
  const got = (request.headers.get("authorization") || "").replace(/^Bearer\s+/i, "");
  const want = env.ADMIN_PASSWORD || "";
  if (!want) return false; // no secret configured → deny all writes
  const enc = new TextEncoder();
  const [a, b] = await Promise.all([
    crypto.subtle.digest("SHA-256", enc.encode(got)),
    crypto.subtle.digest("SHA-256", enc.encode(want)),
  ]);
  const av = new Uint8Array(a), bv = new Uint8Array(b);
  let diff = 0;
  for (let i = 0; i < av.length; i++) diff |= av[i] ^ bv[i];
  return diff === 0;
}

const BODY = ["Sedan", "SUV", "Truck", "Coupe", "Hatchback", "Minivan", "Van", "Convertible", "Wagon"];
const FUEL = ["Gasoline", "Diesel", "Hybrid", "Plug-in Hybrid", "Electric"];
const TRANS = ["Automatic", "Manual", "CVT"];
const DRIVE = ["FWD", "RWD", "AWD", "4WD"];
const COND = ["Used", "Certified Pre-Owned", "New"];
const STAT = ["available", "pending", "sold"];

function pick(v, allow, def) { return allow.includes(v) ? v : def; }
function intOrNull(v) { const n = parseInt(v, 10); return Number.isFinite(n) ? n : null; }
function safeArr(s) { try { const a = JSON.parse(s || "[]"); return Array.isArray(a) ? a : []; } catch { return []; } }
function slug(s) {
  return String(s || "").normalize("NFKD").toLowerCase()
    .replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").replace(/-{2,}/g, "-");
}

// All persisted columns, in a fixed order (used for INSERT/UPSERT).
export const COLUMNS = [
  "id", "make", "model", "trim", "year", "price", "mileage", "bodyType", "fuelType",
  "transmission", "drivetrain", "exteriorColor", "interiorColor", "engine", "cylinders",
  "doors", "seats", "vin", "stockNumber", "condition", "status", "featured",
  "description", "features", "images", "carfaxUrl", "dateAdded",
];

// Turn a raw D1 row into the Vehicle shape the front-end expects.
export function rowToVehicle(r) {
  return {
    id: r.id, make: r.make, model: r.model, trim: r.trim || "",
    year: r.year || 0,
    price: r.price === null || r.price === undefined ? null : r.price,
    mileage: r.mileage || 0,
    bodyType: r.bodyType || "Sedan", fuelType: r.fuelType || "Gasoline",
    transmission: r.transmission || "Automatic", drivetrain: r.drivetrain || "FWD",
    exteriorColor: r.exteriorColor || "", interiorColor: r.interiorColor || "",
    engine: r.engine || "", cylinders: r.cylinders || 0, doors: r.doors || 0, seats: r.seats || 0,
    vin: r.vin || "", stockNumber: r.stockNumber || "",
    condition: r.condition || "Used", status: r.status || "available",
    featured: !!r.featured,
    description: r.description || "",
    features: safeArr(r.features), images: safeArr(r.images),
    carfaxUrl: r.carfaxUrl || "", dateAdded: r.dateAdded || "",
  };
}

// Clean + coerce arbitrary admin input into a safe DB record. Null if unusable.
export function sanitizeVehicle(input, todayISO) {
  const make = String(input.make || "").trim();
  const model = String(input.model || "").trim();
  if (!make || !model) return null;
  const year = intOrNull(input.year) || 0;
  const id = slug(input.id) || slug([year, make, model, input.trim].filter(Boolean).join(" ")) || slug(`${make}-${model}`);
  const priceN = intOrNull(input.price);
  return {
    id,
    make, model, trim: String(input.trim || "").trim(),
    year,
    price: priceN !== null && priceN > 0 ? priceN : null,
    mileage: Math.max(0, intOrNull(input.mileage) || 0),
    bodyType: pick(input.bodyType, BODY, "Sedan"),
    fuelType: pick(input.fuelType, FUEL, "Gasoline"),
    transmission: pick(input.transmission, TRANS, "Automatic"),
    drivetrain: pick(input.drivetrain, DRIVE, "FWD"),
    exteriorColor: String(input.exteriorColor || "").trim(),
    interiorColor: String(input.interiorColor || "").trim(),
    engine: String(input.engine || "").trim(),
    cylinders: intOrNull(input.cylinders) || 0,
    doors: intOrNull(input.doors) || 0,
    seats: intOrNull(input.seats) || 0,
    vin: String(input.vin || "").trim(),
    stockNumber: String(input.stockNumber || "").trim(),
    condition: pick(input.condition, COND, "Used"),
    status: pick(input.status, STAT, "available"),
    featured: input.featured === true || input.featured === 1 || input.featured === "true" ? 1 : 0,
    description: String(input.description || "").trim(),
    features: JSON.stringify(Array.isArray(input.features) ? input.features.map((x) => String(x).trim()).filter(Boolean) : []),
    images: JSON.stringify(Array.isArray(input.images) ? input.images.map((x) => String(x).trim()).filter(Boolean) : []),
    carfaxUrl: String(input.carfaxUrl || "").trim(),
    dateAdded: String(input.dateAdded || "").trim() || todayISO || new Date().toISOString().slice(0, 10),
  };
}

// Insert or update by primary key.
export async function upsert(env, v) {
  const placeholders = COLUMNS.map(() => "?").join(", ");
  const updates = COLUMNS.filter((c) => c !== "id").map((c) => `${c}=excluded.${c}`).join(", ");
  await env.DB.prepare(
    `INSERT INTO vehicles (${COLUMNS.join(", ")}, updatedAt) VALUES (${placeholders}, ?)
     ON CONFLICT(id) DO UPDATE SET ${updates}, updatedAt=excluded.updatedAt`,
  ).bind(...COLUMNS.map((c) => v[c]), new Date().toISOString()).run();
}

// Pick an id that doesn't collide (unless we're editing that same record).
export async function uniqueId(env, desired, editingId) {
  const base = desired || "vehicle";
  let candidate = base, n = 1;
  for (;;) {
    if (editingId && candidate === editingId) return candidate;
    const row = await env.DB.prepare("SELECT id FROM vehicles WHERE id = ?").bind(candidate).first();
    if (!row) return candidate;
    n += 1;
    candidate = `${base}-${n}`;
  }
}
