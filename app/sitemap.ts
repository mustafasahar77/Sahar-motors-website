import type { MetadataRoute } from "next";
import { site } from "@/lib/site";
import { getAllVehicles } from "@/lib/inventory";

// Emitted as a static sitemap.xml during `next build` (output: export).
export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = site.url.replace(/\/$/, "");

  const staticPaths: { path: string; priority: number }[] = [
    { path: "/", priority: 1 },
    { path: "/inventory/", priority: 0.9 },
    { path: "/services/", priority: 0.7 },
    { path: "/sell-your-car/", priority: 0.6 },
    { path: "/about/", priority: 0.5 },
    { path: "/contact/", priority: 0.6 },
  ];

  const staticEntries: MetadataRoute.Sitemap = staticPaths.map((p) => ({
    url: `${base}${p.path}`,
    changeFrequency: "weekly",
    priority: p.priority,
  }));

  // Vehicles are served by the live client view (/inventory/view/?id=…). This
  // lists the cars known at build time; newly-posted cars surface via /inventory/.
  const vehicleEntries: MetadataRoute.Sitemap = getAllVehicles().map((v) => ({
    url: `${base}/inventory/view/?id=${encodeURIComponent(v.id)}`,
    lastModified: v.dateAdded || undefined,
    changeFrequency: "weekly",
    priority: 0.5,
  }));

  return [...staticEntries, ...vehicleEntries];
}
