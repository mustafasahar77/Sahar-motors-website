import Link from "next/link";
import Container from "@/components/Container";
import HomeSearch from "@/components/home/HomeSearch";
import LiveStockCount from "@/components/home/LiveStockCount";
import { site } from "@/lib/site";
import { Car, Wrench, ShieldCheck, ArrowRight } from "@/components/icons";

type HeroProps = {
  makes: string[];
  bodyTypes: string[];
  vehicleCount: number;
};

export default function Hero({ makes, bodyTypes, vehicleCount }: HeroProps) {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-navy-900 via-navy-900 to-navy-800 text-white">
      {/* Decorative background motif */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 opacity-[0.06]">
        <Car className="absolute -right-10 top-10 h-80 w-80 text-white" />
      </div>
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 bottom-0 h-1 bg-brand-500"
      />

      <Container className="relative py-16 sm:py-20 lg:py-24">
        <div className="max-w-3xl">
          <p className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-medium text-navy-100">
            <ShieldCheck size={14} className="text-brand-400" />
            Family-owned in {site.address.city}, {site.address.province}
          </p>
          <h1 className="mt-5 text-4xl font-extrabold leading-[1.1] sm:text-5xl lg:text-6xl">
            {site.tagline}
          </h1>
          <p className="mt-5 max-w-2xl text-lg leading-relaxed text-navy-100">
            Quality pre-owned vehicles, honest pricing, and trusted in-house
            service — all under one roof at {site.name}.
          </p>

          <div className="mt-7 flex flex-wrap gap-3">
            <Link
              href="/inventory/"
              className="inline-flex items-center gap-2 rounded-lg bg-brand-500 px-6 py-3 text-base font-semibold text-white transition-colors hover:bg-brand-600"
            >
              Browse Inventory <ArrowRight size={18} />
            </Link>
            <Link
              href="/services/"
              className="inline-flex items-center gap-2 rounded-lg border border-white/25 px-6 py-3 text-base font-semibold text-white transition-colors hover:bg-white/10"
            >
              <Wrench size={18} /> Book Service
            </Link>
          </div>
        </div>

        {/* Quick search */}
        <div className="mt-10">
          <HomeSearch makes={makes} bodyTypes={bodyTypes} />
        </div>

        {/* Trust row */}
        <ul className="mt-8 flex flex-wrap gap-x-8 gap-y-2 text-sm text-navy-100">
          <li className="inline-flex items-center gap-2">
            <LiveStockCount fallback={vehicleCount} /> vehicles in stock
          </li>
          <li className="inline-flex items-center gap-2">
            <ShieldCheck size={16} className="text-brand-400" /> Every vehicle
            inspected
          </li>
          <li className="inline-flex items-center gap-2">
            <Wrench size={16} className="text-brand-400" /> In-house service &amp;
            repairs
          </li>
        </ul>
      </Container>
    </section>
  );
}
