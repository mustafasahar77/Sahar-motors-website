// GET /img/<key...>  → streams a photo out of the R2 bucket. Public, long-cached.
// Existing cars keep their static /inventory/*.jpg paths; newly-uploaded photos
// live in R2 and are served here.
export async function onRequestGet({ params, env }) {
  if (!env.BUCKET) return new Response("Storage not configured", { status: 503 });

  const key = Array.isArray(params.path) ? params.path.join("/") : params.path || "";
  if (!key) return new Response("Not found", { status: 404 });

  const object = await env.BUCKET.get(key);
  if (!object || !object.body) return new Response("Not found", { status: 404 });

  const headers = new Headers();
  object.writeHttpMetadata(headers);
  headers.set("etag", object.httpEtag);
  headers.set("cache-control", "public, max-age=31536000, immutable");
  return new Response(object.body, { headers });
}
