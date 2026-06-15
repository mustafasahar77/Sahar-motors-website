import Container from "@/components/Container";
import Reveal from "@/components/Reveal";
import { Star } from "@/components/icons";

// NOTE: Placeholder reviews for layout/demo purposes. Replace these with real
// customer reviews (e.g. from Google) before launch — see HANDOFF.md checklist.
const reviews = [
  {
    quote:
      "Easy, no-pressure experience from start to finish. They were upfront about everything and I drove away in a great car at a fair price.",
    name: "Sample Review",
    location: "Langley, BC",
  },
  {
    quote:
      "Brought my SUV in for service and they explained exactly what it needed without any upselling. Honest people — I'll be back.",
    name: "Sample Review",
    location: "Surrey, BC",
  },
  {
    quote:
      "Friendly, family-run, and genuinely helpful. They took the time to find the right vehicle for my budget. Highly recommend.",
    name: "Sample Review",
    location: "Abbotsford, BC",
  },
];

export default function Testimonials() {
  return (
    <section className="bg-slate-50 py-16 sm:py-20">
      <Container>
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-extrabold text-navy-900">
            What Our Customers Say
          </h2>
          <p className="mt-2 text-slate-600">
            We&apos;re proud to be a trusted part of the Langley community.
          </p>
        </div>

        <div className="mt-10 grid grid-cols-1 gap-6 md:grid-cols-3">
          {reviews.map((r, i) => (
            <Reveal key={i} delay={i * 0.08}>
              <figure className="flex h-full flex-col rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                <div className="flex gap-0.5 text-amber-400" aria-label="5 out of 5 stars">
                  {Array.from({ length: 5 }).map((_, s) => (
                    <Star key={s} size={18} className="fill-current" />
                  ))}
                </div>
                <blockquote className="mt-4 flex-1 text-sm leading-relaxed text-slate-700">
                  “{r.quote}”
                </blockquote>
                <figcaption className="mt-5 border-t border-slate-100 pt-4 text-sm">
                  <span className="font-bold text-navy-900">{r.name}</span>
                  <span className="block text-slate-500">{r.location}</span>
                </figcaption>
              </figure>
            </Reveal>
          ))}
        </div>
      </Container>
    </section>
  );
}
