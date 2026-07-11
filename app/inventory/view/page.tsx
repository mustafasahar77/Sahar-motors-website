"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Container from "@/components/Container";
import CarGallery from "@/components/CarGallery";
import ContactForm from "@/components/ContactForm";
import VehicleCard from "@/components/VehicleCard";
import { formatMileage, formatPrice, vehicleTitle } from "@/lib/format";
import { site } from "@/lib/site";
import { safeJsonLd } from "@/lib/jsonld";
import { apiGet, apiList } from "@/lib/adminApi";
import { getAllVehicles } from "@/lib/inventory";
import type { Vehicle } from "@/lib/types";
import {
  Phone, MapPin, Check, Calendar, Gauge, Cog, Car, Fuel,
  ChevronRight, ExternalLink, ShieldCheck, ArrowRight,
  Share2, MessageSquare, Star,
} from "@/components/icons";

const mapsHref = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(site.mapsQuery)}`;

// Texting goes to the mobile line when one is listed (texting a landline goes
// nowhere); "?&body=" prefills the message on both iOS and Android.
const textPhone = site.phones.at(1) ?? site.phones[0];
const smsHref = (message: string) =>
  `sms:${textPhone.href.replace("tel:", "")}?&body=${encodeURIComponent(message)}`;

const statusNotice: Record<string, { label: string; className: string } | undefined> = {
  pending: {
    label: "Sale Pending — contact us to join the waitlist for similar vehicles.",
    className: "border-amber-200 bg-amber-50 text-amber-800",
  },
  sold: {
    label: "This vehicle has sold — but we get similar ones in regularly. Reach out!",
    className: "border-slate-300 bg-slate-100 text-slate-700",
  },
};

function buildSpecs(v: Vehicle): { label: string; value: string }[] {
  const rows: { label: string; value: string | number | undefined | null }[] = [
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
    { label: "Cylinders", value: v.cylinders || undefined },
    { label: "Exterior Color", value: v.exteriorColor },
    { label: "Interior Color", value: v.interiorColor },
    { label: "Doors", value: v.doors || undefined },
    { label: "Seats", value: v.seats || undefined },
    { label: "VIN", value: v.vin },
    { label: "Stock #", value: v.stockNumber },
  ];
  return rows
    .filter(
      (r) =>
        r.value !== undefined &&
        r.value !== null &&
        String(r.value).trim() !== "" &&
        String(r.value) !== "—" &&
        String(r.value) !== "N/A",
    )
    .map((r) => ({ label: r.label, value: String(r.value) }));
}

function getSimilar(current: Vehicle, pool: Vehicle[]): Vehicle[] {
  const scored = pool
    .filter((v) => v.id !== current.id && v.status !== "sold")
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

function setMeta(attr: "name" | "property", key: string, content: string) {
  let el = document.head.querySelector(`meta[${attr}="${key}"]`) as HTMLMetaElement | null;
  if (!el) {
    el = document.createElement("meta");
    el.setAttribute(attr, key);
    document.head.appendChild(el);
  }
  el.setAttribute("content", content);
}
function setLink(rel: string, href: string) {
  let el = document.head.querySelector(`link[rel="${rel}"]`) as HTMLLinkElement | null;
  if (!el) {
    el = document.createElement("link");
    el.setAttribute("rel", rel);
    document.head.appendChild(el);
  }
  el.setAttribute("href", href);
}

export default function VehicleViewPage() {
  const [id, setId] = useState<string | null>(null);
  const [urlRead, setUrlRead] = useState(false);
  const [vehicle, setVehicle] = useState<Vehicle | null | undefined>(undefined);
  const [pool, setPool] = useState<Vehicle[]>([]);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    // Read the ?id= after mount (window is undefined during static prerender);
    // setting state here is intentional and avoids a hydration mismatch.
    /* eslint-disable react-hooks/set-state-in-effect */
    setId(new URLSearchParams(window.location.search).get("id"));
    setUrlRead(true);
    /* eslint-enable react-hooks/set-state-in-effect */
  }, []);

  useEffect(() => {
    if (!urlRead) return;
    if (!id) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setVehicle(null);
      return;
    }
    let alive = true;
    (async () => {
      try {
        const v = await apiGet(id);
        if (alive) setVehicle(v ?? getAllVehicles().find((x) => x.id === id) ?? null);
      } catch {
        if (alive) setVehicle(getAllVehicles().find((x) => x.id === id) ?? null);
      }
      try {
        const list = await apiList();
        if (alive) setPool(list.length ? list : getAllVehicles());
      } catch {
        if (alive) setPool(getAllVehicles());
      }
    })();
    return () => {
      alive = false;
    };
  }, [urlRead, id]);

  // Per-vehicle SEO: this is a client-rendered route (for instant new cars), so
  // set the document title + meta/canonical/OG tags after the vehicle loads.
  // Googlebot renders JS and indexes these; the static site-level OG is the
  // fallback for non-JS social scrapers.
  useEffect(() => {
    if (!vehicle) return;
    const title = `${vehicleTitle(vehicle)} | ${site.name}`;
    document.title = title;
    const desc = (vehicle.description ||
      `${vehicleTitle(vehicle)} at ${site.name} in ${site.address.city}, ${site.address.province}.`).slice(0, 160);
    const url = `${site.url}/inventory/view/?id=${encodeURIComponent(vehicle.id)}`;
    const first = vehicle.images[0];
    const img = first ? (first.startsWith("http") ? first : `${site.url}${first}`) : `${site.url}/og.png`;
    setMeta("name", "description", desc);
    setLink("canonical", url);
    setMeta("property", "og:title", title);
    setMeta("property", "og:description", desc);
    setMeta("property", "og:image", img);
    setMeta("property", "og:url", url);
    setMeta("name", "twitter:card", "summary_large_image");
    setMeta("name", "twitter:image", img);

    // schema.org Car + Offer — the structured data Google uses for used-vehicle
    // listings. Googlebot renders JS, so client injection is indexed. Price is
    // only claimed when one is set; sold/pending map to availability honestly.
    const jsonLd: Record<string, unknown> = {
      "@context": "https://schema.org",
      "@type": "Car",
      name: vehicleTitle(vehicle),
      brand: { "@type": "Brand", name: vehicle.make },
      model: vehicle.model,
      ...(vehicle.year ? { vehicleModelDate: String(vehicle.year) } : {}),
      ...(vehicle.trim ? { vehicleConfiguration: vehicle.trim } : {}),
      bodyType: vehicle.bodyType,
      fuelType: vehicle.fuelType,
      vehicleTransmission: vehicle.transmission,
      driveWheelConfiguration: vehicle.drivetrain,
      ...(vehicle.exteriorColor && vehicle.exteriorColor !== "—" ? { color: vehicle.exteriorColor } : {}),
      ...(vehicle.mileage > 0
        ? { mileageFromOdometer: { "@type": "QuantitativeValue", value: vehicle.mileage, unitCode: "KMT" } }
        : {}),
      ...(vehicle.vin ? { vehicleIdentificationNumber: vehicle.vin } : {}),
      itemCondition: "https://schema.org/UsedCondition",
      image: vehicle.images.slice(0, 5).map((u) => (u.startsWith("http") ? u : `${site.url}${u}`)),
      description: desc,
      offers: {
        "@type": "Offer",
        url,
        priceCurrency: "CAD",
        ...(vehicle.price !== null ? { price: vehicle.price } : {}),
        availability:
          vehicle.status === "available"
            ? "https://schema.org/InStock"
            : vehicle.status === "sold"
              ? "https://schema.org/SoldOut"
              : "https://schema.org/LimitedAvailability",
        itemCondition: "https://schema.org/UsedCondition",
        seller: { "@type": "AutoDealer", name: site.name, telephone: site.phones[0].href.replace("tel:", "") },
      },
    };
    let script = document.getElementById("vehicle-jsonld") as HTMLScriptElement | null;
    if (!script) {
      script = document.createElement("script");
      script.id = "vehicle-jsonld";
      script.type = "application/ld+json";
      document.head.appendChild(script);
    }
    script.textContent = safeJsonLd(jsonLd);
  }, [vehicle]);

  // A listing that was deleted or re-slugged after the last build resolves to the
  // "Vehicle not found" view. Mark those noindex so search engines don't treat
  // them as thin/soft-404 pages; real vehicles stay indexable.
  useEffect(() => {
    if (vehicle === undefined) return; // still loading — leave default
    setMeta("name", "robots", vehicle ? "index,follow" : "noindex,follow");
  }, [vehicle]);

  if (vehicle === undefined) {
    return (
      <Container className="py-24 text-center text-slate-500">
        <Car size={36} className="mx-auto animate-pulse text-slate-300" />
        <p className="mt-3 text-sm">Loading vehicle…</p>
      </Container>
    );
  }

  if (vehicle === null) {
    return (
      <Container className="py-24 text-center">
        <Car size={44} className="mx-auto text-slate-300" />
        <h1 className="mt-4 text-2xl font-extrabold text-navy-900">Vehicle not found</h1>
        <p className="mx-auto mt-2 max-w-md text-sm text-slate-600">
          This listing may have sold or been removed. Browse our current inventory —
          we get new vehicles in regularly.
        </p>
        <Link
          href="/inventory/"
          className="mt-6 inline-flex items-center gap-2 rounded-lg bg-brand-500 px-6 py-3 text-sm font-semibold text-white hover:bg-brand-600"
        >
          Browse Inventory <ArrowRight size={16} />
        </Link>
      </Container>
    );
  }

  const title = vehicleTitle(vehicle);
  const notice = statusNotice[vehicle.status];
  const specs = buildSpecs(vehicle);
  const similar = getSimilar(vehicle, pool);
  const inquiryMessage = `Hi, I'm interested in the ${title}${
    vehicle.stockNumber ? ` (Stock #${vehicle.stockNumber})` : ""
  }. Is it still available? Please get in touch with more details.`;
  const textMessage = `Hi, I'm interested in the ${title} at ${site.name}. Is it still available?`;

  async function share() {
    const url = window.location.href;
    if (typeof navigator.share === "function") {
      try {
        await navigator.share({ title: `${title} | ${site.name}`, url });
      } catch {
        /* user closed the share sheet */
      }
      return;
    }
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      /* clipboard unavailable */
    }
  }

  return (
    <div className="bg-slate-50 pb-16 lg:pb-0">
      <Container className="py-6 sm:py-8">
        <nav aria-label="Breadcrumb" className="mb-4">
          <ol className="flex flex-wrap items-center gap-1 text-sm text-slate-500">
            <li>
              <Link href="/" className="hover:text-navy-900">Home</Link>
            </li>
            <ChevronRight size={14} className="text-slate-400" />
            <li>
              <Link href="/inventory/" className="hover:text-navy-900">Inventory</Link>
            </li>
            <ChevronRight size={14} className="text-slate-400" />
            <li className="font-medium text-navy-900">{title}</li>
          </ol>
        </nav>

        <div className="grid gap-8 lg:grid-cols-[1fr_minmax(320px,380px)] lg:items-start">
          <div className="lg:col-start-1 lg:row-start-1">
            <CarGallery images={vehicle.images} title={title} />
          </div>

          <div className="space-y-6 lg:col-start-2 lg:row-span-2 lg:row-start-1">
            <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
              <p className="text-sm font-medium uppercase tracking-wide text-slate-500">
                {vehicle.condition} · {vehicle.bodyType}
              </p>
              <h1 className="mt-1 text-2xl font-extrabold leading-tight text-navy-900">{title}</h1>
              <div className="mt-3 text-3xl font-extrabold text-brand-600">{formatPrice(vehicle.price)}</div>
              {vehicle.price !== null && (
                <p className="mt-1 text-xs text-slate-500">Plus applicable taxes &amp; documentation fees.</p>
              )}

              {notice && (
                <p className={`mt-4 rounded-lg border px-3 py-2 text-sm ${notice.className}`}>{notice.label}</p>
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
                <div className="flex items-center justify-center gap-1">
                  <a
                    href={mapsHref}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-medium text-navy-700 hover:text-brand-600"
                  >
                    <MapPin size={16} /> Get Directions
                  </a>
                  <span aria-hidden className="text-slate-300">·</span>
                  <button
                    type="button"
                    onClick={share}
                    className="flex items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-medium text-navy-700 hover:text-brand-600"
                  >
                    <Share2 size={15} /> {copied ? "Link copied!" : "Share"}
                  </button>
                </div>
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
              <h2 className="text-lg font-bold text-navy-900">Ask About This Vehicle</h2>
              <p className="mt-1 text-sm text-slate-600">Send us a message and we&apos;ll get right back to you.</p>
              {site.googleReviews.url && (
                <a
                  href={site.googleReviews.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-2 inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-navy-900"
                >
                  <Star size={13} className="fill-current text-amber-400" />
                  <span>
                    <strong className="text-navy-900">{site.googleReviews.rating}</strong> rating from{" "}
                    {site.googleReviews.count} Google reviews
                  </span>
                </a>
              )}
              <div className="mt-4">
                <ContactForm
                  subject={`Vehicle Inquiry: ${title}${vehicle.stockNumber ? ` (Stock #${vehicle.stockNumber})` : ""}`}
                  hiddenFields={{
                    vehicle: title,
                    vehicle_id: vehicle.id,
                    ...(vehicle.stockNumber ? { stock_number: vehicle.stockNumber } : {}),
                  }}
                  defaultMessage={inquiryMessage}
                  submitLabel="Send Inquiry"
                  requirePhone
                />
              </div>
            </section>
          </div>

          <div className="space-y-8 lg:col-start-1 lg:row-start-2">
            {vehicle.description && (
              <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
                <h2 className="text-lg font-bold text-navy-900">Overview</h2>
                <p className="mt-3 whitespace-pre-line leading-relaxed text-slate-700">{vehicle.description}</p>
              </section>
            )}

            <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
              <h2 className="text-lg font-bold text-navy-900">Specifications</h2>
              <dl className="mt-4 grid grid-cols-1 gap-x-8 sm:grid-cols-2">
                {specs.map((spec) => (
                  <div key={spec.label} className="flex justify-between gap-4 border-b border-slate-100 py-2.5 text-sm">
                    <dt className="text-slate-500">{spec.label}</dt>
                    <dd className="text-right font-medium text-navy-900">{spec.value}</dd>
                  </div>
                ))}
              </dl>
            </section>

            {vehicle.features.length > 0 && (
              <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
                <h2 className="text-lg font-bold text-navy-900">Features &amp; Options</h2>
                <ul className="mt-4 grid grid-cols-1 gap-x-6 gap-y-2.5 sm:grid-cols-2">
                  {vehicle.features.map((f) => (
                    <li key={f} className="flex items-center gap-2.5 text-sm text-slate-700">
                      <Check size={16} className="shrink-0 text-green-600" />
                      {f}
                    </li>
                  ))}
                </ul>
              </section>
            )}
          </div>
        </div>

        {similar.length > 0 && (
          <section className="mt-14">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-extrabold text-navy-900">Similar Vehicles</h2>
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

      {/* Sticky mobile action bar — the Call/Text/Ask buttons stay reachable
          while the shopper scrolls specs and photos. Hidden on desktop, where
          the sidebar card is always visible. */}
      <div className="fixed inset-x-0 bottom-0 z-40 grid grid-cols-3 border-t border-slate-200 bg-white shadow-[0_-2px_10px_rgba(0,0,0,0.08)] lg:hidden">
        <a
          href={site.phones[0].href}
          className="flex items-center justify-center gap-1.5 py-3.5 text-sm font-semibold text-navy-900 active:bg-slate-50"
        >
          <Phone size={17} className="text-brand-500" /> Call
        </a>
        <a
          href={smsHref(textMessage)}
          className="flex items-center justify-center gap-1.5 border-x border-slate-200 py-3.5 text-sm font-semibold text-navy-900 active:bg-slate-50"
        >
          <MessageSquare size={17} className="text-brand-500" /> Text
        </a>
        <a
          href="#inquire"
          className="flex items-center justify-center gap-1.5 py-3.5 text-sm font-semibold text-navy-900 active:bg-slate-50"
        >
          <ArrowRight size={17} className="text-brand-500" /> Ask
        </a>
      </div>
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
