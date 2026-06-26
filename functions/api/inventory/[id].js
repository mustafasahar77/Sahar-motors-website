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
  if (!(await checkAuth(request, env))) return bad("Unauthorized", 401);
  if (!env.DB) return bad("Database not configured", 503);

  const row = await env.DB.prepare("SELECT images FROM vehicles WHERE id = ?").bind(params.id).first();
  await env.DB.prepare("DELETE FROM vehicles WHERE id = ?").bind(params.id).run();

  if (row && env.PHOTOS) {
    try {
      const mine = JSON.parse(row.images || "[]").filter((u) => typeof u === "string" && u.startsWith("/img/"));
      if (mine.length) {
        // Never delete a photo another vehicle still references (e.g. a duplicate).
        const others = await env.DB.prepare("SELECT images FROM vehicles").all();
        const referenced = new Set();
        for (const r of others.results || []) {
          try { JSON.parse(r.images || "[]").forEach((u) => referenced.add(u)); } catch { /* skip */ }
        }
        for (const u of mine) {
          if (!referenced.has(u)) {
            try { await env.PHOTOS.delete(u.slice("/img/".length)); } catch { /* per-photo best effort */ }
          }
        }
      }
    } catch { /* best-effort photo cleanup */ }
  }
  return json({ ok: true });
}
