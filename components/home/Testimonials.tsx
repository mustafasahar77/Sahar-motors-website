import Container from "@/components/Container";
import Reveal from "@/components/Reveal";
import { site } from "@/lib/site";
import { Star } from "@/components/icons";

// Real Google reviews for Sahar Motors. Wording and star ratings are the
// customers' own; longer reviews are trimmed for length without changing their
// meaning. The aggregate badge reads from site.googleReviews — update there as
// the profile grows.
const GOOGLE_REVIEWS_URL = site.googleReviews.url;

const reviews = [
  {
    quote:
      "I had a pleasant experience at Sahar Motors. Mustafa was easy going, patient and honest. They have great pricing and their vehicles are tested to ensure reliability. I would highly recommend Sahar Motors to anyone looking for a used vehicle.",
    name: "Mac Houssaini",
    meta: "Local Guide · Google",
    rating: 5,
  },
  {
    quote:
      "Very good to deal with. They were honest, upfront and helpful — and refunded our deposit when some issues came up with the car we were looking at.",
    name: "David Brodie",
    meta: "Google review",
    rating: 5,
  },
  {
    quote:
      "I bought a Ford Fusion, really cheap for a hybrid with 200K km, for cash. If you're looking to buy a cash car, this is the right place — better than auction in my opinion.",
    name: "Robin Grover",
    meta: "Local Guide · Google",
    rating: 4,
  },
];

function Stars({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5 text-amber-400" aria-label={`${rating} out of 5 stars`}>
      {Array.from({ length: 5 }).map((_, s) => (
        <Star
          key={s}
          size={18}
          className={s < rating ? "fill-current" : "fill-current text-slate-200"}
        />
      ))}
    </div>
  );
}

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
          <a
            href={GOOGLE_REVIEWS_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-4 inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm shadow-sm transition hover:shadow"
          >
            <span className="text-lg font-extrabold text-navy-900">{site.googleReviews.rating}</span>
            <span className="flex gap-0.5 text-amber-400" aria-hidden="true">
              {Array.from({ length: 5 }).map((_, s) => (
                <Star key={s} size={16} className="fill-current" />
              ))}
            </span>
            <span className="text-slate-600">based on {site.googleReviews.count} Google reviews</span>
          </a>
        </div>

        <div className="mt-10 grid grid-cols-1 gap-6 md:grid-cols-3">
          {reviews.map((r, i) => (
            <Reveal key={i} delay={i * 0.08}>
              <figure className="flex h-full flex-col rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                <Stars rating={r.rating} />
                <blockquote className="mt-4 flex-1 text-sm leading-relaxed text-slate-700">
                  “{r.quote}”
                </blockquote>
                <figcaption className="mt-5 border-t border-slate-100 pt-4 text-sm">
                  <span className="font-bold text-navy-900">{r.name}</span>
                  <span className="block text-slate-500">{r.meta}</span>
                </figcaption>
              </figure>
            </Reveal>
          ))}
        </div>

        <div className="mt-8 text-center">
          <a
            href={GOOGLE_REVIEWS_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm font-semibold text-blue-700 hover:text-blue-900"
          >
            Read all of our reviews on Google →
          </a>
        </div>
      </Container>
    </section>
  );
}
