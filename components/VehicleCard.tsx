"use client";

import Link from "next/link";
import VehicleImage from "@/components/VehicleImage";
import { formatMileage, formatPrice, vehicleTitle } from "@/lib/format";
import type { Vehicle } from "@/lib/types";
import { Gauge, Cog, Car, Fuel, Camera, ChevronRight } from "@/components/icons";

type VehicleCardProps = {
  vehicle: Vehicle;
  priority?: boolean;
};

const statusBadge: Record<string, { label: string; className: string }> = {
  pending: { label: "Sale Pending", className: "bg-amber-500 text-white" },
  sold: { label: "Sold", className: "bg-navy-900 text-white" },
};

export default function VehicleCard({ vehicle, priority }: VehicleCardProps) {
  const title = vehicleTitle(vehicle);
  const href = `/inventory/${vehicle.id}/`;
  const badge = statusBadge[vehicle.status];
  const photoCount = vehicle.images.length;

  return (
    <article className="group relative flex flex-col overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm transition-shadow duration-200 hover:shadow-lg">
      <Link href={href} className="relative block aspect-[16/10] overflow-hidden bg-navy-100">
        <VehicleImage
          src={vehicle.images[0]}
          alt={title}
          priority={priority}
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
        />
        {/* Status / featured overlays */}
        <div className="absolute left-3 top-3 flex flex-col gap-1.5">
          {vehicle.featured && vehicle.status === "available" && (
            <span className="inline-flex w-fit items-center rounded-full bg-brand-500 px-2.5 py-1 text-xs font-semibold text-white shadow">
              Featured
            </span>
          )}
          {badge && (
            <span
              className={`inline-flex w-fit items-center rounded-full px-2.5 py-1 text-xs font-semibold shadow ${badge.className}`}
            >
              {badge.label}
            </span>
          )}
        </div>
        {photoCount > 1 && (
          <span className="absolute bottom-3 right-3 inline-flex items-center gap-1 rounded-md bg-black/55 px-2 py-1 text-xs font-medium text-white">
            <Camera size={13} /> {photoCount}
          </span>
        )}
      </Link>

      <div className="flex flex-1 flex-col p-4">
        <div className="flex items-start justify-between gap-3">
          <h3 className="text-base font-bold leading-snug text-navy-900">
            <Link href={href} className="after:absolute after:inset-0">
              {title}
            </Link>
          </h3>
        </div>

        <p className="mt-1 text-xs font-medium uppercase tracking-wide text-slate-500">
          {vehicle.bodyType} · {vehicle.condition}
        </p>

        <div className="mt-3 text-xl font-extrabold text-brand-600">
          {formatPrice(vehicle.price)}
        </div>

        <dl className="mt-4 grid grid-cols-2 gap-y-2 gap-x-3 border-t border-slate-100 pt-4 text-sm text-slate-600">
          <div className="flex items-center gap-1.5">
            <Gauge size={16} className="text-navy-500" />
            <dt className="sr-only">Mileage</dt>
            <dd>{formatMileage(vehicle.mileage)}</dd>
          </div>
          <div className="flex items-center gap-1.5">
            <Cog size={16} className="text-navy-500" />
            <dt className="sr-only">Transmission</dt>
            <dd className="truncate">{vehicle.transmission}</dd>
          </div>
          <div className="flex items-center gap-1.5">
            <Car size={16} className="text-navy-500" />
            <dt className="sr-only">Drivetrain</dt>
            <dd>{vehicle.drivetrain}</dd>
          </div>
          <div className="flex items-center gap-1.5">
            <Fuel size={16} className="text-navy-500" />
            <dt className="sr-only">Fuel type</dt>
            <dd className="truncate">{vehicle.fuelType}</dd>
          </div>
        </dl>

        <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3 text-sm font-semibold text-navy-900">
          <span className="group-hover:text-brand-600">View Details</span>
          <ChevronRight
            size={18}
            className="text-brand-500 transition-transform group-hover:translate-x-0.5"
          />
        </div>
      </div>
    </article>
  );
}
