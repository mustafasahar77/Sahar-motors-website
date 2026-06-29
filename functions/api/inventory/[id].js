// GET    /api/inventory/:id  → public single vehicle
// DELETE /api/inventory/:id  → delete vehicle + its KV photos (admin only)
import { json, bad, checkAuth, rowToVehicle, deleteOrphanPhotos, safeArr } from "../../_lib.js";

export async function onRequestGet({ params, env }) {
  if (!env.DB) return bad("Database not configured", 503);
  const row = await env.DB.prepare("SELECT * FROM vehicles WHERE id = ?").bind(params.id).first();
  if (!row) return bad("Vehicle not found", 404);
  return json(rowToVehicle(row));
}

export async function onRequestDelete({ params, env, request }) {
  if (!(await checkAuth(request, env))) return bad("Unauthorized", 401);
  if (!env.DB) return bad("Database not configured", 503);

  const row = await env.DB.prepare("SELECT images FROM vehicles WHERE id = ?").bind(params.id).first();
  await env.DB.prepare("DELETE FROM vehicles WHERE id = ?").bind(params.id).run();

  // Reclaim this car's KV photos that no other listing still references.
  if (row) {
    try { await deleteOrphanPhotos(env, safeArr(row.images), null); } catch { /* best effort */ }
  }
  return json({ ok: true });
}
