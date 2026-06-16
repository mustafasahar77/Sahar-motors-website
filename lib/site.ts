import type {
  BodyType,
  Condition,
  Drivetrain,
  FuelType,
  Transmission,
} from "@/lib/types";

/**
 * Single source of truth for business details, contact info and integration
 * keys. Editing this one file updates the whole site (header, footer, contact
 * pages, structured data, etc.). See HANDOFF.md for what to change before launch.
 */
export const site = {
  name: "Sahar Motors",
  legalName: "Sahar Brothers Enterprise Ltd.",
  tagline: "Making Car Ownership Easy and Affordable",
  description:
    "Sahar Motors is a family-run used-car dealership in Langley, BC offering quality pre-owned vehicles at honest, affordable prices — plus trusted in-house service and repairs.",

  // The canonical production URL. Update this to the real domain before launch
  // so SEO tags, sitemap and structured data point at the right place.
  url: "https://www.saharmotors.com",

  // --- Contact -----------------------------------------------------------
  phones: [
    { label: "Main", value: "(604) 652-2870", href: "tel:+16046522870" },
    { label: "Mobile", value: "(778) 773-4676", href: "tel:+17787734676" },
  ],
  email: "sales@saharmotors.com",
  address: {
    street: "5921 200A Street",
    city: "Langley",
    province: "BC",
    postalCode: "V3A 6R2",
    country: "Canada",
  },
  // Google Maps query for the embedded map / "Get Directions" link.
  mapsQuery: "Sahar Motors, 5921 200A Street, Langley, BC V3A 6R2",

  // --- Hours -------------------------------------------------------------
  // PLACEHOLDER hours — confirm the real schedule before launch (see HANDOFF.md).
  hours: [
    { day: "Monday", open: "9:00 AM", close: "6:00 PM" },
    { day: "Tuesday", open: "9:00 AM", close: "6:00 PM" },
    { day: "Wednesday", open: "9:00 AM", close: "6:00 PM" },
    { day: "Thursday", open: "9:00 AM", close: "6:00 PM" },
    { day: "Friday", open: "9:00 AM", close: "6:00 PM" },
    { day: "Saturday", open: "10:00 AM", close: "5:00 PM" },
    { day: "Sunday", open: null, close: null }, // closed
  ] as { day: string; open: string | null; close: string | null }[],

  // --- Social ------------------------------------------------------------
  // PLACEHOLDER links — replace with the dealership's real profiles.
  social: {
    instagram: "https://www.instagram.com/",
    facebook: "https://www.facebook.com/",
  },

  // --- Integrations ------------------------------------------------------
  // Free Web3Forms backends. These are PUBLIC access keys (safe to ship in
  // client code) created at https://web3forms.com with the dealership inbox.
  // Each form uses its own key so submissions are routed/labelled separately.
  web3formsAccessKey: "df44d32d-05da-44ee-aacb-7357cc7d86cf", // Contact form
  web3formsSellAccessKey: "f9e3b6e3-9e6a-42cf-985b-7e264cd49e35", // Sell / trade form

  // Basic password gate for the /admin page. This is a CLIENT-SIDE deterrent only
  // (the value ships in the page code) — fine because /admin just downloads a JSON
  // file and exposes no private data. Change it from "password", and for real
  // protection enable Cloudflare Access (see HOSTING.md → "Lock the /admin page").
  adminPassword: "password",
} as const;

/** True when forms are wired to a real Web3Forms key. */
const accessKey: string = site.web3formsAccessKey;
export const isFormsConfigured =
  accessKey !== "YOUR-WEB3FORMS-ACCESS-KEY" && accessKey.trim().length > 0;

/** Primary site navigation (also used for the mobile menu). */
export const NAV_LINKS = [
  { label: "Home", href: "/" },
  { label: "Inventory", href: "/inventory/" },
  { label: "Services", href: "/services/" },
  { label: "Sell Your Car", href: "/sell-your-car/" },
  { label: "About", href: "/about/" },
  { label: "Contact", href: "/contact/" },
] as const;

/** Canonical option lists, reused by the admin tool's dropdowns. */
export const OPTIONS = {
  bodyType: [
    "Sedan",
    "SUV",
    "Truck",
    "Coupe",
    "Hatchback",
    "Minivan",
    "Van",
    "Convertible",
    "Wagon",
  ] as BodyType[],
  fuelType: [
    "Gasoline",
    "Diesel",
    "Hybrid",
    "Plug-in Hybrid",
    "Electric",
  ] as FuelType[],
  transmission: ["Automatic", "Manual", "CVT"] as Transmission[],
  drivetrain: ["FWD", "RWD", "AWD", "4WD"] as Drivetrain[],
  condition: ["Used", "Certified Pre-Owned", "New"] as Condition[],
};

/** Single formatted address line. */
export const fullAddress = `${site.address.street}, ${site.address.city}, ${site.address.province} ${site.address.postalCode}`;
