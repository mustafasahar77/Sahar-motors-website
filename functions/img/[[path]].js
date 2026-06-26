// GET /img/<key...>  → streams a photo out of KV storage. Public, long-cached.
// Existing cars keep their static /inventory/*.jpg paths; newly-uploaded photos
// live in KV and are served here.
export async function onRequestGet({ params, env }) {
  if (!env.PHOTOS) return new Response("Storage not configured", { status: 503 });

  const key = Array.isArray(params.path) ? params.path.join("/") : params.path || "";
  if (!key) return new Response("Not found", { status: 404 });

  const { value, metadata } = await env.PHOTOS.getWithMetadata(key, { type: "arrayBuffer" });
  if (!value) return new Response("Not found", { status: 404 });

  const headers = new Headers();
  headers.set("content-type", (metadata && metadata.contentType) || "image/jpeg");
  headers.set("cache-control", "public, max-age=31536000, immutable");
  return new Response(value, { headers });
}
