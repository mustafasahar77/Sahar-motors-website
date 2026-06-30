// POST /api/reorder  → set the manual display order of vehicles (admin only).
// Body: { "order": ["id-a", "id-b", ...] } — each id's sortOrder becomes its
// index in the array (0 = shown first). Ids not listed keep their current order.
import { json, bad, checkAuth } from "../_lib.js";

const MAX_BODY = 256 * 1024;

export async function onRequestPost({ request, env }) {
  if (!(await checkAuth(request, env))) return bad("Unauthorized", 401);
  if (!env.DB) return bad("Database not configured", 503);
  if (Number(request.headers.get("content-length") || 0) > MAX_BODY) return bad("Request body too large", 413);

  let body;
  try { body = await request.json(); } catch { return bad("Invalid JSON body"); }

  const ids = Array.isArray(body) ? body : Array.isArray(body && body.order) ? body.order : null;
  if (!ids) return bad("Provide an array of vehicle ids in display order");
  const clean = ids.filter((x) => typeof x === "string" && x).slice(0, 4096);
  if (!clean.length) return bad("No vehicle ids provided");

  const now = new Date().toISOString();
  const stmts = clean.map((id, i) =>
    env.DB.prepare("UPDATE vehicles SET sortOrder = ?, updatedAt = ? WHERE id = ?").bind(i, now, id),
  );
  await env.DB.batch(stmts);
  return json({ ok: true, count: stmts.length });
}
