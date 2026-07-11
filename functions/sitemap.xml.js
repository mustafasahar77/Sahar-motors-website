// GET /sitemap.xml → live sitemap built from D1, so cars posted via /admin are
// visible to search engines immediately (the build-time sitemap only knows the
// inventory as of the last deploy). Falls back to the static file if D1 is
// unavailable. Functions run before static assets, so this shadows the built one.

const BASE = "https://www.saharmotors.com"; // keep in sync with site.url in lib/site.ts

const STATIC_PATHS = [
  { path: "/", priority: "1.0" },
  { path: "/inventory/", priority: "0.9" },
  { path: "/services/", priority: "0.7" },
  { path: "/sell-your-car/", priority: "0.6" },
  { path: "/about/", priority: "0.5" },
  { path: "/contact/", priority: "0.6" },
];

const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&apos;");

export async function onRequestGet({ env, request }) {
  try {
    if (!env.DB) throw new Error("no DB");
    const { results } = await env.DB
      .prepare("SELECT id, dateAdded, updatedAt FROM vehicles ORDER BY sortOrder")
      .all();

    const urls = [];
    for (const p of STATIC_PATHS) {
      urls.push(`<url><loc>${BASE}${p.path}</loc><changefreq>weekly</changefreq><priority>${p.priority}</priority></url>`);
    }
    for (const r of results || []) {
      const loc = `${BASE}/inventory/view/?id=${encodeURIComponent(r.id)}`;
      // lastmod prefers the true update time; falls back to the listing date.
      const mod = (r.updatedAt || r.dateAdded || "").slice(0, 10);
      urls.push(`<url><loc>${esc(loc)}</loc>${mod ? `<lastmod>${esc(mod)}</lastmod>` : ""}<changefreq>weekly</changefreq><priority>0.5</priority></url>`);
    }

    const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.join("\n")}\n</urlset>`;
    return new Response(xml, {
      headers: {
        "content-type": "application/xml; charset=utf-8",
        // fresh enough for daily inventory changes, cheap on the free tier
        "cache-control": "public, max-age=3600",
      },
    });
  } catch {
    // D1 hiccup — serve the build-time sitemap instead of failing.
    return env.ASSETS.fetch(request);
  }
}
