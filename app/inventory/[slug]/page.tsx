import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import Container from "@/components/Container";
import CarGallery from "@/components/CarGallery";
import ContactForm from "@/components/ContactForm";
import VehicleCard from "@/components/VehicleCard";
import {
  getAllSlugs,
  getVehicleBySlug,
  getAvailableVehicles,
} from "@/lib/inventory";
import { formatMileage, formatPrice, vehicleTitle } from "@/lib/format";
import { safeJsonLd } from "@/lib/jsonld";
import { site } from "@/lib/site";
import type { Drivetrain, Vehicle } from "@/lib/types";
import {
  Phone,
  MapPin,
  Check,
  Calendar,
  Gauge,
  Cog,
  Car,
  Fuel,
  ChevronRight,
  ExternalLink,
  ShieldCheck,
  ArrowRight,
} from "@/components/icons";

// Pre-render one static page per vehicle (required for `output: export`).
export function generateStaticParams() {
  return getAllSlugs().map((slug) => ({ slug }));
}

// Only the slugs above exist; anything else is a 404 (no runtime generation).
export const dynamicParams = false;

const mapsHref = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
  site.mapsQuery,
)}`;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const vehicle = getVehicleBySlug(slug);
  if (!vehicle) {
    return { title: "Vehicle Not Found" };
  }
  const title = vehicleTitle(vehicle);
  const priceText =
    vehicle.price !== null ? ` — ${formatPrice(vehicle.price)}` : "";
  const description = vehicle.description
    ? vehicle.description.slice(0, 155)
    : `${title} with ${formatMileage(vehicle.mileage)} at ${site.name} in ${site.address.city}, ${site.address.province}.`;
  const image = vehicle.images[0] ?? "/og.svg";

  return {
    title: `${title}${priceText}`,
    description,
    alternates: { canonical: `/inventory/${vehicle.id}/` },
    openGraph: {
      title: `${title} | ${site.name}`,
      description,
      images: [{ url: image, alt: title }],
      type: "website",
    },
  };
}

const statusNotice: Record<
  string,
  { label: string; className: string } | undefined
> = {
  pending: {
    label: "Sale Pending — contact us to join the waitlist for similar vehicles.",
    className: "border-amber-200 bg-amber-50 text-amber-800",
  },
  sold: {
    label: "This vehicle has sold — but we get similar ones in regularly. Reach out!",
    className: "border-slate-300 bg-slate-100 text-slate-700",
  },
};

export default async function VehicleDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const vehicle = getVehicleBySlug(slug);
  if (!vehicle) notFound();

  const title = vehicleTitle(vehicle);
  const notice = statusNotice[vehicle.status];
  const specs = buildSpecs(vehicle);
  const similar = getSimilarVehicles(vehicle);
  const jsonLd = buildVehicleJsonLd(vehicle, title);

  const inquiryMessage = `Hi, I'm interested in the ${title}${
    vehicle.stockNumber ? ` (Stock #${vehicle.stockNumber})` : ""
  }. Is it still available? Please get in touch with more details.`;

  return (
    <div className="bg-slate-50">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: safeJsonLd(jsonLd) }}
      />
      <Container className="py-6 sm:py-8">
        {/* Breadcrumb */}
        <nav aria-label="Breadcrumb" className="mb-4">
          <ol className="flex flex-wrap items-center gap-1 text-sm text-slate-500">
            <li>
              <Link href="/" className="hover:text-navy-900">
                Home
              </Link>
            </li>
            <ChevronRight size={14} className="text-slate-400" />
            <li>
              <Link href="/inventory/" className="hover:text-navy-900">
                Inventory
              </Link>
            </li>
            <ChevronRight size={14} className="text-slate-400" />
            <li className="font-medium text-navy-900">{title}</li>
          </ol>
        </nav>

        <div className="grid gap-8 lg:grid-cols-[1fr_minmax(320px,380px)] lg:items-start">
          {/* Gallery */}
          <div className="lg:col-start-1 lg:row-start-1">
            <CarGallery images={vehicle.images} title={title} />
          </div>

          {/* Right rail: price/CTA card + inquiry form (spans both grid rows) */}
          <div className="space-y-6 lg:col-start-2 lg:row-span-2 lg:row-start-1">
            <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
              <p className="text-sm font-medium uppercase tracking-wide text-slate-500">
                {vehicle.condition} · {vehicle.bodyType}
              </p>
              <h1 className="mt-1 text-2xl font-extrabold leading-tight text-navy-900">
                {title}
              </h1>
              <div className="mt-3 text-3xl font-extrabold text-brand-600">
                {formatPrice(vehicle.price)}
              </div>
              {vehicle.price !== null && (
                <p className="mt-1 text-xs text-slate-500">
                  Plus applicable taxes &amp; documentation fees.
                </p>
              )}

              {notice && (
                <p
                  className={`mt-4 rounded-lg border px-3 py-2 text-sm ${notice.className}`}
                >
                  {notice.label}
                </p>
              )}

              <dl className="mt-5 grid grid-cols-2 gap-3 border-t border-slate-100 pt-5 text-sm">
                <KeyFact icon={<Calendar size={16} />} label="Year" value={String(vehicle.year)} />
                <KeyFact icon={<Gauge size={16} />} label="Mileage" value={formatMileage(vehicle.mileage)} />
                <KeyFact icon={<Cog size={16} />} label="Transmission" value={vehicle.transmission} />
                <KeyFact icon={<Car size={16} />} label="Drivetrain" value={vehicle.drivetrain} />
                <KeyFact icon={<Fuel size={16} />} label="Fuel" value={vehicle.fuelType} />
                {vehicle.stockNumber && (
                  <KeyFact icon={<ShieldCheck size={16} />} label="Stock #" value={vehicle.stockNumber} />
                )}
              </dl>

              <div className="mt-5 space-y-2.5">
                <a
                  href={site.phones[0].href}
                  className="flex w-full items-center justify-center gap-2 rounded-lg bg-brand-500 px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-brand-600"
                >
                  <Phone size={17} /> Call {site.phones[0].value}
                </a>
                <a
                  href="#inquire"
                  className="flex w-full items-center justify-center gap-2 rounded-lg border border-navy-300 bg-white px-4 py-3 text-sm font-semibold text-navy-900 transition-colors hover:bg-navy-50"
                >
                  Ask About This Vehicle <ArrowRight size={16} />
                </a>
                <a
                  href={mapsHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex w-full items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-medium text-navy-700 hover:text-brand-600"
                >
                  <MapPin size={16} /> Get Directions
                </a>
              </div>

              {vehicle.carfaxUrl && (
                <a
                  href={vehicle.carfaxUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-3 flex items-center justify-center gap-1.5 text-xs font-semibold text-navy-600 hover:text-brand-600"
                >
                  View CARFAX Report <ExternalLink size={13} />
                </a>
              )}
            </div>

            <section
              id="inquire"
              className="scroll-mt-[5.5rem] rounded-xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6"
            >
              <h2 className="text-lg font-bold text-navy-900">
                Ask About This Vehicle
              </h2>
              <p className="mt-1 text-sm text-slate-600">
                Send us a message and we&apos;ll get right back to you.
              </p>
              <div className="mt-4">
                <ContactForm
                  subject={`Vehicle Inquiry: ${title}${
                    vehicle.stockNumber ? ` (Stock #${vehicle.stockNumber})` : ""
                  }`}
                  hiddenFields={{
                    vehicle: title,
                    vehicle_id: vehicle.id,
                    ...(vehicle.stockNumber
                      ? { stock_number: vehicle.stockNumber }
                      : {}),
                  }}
                  defaultMessage={inquiryMessage}
                  submitLabel="Send Inquiry"
                  requirePhone
                />
              </div>
            </section>
          </div>

          {/* Details */}
          <div className="space-y-8 lg:col-start-1 lg:row-start-2">
            {vehicle.description && (
              <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
                <h2 className="text-lg font-bold text-navy-900">Overview</h2>
                <p className="mt-3 whitespace-pre-line leading-relaxed text-slate-700">
                  {vehicle.description}
                </p>
              </section>
            )}

            <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
              <h2 className="text-lg font-bold text-navy-900">Specifications</h2>
              <dl className="mt-4 grid grid-cols-1 gap-x-8 sm:grid-cols-2">
                {specs.map((spec) => (
                  <div
                    key={spec.label}
                    className="flex justify-between gap-4 border-b border-slate-100 py-2.5 text-sm"
                  >
                    <dt className="text-slate-500">{spec.label}</dt>
                    <dd className="text-right font-medium text-navy-900">
                      {spec.value}
                    </dd>
                  </div>
                ))}
              </dl>
            </section>

            {vehicle.features.length > 0 && (
              <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
                <h2 className="text-lg font-bold text-navy-900">
                  Features &amp; Options
                </h2>
                <ul className="mt-4 grid grid-cols-1 gap-x-6 gap-y-2.5 sm:grid-cols-2">
                  {vehicle.features.map((f) => (
                    <li
                      key={f}
                      className="flex items-center gap-2.5 text-sm text-slate-700"
                    >
                      <Check size={16} className="shrink-0 text-green-600" />
                      {f}
                    </li>
                  ))}
                </ul>
              </section>
            )}
          </div>

        </div>

        {/* Similar vehicles */}
        {similar.length > 0 && (
          <section className="mt-14">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-extrabold text-navy-900">
                Similar Vehicles
              </h2>
              <Link
                href="/inventory/"
                className="inline-flex items-center gap-1 text-sm font-semibold text-brand-600 hover:underline"
              >
                View all <ArrowRight size={15} />
              </Link>
            </div>
            <div className="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {similar.map((v) => (
                <VehicleCard key={v.id} vehicle={v} />
              ))}
            </div>
          </section>
        )}
      </Container>
    </div>
  );
}

function KeyFact({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start gap-2">
      <span className="mt-0.5 text-navy-500">{icon}</span>
      <div>
        <dt className="text-xs text-slate-500">{label}</dt>
        <dd className="font-semibold text-navy-900">{value}</dd>
      </div>
    </div>
  );
}

function buildSpecs(v: Vehicle): { label: string; value: string }[] {
  const rows: { label: string; value: string | number | undefined }[] = [
    { label: "Year", value: v.year || undefined },
    { label: "Make", value: v.make },
    { label: "Model", value: v.model },
    { label: "Trim", value: v.trim },
    { label: "Body Type", value: v.bodyType },
    { label: "Mileage", value: formatMileage(v.mileage) },
    { label: "Condition", value: v.condition },
    { label: "Transmission", value: v.transmission },
    { label: "Drivetrain", value: v.drivetrain },
    { label: "Fuel Type", value: v.fuelType },
    { label: "Engine", value: v.engine },
    { label: "Cylinders", value: v.cylinders },
    { label: "Exterior Color", value: v.exteriorColor },
    { label: "Interior Color", value: v.interiorColor },
    { label: "Doors", value: v.doors },
    { label: "Seats", value: v.seats },
    { label: "VIN", value: v.vin },
    { label: "Stock #", value: v.stockNumber },
  ];
  return rows
    .filter(
      (r) =>
        r.value !== undefined &&
        r.value !== null &&
        String(r.value).trim() !== "" &&
        String(r.value) !== "—",
    )
    .map((r) => ({ label: r.label, value: String(r.value) }));
}

function getSimilarVehicles(current: Vehicle): Vehicle[] {
  const pool = getAvailableVehicles().filter((v) => v.id !== current.id);
  const scored = pool
    .map((v) => {
      let score = 0;
      if (v.bodyType === current.bodyType) score += 3;
      if (v.make === current.make) score += 2;
      if (current.price !== null && v.price !== null) {
        const diff = Math.abs(v.price - current.price);
        if (diff < 5000) score += 2;
        else if (diff < 10000) score += 1;
      }
      return { v, score };
    })
    .sort((a, b) => b.score - a.score || b.v.dateAdded.localeCompare(a.v.dateAdded));
  return scored.slice(0, 3).map((s) => s.v);
}

const DRIVE_WHEEL_URLS: Record<Drivetrain, string> = {
  FWD: "https://schema.org/FrontWheelDriveConfiguration",
  RWD: "https://schema.org/RearWheelDriveConfiguration",
  AWD: "https://schema.org/AllWheelDriveConfiguration",
  "4WD": "https://schema.org/FourWheelDriveConfiguration",
};

function buildVehicleJsonLd(v: Vehicle, title: string) {
  const availability =
    v.status === "sold"
      ? "https://schema.org/SoldOut"
      : v.status === "pending"
        ? "https://schema.org/LimitedAvailability"
        : "https://schema.org/InStock";

  const jsonLd: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "Car",
    name: title,
    brand: { "@type": "Brand", name: v.make },
    model: v.model,
    vehicleModelDate: String(v.year),
    mileageFromOdometer: {
      "@type": "QuantitativeValue",
      value: v.mileage,
      unitCode: "KMT",
    },
    vehicleTransmission: v.transmission,
    fuelType: v.fuelType,
    driveWheelConfiguration: DRIVE_WHEEL_URLS[v.drivetrain],
    color: v.exteriorColor,
    itemCondition: "https://schema.org/UsedCondition",
  };
  if (v.vin) jsonLd.vehicleIdentificationNumber = v.vin;
  if (v.images.length > 0) {
    jsonLd.image = v.images.map((src) => `${site.url}${src}`);
  }
  if (v.price !== null) {
    jsonLd.offers = {
      "@type": "Offer",
      price: v.price,
      priceCurrency: "CAD",
      availability,
      priceValidUntil: `${new Date().getFullYear() + 1}-12-31`,
      url: `${site.url}/inventory/${v.id}/`,
      seller: { "@type": "AutoDealer", name: site.name },
    };
  }
  return jsonLd;
}
