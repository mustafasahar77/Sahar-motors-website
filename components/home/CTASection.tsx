import Link from "next/link";
import Container from "@/components/Container";
import { site } from "@/lib/site";
import { Phone, ArrowRight } from "@/components/icons";

export default function CTASection() {
  return (
    <section className="bg-navy-900 py-16 text-white sm:py-20">
      <Container>
        <div className="flex flex-col items-center justify-between gap-6 rounded-2xl bg-gradient-to-r from-brand-600 to-brand-500 px-8 py-10 text-center shadow-xl sm:px-12 lg:flex-row lg:text-left">
          <div>
            <h2 className="text-2xl font-extrabold sm:text-3xl">
              Ready to find your next vehicle?
            </h2>
            <p className="mt-2 max-w-xl text-white/90">
              Browse our inventory online or stop by the lot in{" "}
              {site.address.city}. Our team is happy to help — no pressure, ever.
            </p>
          </div>
          <div className="flex shrink-0 flex-wrap justify-center gap-3">
            <Link
              href="/inventory/"
              className="inline-flex items-center gap-2 rounded-lg bg-white px-6 py-3 text-base font-semibold text-brand-600 transition-colors hover:bg-navy-50"
            >
              Browse Inventory <ArrowRight size={18} />
            </Link>
            <a
              href={site.phones[0].href}
              className="inline-flex items-center gap-2 rounded-lg border border-white/40 px-6 py-3 text-base font-semibold text-white transition-colors hover:bg-white/10"
            >
              <Phone size={18} /> {site.phones[0].value}
            </a>
          </div>
        </div>
      </Container>
    </section>
  );
}
