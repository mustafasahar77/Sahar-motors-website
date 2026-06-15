import type { Metadata } from "next";
import PageHeader from "@/components/PageHeader";
import InventoryBrowser from "@/components/InventoryBrowser";
import {
  getAllVehicles,
  getAvailableVehicles,
  availableVehicleCount,
} from "@/lib/inventory";
import { computeFacets } from "@/lib/filters";

export const metadata: Metadata = {
  title: "Used Car Inventory",
  description:
    "Browse Sahar Motors' full inventory of quality pre-owned vehicles in Langley, BC. Filter by make, body type, price, year, mileage and more.",
  alternates: { canonical: "/inventory/" },
};

export default function InventoryPage() {
  const vehicles = getAllVehicles();
  // Facets (option counts + numeric ranges) are derived from the default,
  // non-sold view so a sold-only value never shows a count that yields zero
  // results. Sold cars still load (passed below) for the "include sold" toggle.
  const facets = computeFacets(getAvailableVehicles());

  return (
    <>
      <PageHeader
        title="Our Inventory"
        subtitle={`Explore our selection of ${availableVehicleCount} quality pre-owned vehicles. Every vehicle is inspected and priced to move.`}
        breadcrumb={[{ label: "Home", href: "/" }, { label: "Inventory" }]}
      />
      <div className="py-8 sm:py-10">
        <InventoryBrowser vehicles={vehicles} facets={facets} />
      </div>
    </>
  );
}
