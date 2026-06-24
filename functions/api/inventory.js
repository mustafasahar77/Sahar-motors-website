// GET  /api/inventory        → public list of all vehicles
// POST /api/inventory        → create or update a vehicle (admin only)
import { json, bad, checkAuth, rowToVehicle, sanitizeVehicle, upsert, uniqueId } from "../_lib.js";

export async function onRequestGet({ env }) {
  if (!env.DB) return bad("Database not configured", 503);
  const { results } = await env.DB.prepare("SELECT * FROM vehicles").all();
  return json((results || []).map(rowToVehicle));
}

export async function onRequestPost({ request, env }) {
  if (!checkAuth(request, env)) return bad("Unauthorized", 401);
  if (!env.DB) return bad("Database not configured", 503);
  let body;
  try { body = await request.json(); } catch { return bad("Invalid JSON body"); }

  const v = sanitizeVehicle(body);
  if (!v) return bad("Make and model are required");

  // body.originalId is sent when editing so we don't fork the record into a new id.
  v.id = await uniqueId(env, v.id, body.originalId);
  await upsert(env, v);

  const row = await env.DB.prepare("SELECT * FROM vehicles WHERE id = ?").bind(v.id).first();
  return json({ ok: true, id: v.id, vehicle: rowToVehicle(row) });
}
