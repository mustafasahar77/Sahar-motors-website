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

async function sha256Hex(s) {
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(s));
  return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, "0")).join("");
}
function timingEqual(a, b) {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

// Writes require `Authorization: Bearer <admin password>`. Reads are public.
// The password's SHA-256 hash lives in the D1 `settings` table (key
// 'admin_password_sha256'), so it survives every deploy and can be changed
// instantly via SQL with no redeploy. Falls back to the ADMIN_PASSWORD secret
// when the table/row isn't present. Compared as fixed-length hex digests
// (constant-time) so neither length nor content leaks via timing.
export async function checkAuth(request, env) {
  const got = (request.headers.get("authorization") || "").replace(/^Bearer\s+/i, "");
  if (!got) return false;
  const gotHex = await sha256Hex(got);
  try {
    if (env.DB) {
      const row = await env.DB.prepare("SELECT value FROM settings WHERE key = ?").bind("admin_password_sha256").first();
      if (row && row.value) return timingEqual(gotHex, String(row.value));
    }
  } catch {
    /* settings table not present yet — fall through to the env secret */
  }
  if (env.ADMIN_PASSWORD) return timingEqual(gotHex, await sha256Hex(env.ADMIN_PASSWORD));
  return false;
}

const BODY = ["Sedan", "SUV", "Truck", "Coupe", "Hatchback", "Minivan", "Van", "Convertible", "Wagon"];
const FUEL = ["Gasoline", "Diesel", "Hybrid", "Plug-in Hybrid", "Electric"];
const TRANS = ["Automatic", "Manual", "CVT"];
const DRIVE = ["FWD", "RWD", "AWD", "4WD"];
const COND = ["Used", "Certified Pre-Owned", "New"];
const STAT = ["available", "pending", "sold"];

function pick(v, allow, def) { return allow.includes(v) ? v : def; }
function intOrNull(v) { const n = parseInt(v, 10); return Number.isFinite(n) ? n : null; }
export function safeArr(s) { try { const a = JSON.parse(s || "[]"); return Array.isArray(a) ? a : []; } catch { return []; } }
function slug(s) {
  return String(s || "").normalize("NFKD").toLowerCase()
    .replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").replace(/-{2,}/g, "-");
}
// Only let http(s) URLs reach an <a href> — blocks javascript:/data: values that
// would otherwise become stored XSS when rendered on the public vehicle page.
function safeHttpUrl(s) {
  const u = String(s || "").trim();
  return /^https?:\/\//i.test(u) ? u : "";
}
// intOrNull + clamp into [min,max]; returns def when the value isn't a number.
function clampInt(v, min, max, def = 0) {
  const n = intOrNull(v);
  return n === null ? def : Math.min(max, Math.max(min, n));
}

// All persisted columns, in a fixed order (used for INSERT/UPSERT).
export const COLUMNS = [
  "id", "make", "model", "trim", "year", "price", "mileage", "bodyType", "fuelType",
  "transmission", "drivetrain", "exteriorColor", "interiorColor", "engine", "cylinders",
  "doors", "seats", "vin", "stockNumber", "condition", "status", "featured", "sortOrder",
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
    sortOrder: r.sortOrder || 0,
    description: r.description || "",
    features: safeArr(r.features), images: safeArr(r.images),
    carfaxUrl: r.carfaxUrl || "", dateAdded: r.dateAdded || "",
  };
}

// Trim to a string and cap length, so an admin can't bloat D1 rows with huge text.
function cap(v, n) { return String(v || "").trim().slice(0, n); }
function capArr(v, maxItems, maxLen) {
  return JSON.stringify(
    (Array.isArray(v) ? v : []).map((x) => cap(x, maxLen)).filter(Boolean).slice(0, maxItems),
  );
}

// Clean + coerce arbitrary admin input into a safe DB record. Null if unusable.
export function sanitizeVehicle(input, todayISO) {
  const make = cap(input.make, 80);
  const model = cap(input.model, 80);
  if (!make || !model) return null;
  let year = intOrNull(input.year) || 0;
  if (year !== 0) year = Math.min(2100, Math.max(1900, year)); // reject implausible years
  const id = slug(input.id) || slug([year, make, model, input.trim].filter(Boolean).join(" ")) || slug(`${make}-${model}`);
  const priceN = intOrNull(input.price);
  return {
    id,
    make, model, trim: cap(input.trim, 60),
    year,
    price: priceN !== null && priceN > 0 ? Math.min(priceN, 100000000) : null,
    mileage: Math.min(5000000, Math.max(0, intOrNull(input.mileage) || 0)),
    bodyType: pick(input.bodyType, BODY, "Sedan"),
    fuelType: pick(input.fuelType, FUEL, "Gasoline"),
    transmission: pick(input.transmission, TRANS, "Automatic"),
    drivetrain: pick(input.drivetrain, DRIVE, "FWD"),
    exteriorColor: cap(input.exteriorColor, 60),
    interiorColor: cap(input.interiorColor, 60),
    engine: cap(input.engine, 120),
    cylinders: clampInt(input.cylinders, 0, 16, 0),
    doors: clampInt(input.doors, 0, 10, 0),
    seats: clampInt(input.seats, 0, 60, 0),
    vin: cap(input.vin, 40),
    stockNumber: cap(input.stockNumber, 60),
    condition: pick(input.condition, COND, "Used"),
    status: pick(input.status, STAT, "available"),
    featured: input.featured === true || input.featured === 1 || input.featured === "true" ? 1 : 0,
    sortOrder: intOrNull(input.sortOrder) || 0, // overridden in the POST handler (new = top, edit = preserved)
    description: cap(input.description, 8000),
    features: capArr(input.features, 60, 120),
    images: capArr(input.images, 40, 500),
    carfaxUrl: safeHttpUrl(cap(input.carfaxUrl, 500)),
    dateAdded: cap(input.dateAdded, 10) || todayISO || new Date().toISOString().slice(0, 10),
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

// Delete KV photo blobs in `candidateUrls` that NO vehicle row references any
// more — ref-counted, so a photo a duplicate listing still uses is never
// removed. Pass keepRowId to ignore the row you're about to write / just deleted.
export async function deleteOrphanPhotos(env, candidateUrls, keepRowId) {
  if (!env.PHOTOS || !env.DB) return;
  const mine = (candidateUrls || []).filter((u) => typeof u === "string" && u.startsWith("/img/"));
  if (!mine.length) return;
  const others = await env.DB.prepare("SELECT id, images FROM vehicles").all();
  const referenced = new Set();
  for (const r of others.results || []) {
    if (keepRowId && r.id === keepRowId) continue;
    for (const u of safeArr(r.images)) referenced.add(u);
  }
  for (const u of mine) {
    if (!referenced.has(u)) {
      try { await env.PHOTOS.delete(u.slice("/img/".length)); } catch { /* best effort */ }
    }
  }
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
