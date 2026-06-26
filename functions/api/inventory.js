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

  // On edit, the original id is canonical — update that row in place, never fork
  // into a new one. On create, ensure the derived id is unique.
  v.id = body.originalId ? String(body.originalId) : await uniqueId(env, v.id);
  await upsert(env, v);

  const row = await env.DB.prepare("SELECT * FROM vehicles WHERE id = ?").bind(v.id).first();
  return json({ ok: true, id: v.id, vehicle: rowToVehicle(row) });
}
