-- Sahar Motors inventory database (Cloudflare D1).
-- Run once against your D1 database (the setup guide shows how, via the dashboard
-- "Console" tab — just paste this in and click Execute).

CREATE TABLE IF NOT EXISTS vehicles (
  id            TEXT PRIMARY KEY,
  make          TEXT NOT NULL,
  model         TEXT NOT NULL,
  trim          TEXT,
  year          INTEGER NOT NULL DEFAULT 0,
  price         INTEGER,            -- whole CAD dollars; NULL = "Call for Price"
  mileage       INTEGER DEFAULT 0,  -- km; 0 = not stated ("N/A")
  bodyType      TEXT DEFAULT 'Sedan',
  fuelType      TEXT DEFAULT 'Gasoline',
  transmission  TEXT DEFAULT 'Automatic',
  drivetrain    TEXT DEFAULT 'FWD',
  exteriorColor TEXT,
  interiorColor TEXT,
  engine        TEXT,
  cylinders     INTEGER DEFAULT 0,
  doors         INTEGER DEFAULT 0,
  seats         INTEGER DEFAULT 0,
  vin           TEXT,
  stockNumber   TEXT,
  condition     TEXT DEFAULT 'Used',
  status        TEXT NOT NULL DEFAULT 'available',  -- available | pending | sold
  featured      INTEGER NOT NULL DEFAULT 0,         -- 0/1
  description   TEXT,
  features      TEXT,               -- JSON array, e.g. ["Sunroof","Bluetooth"]
  images        TEXT,               -- JSON array of URLs, e.g. ["/img/cars/.../x.jpg"]
  carfaxUrl     TEXT,
  dateAdded     TEXT,               -- "YYYY-MM-DD"
  updatedAt     TEXT
);

CREATE INDEX IF NOT EXISTS idx_vehicles_status ON vehicles (status);
CREATE INDEX IF NOT EXISTS idx_vehicles_added  ON vehicles (dateAdded);
