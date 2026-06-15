import type { Metadata, Viewport } from "next";
import { Inter, Sora } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { fullAddress, site } from "@/lib/site";
import { safeJsonLd } from "@/lib/jsonld";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const sora = Sora({
  variable: "--font-sora",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: {
    default: `${site.name} | Quality Used Cars in ${site.address.city}, ${site.address.province}`,
    template: `%s | ${site.name}`,
  },
  description: site.description,
  applicationName: site.name,
  keywords: [
    "used cars",
    "Langley used cars",
    "BC used cars",
    "pre-owned vehicles",
    "car dealership Langley",
    "Sahar Motors",
    "affordable cars Langley",
    "auto service Langley",
  ],
  authors: [{ name: site.name }],
  openGraph: {
    type: "website",
    locale: "en_CA",
    url: `${site.url}/`,
    siteName: site.name,
    title: `${site.name} | Quality Used Cars in ${site.address.city}, ${site.address.province}`,
    description: site.description,
    images: [{ url: "/og.svg", width: 1200, height: 630, alt: site.name }],
  },
  twitter: {
    card: "summary_large_image",
    title: `${site.name} | Quality Used Cars`,
    description: site.description,
    images: ["/og.svg"],
  },
  alternates: { canonical: "/" },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: "#0b2545",
  width: "device-width",
  initialScale: 1,
};

/** Convert a "9:00 AM" style time to schema.org's 24h "09:00" format. */
function to24h(time: string): string {
  const m = time.trim().match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
  if (!m) return time;
  let hours = parseInt(m[1], 10);
  const ampm = m[3].toUpperCase();
  if (ampm === "PM" && hours !== 12) hours += 12;
  if (ampm === "AM" && hours === 12) hours = 0;
  return `${String(hours).padStart(2, "0")}:${m[2]}`;
}

const openingHoursSpecification = site.hours
  .filter((h) => h.open && h.close)
  .map((h) => ({
    "@type": "OpeningHoursSpecification",
    dayOfWeek: `https://schema.org/${h.day}`,
    opens: to24h(h.open as string),
    closes: to24h(h.close as string),
  }));

/** Structured data so search engines understand the business + location. */
const jsonLd = {
  "@context": "https://schema.org",
  "@type": "AutoDealer",
  name: site.name,
  legalName: site.legalName,
  description: site.description,
  url: site.url,
  email: site.email,
  telephone: site.phones[0].value,
  image: `${site.url}/og.svg`,
  address: {
    "@type": "PostalAddress",
    streetAddress: site.address.street,
    addressLocality: site.address.city,
    addressRegion: site.address.province,
    postalCode: site.address.postalCode,
    addressCountry: "CA",
  },
  openingHoursSpecification,
  areaServed: "Greater Vancouver, BC",
  priceRange: "$$",
  slogan: site.tagline,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${sora.variable} h-full`}
      suppressHydrationWarning
    >
      <body className="flex min-h-full flex-col bg-white text-slate-900">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: safeJsonLd(jsonLd) }}
        />
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[100] focus:rounded-md focus:bg-navy-900 focus:px-4 focus:py-2 focus:text-white"
        >
          Skip to main content
        </a>
        <Navbar />
        <main id="main" className="flex-1">
          {children}
        </main>
        <Footer />
        <span className="sr-only">{fullAddress}</span>
      </body>
    </html>
  );
}
