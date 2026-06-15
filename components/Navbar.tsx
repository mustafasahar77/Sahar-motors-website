"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Logo from "@/components/Logo";
import { useDialog } from "@/lib/useDialog";
import { NAV_LINKS, site, fullAddress } from "@/lib/site";
import {
  Phone,
  Mail,
  MapPin,
  Menu,
  X,
  Instagram,
  Facebook,
  ArrowRight,
} from "@/components/icons";

function isActive(pathname: string, href: string): boolean {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(href);
}

export default function Navbar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const close = () => setOpen(false);
  // Focus trap + Escape-to-close + scroll lock + focus restore for the drawer.
  const drawerRef = useDialog<HTMLDivElement>(open, close);

  return (
    <header className="relative z-50">
      {/* Utility bar */}
      <div className="hidden bg-navy-950 text-navy-100 md:block">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-1.5 text-xs lg:px-8">
          <div className="flex items-center gap-5">
            <a
              href={site.phones[0].href}
              className="inline-flex items-center gap-1.5 transition-colors hover:text-white"
            >
              <Phone size={14} /> {site.phones[0].value}
            </a>
            <span className="inline-flex items-center gap-1.5">
              <MapPin size={14} /> {fullAddress}
            </span>
          </div>
          <div className="flex items-center gap-3">
            <a
              href={site.social.instagram}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Sahar Motors on Instagram"
              className="transition-colors hover:text-white"
            >
              <Instagram size={15} />
            </a>
            <a
              href={site.social.facebook}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Sahar Motors on Facebook"
              className="transition-colors hover:text-white"
            >
              <Facebook size={15} />
            </a>
          </div>
        </div>
      </div>

      {/* Main nav */}
      <nav className="sticky top-0 z-50 border-b border-white/10 bg-navy-900/95 text-white shadow-sm backdrop-blur">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link href="/" aria-label={`${site.name} home`} className="text-white">
            <Logo />
          </Link>

          {/* Desktop links */}
          <ul className="hidden items-center gap-1 lg:flex">
            {NAV_LINKS.map((link) => {
              const active = isActive(pathname, link.href);
              return (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    aria-current={active ? "page" : undefined}
                    className={`relative rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                      active ? "text-white" : "text-navy-100 hover:text-white"
                    }`}
                  >
                    {link.label}
                    {active && (
                      <span className="absolute inset-x-3 bottom-1 h-0.5 rounded bg-brand-500" />
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>

          <div className="hidden items-center gap-3 lg:flex">
            <Link
              href="/contact/"
              className="inline-flex items-center gap-2 rounded-lg border border-white/20 px-4 py-2 text-sm font-semibold transition-colors hover:bg-white/10"
            >
              <Mail size={16} /> Contact Us
            </Link>
            <Link
              href="/inventory/"
              className="inline-flex items-center gap-2 rounded-lg bg-brand-500 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-brand-600"
            >
              View Inventory <ArrowRight size={16} />
            </Link>
          </div>

          {/* Mobile toggle */}
          <button
            type="button"
            aria-label="Open menu"
            aria-expanded={open}
            aria-controls="mobile-menu"
            onClick={() => setOpen(true)}
            className="inline-flex h-10 w-10 items-center justify-center rounded-md text-white hover:bg-white/10 lg:hidden"
          >
            <Menu />
          </button>
        </div>
      </nav>

      {/* Mobile menu (modal dialog) */}
      {open && (
        <div
          ref={drawerRef}
          id="mobile-menu"
          role="dialog"
          aria-modal="true"
          aria-label="Site menu"
          className="fixed inset-0 z-[60] flex flex-col bg-navy-900 text-white lg:hidden"
        >
          <div className="flex h-16 items-center justify-between border-b border-white/10 px-4">
            <Logo />
            <button
              type="button"
              aria-label="Close menu"
              onClick={close}
              className="inline-flex h-10 w-10 items-center justify-center rounded-md text-white hover:bg-white/10"
            >
              <X />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto px-4 py-4">
            <ul className="space-y-1">
              {NAV_LINKS.map((link) => {
                const active = isActive(pathname, link.href);
                return (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      onClick={close}
                      aria-current={active ? "page" : undefined}
                      className={`flex items-center justify-between rounded-lg px-4 py-3 text-lg font-medium ${
                        active
                          ? "bg-white/10 text-white"
                          : "text-navy-100 hover:bg-white/5"
                      }`}
                    >
                      {link.label}
                      <ArrowRight size={18} />
                    </Link>
                  </li>
                );
              })}
            </ul>

            <div className="mt-6 space-y-3 border-t border-white/10 pt-6">
              {site.phones.map((p) => (
                <a
                  key={p.href}
                  href={p.href}
                  onClick={close}
                  className="flex items-center gap-3 rounded-lg bg-white/5 px-4 py-3 font-medium"
                >
                  <Phone size={18} className="text-brand-400" />
                  <span>
                    {p.label}: {p.value}
                  </span>
                </a>
              ))}
              <Link
                href="/inventory/"
                onClick={close}
                className="flex items-center justify-center gap-2 rounded-lg bg-brand-500 px-4 py-3 font-semibold"
              >
                Browse Inventory <ArrowRight size={18} />
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
