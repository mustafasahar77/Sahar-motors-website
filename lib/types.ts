// Domain model for Sahar Motors inventory.
// These string-union types double as the canonical list of allowed values and
// are surfaced in the admin tool dropdowns (see lib/site.ts OPTIONS).

export type BodyType =
  | "Sedan"
  | "SUV"
  | "Truck"
  | "Coupe"
  | "Hatchback"
  | "Minivan"
  | "Van"
  | "Convertible"
  | "Wagon";

export type FuelType =
  | "Gasoline"
  | "Diesel"
  | "Hybrid"
  | "Plug-in Hybrid"
  | "Electric";

export type Transmission = "Automatic" | "Manual" | "CVT";

export type Drivetrain = "FWD" | "RWD" | "AWD" | "4WD";

export type Condition = "Used" | "New" | "Certified Pre-Owned";

export type VehicleStatus = "available" | "pending" | "sold";

export interface Vehicle {
  /** Unique, URL-safe identifier used as the detail-page slug. */
  id: string;
  make: string;
  model: string;
  trim?: string;
  year: number;
  /** Asking price in CAD. `null` renders as "Call for Price". */
  price: number | null;
  /** Odometer reading in kilometres. */
  mileage: number;
  bodyType: BodyType;
  fuelType: FuelType;
  transmission: Transmission;
  drivetrain: Drivetrain;
  exteriorColor: string;
  interiorColor?: string;
  engine?: string;
  cylinders?: number;
  doors?: number;
  seats?: number;
  vin?: string;
  stockNumber?: string;
  condition: Condition;
  status: VehicleStatus;
  featured: boolean;
  description: string;
  features: string[];
  /** Public paths to photos, e.g. "/inventory/2019-honda-civic-1.jpg". */
  images: string[];
  /** Optional CARFAX report link. */
  carfaxUrl?: string;
  /** ISO date the listing was added, "YYYY-MM-DD". Drives "newest" sort. */
  dateAdded: string;
}

export type SortKey =
  | "newest"
  | "price-asc"
  | "price-desc"
  | "year-desc"
  | "year-asc"
  | "mileage-asc";

export interface FilterState {
  query: string;
  makes: string[];
  bodyTypes: BodyType[];
  fuelTypes: FuelType[];
  transmissions: Transmission[];
  drivetrains: Drivetrain[];
  minPrice: number | null;
  maxPrice: number | null;
  minYear: number | null;
  maxYear: number | null;
  maxMileage: number | null;
  includeSold: boolean;
  sort: SortKey;
}

/** Facets derived from the live inventory to populate the filter UI. */
export interface InventoryFacets {
  makes: { value: string; count: number }[];
  bodyTypes: { value: BodyType; count: number }[];
  fuelTypes: { value: FuelType; count: number }[];
  transmissions: { value: Transmission; count: number }[];
  drivetrains: { value: Drivetrain; count: number }[];
  priceMin: number;
  priceMax: number;
  yearMin: number;
  yearMax: number;
  mileageMax: number;
}
