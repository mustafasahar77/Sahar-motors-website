import type { Metadata } from "next";
import PageHeader from "@/components/PageHeader";
import LiveInventory from "@/components/LiveInventory";

export const metadata: Metadata = {
  title: "Used Car Inventory",
  description:
    "Browse Sahar Motors' full inventory of quality pre-owned vehicles in Langley, BC. Filter by make, body type, price, year, mileage and more.",
  alternates: { canonical: "/inventory/" },
};

export default function InventoryPage() {
  return (
    <>
      <PageHeader
        title="Our Inventory"
        subtitle="Explore our selection of quality pre-owned vehicles. Every vehicle is inspected and priced to move."
        breadcrumb={[{ label: "Home", href: "/" }, { label: "Inventory" }]}
      />
      {/* Inventory loads live from the backend so newly-posted cars appear instantly. */}
      <div className="py-8 sm:py-10">
        <LiveInventory />
      </div>
    </>
  );
}
