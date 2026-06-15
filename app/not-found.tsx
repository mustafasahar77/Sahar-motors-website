import Link from "next/link";
import Container from "@/components/Container";
import { Car, ArrowRight, Phone } from "@/components/icons";
import { site } from "@/lib/site";

export default function NotFound() {
  return (
    <section className="bg-slate-50">
      <Container className="flex min-h-[60vh] flex-col items-center justify-center py-20 text-center">
        <Car size={56} className="text-navy-300" />
        <p className="mt-6 text-sm font-bold uppercase tracking-widest text-brand-600">
          404 — Page not found
        </p>
        <h1 className="mt-2 text-3xl font-extrabold text-navy-900 sm:text-4xl">
          We couldn&apos;t find that page
        </h1>
        <p className="mt-3 max-w-md text-slate-600">
          The page or vehicle you&apos;re looking for may have moved or sold.
          Let&apos;s get you back on the road.
        </p>
        <div className="mt-7 flex flex-wrap justify-center gap-3">
          <Link
            href="/inventory/"
            className="inline-flex items-center gap-2 rounded-lg bg-brand-500 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-brand-600"
          >
            Browse Inventory <ArrowRight size={16} />
          </Link>
          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-lg border border-navy-300 bg-white px-6 py-3 text-sm font-semibold text-navy-900 transition-colors hover:bg-navy-50"
          >
            Go Home
          </Link>
          <a
            href={site.phones[0].href}
            className="inline-flex items-center gap-2 rounded-lg px-6 py-3 text-sm font-semibold text-navy-700 hover:text-brand-600"
          >
            <Phone size={16} /> {site.phones[0].value}
          </a>
        </div>
      </Container>
    </section>
  );
}
