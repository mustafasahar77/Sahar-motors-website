// POST /api/upload?carId=<id>&ext=jpg  → stores the raw image body in KV (admin only)
// Returns { url: "/img/cars/<id>/<uuid>.jpg" } to save into the vehicle's images[].
import { json, bad, checkAuth } from "../_lib.js";

const MAX_BYTES = 8 * 1024 * 1024; // 8 MB safety cap (client resizes well below this)

export async function onRequestPost({ request, env }) {
  if (!checkAuth(request, env)) return bad("Unauthorized", 401);
  if (!env.PHOTOS) return bad("Photo storage not configured", 503);

  const url = new URL(request.url);
  const carId = (url.searchParams.get("carId") || "misc").toLowerCase().replace(/[^a-z0-9-]/g, "") || "misc";
  const ext = (url.searchParams.get("ext") || "jpg").toLowerCase().replace(/[^a-z0-9]/g, "") || "jpg";
  const contentType = request.headers.get("content-type") || "image/jpeg";

  const body = await request.arrayBuffer();
  if (!body || body.byteLength < 100) return bad("Empty image upload");
  if (body.byteLength > MAX_BYTES) return bad("Image too large (max 8 MB)");

  const key = `cars/${carId}/${crypto.randomUUID()}.${ext}`;
  await env.PHOTOS.put(key, body, { metadata: { contentType } });
  return json({ ok: true, url: `/img/${key}` });
}
