import type { Metadata } from "next";
import Container from "@/components/Container";
import PageHeader from "@/components/PageHeader";
import ContactForm from "@/components/ContactForm";
import Reveal from "@/components/Reveal";
import { site } from "@/lib/site";
import { DollarSign, ShieldCheck, Check } from "@/components/icons";

export const metadata: Metadata = {
  title: "Sell or Trade Your Car",
  description:
    "Looking to sell or trade your vehicle? Sahar Motors makes it easy. Tell us about your car and we'll get back to you with a fair, no-obligation offer.",
  alternates: { canonical: "/sell-your-car/" },
};

const steps = [
  {
    icon: ShieldCheck,
    title: "Tell us about it",
    text: "Share your vehicle's details using the form below — it only takes a minute.",
  },
  {
    icon: DollarSign,
    title: "Get a fair offer",
    text: "We'll review the details and follow up with a no-obligation offer.",
  },
  {
    icon: Check,
    title: "Get paid or trade up",
    text: "Accept and we'll handle the paperwork — sell outright or put it toward your next vehicle.",
  },
];

const fieldClass =
  "w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-sm focus:border-navy-500";

export default function SellYourCarPage() {
  return (
    <>
      <PageHeader
        title="Sell or Trade Your Car"
        subtitle="Get a fair, no-pressure offer for your vehicle — whether you're selling outright or trading up to something from our lot."
        breadcrumb={[
          { label: "Home", href: "/" },
          { label: "Sell Your Car" },
        ]}
      />

      {/* Steps */}
      <section className="bg-white py-16 sm:py-20">
        <Container>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            {steps.map((s, i) => (
              <Reveal key={s.title} delay={i * 0.08}>
                <div className="h-full rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                  <div className="flex items-center gap-3">
                    <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-brand-500 text-sm font-bold text-white">
                      {i + 1}
                    </span>
                    <s.icon size={22} className="text-navy-500" />
                  </div>
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

      {/* Form */}
      <section className="border-t border-slate-200 bg-slate-50 py-16 sm:py-20">
        <Container>
          <div className="mx-auto max-w-3xl rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
            <h2 className="text-2xl font-extrabold text-navy-900">
              Tell Us About Your Vehicle
            </h2>
            <p className="mt-2 text-slate-600">
              The more detail you share, the more accurate our offer. Fields
              marked with <span className="text-brand-500">*</span> are required.
            </p>
            <div className="mt-6">
              <ContactForm
                subject="Sell / Trade-In Inquiry"
                accessKey={site.web3formsSellAccessKey}
                submitLabel="Get My Offer"
                requirePhone
                messageLabel="Anything else we should know?"
                messagePlaceholder="Condition notes, modifications, reason for selling, etc."
                topFields={
                  <>
                    <div className="grid gap-4 sm:grid-cols-3">
                      <div>
                        <label
                          htmlFor="sell-year"
                          className="mb-1 block text-sm font-medium text-navy-900"
                        >
                          Year <span className="text-brand-500">*</span>
                        </label>
                        <input
                          id="sell-year"
                          name="vehicle_year"
                          type="text"
                          inputMode="numeric"
                          required
                          placeholder="2018"
                          className={fieldClass}
                        />
                      </div>
                      <div>
                        <label
                          htmlFor="sell-make"
                          className="mb-1 block text-sm font-medium text-navy-900"
                        >
                          Make <span className="text-brand-500">*</span>
                        </label>
                        <input
                          id="sell-make"
                          name="vehicle_make"
                          type="text"
                          required
                          placeholder="Honda"
                          className={fieldClass}
                        />
                      </div>
                      <div>
                        <label
                          htmlFor="sell-model"
                          className="mb-1 block text-sm font-medium text-navy-900"
                        >
                          Model <span className="text-brand-500">*</span>
                        </label>
                        <input
                          id="sell-model"
                          name="vehicle_model"
                          type="text"
                          required
                          placeholder="Civic"
                          className={fieldClass}
                        />
                      </div>
                    </div>
                    <div className="grid gap-4 sm:grid-cols-3">
                      <div>
                        <label
                          htmlFor="sell-trim"
                          className="mb-1 block text-sm font-medium text-navy-900"
                        >
                          Trim
                        </label>
                        <input
                          id="sell-trim"
                          name="vehicle_trim"
                          type="text"
                          placeholder="EX-L AWD"
                          className={fieldClass}
                        />
                      </div>
                      <div>
                        <label
                          htmlFor="sell-km"
                          className="mb-1 block text-sm font-medium text-navy-900"
                        >
                          Mileage (km)
                        </label>
                        <input
                          id="sell-km"
                          name="vehicle_mileage"
                          type="text"
                          inputMode="numeric"
                          placeholder="84,000"
                          className={fieldClass}
                        />
                      </div>
                      <div>
                        <label
                          htmlFor="sell-condition"
                          className="mb-1 block text-sm font-medium text-navy-900"
                        >
                          Overall condition
                        </label>
                        <select
                          id="sell-condition"
                          name="vehicle_condition"
                          defaultValue=""
                          className={fieldClass}
                        >
                          <option value="" disabled>
                            Select…
                          </option>
                          <option>Excellent</option>
                          <option>Good</option>
                          <option>Fair</option>
                          <option>Needs work</option>
                        </select>
                      </div>
                    </div>
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div>
                        <label
                          htmlFor="sell-vin"
                          className="mb-1 block text-sm font-medium text-navy-900"
                        >
                          VIN
                        </label>
                        <input
                          id="sell-vin"
                          name="vehicle_vin"
                          type="text"
                          maxLength={17}
                          autoCapitalize="characters"
                          placeholder="1HGBH41JXMN109186"
                          className={`${fieldClass} uppercase placeholder:normal-case`}
                        />
                        <p className="mt-1 text-xs text-slate-500">
                          17-character Vehicle Identification Number — optional,
                          but it speeds up an accurate offer.
                        </p>
                      </div>
                      <div>
                        <label
                          htmlFor="sell-price"
                          className="mb-1 block text-sm font-medium text-navy-900"
                        >
                          Asking price (CAD)
                        </label>
                        <input
                          id="sell-price"
                          name="vehicle_asking_price"
                          type="text"
                          inputMode="numeric"
                          placeholder="Optional"
                          className={fieldClass}
                        />
                      </div>
                    </div>
                  </>
                }
              />
            </div>
            <p className="mt-5 text-center text-sm text-slate-500">
              Prefer to talk it through? Call us at{" "}
              <a
                href={site.phones[0].href}
                className="font-semibold text-brand-600 hover:underline"
              >
                {site.phones[0].value}
              </a>
              .
            </p>
          </div>
        </Container>
      </section>
    </>
  );
}
