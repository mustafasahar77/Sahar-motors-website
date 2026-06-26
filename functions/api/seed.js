// POST /api/seed  → bulk insert/update vehicles (admin only).
// Used once by the admin "Import current inventory" button to load the existing
// cars into D1. Idempotent: re-running overwrites by id, never duplicates.
import { json, bad, checkAuth, sanitizeVehicle, upsert } from "../_lib.js";

export async function onRequestPost({ request, env }) {
  if (!checkAuth(request, env)) return bad("Unauthorized", 401);
  if (!env.DB) return bad("Database not configured", 503);
  let body;
  try { body = await request.json(); } catch { return bad("Invalid JSON body"); }

  const list = Array.isArray(body) ? body : Array.isArray(body.vehicles) ? body.vehicles : [];
  if (!list.length) return bad("No vehicles provided");

  let seeded = 0, skipped = 0;
  for (const item of list) {
    const v = sanitizeVehicle(item);
    if (!v) { skipped += 1; continue; }
    await upsert(env, v);
    seeded += 1;
  }
  return json({ ok: true, seeded, skipped });
}
