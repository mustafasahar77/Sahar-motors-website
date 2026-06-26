// POST /api/upload?carId=<id>  → stores the raw image body in KV (admin only)
// Returns { url: "/img/cars/<id>/<uuid>.<ext>" } to save into the vehicle's images[].
import { json, bad, checkAuth } from "../_lib.js";

const MAX_BYTES = 8 * 1024 * 1024; // 8 MB safety cap (client resizes well below this)

// Identify the image type from its magic bytes — authoritative, ignores the
// client-supplied header, and rejects anything that isn't a real raster image
// (incl. SVG/HTML, which could otherwise be served back as same-origin XSS).
function sniffImage(buf) {
  const b = new Uint8Array(buf.slice(0, 16));
  const at = (sig, off = 0) => sig.every((x, i) => b[off + i] === x);
  if (at([0xff, 0xd8, 0xff])) return { ct: "image/jpeg", ext: "jpg" };
  if (at([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])) return { ct: "image/png", ext: "png" };
  if (at([0x47, 0x49, 0x46, 0x38])) return { ct: "image/gif", ext: "gif" };
  if (at([0x52, 0x49, 0x46, 0x46]) && at([0x57, 0x45, 0x42, 0x50], 8)) return { ct: "image/webp", ext: "webp" };
  return null;
}

export async function onRequestPost({ request, env }) {
  if (!(await checkAuth(request, env))) return bad("Unauthorized", 401);
  if (!env.PHOTOS) return bad("Photo storage not configured", 503);

  const url = new URL(request.url);
  const carId = (url.searchParams.get("carId") || "misc").toLowerCase().replace(/[^a-z0-9-]/g, "") || "misc";

  const body = await request.arrayBuffer();
  if (!body || body.byteLength < 100) return bad("Empty image upload");
  if (body.byteLength > MAX_BYTES) return bad("Image too large (max 8 MB)");

  const kind = sniffImage(body);
  if (!kind) return bad("Unsupported image format — please upload a JPEG, PNG, GIF, or WebP photo.");

  const key = `cars/${carId}/${crypto.randomUUID()}.${kind.ext}`;
  await env.PHOTOS.put(key, body, { metadata: { contentType: kind.ct } });
  return json({ ok: true, url: `/img/${key}` });
}
