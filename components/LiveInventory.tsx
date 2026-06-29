"use client";

import { useEffect, useState } from "react";
import InventoryBrowser from "@/components/InventoryBrowser";
import { computeFacets } from "@/lib/filters";
import { getAllVehicles } from "@/lib/inventory";
import { apiList } from "@/lib/adminApi";
import type { Vehicle } from "@/lib/types";
import { Car } from "@/components/icons";

// Loads inventory live from the backend so newly-posted cars appear instantly.
// Falls back to the inventory bundled at build time if the API isn't reachable
// (e.g. before the Cloudflare backend is set up) so the page never goes blank.
export default function LiveInventory() {
  const [vehicles, setVehicles] = useState<Vehicle[] | null>(null);

  useEffect(() => {
    let alive = true;
    apiList()
      .then((data) => {
        if (!alive) return;
        setVehicles(Array.isArray(data) && data.length > 0 ? data : getAllVehicles());
      })
      .catch(() => {
        if (alive) setVehicles(getAllVehicles());
      });
    return () => {
      alive = false;
    };
  }, []);

  if (!vehicles) {
    return (
      <div className="mx-auto w-full max-w-7xl px-4 py-24 text-center text-slate-500 sm:px-6 lg:px-8">
        <Car size={36} className="mx-auto animate-pulse text-slate-300" />
        <p className="mt-3 text-sm">Loading inventory…</p>
      </div>
    );
  }

  // Facets are built from the FULL set (including sold) so that when a shopper
  // turns on "Include sold", every sold car's make/body/etc. still appears as a
  // filter option instead of silently missing.
  const facets = computeFacets(vehicles);
  return <InventoryBrowser vehicles={vehicles} facets={facets} />;
}
