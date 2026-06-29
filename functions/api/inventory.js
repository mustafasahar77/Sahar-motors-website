// GET  /api/inventory        → public list of all vehicles
// POST /api/inventory        → create or update a vehicle (admin only)
import { json, bad, checkAuth, rowToVehicle, sanitizeVehicle, upsert, uniqueId } from "../_lib.js";

export async function onRequestGet({ env }) {
  if (!env.DB) return bad("Database not configured", 503);
  const { results } = await env.DB.prepare("SELECT * FROM vehicles").all();
  return json((results || []).map(rowToVehicle));
}

export async function onRequestPost({ request, env }) {
  if (!(await checkAuth(request, env))) return bad("Unauthorized", 401);
  if (!env.DB) return bad("Database not configured", 503);
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
  await upsert(env, v);

  const row = await env.DB.prepare("SELECT * FROM vehicles WHERE id = ?").bind(v.id).first();
  return json({ ok: true, id: v.id, vehicle: rowToVehicle(row) });
}
