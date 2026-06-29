// GET  /api/inventory        → public list of all vehicles
// POST /api/inventory        → create or update a vehicle (admin only)
import { json, bad, checkAuth, rowToVehicle, sanitizeVehicle, upsert, uniqueId, deleteOrphanPhotos, safeArr } from "../_lib.js";

const MAX_BODY = 256 * 1024; // a single vehicle's JSON is comfortably under this

export async function onRequestGet({ env }) {
  if (!env.DB) return bad("Database not configured", 503);
  const { results } = await env.DB.prepare("SELECT * FROM vehicles").all();
  return json((results || []).map(rowToVehicle));
}

export async function onRequestPost({ request, env }) {
  if (!(await checkAuth(request, env))) return bad("Unauthorized", 401);
  if (!env.DB) return bad("Database not configured", 503);
  if (Number(request.headers.get("content-length") || 0) > MAX_BODY) return bad("Request body too large", 413);
  let body;
  try { body = await request.json(); } catch { return bad("Invalid JSON body"); }

  const v = sanitizeVehicle(body);
  if (!v) return bad("Make and model are required");

  // On edit, the original id is canonical — verify the row exists, then update it
  // in place (never fork). On create, ensure the derived id is unique.
  if (body.originalId) {
    const orig = String(body.originalId);
    const exists = await env.DB.prepare("SELECT id FROM vehicles WHERE id = ?").bind(orig).first();
    if (!exists) return bad("The vehicle you're editing no longer exists.", 404);
    v.id = orig;
  } else {
    v.id = await uniqueId(env, v.id);
  }

  // Diff the existing row's photos against the incoming set so any photo removed
  // in this save is reclaimed from KV (ref-counted) instead of leaking forever.
  let removed = [];
  try {
    const prev = await env.DB.prepare("SELECT images FROM vehicles WHERE id = ?").bind(v.id).first();
    if (prev) {
      const newImgs = safeArr(v.images);
      removed = safeArr(prev.images).filter((u) => !newImgs.includes(u));
    }
  } catch { /* best effort */ }

  await upsert(env, v);
  if (removed.length) {
    try { await deleteOrphanPhotos(env, removed, v.id); } catch { /* best effort */ }
  }

  const row = await env.DB.prepare("SELECT * FROM vehicles WHERE id = ?").bind(v.id).first();
  return json({ ok: true, id: v.id, vehicle: rowToVehicle(row) });
}
