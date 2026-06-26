// GET /img/<key...>  → streams a photo out of KV storage. Public, long-cached.
// Existing cars keep their static /inventory/*.jpg paths; newly-uploaded photos
// live in KV and are served here.
const ALLOWED = ["image/jpeg", "image/png", "image/gif", "image/webp"];

export async function onRequestGet({ params, env }) {
  if (!env.PHOTOS) return new Response("Storage not configured", { status: 503 });

  const key = Array.isArray(params.path) ? params.path.join("/") : params.path || "";
  if (!key) return new Response("Not found", { status: 404 });

  const { value, metadata } = await env.PHOTOS.getWithMetadata(key, { type: "arrayBuffer" });
  if (!value) return new Response("Not found", { status: 404 });

  // Only ever serve a known image type, and tell browsers not to MIME-sniff — so a
  // stored object can never be interpreted as HTML/script on our origin.
  let ct = (metadata && metadata.contentType) || "image/jpeg";
  if (!ALLOWED.includes(ct)) ct = "application/octet-stream";

  const headers = new Headers();
  headers.set("content-type", ct);
  headers.set("x-content-type-options", "nosniff");
  headers.set("cache-control", "public, max-age=31536000, immutable");
  return new Response(value, { headers });
}
