"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import VehicleCard from "@/components/VehicleCard";
import { useDialog } from "@/lib/useDialog";
import { formatNumber } from "@/lib/format";
import {
  SORT_OPTIONS,
  countActiveFilters,
  defaultFilterState,
  filterAndSort,
  filtersFromParams,
  filtersToParams,
  isDefaultFilter,
} from "@/lib/filters";
import type {
  FilterState,
  InventoryFacets,
  SortKey,
  Vehicle,
} from "@/lib/types";
import {
  Filter,
  Search,
  X,
  ChevronLeft,
  ChevronRight,
  Car,
} from "@/components/icons";

const PAGE_SIZE = 12;

type Props = {
  vehicles: Vehicle[];
  facets: InventoryFacets;
};

/** Toggle a value within one of the array-valued filter keys. */
function toggle<T>(list: T[], value: T): T[] {
  return list.includes(value)
    ? list.filter((v) => v !== value)
    : [...list, value];
}

/** Parse a numeric input into a positive integer or null (empty/invalid). */
function parseNum(raw: string): number | null {
  if (raw.trim() === "") return null;
  const n = Math.round(Number(raw));
  return Number.isFinite(n) && n >= 0 ? n : null;
}

export default function InventoryBrowser({ vehicles, facets }: Props) {
  const [filters, setFilters] = useState<FilterState>(defaultFilterState());
  const [page, setPage] = useState(1);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const writeCount = useRef(0);
  const resultsTop = useRef<HTMLDivElement>(null);

  // Initialise filters from the URL once on mount. This must run after
  // hydration (not in a useState initializer) so the server-rendered markup and
  // the first client render match — the brief default-state frame is intended.
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setFilters(filtersFromParams(new URLSearchParams(window.location.search)));
  }, []);

  // Keep filters in sync if the user navigates back/forward.
  useEffect(() => {
    const onPop = () => {
      setFilters(filtersFromParams(new URLSearchParams(window.location.search)));
      setPage(1);
    };
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, []);

  // Reflect filter state into the URL (skip the first mount render so we never
  // clobber an incoming query string before it's been read).
  useEffect(() => {
    if (writeCount.current === 0) {
      writeCount.current = 1;
      return;
    }
    const qs = filtersToParams(filters).toString();
    const url = qs ? `?${qs}` : window.location.pathname;
    window.history.replaceState(null, "", url);
  }, [filters]);

  // Focus trap + Escape + scroll lock + focus restore for the filter drawer.
  const drawerRef = useDialog<HTMLDivElement>(drawerOpen, () =>
    setDrawerOpen(false),
  );

  const results = useMemo(
    () => filterAndSort(vehicles, filters),
    [vehicles, filters],
  );

  const totalPages = Math.max(1, Math.ceil(results.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const pageItems = results.slice(
    (safePage - 1) * PAGE_SIZE,
    safePage * PAGE_SIZE,
  );

  const activeCount = countActiveFilters(filters);

  // Any filter change returns to the first page of results.
  function patch(next: Partial<FilterState>) {
    setFilters((f) => ({ ...f, ...next }));
    setPage(1);
  }

  function clearAll() {
    setFilters(defaultFilterState());
    setPage(1);
  }

  function goToPage(p: number) {
    setPage(p);
    // Scroll results into view (header offset handled by CSS scroll-padding).
    resultsTop.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  const chips = buildChips(filters, patch);

  return (
    <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
      {/* Search + sort bar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search
            size={18}
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
          />
          <input
            type="search"
            value={filters.query}
            onChange={(e) => patch({ query: e.target.value })}
            placeholder="Search make, model, feature…"
            aria-label="Search inventory"
            className="w-full rounded-lg border border-slate-300 bg-white py-2.5 pl-10 pr-3 text-sm text-slate-900 placeholder:text-slate-500 focus:border-navy-500"
          />
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={() => setDrawerOpen(true)}
            className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-navy-900 lg:hidden"
          >
            <Filter size={16} /> Filters
            {activeCount > 0 && (
              <span className="ml-0.5 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-brand-500 px-1.5 text-xs text-white">
                {activeCount}
              </span>
            )}
          </button>
          <label className="sr-only" htmlFor="sort">
            Sort vehicles
          </label>
          <select
            id="sort"
            value={filters.sort}
            onChange={(e) => patch({ sort: e.target.value as SortKey })}
            className="min-w-0 flex-1 rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm font-medium text-navy-900 focus:border-navy-500 sm:flex-none"
          >
            {SORT_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div ref={resultsTop} className="mt-6 grid grid-cols-1 gap-8 lg:grid-cols-[260px_1fr]">
        {/* Desktop filter sidebar */}
        <aside className="hidden lg:block">
          <div className="sticky top-20 max-h-[calc(100vh-6rem)] overflow-y-auto pr-1">
            <FilterControls
              filters={filters}
              facets={facets}
              patch={patch}
              clearAll={clearAll}
              activeCount={activeCount}
            />
          </div>
        </aside>

        {/* Results */}
        <section aria-label="Vehicle results">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p
              className="text-sm text-slate-600"
              role="status"
              aria-live="polite"
              aria-atomic="true"
            >
              <span className="font-bold text-navy-900">{results.length}</span>{" "}
              {results.length === 1 ? "vehicle" : "vehicles"}
              {!isDefaultFilter(filters) && " match your search"}
            </p>
          </div>

          {/* Active filter chips */}
          {chips.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-2">
              {chips.map((chip) => (
                <button
                  key={chip.key}
                  type="button"
                  onClick={chip.onRemove}
                  className="inline-flex items-center gap-1.5 rounded-full border border-slate-300 bg-slate-50 px-3 py-1 text-xs font-medium text-navy-800 hover:bg-slate-100"
                >
                  {chip.label}
                  <X size={13} />
                </button>
              ))}
              <button
                type="button"
                onClick={clearAll}
                className="inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold text-brand-600 hover:underline"
              >
                Clear all
              </button>
            </div>
          )}

          {pageItems.length > 0 ? (
            <>
              <div className="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
                {pageItems.map((v, i) => (
                  <VehicleCard key={v.id} vehicle={v} priority={i < 3} />
                ))}
              </div>

              {totalPages > 1 && (
                <Pagination
                  page={safePage}
                  totalPages={totalPages}
                  onChange={goToPage}
                />
              )}
            </>
          ) : (
            <div className="mt-8 rounded-xl border border-dashed border-slate-300 bg-slate-50 px-6 py-16 text-center">
              <Car size={40} className="mx-auto text-slate-300" />
              <h3 className="mt-4 text-lg font-bold text-navy-900">
                No vehicles match your search
              </h3>
              <p className="mx-auto mt-1 max-w-md text-sm text-slate-600">
                Try widening your filters, or contact us — we get new inventory
                in regularly and can help you find the right vehicle.
              </p>
              {activeCount > 0 && (
                <button
                  type="button"
                  onClick={clearAll}
                  className="mt-5 inline-flex items-center rounded-lg bg-brand-500 px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-600"
                >
                  Clear all filters
                </button>
              )}
            </div>
          )}
        </section>
      </div>

      {/* Mobile filter drawer */}
      {drawerOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setDrawerOpen(false)}
            aria-hidden="true"
          />
          <div
            ref={drawerRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby="filter-drawer-title"
            className="absolute inset-y-0 left-0 flex w-[88%] max-w-sm flex-col bg-white shadow-xl"
          >
            <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3">
              <h2
                id="filter-drawer-title"
                className="text-base font-bold text-navy-900"
              >
                Filters
              </h2>
              <button
                type="button"
                aria-label="Close filters"
                onClick={() => setDrawerOpen(false)}
                className="flex h-9 w-9 items-center justify-center rounded-md text-navy-900 hover:bg-slate-100"
              >
                <X />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto px-4 py-4">
              <FilterControls
                filters={filters}
                facets={facets}
                patch={patch}
                clearAll={clearAll}
                activeCount={activeCount}
              />
            </div>
            <div className="border-t border-slate-200 p-4">
              <button
                type="button"
                onClick={() => setDrawerOpen(false)}
                className="w-full rounded-lg bg-navy-900 px-4 py-3 text-sm font-semibold text-white"
              >
                Show {results.length} {results.length === 1 ? "result" : "results"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------

type FilterControlsProps = {
  filters: FilterState;
  facets: InventoryFacets;
  patch: (next: Partial<FilterState>) => void;
  clearAll: () => void;
  activeCount: number;
};

function FilterControls({
  filters,
  facets,
  patch,
  clearAll,
  activeCount,
}: FilterControlsProps) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-bold uppercase tracking-wide text-navy-900">
          Refine
        </h2>
        {activeCount > 0 && (
          <button
            type="button"
            onClick={clearAll}
            className="text-xs font-semibold text-brand-600 hover:underline"
          >
            Clear ({activeCount})
          </button>
        )}
      </div>

      <CheckGroup
        title="Make"
        options={facets.makes}
        selected={filters.makes}
        onToggle={(v) => patch({ makes: toggle(filters.makes, v) })}
      />

      <CheckGroup
        title="Body Type"
        options={facets.bodyTypes}
        selected={filters.bodyTypes}
        onToggle={(v) =>
          patch({ bodyTypes: toggle(filters.bodyTypes, v) })
        }
      />

      {/* Price */}
      <FieldGroup title="Price">
        <div className="flex items-center gap-2">
          <NumberField
            label="Min price"
            value={filters.minPrice}
            placeholder={facets.priceMin ? `$${formatNumber(facets.priceMin)}` : "Min"}
            onChange={(n) => patch({ minPrice: n })}
          />
          <span className="text-slate-400">–</span>
          <NumberField
            label="Max price"
            value={filters.maxPrice}
            placeholder={facets.priceMax ? `$${formatNumber(facets.priceMax)}` : "Max"}
            onChange={(n) => patch({ maxPrice: n })}
          />
        </div>
      </FieldGroup>

      {/* Year */}
      <FieldGroup title="Year">
        <div className="flex items-center gap-2">
          <NumberField
            label="Min year"
            value={filters.minYear}
            placeholder={facets.yearMin ? String(facets.yearMin) : "From"}
            onChange={(n) => patch({ minYear: n })}
          />
          <span className="text-slate-400">–</span>
          <NumberField
            label="Max year"
            value={filters.maxYear}
            placeholder={facets.yearMax ? String(facets.yearMax) : "To"}
            onChange={(n) => patch({ maxYear: n })}
          />
        </div>
      </FieldGroup>

      {/* Max mileage */}
      <FieldGroup title="Max Mileage">
        <select
          value={filters.maxMileage ?? ""}
          onChange={(e) =>
            patch({
              maxMileage: e.target.value === "" ? null : Number(e.target.value),
            })
          }
          aria-label="Maximum mileage"
          className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus:border-navy-500"
        >
          <option value="">Any mileage</option>
          {[50000, 80000, 100000, 120000, 150000, 200000]
            .filter((m) => !facets.mileageMax || m < facets.mileageMax + 20000)
            .map((m) => (
              <option key={m} value={m}>
                Under {formatNumber(m)} km
              </option>
            ))}
        </select>
      </FieldGroup>

      <CheckGroup
        title="Fuel Type"
        options={facets.fuelTypes}
        selected={filters.fuelTypes}
        onToggle={(v) =>
          patch({ fuelTypes: toggle(filters.fuelTypes, v) })
        }
      />

      <CheckGroup
        title="Transmission"
        options={facets.transmissions}
        selected={filters.transmissions}
        onToggle={(v) =>
          patch({ transmissions: toggle(filters.transmissions, v) })
        }
      />

      <CheckGroup
        title="Drivetrain"
        options={facets.drivetrains}
        selected={filters.drivetrains}
        onToggle={(v) =>
          patch({ drivetrains: toggle(filters.drivetrains, v) })
        }
      />

      <FieldGroup title="Availability">
        <label className="flex cursor-pointer items-center gap-2.5 text-sm text-slate-700">
          <input
            type="checkbox"
            checked={filters.includeSold}
            onChange={(e) => patch({ includeSold: e.target.checked })}
            className="h-4 w-4 rounded border-slate-300 text-brand-500 focus:ring-brand-500"
          />
          Include sold vehicles
        </label>
      </FieldGroup>
    </div>
  );
}

function FieldGroup({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
        {title}
      </h3>
      {children}
    </div>
  );
}

function CheckGroup<T extends string>({
  title,
  options,
  selected,
  onToggle,
}: {
  title: string;
  options: { value: T; count: number }[];
  selected: T[];
  onToggle: (value: T) => void;
}) {
  if (options.length === 0) return null;
  return (
    <FieldGroup title={title}>
      <ul className="space-y-1.5">
        {options.map((o) => (
          <li key={o.value}>
            <label className="flex cursor-pointer items-center justify-between gap-2 text-sm text-slate-700">
              <span className="inline-flex items-center gap-2.5">
                <input
                  type="checkbox"
                  checked={selected.includes(o.value)}
                  onChange={() => onToggle(o.value)}
                  className="h-4 w-4 rounded border-slate-300 text-brand-500 focus:ring-brand-500"
                />
                {o.value}
              </span>
              <span className="text-xs text-slate-500">{o.count}</span>
            </label>
          </li>
        ))}
      </ul>
    </FieldGroup>
  );
}

function NumberField({
  label,
  value,
  placeholder,
  onChange,
}: {
  label: string;
  value: number | null;
  placeholder?: string;
  onChange: (n: number | null) => void;
}) {
  return (
    <input
      type="number"
      inputMode="numeric"
      aria-label={label}
      value={value ?? ""}
      placeholder={placeholder}
      min={0}
      onChange={(e) => onChange(parseNum(e.target.value))}
      className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus:border-navy-500"
    />
  );
}

function Pagination({
  page,
  totalPages,
  onChange,
}: {
  page: number;
  totalPages: number;
  onChange: (p: number) => void;
}) {
  // Compact window of page numbers around the current page.
  const pages: number[] = [];
  const start = Math.max(1, page - 2);
  const end = Math.min(totalPages, start + 4);
  for (let i = Math.max(1, end - 4); i <= end; i++) pages.push(i);

  return (
    <nav
      className="mt-10 flex items-center justify-center gap-1.5"
      aria-label="Pagination"
    >
      <button
        type="button"
        onClick={() => onChange(page - 1)}
        disabled={page <= 1}
        aria-label="Previous page"
        className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-slate-300 text-navy-900 disabled:opacity-40 enabled:hover:bg-slate-100"
      >
        <ChevronLeft size={18} />
      </button>
      {pages[0] > 1 && (
        <span className="px-1 text-slate-400" aria-hidden="true">
          …
        </span>
      )}
      {pages.map((p) => (
        <button
          key={p}
          type="button"
          onClick={() => onChange(p)}
          aria-current={p === page ? "page" : undefined}
          className={`inline-flex h-9 min-w-9 items-center justify-center rounded-md px-2 text-sm font-semibold ${
            p === page
              ? "bg-navy-900 text-white"
              : "border border-slate-300 text-navy-900 hover:bg-slate-100"
          }`}
        >
          {p}
        </button>
      ))}
      {pages[pages.length - 1] < totalPages && (
        <span className="px-1 text-slate-400" aria-hidden="true">
          …
        </span>
      )}
      <button
        type="button"
        onClick={() => onChange(page + 1)}
        disabled={page >= totalPages}
        aria-label="Next page"
        className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-slate-300 text-navy-900 disabled:opacity-40 enabled:hover:bg-slate-100"
      >
        <ChevronRight size={18} />
      </button>
    </nav>
  );
}

// ---------------------------------------------------------------------------

type Chip = { key: string; label: string; onRemove: () => void };

function buildChips(
  filters: FilterState,
  patch: (next: Partial<FilterState>) => void,
): Chip[] {
  const chips: Chip[] = [];

  if (filters.query.trim()) {
    chips.push({
      key: "q",
      label: `“${filters.query.trim()}”`,
      onRemove: () => patch({ query: "" }),
    });
  }
  const arrayKeys: {
    key: keyof FilterState;
    values: string[];
  }[] = [
    { key: "makes", values: filters.makes },
    { key: "bodyTypes", values: filters.bodyTypes },
    { key: "fuelTypes", values: filters.fuelTypes },
    { key: "transmissions", values: filters.transmissions },
    { key: "drivetrains", values: filters.drivetrains },
  ];
  for (const group of arrayKeys) {
    for (const value of group.values) {
      chips.push({
        key: `${group.key}-${value}`,
        label: value,
        onRemove: () =>
          patch({
            [group.key]: (group.values as string[]).filter((v) => v !== value),
          } as Partial<FilterState>),
      });
    }
  }
  if (filters.minPrice !== null) {
    chips.push({
      key: "minPrice",
      label: `Min $${formatNumber(filters.minPrice)}`,
      onRemove: () => patch({ minPrice: null }),
    });
  }
  if (filters.maxPrice !== null) {
    chips.push({
      key: "maxPrice",
      label: `Max $${formatNumber(filters.maxPrice)}`,
      onRemove: () => patch({ maxPrice: null }),
    });
  }
  if (filters.minYear !== null) {
    chips.push({
      key: "minYear",
      label: `From ${filters.minYear}`,
      onRemove: () => patch({ minYear: null }),
    });
  }
  if (filters.maxYear !== null) {
    chips.push({
      key: "maxYear",
      label: `To ${filters.maxYear}`,
      onRemove: () => patch({ maxYear: null }),
    });
  }
  if (filters.maxMileage !== null) {
    chips.push({
      key: "maxKm",
      label: `Under ${formatNumber(filters.maxMileage)} km`,
      onRemove: () => patch({ maxMileage: null }),
    });
  }
  if (filters.includeSold) {
    chips.push({
      key: "sold",
      label: "Incl. sold",
      onRemove: () => patch({ includeSold: false }),
    });
  }
  return chips;
}
