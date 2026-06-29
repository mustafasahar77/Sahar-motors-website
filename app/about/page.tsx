import type { Metadata } from "next";
import Link from "next/link";
import Container from "@/components/Container";
import PageHeader from "@/components/PageHeader";
import Reveal from "@/components/Reveal";
import { site, fullAddress } from "@/lib/site";
import {
  ShieldCheck,
  Tag,
  Users,
  Wrench,
  MapPin,
  ArrowRight,
} from "@/components/icons";

export const metadata: Metadata = {
  title: "About Us",
  description: `Learn about Sahar Motors — a family-owned used-car dealership in ${site.address.city}, ${site.address.province} built on honesty, value, and trusted service.`,
  alternates: { canonical: "/about/" },
};

const values = [
  {
    icon: ShieldCheck,
    title: "Integrity First",
    text: "Straight answers and transparent pricing. We treat every customer the way we'd want to be treated.",
  },
  {
    icon: Tag,
    title: "Real Value",
    text: "Quality vehicles at fair prices, so good cars stay within reach for more people.",
  },
  {
    icon: Users,
    title: "Family-Run Care",
    text: "We're a local, family business — not a faceless chain. Your experience matters to us.",
  },
  {
    icon: Wrench,
    title: "Here for the Long Haul",
    text: "With in-house service, we're your partner well beyond the day you drive off the lot.",
  },
];

const team = [
  { name: "Mustafa Sahar", title: "Founder & CEO", image: "/team/mustafar-sahar.jpg" },
  { name: "Mujtaba Sahar", title: "Operations Director", image: "/team/mujataba-sahar.jpg" },
  { name: "Samiullah Mohib", title: "Sales Manager", image: "/team/samiullah-mohib.jpg" },
  { name: "Sajjad Liwal", title: "Sales Associate", image: "/team/sijad-liwal.jpg" },
];

const mapEmbed = `https://www.google.com/maps?q=${encodeURIComponent(
  site.mapsQuery,
)}&output=embed`;

export default function AboutPage() {
  return (
    <>
      <PageHeader
        title={`About ${site.name}`}
        subtitle="A family-owned dealership making car ownership easy and affordable in the Langley community."
        breadcrumb={[{ label: "Home", href: "/" }, { label: "About" }]}
      />

      {/* Story */}
      <section className="bg-white py-16 sm:py-20">
        <Container>
          <div className="mx-auto max-w-3xl">
            <Reveal>
              <h2 className="text-3xl font-extrabold text-navy-900">
                Our Story
              </h2>
              <div className="mt-5 space-y-4 leading-relaxed text-slate-700">
                <p>
                  At {site.name}, our goal is simple: to provide high-quality
                  vehicles at affordable prices, making car ownership simple and
                  accessible for everyone.
                </p>
                <p>
                  As a family-owned and operated business in {site.address.city},{" "}
                  {site.address.province}, we take pride in a no-pressure,
                  honest approach. We hand-pick and inspect every vehicle on our
                  lot, and we&apos;re upfront about pricing and condition — because
                  we want you to feel confident in your purchase.
                </p>
                <p>
                  And because our relationship doesn&apos;t end at the sale, our
                  in-house service team is here to keep your vehicle running for
                  years to come. Whether you&apos;re buying your first car or your
                  next one, we&apos;d be honored to help.
                </p>
              </div>
            </Reveal>
          </div>
        </Container>
      </section>

      {/* Values */}
      <section className="border-t border-slate-200 bg-slate-50 py-16 sm:py-20">
        <Container>
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-extrabold text-navy-900">
              What We Stand For
            </h2>
            <p className="mt-2 text-slate-600">
              The values that guide how we do business every day.
            </p>
          </div>
          <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {values.map((v, i) => (
              <Reveal key={v.title} delay={i * 0.08}>
                <div className="h-full rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                  <span className="inline-flex h-12 w-12 items-center justify-center rounded-lg bg-navy-50 text-brand-500">
                    <v.icon size={24} />
                  </span>
                  <h3 className="mt-4 text-lg font-bold text-navy-900">
                    {v.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-slate-600">
                    {v.text}
                  </p>
                </div>
              </Reveal>
            ))}
          </div>
        </Container>
      </section>

      {/* Team */}
      <section className="border-t border-slate-200 bg-white py-16 sm:py-20">
        <Container>
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-extrabold text-navy-900">
              Meet the Team
            </h2>
            <p className="mt-2 text-slate-600">
              The family and people behind Sahar Motors.
            </p>
          </div>
          <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {team.map((m, i) => (
              <Reveal key={m.name} delay={i * 0.08}>
                <div className="h-full overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={m.image}
                    alt={m.name}
                    loading="lazy"
                    className="aspect-[4/5] w-full object-cover"
                  />
                  <div className="p-5">
                    <h3 className="text-lg font-bold text-navy-900">{m.name}</h3>
                    <p className="mt-0.5 text-sm font-medium text-brand-600">
                      {m.title}
                    </p>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </Container>
      </section>

      {/* Visit */}
      <section className="border-t border-slate-200 bg-slate-50 py-16 sm:py-20">
        <Container>
          <div className="grid items-center gap-10 lg:grid-cols-2">
            <div>
              <h2 className="text-3xl font-extrabold text-navy-900">Visit Us</h2>
              <p className="mt-3 flex items-start gap-2.5 text-slate-700">
                <MapPin size={20} className="mt-0.5 shrink-0 text-brand-500" />
                {fullAddress}
              </p>
              <p className="mt-4 text-slate-600">
                Stop by the lot to browse our inventory in person, or reach out
                and we&apos;ll help you find the right fit.
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                <Link
                  href="/inventory/"
                  className="inline-flex items-center gap-2 rounded-lg bg-brand-500 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-brand-600"
                >
                  Browse Inventory <ArrowRight size={16} />
                </Link>
                <Link
                  href="/contact/"
                  className="inline-flex items-center gap-2 rounded-lg border border-navy-300 bg-white px-6 py-3 text-sm font-semibold text-navy-900 transition-colors hover:bg-navy-50"
                >
                  Contact Us
                </Link>
              </div>
            </div>
            <div className="overflow-hidden rounded-xl border border-slate-200">
              <iframe
                title={`Map to ${site.name}`}
                src={mapEmbed}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                className="h-72 w-full"
              />
            </div>
          </div>
        </Container>
      </section>
    </>
  );
}
