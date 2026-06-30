"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Container from "@/components/Container";
import VehicleCard from "@/components/VehicleCard";
import { getFeaturedVehicles } from "@/lib/inventory";
import { apiList } from "@/lib/adminApi";
import type { Vehicle } from "@/lib/types";
import { ArrowRight } from "@/components/icons";

// Mirror lib/inventory getFeaturedVehicles: flagged-available first, then the
// rest, each in the dealer's manual display order (sortOrder), capped at `limit`.
function pickFeatured(all: Vehicle[], limit = 6): Vehicle[] {
  const byOrder = (a: Vehicle, b: Vehicle) =>
    (a.sortOrder ?? 0) - (b.sortOrder ?? 0) || (b.dateAdded || "").localeCompare(a.dateAdded || "");
  const available = all.filter((v) => v.status !== "sold");
  const flagged = available.filter((v) => v.featured).sort(byOrder);
  const rest = available.filter((v) => !v.featured).sort(byOrder);
  return [...flagged, ...rest].slice(0, limit);
}

export default function FeaturedVehicles() {
  // Seed with the build-time set so the section renders immediately (and in the
  // prerendered HTML), then refresh to live data after mount so a freshly-posted
  // or newly-featured car shows up without a rebuild.
  const [vehicles, setVehicles] = useState<Vehicle[]>(() => getFeaturedVehicles(6));

  useEffect(() => {
    let alive = true;
    apiList()
      .then((list) => {
        if (alive && Array.isArray(list) && list.length) setVehicles(pickFeatured(list));
      })
      .catch(() => {
        /* keep the seeded build-time set on failure */
      });
    return () => {
      alive = false;
    };
  }, []);

  if (vehicles.length === 0) return null;

  return (
    <section className="bg-slate-50 py-16 sm:py-20">
      <Container>
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h2 className="text-3xl font-extrabold text-navy-900">
              Featured Vehicles
            </h2>
            <p className="mt-2 text-slate-600">
              A look at some of the standout vehicles on our lot right now.
            </p>
          </div>
          <Link
            href="/inventory/"
            className="inline-flex items-center gap-2 rounded-lg border border-navy-300 bg-white px-5 py-2.5 text-sm font-semibold text-navy-900 transition-colors hover:bg-navy-50"
          >
            View All Inventory <ArrowRight size={16} />
          </Link>
        </div>

        <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {vehicles.map((v, i) => (
            <VehicleCard key={v.id} vehicle={v} priority={i < 3} />
          ))}
        </div>
      </Container>
    </section>
  );
}
