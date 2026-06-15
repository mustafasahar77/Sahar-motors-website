import type { Metadata } from "next";
import Container from "@/components/Container";
import PageHeader from "@/components/PageHeader";
import ContactForm from "@/components/ContactForm";
import { site, fullAddress } from "@/lib/site";
import { Phone, Mail, MapPin, Clock } from "@/components/icons";

export const metadata: Metadata = {
  title: "Contact Us",
  description: `Get in touch with Sahar Motors in ${site.address.city}, ${site.address.province}. Call, email, or visit our lot — we're happy to help.`,
  alternates: { canonical: "/contact/" },
};

const mapEmbed = `https://www.google.com/maps?q=${encodeURIComponent(
  site.mapsQuery,
)}&output=embed`;
const mapsHref = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
  site.mapsQuery,
)}`;

export default function ContactPage() {
  return (
    <>
      <PageHeader
        title="Contact Us"
        subtitle="Questions about a vehicle, service, or anything else? We'd love to hear from you."
        breadcrumb={[{ label: "Home", href: "/" }, { label: "Contact" }]}
      />

      <section className="bg-white py-16 sm:py-20">
        <Container>
          <div className="grid gap-10 lg:grid-cols-2">
            {/* Info + map */}
            <div>
              <h2 className="text-2xl font-extrabold text-navy-900">
                Get in Touch
              </h2>
              <ul className="mt-6 space-y-5">
                <li className="flex items-start gap-4">
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-navy-50 text-brand-500">
                    <MapPin size={20} />
                  </span>
                  <div>
                    <h3 className="text-sm font-semibold text-navy-900">
                      Visit the Lot
                    </h3>
                    <a
                      href={mapsHref}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-slate-600 hover:text-brand-600"
                    >
                      {fullAddress}
                    </a>
                  </div>
                </li>
                <li className="flex items-start gap-4">
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-navy-50 text-brand-500">
                    <Phone size={20} />
                  </span>
                  <div>
                    <h3 className="text-sm font-semibold text-navy-900">Call</h3>
                    {site.phones.map((p) => (
                      <a
                        key={p.href}
                        href={p.href}
                        className="block text-sm text-slate-600 hover:text-brand-600"
                      >
                        {p.value}
                        <span className="text-slate-400"> · {p.label}</span>
                      </a>
                    ))}
                  </div>
                </li>
                <li className="flex items-start gap-4">
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-navy-50 text-brand-500">
                    <Mail size={20} />
                  </span>
                  <div>
                    <h3 className="text-sm font-semibold text-navy-900">Email</h3>
                    <a
                      href={`mailto:${site.email}`}
                      className="break-all text-sm text-slate-600 hover:text-brand-600"
                    >
                      {site.email}
                    </a>
                  </div>
                </li>
                <li className="flex items-start gap-4">
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-navy-50 text-brand-500">
                    <Clock size={20} />
                  </span>
                  <div>
                    <h3 className="text-sm font-semibold text-navy-900">Hours</h3>
                    <ul className="mt-1 space-y-1 text-sm text-slate-600">
                      {site.hours.map((h) => (
                        <li key={h.day} className="flex justify-between gap-6">
                          <span>{h.day}</span>
                          <span>
                            {h.open && h.close
                              ? `${h.open} – ${h.close}`
                              : "Closed"}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </li>
              </ul>

              <div className="mt-8 overflow-hidden rounded-xl border border-slate-200">
                <iframe
                  title={`Map to ${site.name}`}
                  src={mapEmbed}
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  className="h-64 w-full"
                />
              </div>
            </div>

            {/* Form */}
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
              <h2 className="text-2xl font-extrabold text-navy-900">
                Send a Message
              </h2>
              <p className="mt-2 text-slate-600">
                Fill out the form and we&apos;ll get back to you as soon as we
                can.
              </p>
              <div className="mt-6">
                <ContactForm
                  subject="General Inquiry — Sahar Motors Website"
                  messagePlaceholder="How can we help you today?"
                />
              </div>
            </div>
          </div>
        </Container>
      </section>
    </>
  );
}
