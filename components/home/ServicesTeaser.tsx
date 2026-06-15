import Link from "next/link";
import Container from "@/components/Container";
import Reveal from "@/components/Reveal";
import { Wrench, Check, ArrowRight } from "@/components/icons";

const services = [
  "Oil changes & routine maintenance",
  "Brakes, tires & suspension",
  "Diagnostics & engine repair",
  "Pre-purchase & seasonal inspections",
];

export default function ServicesTeaser() {
  return (
    <section className="bg-white py-16 sm:py-20">
      <Container>
        <div className="grid items-center gap-10 lg:grid-cols-2">
          <Reveal>
            <div>
              <span className="inline-flex items-center gap-2 rounded-full bg-navy-50 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-navy-700">
                <Wrench size={14} className="text-brand-500" /> Service &amp;
                Repairs
              </span>
              <h2 className="mt-4 text-3xl font-extrabold text-navy-900">
                We don&apos;t just sell cars — we keep them running.
              </h2>
              <p className="mt-3 leading-relaxed text-slate-600">
                Our in-house service team handles everything from routine
                maintenance to repairs, so you have a trusted partner for the
                life of your vehicle — whether you bought it from us or not.
              </p>
              <ul className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
                {services.map((s) => (
                  <li
                    key={s}
                    className="flex items-start gap-2.5 text-sm text-slate-700"
                  >
                    <Check size={18} className="mt-0.5 shrink-0 text-green-600" />
                    {s}
                  </li>
                ))}
              </ul>
              <Link
                href="/services/"
                className="mt-7 inline-flex items-center gap-2 rounded-lg bg-brand-500 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-brand-600"
              >
                Book a Service Appointment <ArrowRight size={16} />
              </Link>
            </div>
          </Reveal>

          <Reveal delay={0.1}>
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-navy-800 to-navy-900 p-8 text-white shadow-xl">
              <Wrench
                aria-hidden="true"
                className="absolute -right-6 -top-6 h-40 w-40 text-white/5"
              />
              <h3 className="text-xl font-bold">Why service with us?</h3>
              <dl className="mt-6 space-y-5">
                <div>
                  <dt className="text-2xl font-extrabold text-brand-400">
                    Fair, upfront quotes
                  </dt>
                  <dd className="mt-1 text-sm text-navy-200">
                    No surprises — we explain what your vehicle needs and what it
                    costs before any work begins.
                  </dd>
                </div>
                <div>
                  <dt className="text-2xl font-extrabold text-brand-400">
                    Experienced hands
                  </dt>
                  <dd className="mt-1 text-sm text-navy-200">
                    Workmanship you can rely on, on a wide range of makes and
                    models.
                  </dd>
                </div>
              </dl>
            </div>
          </Reveal>
        </div>
      </Container>
    </section>
  );
}
