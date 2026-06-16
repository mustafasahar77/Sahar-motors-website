import Link from "next/link";
import Logo from "@/components/Logo";
import { NAV_LINKS, site, fullAddress } from "@/lib/site";
import { Phone, Mail, MapPin, Instagram, Facebook } from "@/components/icons";

const mapsHref = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
  site.mapsQuery,
)}`;

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="mt-auto bg-navy-950 text-navy-100">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 sm:px-6 md:grid-cols-2 lg:grid-cols-4 lg:px-8">
        {/* Brand */}
        <div>
          <Logo height={84} />
          <p className="mt-4 max-w-xs text-sm leading-relaxed text-navy-200">
            {site.tagline}. Quality pre-owned vehicles and trusted service in{" "}
            {site.address.city}, {site.address.province}.
          </p>
          <div className="mt-5 flex items-center gap-3">
            <a
              href={site.social.instagram}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Sahar Motors on Instagram"
              className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 transition-colors hover:bg-brand-500"
            >
              <Instagram size={17} />
            </a>
            <a
              href={site.social.facebook}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Sahar Motors on Facebook"
              className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 transition-colors hover:bg-brand-500"
            >
              <Facebook size={17} />
            </a>
          </div>
        </div>

        {/* Quick links */}
        <nav aria-label="Footer">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-white">
            Explore
          </h2>
          <ul className="mt-4 space-y-2.5 text-sm">
            {NAV_LINKS.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="text-navy-200 transition-colors hover:text-white"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        {/* Contact */}
        <div>
          <h2 className="text-sm font-semibold uppercase tracking-wider text-white">
            Get in Touch
          </h2>
          <ul className="mt-4 space-y-3 text-sm">
            <li>
              <a
                href={mapsHref}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-start gap-2.5 text-navy-200 transition-colors hover:text-white"
              >
                <MapPin size={18} className="mt-0.5 shrink-0 text-brand-400" />
                <span>{fullAddress}</span>
              </a>
            </li>
            {site.phones.map((p) => (
              <li key={p.href}>
                <a
                  href={p.href}
                  className="flex items-center gap-2.5 text-navy-200 transition-colors hover:text-white"
                >
                  <Phone size={18} className="shrink-0 text-brand-400" />
                  <span>
                    {p.value}
                    <span className="text-navy-300"> · {p.label}</span>
                  </span>
                </a>
              </li>
            ))}
            <li>
              <a
                href={`mailto:${site.email}`}
                className="flex items-center gap-2.5 break-all text-navy-200 transition-colors hover:text-white"
              >
                <Mail size={18} className="shrink-0 text-brand-400" />
                <span>{site.email}</span>
              </a>
            </li>
          </ul>
        </div>

        {/* Hours */}
        <div>
          <h2 className="text-sm font-semibold uppercase tracking-wider text-white">
            Hours
          </h2>
          <ul className="mt-4 space-y-1.5 text-sm">
            {site.hours.map((h) => (
              <li key={h.day} className="flex justify-between gap-4">
                <span className="text-navy-200">{h.day}</span>
                <span className="text-navy-300">
                  {h.open && h.close ? `${h.open} – ${h.close}` : "Closed"}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-2 px-4 py-5 text-xs text-navy-300 sm:flex-row sm:px-6 lg:px-8">
          <p>
            © {year} {site.name}. All rights reserved.
          </p>
          <p>
            {site.legalName} · Prices plus applicable taxes &amp; documentation
            fees.
          </p>
        </div>
      </div>
    </footer>
  );
}
