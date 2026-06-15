import type { Metadata } from "next";
import Container from "@/components/Container";
import PageHeader from "@/components/PageHeader";
import ContactForm from "@/components/ContactForm";
import Reveal from "@/components/Reveal";
import { site, fullAddress } from "@/lib/site";
import {
  Wrench,
  Cog,
  Gauge,
  ShieldCheck,
  Car,
  Fuel,
  Check,
  Phone,
  Clock,
} from "@/components/icons";

export const metadata: Metadata = {
  title: "Auto Service & Repairs",
  description:
    "Trusted in-house auto service and repairs at Sahar Motors in Langley, BC — maintenance, brakes, tires, diagnostics, inspections and more. Book your appointment today.",
  alternates: { canonical: "/services/" },
};

const services = [
  {
    icon: Fuel,
    title: "Oil & Fluid Changes",
    text: "Keep your engine healthy with regular oil and fluid service.",
  },
  {
    icon: Cog,
    title: "Brakes & Suspension",
    text: "Pads, rotors, shocks and struts — repaired and replaced.",
  },
  {
    icon: Car,
    title: "Tires & Seasonal Swaps",
    text: "Mounting, balancing, rotations and winter/summer changeovers.",
  },
  {
    icon: Gauge,
    title: "Diagnostics",
    text: "Check-engine lights and drivability issues, diagnosed properly.",
  },
  {
    icon: Wrench,
    title: "Engine & General Repair",
    text: "From minor fixes to larger repairs on most makes and models.",
  },
  {
    icon: ShieldCheck,
    title: "Inspections",
    text: "Pre-purchase and seasonal inspections for peace of mind.",
  },
];

const serviceTypeOptions = [
  "Oil / Fluid Change",
  "Brakes",
  "Tires / Seasonal Swap",
  "Diagnostics / Check-Engine Light",
  "General Repair",
  "Inspection",
  "Other / Not Sure",
];

export default function ServicesPage() {
  return (
    <>
      <PageHeader
        title="Service & Repairs"
        subtitle="We don't just sell cars — we keep them running. Trusted, fairly-priced service on most makes and models, whether you bought from us or not."
        breadcrumb={[{ label: "Home", href: "/" }, { label: "Services" }]}
      />

      {/* Services grid */}
      <section className="bg-white py-16 sm:py-20">
        <Container>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {services.map((s, i) => (
              <Reveal key={s.title} delay={i * 0.06}>
                <div className="h-full rounded-xl border border-slate-200 bg-white p-6 shadow-sm transition-shadow hover:shadow-md">
                  <span className="inline-flex h-12 w-12 items-center justify-center rounded-lg bg-navy-50 text-brand-500">
                    <s.icon size={24} />
                  </span>
                  <h3 className="mt-4 text-lg font-bold text-navy-900">
                    {s.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-slate-600">
                    {s.text}
                  </p>
                </div>
              </Reveal>
            ))}
          </div>
        </Container>
      </section>

      {/* Booking form + info */}
      <section className="border-t border-slate-200 bg-slate-50 py-16 sm:py-20">
        <Container>
          <div className="grid gap-10 lg:grid-cols-[1fr_360px] lg:items-start">
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
              <h2 className="text-2xl font-extrabold text-navy-900">
                Book a Service Appointment
              </h2>
              <p className="mt-2 text-slate-600">
                Tell us about your vehicle and what it needs. We&apos;ll confirm
                a time that works for you.
              </p>
              <div className="mt-6">
                <ContactForm
                  subject="Service Appointment Request"
                  submitLabel="Request Appointment"
                  requirePhone
                  messageLabel="What does your vehicle need?"
                  messagePlaceholder="Describe the issue or service you're looking for…"
                  topFields={
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div>
                        <label
                          htmlFor="svc-year"
                          className="mb-1 block text-sm font-medium text-navy-900"
                        >
                          Vehicle year
                        </label>
                        <input
                          id="svc-year"
                          name="vehicle_year"
                          type="text"
                          inputMode="numeric"
                          placeholder="e.g. 2018"
                          className="w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-sm focus:border-navy-500"
                        />
                      </div>
                      <div>
                        <label
                          htmlFor="svc-vehicle"
                          className="mb-1 block text-sm font-medium text-navy-900"
                        >
                          Make &amp; model
                        </label>
                        <input
                          id="svc-vehicle"
                          name="vehicle_make_model"
                          type="text"
                          placeholder="e.g. Honda Civic"
                          className="w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-sm focus:border-navy-500"
                        />
                      </div>
                      <div>
                        <label
                          htmlFor="svc-type"
                          className="mb-1 block text-sm font-medium text-navy-900"
                        >
                          Service needed
                        </label>
                        <select
                          id="svc-type"
                          name="service_type"
                          defaultValue=""
                          className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm focus:border-navy-500"
                        >
                          <option value="" disabled>
                            Select…
                          </option>
                          {serviceTypeOptions.map((o) => (
                            <option key={o} value={o}>
                              {o}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label
                          htmlFor="svc-date"
                          className="mb-1 block text-sm font-medium text-navy-900"
                        >
                          Preferred date
                        </label>
                        <input
                          id="svc-date"
                          name="preferred_date"
                          type="date"
                          className="w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-sm focus:border-navy-500"
                        />
                      </div>
                    </div>
                  }
                />
              </div>
            </div>

            <aside className="space-y-4">
              <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                <h3 className="flex items-center gap-2 text-base font-bold text-navy-900">
                  <Phone size={18} className="text-brand-500" /> Prefer to call?
                </h3>
                <ul className="mt-3 space-y-2 text-sm">
                  {site.phones.map((p) => (
                    <li key={p.href}>
                      <a
                        href={p.href}
                        className="font-semibold text-navy-900 hover:text-brand-600"
                      >
                        {p.value}
                      </a>
                      <span className="text-slate-500"> · {p.label}</span>
                    </li>
                  ))}
                </ul>
                <p className="mt-3 text-sm text-slate-600">{fullAddress}</p>
              </div>

              <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                <h3 className="flex items-center gap-2 text-base font-bold text-navy-900">
                  <Clock size={18} className="text-brand-500" /> Hours
                </h3>
                <ul className="mt-3 space-y-1.5 text-sm">
                  {site.hours.map((h) => (
                    <li key={h.day} className="flex justify-between gap-4">
                      <span className="text-slate-600">{h.day}</span>
                      <span className="font-medium text-navy-900">
                        {h.open && h.close ? `${h.open} – ${h.close}` : "Closed"}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="rounded-xl border border-green-200 bg-green-50 p-5">
                <h3 className="flex items-center gap-2 text-sm font-bold text-green-800">
                  <Check size={16} /> Service on any make
                </h3>
                <p className="mt-1.5 text-sm text-green-800/90">
                  You don&apos;t have to buy from us to service with us — all
                  makes and models are welcome.
                </p>
              </div>
            </aside>
          </div>
        </Container>
      </section>
    </>
  );
}
