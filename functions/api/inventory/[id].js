// GET    /api/inventory/:id  → public single vehicle
// DELETE /api/inventory/:id  → delete vehicle + its R2 photos (admin only)
import { json, bad, checkAuth, rowToVehicle } from "../../_lib.js";

export async function onRequestGet({ params, env }) {
  if (!env.DB) return bad("Database not configured", 503);
  const row = await env.DB.prepare("SELECT * FROM vehicles WHERE id = ?").bind(params.id).first();
  if (!row) return bad("Vehicle not found", 404);
  return json(rowToVehicle(row));
}

export async function onRequestDelete({ params, env, request }) {
  if (!checkAuth(request, env)) return bad("Unauthorized", 401);
  if (!env.DB) return bad("Database not configured", 503);

  const row = await env.DB.prepare("SELECT images FROM vehicles WHERE id = ?").bind(params.id).first();
  if (row && env.PHOTOS) {
    try {
      const imgs = JSON.parse(row.images || "[]");
      for (const u of imgs) {
        if (typeof u === "string" && u.startsWith("/img/")) {
          await env.PHOTOS.delete(u.slice("/img/".length));
        }
      }
    } catch { /* best-effort photo cleanup */ }
  }
  await env.DB.prepare("DELETE FROM vehicles WHERE id = ?").bind(params.id).run();
  return json({ ok: true });
}
