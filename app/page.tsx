import type { Metadata } from "next";
import Hero from "@/components/home/Hero";
import ValueProps from "@/components/home/ValueProps";
import FeaturedVehicles from "@/components/home/FeaturedVehicles";
import ServicesTeaser from "@/components/home/ServicesTeaser";
import Testimonials from "@/components/home/Testimonials";
import CTASection from "@/components/home/CTASection";
import { getAvailableVehicles, availableVehicleCount } from "@/lib/inventory";
import { computeFacets } from "@/lib/filters";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  description: `Shop quality pre-owned vehicles in ${site.address.city}, ${site.address.province} at honest, affordable prices — plus trusted in-house auto service. Browse the Sahar Motors inventory and get in touch today.`,
  openGraph: {
    description: `Quality used cars and trusted in-house service in ${site.address.city}, ${site.address.province}. Browse the Sahar Motors inventory.`,
  },
};

export default function Home() {
  const facets = computeFacets(getAvailableVehicles());
  const makes = facets.makes.map((m) => m.value);
  const bodyTypes = facets.bodyTypes.map((b) => b.value);

  return (
    <>
      <Hero
        makes={makes}
        bodyTypes={bodyTypes}
        vehicleCount={availableVehicleCount}
      />
      <ValueProps />
      <FeaturedVehicles />
      <ServicesTeaser />
      <Testimonials />
      <CTASection />
    </>
  );
}
