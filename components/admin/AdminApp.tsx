"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import currentInventory from "@/data/inventory.json";
import { OPTIONS } from "@/lib/site";
import { slugify, formatPrice, formatMileage } from "@/lib/format";
import {
  Plus,
  Trash,
  Download,
  Upload,
  Copy,
  Check,
  ChevronLeft,
  Car,
} from "@/components/icons";

const STORAGE_KEY = "sahar-inventory-draft-v1";

type Json = Record<string, unknown>;

type FormState = {
  id: string;
  make: string;
  model: string;
  trim: string;
  year: string;
  price: string;
  mileage: string;
  bodyType: string;
  fuelType: string;
  transmission: string;
  drivetrain: string;
  exteriorColor: string;
  interiorColor: string;
  engine: string;
  cylinders: string;
  doors: string;
  seats: string;
  vin: string;
  stockNumber: string;
  condition: string;
  status: string;
  featured: boolean;
  description: string;
  features: string;
  images: string[];
  carfaxUrl: string;
  dateAdded: string;
};

function emptyForm(): FormState {
  return {
    id: "",
    make: "",
    model: "",
    trim: "",
    year: "",
    price: "",
    mileage: "",
    bodyType: OPTIONS.bodyType[0],
    fuelType: OPTIONS.fuelType[0],
    transmission: OPTIONS.transmission[0],
    drivetrain: OPTIONS.drivetrain[0],
    exteriorColor: "",
    interiorColor: "",
    engine: "",
    cylinders: "",
    doors: "",
    seats: "",
    vin: "",
    stockNumber: "",
    condition: OPTIONS.condition[0],
    status: "available",
    featured: false,
    description: "",
    features: "",
    images: [],
    carfaxUrl: "",
    dateAdded: "",
  };
}

function jsonToForm(j: Json): FormState {
  const f = emptyForm();
  const s = (k: string) => (typeof j[k] === "string" ? (j[k] as string) : "");
  const n = (k: string) =>
    j[k] === null || j[k] === undefined ? "" : String(j[k]);
  return {
    ...f,
    id: s("id"),
    make: s("make"),
    model: s("model"),
    trim: s("trim"),
    year: n("year"),
    price: j.price === null ? "" : n("price"),
    mileage: n("mileage"),
    bodyType: s("bodyType") || f.bodyType,
    fuelType: s("fuelType") || f.fuelType,
    transmission: s("transmission") || f.transmission,
    drivetrain: s("drivetrain") || f.drivetrain,
    exteriorColor: s("exteriorColor"),
    interiorColor: s("interiorColor"),
    engine: s("engine"),
    cylinders: n("cylinders"),
    doors: n("doors"),
    seats: n("seats"),
    vin: s("vin"),
    stockNumber: s("stockNumber"),
    condition: s("condition") || f.condition,
    status: s("status") || "available",
    featured: j.featured === true,
    description: s("description"),
    features: Array.isArray(j.features) ? (j.features as string[]).join("\n") : "",
    images: Array.isArray(j.images)
      ? (j.images as unknown[]).filter((x): x is string => typeof x === "string")
      : [],
    carfaxUrl: s("carfaxUrl"),
    dateAdded: s("dateAdded"),
  };
}

function optNum(v: string): number | undefined {
  const t = v.trim();
  if (t === "") return undefined;
  const num = Number(t);
  return Number.isFinite(num) ? num : undefined;
}

/** Convert form -> clean JSON object (omitting empty optional fields). */
function formToJson(f: FormState): Json {
  const derivedId =
    slugify(f.id) ||
    slugify(
      [f.year, f.make, f.model, f.trim, f.stockNumber].filter(Boolean).join(" "),
    ) ||
    slugify(`${f.make}-${f.model}`) ||
    `vehicle-${Date.parse(f.dateAdded) || Date.now()}`;

  const out: Json = {
    id: derivedId,
    make: f.make.trim(),
    model: f.model.trim(),
    year: optNum(f.year) ?? 0,
    price: f.price.trim() === "" ? null : (optNum(f.price) ?? null),
    mileage: optNum(f.mileage) ?? 0,
    bodyType: f.bodyType,
    fuelType: f.fuelType,
    transmission: f.transmission,
    drivetrain: f.drivetrain,
    exteriorColor: f.exteriorColor.trim() || "—",
    condition: f.condition,
    status: f.status,
    featured: f.featured,
    description: f.description.trim(),
    features: f.features
      .split(/\r?\n/)
      .map((x) => x.trim())
      .filter(Boolean),
    images: f.images.map((x) => x.trim()).filter(Boolean),
    dateAdded: f.dateAdded.trim(),
  };

  // Optional fields — only include when present.
  if (f.trim.trim()) out.trim = f.trim.trim();
  if (f.interiorColor.trim()) out.interiorColor = f.interiorColor.trim();
  if (f.engine.trim()) out.engine = f.engine.trim();
  if (optNum(f.cylinders) !== undefined) out.cylinders = optNum(f.cylinders);
  if (optNum(f.doors) !== undefined) out.doors = optNum(f.doors);
  if (optNum(f.seats) !== undefined) out.seats = optNum(f.seats);
  if (f.vin.trim()) out.vin = f.vin.trim();
  if (f.stockNumber.trim()) out.stockNumber = f.stockNumber.trim();
  if (f.carfaxUrl.trim()) out.carfaxUrl = f.carfaxUrl.trim();

  return out;
}

function todayIso(): string {
  // Avoid build-time evaluation; only called from event handlers in the browser.
  return new Date().toISOString().slice(0, 10);
}

export default function AdminApp() {
  const [cars, setCars] = useState<Json[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [mode, setMode] = useState<"list" | "editor">("list");
  const [editIndex, setEditIndex] = useState<number | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm());
  const [copied, setCopied] = useState(false);
  const [previews, setPreviews] = useState<Record<string, string>>({});
  const importRef = useRef<HTMLInputElement>(null);

  // Load draft from localStorage (browser-only), else seed from the live
  // inventory file. Runs once after mount — setState here is intentional and
  // can't move to a useState initializer without a hydration mismatch.
  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          setCars(parsed);
          setLoaded(true);
          return;
        }
      }
    } catch {
      /* ignore corrupt draft */
    }
    setCars(currentInventory as Json[]);
    setLoaded(true);
  }, []);
  /* eslint-enable react-hooks/set-state-in-effect */

  // Persist working set whenever it changes (after initial load).
  useEffect(() => {
    if (!loaded) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(cars));
    } catch {
      /* storage full / unavailable — non-fatal */
    }
  }, [cars, loaded]);

  // Revoke preview object URLs only on unmount — never on every previews change,
  // since onPickPhotos merges into the map and the URLs stay referenced on screen.
  const previewsRef = useRef<Record<string, string>>({});
  useEffect(() => {
    previewsRef.current = previews;
  }, [previews]);
  useEffect(() => {
    return () => {
      Object.values(previewsRef.current).forEach((url) =>
        URL.revokeObjectURL(url),
      );
    };
  }, []);

  const exportJson = useMemo(() => JSON.stringify(cars, null, 2), [cars]);

  const duplicateIds = useMemo(() => {
    const seen = new Set<string>();
    const dupes = new Set<string>();
    for (const c of cars) {
      const id = typeof c.id === "string" ? c.id : "";
      if (id && seen.has(id)) dupes.add(id);
      if (id) seen.add(id);
    }
    return dupes;
  }, [cars]);

  function startAdd() {
    const f = emptyForm();
    f.dateAdded = todayIso();
    setForm(f);
    setEditIndex(null);
    setPreviews({});
    setMode("editor");
  }

  function startEdit(index: number) {
    setForm(jsonToForm(cars[index]));
    setEditIndex(index);
    setPreviews({});
    setMode("editor");
  }

  function removeCar(index: number) {
    if (!confirm("Delete this vehicle from the list?")) return;
    setCars((prev) => prev.filter((_, i) => i !== index));
  }

  function duplicateCar(index: number) {
    setCars((prev) => {
      const existing = new Set(
        prev.map((c) => (typeof c.id === "string" ? c.id : "")),
      );
      const src = prev[index];
      const base = `${typeof src.id === "string" ? src.id : "vehicle"}-copy`;
      let id = base;
      let n = 2;
      while (existing.has(id)) id = `${base}-${n++}`;
      const next = [...prev];
      next.splice(index + 1, 0, { ...src, id });
      return next;
    });
  }

  function move(index: number, delta: number) {
    setCars((prev) => {
      const next = [...prev];
      const target = index + delta;
      if (target < 0 || target >= next.length) return prev;
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });
  }

  function saveForm() {
    if (!form.make.trim() || !form.model.trim()) {
      alert("Make and Model are required.");
      return;
    }
    const json = formToJson(form);
    setCars((prev) => {
      const next = [...prev];
      if (editIndex === null) next.push(json);
      else next[editIndex] = json;
      return next;
    });
    setMode("list");
    setEditIndex(null);
  }

  function onImport(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const parsed = JSON.parse(String(reader.result));
        if (!Array.isArray(parsed)) throw new Error("not an array");
        const objects = parsed.filter(
          (x): x is Json =>
            x !== null && typeof x === "object" && !Array.isArray(x),
        );
        setCars(objects);
        const skipped = parsed.length - objects.length;
        alert(
          `Imported ${objects.length} vehicle${objects.length === 1 ? "" : "s"}` +
            (skipped
              ? ` (skipped ${skipped} invalid entr${skipped === 1 ? "y" : "ies"})`
              : "") +
            ".",
        );
      } catch {
        alert("That file isn't a valid inventory.json (expected a JSON array).");
      }
    };
    reader.readAsText(file);
    e.target.value = "";
  }

  function download() {
    const blob = new Blob([exportJson], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "inventory.json";
    a.click();
    URL.revokeObjectURL(url);
  }

  async function copyJson() {
    try {
      await navigator.clipboard.writeText(exportJson);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      alert("Couldn't copy automatically — use the Download button instead.");
    }
  }

  function resetToSite() {
    if (!confirm("Discard your draft and reload the inventory currently on the site?"))
      return;
    setCars(currentInventory as Json[]);
    setMode("list");
  }

  // --- Image field handlers (editor) ---------------------------------------
  function addImagePath() {
    setForm((f) => ({ ...f, images: [...f.images, ""] }));
  }
  function setImagePath(i: number, value: string) {
    setForm((f) => {
      const images = [...f.images];
      images[i] = value;
      return { ...f, images };
    });
  }
  function removeImagePath(i: number) {
    setForm((f) => ({ ...f, images: f.images.filter((_, idx) => idx !== i) }));
  }
  function onPickPhotos(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    if (files.length === 0) return;
    const newPreviews: Record<string, string> = {};
    const newPaths: string[] = [];
    for (const file of files) {
      const dot = file.name.lastIndexOf(".");
      const baseName = dot > 0 ? file.name.slice(0, dot) : file.name;
      const ext = dot > 0 ? file.name.slice(dot + 1).toLowerCase() : "jpg";
      const path = `/inventory/${slugify(baseName)}.${ext}`;
      newPaths.push(path);
      newPreviews[path] = URL.createObjectURL(file);
    }
    setPreviews((p) => ({ ...p, ...newPreviews }));
    setForm((f) => ({
      ...f,
      images: [...f.images.filter(Boolean), ...newPaths],
    }));
    e.target.value = "";
  }

  if (!loaded) {
    return (
      <div className="py-20 text-center text-slate-500">Loading inventory…</div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold text-navy-900">
            Inventory Manager
          </h1>
          <p className="mt-1 text-sm text-slate-600">
            Add and edit listings, then export <code>inventory.json</code> to
            update the website. Your work is saved in this browser automatically.
          </p>
        </div>
        <Link
          href="/inventory/"
          className="text-sm font-semibold text-brand-600 hover:underline"
        >
          View live inventory →
        </Link>
      </div>

      {mode === "list" ? (
        <>
          {/* Toolbar */}
          <div className="mt-6 flex flex-wrap items-center gap-2 rounded-xl border border-slate-200 bg-white p-3 shadow-sm">
            <button
              type="button"
              onClick={startAdd}
              className="inline-flex items-center gap-1.5 rounded-lg bg-brand-500 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-600"
            >
              <Plus size={16} /> Add Vehicle
            </button>
            <button
              type="button"
              onClick={download}
              className="inline-flex items-center gap-1.5 rounded-lg bg-navy-900 px-4 py-2 text-sm font-semibold text-white hover:bg-navy-800"
            >
              <Download size={16} /> Download inventory.json
            </button>
            <button
              type="button"
              onClick={copyJson}
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-navy-900 hover:bg-slate-50"
            >
              {copied ? <Check size={16} /> : <Copy size={16} />}
              {copied ? "Copied!" : "Copy JSON"}
            </button>
            <button
              type="button"
              onClick={() => importRef.current?.click()}
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-navy-900 hover:bg-slate-50"
            >
              <Upload size={16} /> Import
            </button>
            <input
              ref={importRef}
              type="file"
              accept="application/json,.json"
              onChange={onImport}
              className="hidden"
            />
            <button
              type="button"
              onClick={resetToSite}
              className="ml-auto text-sm font-medium text-slate-500 hover:text-brand-600"
            >
              Reset to live data
            </button>
          </div>

          {duplicateIds.size > 0 && (
            <p className="mt-3 rounded-lg border border-amber-200 bg-amber-50 px-3.5 py-2.5 text-sm text-amber-800">
              Warning: duplicate IDs detected ({[...duplicateIds].join(", ")}).
              Each vehicle needs a unique ID — edit one to fix it.
            </p>
          )}

          {/* List */}
          <div className="mt-4 space-y-2">
            <p className="text-sm text-slate-500">
              {cars.length} {cars.length === 1 ? "vehicle" : "vehicles"} in your
              working list
            </p>
            {cars.length === 0 && (
              <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 px-6 py-12 text-center">
                <Car size={36} className="mx-auto text-slate-300" />
                <p className="mt-3 text-sm text-slate-600">
                  No vehicles yet. Click <strong>Add Vehicle</strong> to create
                  your first listing.
                </p>
              </div>
            )}
            {cars.map((c, i) => {
              if (!c || typeof c !== "object") return null;
              const id = typeof c.id === "string" ? c.id : "";
              const title = [c.year, c.make, c.model, c.trim]
                .filter(Boolean)
                .join(" ");
              const price =
                typeof c.price === "number" ? c.price : c.price === null ? null : 0;
              const mileage = typeof c.mileage === "number" ? c.mileage : 0;
              return (
                <div
                  key={`${id}-${i}`}
                  className="flex flex-wrap items-center gap-3 rounded-xl border border-slate-200 bg-white p-3 shadow-sm"
                >
                  <div className="flex flex-col">
                    <button
                      type="button"
                      onClick={() => move(i, -1)}
                      disabled={i === 0}
                      aria-label="Move up"
                      className="text-slate-400 hover:text-navy-900 disabled:opacity-30"
                    >
                      ▲
                    </button>
                    <button
                      type="button"
                      onClick={() => move(i, 1)}
                      disabled={i === cars.length - 1}
                      aria-label="Move down"
                      className="text-slate-400 hover:text-navy-900 disabled:opacity-30"
                    >
                      ▼
                    </button>
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-semibold text-navy-900">
                      {title || "(untitled vehicle)"}
                      {c.featured === true && (
                        <span className="ml-2 rounded bg-brand-50 px-1.5 py-0.5 text-xs font-semibold text-brand-600">
                          Featured
                        </span>
                      )}
                      {typeof c.status === "string" && c.status !== "available" && (
                        <span className="ml-2 rounded bg-slate-100 px-1.5 py-0.5 text-xs font-medium capitalize text-slate-600">
                          {c.status}
                        </span>
                      )}
                    </p>
                    <p className="truncate text-xs text-slate-500">
                      {formatPrice(price)} · {formatMileage(mileage)} ·{" "}
                      <span className="font-mono">{id || "no-id"}</span>
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => startEdit(i)}
                      className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm font-semibold text-navy-900 hover:bg-slate-50"
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => duplicateCar(i)}
                      className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-600 hover:bg-slate-50"
                    >
                      Duplicate
                    </button>
                    <button
                      type="button"
                      onClick={() => removeCar(i)}
                      aria-label="Delete vehicle"
                      className="rounded-lg border border-red-200 p-1.5 text-red-600 hover:bg-red-50"
                    >
                      <Trash size={16} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          <Instructions />
        </>
      ) : (
        <Editor
          form={form}
          setForm={setForm}
          previews={previews}
          onSave={saveForm}
          onCancel={() => setMode("list")}
          isNew={editIndex === null}
          addImagePath={addImagePath}
          setImagePath={setImagePath}
          removeImagePath={removeImagePath}
          onPickPhotos={onPickPhotos}
        />
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------

const labelClass = "mb-1 block text-sm font-medium text-navy-900";
const inputClass =
  "w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus:border-navy-500";

function Field({
  label,
  children,
  hint,
}: {
  label: string;
  children: React.ReactNode;
  hint?: string;
}) {
  return (
    <div>
      <span className={labelClass}>{label}</span>
      {children}
      {hint && <p className="mt-1 text-xs text-slate-500">{hint}</p>}
    </div>
  );
}

type EditorProps = {
  form: FormState;
  setForm: React.Dispatch<React.SetStateAction<FormState>>;
  previews: Record<string, string>;
  onSave: () => void;
  onCancel: () => void;
  isNew: boolean;
  addImagePath: () => void;
  setImagePath: (i: number, v: string) => void;
  removeImagePath: (i: number) => void;
  onPickPhotos: (e: React.ChangeEvent<HTMLInputElement>) => void;
};

function Editor({
  form,
  setForm,
  previews,
  onSave,
  onCancel,
  isNew,
  addImagePath,
  setImagePath,
  removeImagePath,
  onPickPhotos,
}: EditorProps) {
  const set = (patch: Partial<FormState>) => setForm((f) => ({ ...f, ...patch }));

  return (
    <div className="mt-6">
      <button
        type="button"
        onClick={onCancel}
        className="mb-4 inline-flex items-center gap-1 text-sm font-semibold text-slate-600 hover:text-navy-900"
      >
        <ChevronLeft size={16} /> Back to list
      </button>

      <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
        <h2 className="text-lg font-bold text-navy-900">
          {isNew ? "Add Vehicle" : "Edit Vehicle"}
        </h2>

        <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Field label="Year">
            <input
              className={inputClass}
              inputMode="numeric"
              value={form.year}
              onChange={(e) => set({ year: e.target.value })}
              placeholder="2020"
            />
          </Field>
          <Field label="Make *">
            <input
              className={inputClass}
              value={form.make}
              onChange={(e) => set({ make: e.target.value })}
              placeholder="Honda"
            />
          </Field>
          <Field label="Model *">
            <input
              className={inputClass}
              value={form.model}
              onChange={(e) => set({ model: e.target.value })}
              placeholder="Civic"
            />
          </Field>
          <Field label="Trim">
            <input
              className={inputClass}
              value={form.trim}
              onChange={(e) => set({ trim: e.target.value })}
              placeholder="LX"
            />
          </Field>
          <Field label="Price (CAD)" hint="Leave blank for “Call for Price”.">
            <input
              className={inputClass}
              inputMode="numeric"
              value={form.price}
              onChange={(e) => set({ price: e.target.value })}
              placeholder="22995"
            />
          </Field>
          <Field label="Mileage (km)">
            <input
              className={inputClass}
              inputMode="numeric"
              value={form.mileage}
              onChange={(e) => set({ mileage: e.target.value })}
              placeholder="68000"
            />
          </Field>

          <Field label="Body Type">
            <select
              className={inputClass}
              value={form.bodyType}
              onChange={(e) => set({ bodyType: e.target.value })}
            >
              {OPTIONS.bodyType.map((o) => (
                <option key={o}>{o}</option>
              ))}
            </select>
          </Field>
          <Field label="Fuel Type">
            <select
              className={inputClass}
              value={form.fuelType}
              onChange={(e) => set({ fuelType: e.target.value })}
            >
              {OPTIONS.fuelType.map((o) => (
                <option key={o}>{o}</option>
              ))}
            </select>
          </Field>
          <Field label="Transmission">
            <select
              className={inputClass}
              value={form.transmission}
              onChange={(e) => set({ transmission: e.target.value })}
            >
              {OPTIONS.transmission.map((o) => (
                <option key={o}>{o}</option>
              ))}
            </select>
          </Field>
          <Field label="Drivetrain">
            <select
              className={inputClass}
              value={form.drivetrain}
              onChange={(e) => set({ drivetrain: e.target.value })}
            >
              {OPTIONS.drivetrain.map((o) => (
                <option key={o}>{o}</option>
              ))}
            </select>
          </Field>
          <Field label="Condition">
            <select
              className={inputClass}
              value={form.condition}
              onChange={(e) => set({ condition: e.target.value })}
            >
              {OPTIONS.condition.map((o) => (
                <option key={o}>{o}</option>
              ))}
            </select>
          </Field>
          <Field label="Status">
            <select
              className={inputClass}
              value={form.status}
              onChange={(e) => set({ status: e.target.value })}
            >
              <option value="available">Available</option>
              <option value="pending">Sale Pending</option>
              <option value="sold">Sold</option>
            </select>
          </Field>

          <Field label="Exterior Color">
            <input
              className={inputClass}
              value={form.exteriorColor}
              onChange={(e) => set({ exteriorColor: e.target.value })}
              placeholder="Modern Steel Metallic"
            />
          </Field>
          <Field label="Interior Color">
            <input
              className={inputClass}
              value={form.interiorColor}
              onChange={(e) => set({ interiorColor: e.target.value })}
              placeholder="Black"
            />
          </Field>
          <Field label="Engine">
            <input
              className={inputClass}
              value={form.engine}
              onChange={(e) => set({ engine: e.target.value })}
              placeholder="2.0L 4-Cylinder"
            />
          </Field>
          <Field label="Cylinders">
            <input
              className={inputClass}
              inputMode="numeric"
              value={form.cylinders}
              onChange={(e) => set({ cylinders: e.target.value })}
              placeholder="4"
            />
          </Field>
          <Field label="Doors">
            <input
              className={inputClass}
              inputMode="numeric"
              value={form.doors}
              onChange={(e) => set({ doors: e.target.value })}
              placeholder="4"
            />
          </Field>
          <Field label="Seats">
            <input
              className={inputClass}
              inputMode="numeric"
              value={form.seats}
              onChange={(e) => set({ seats: e.target.value })}
              placeholder="5"
            />
          </Field>
          <Field label="VIN">
            <input
              className={inputClass}
              value={form.vin}
              onChange={(e) => set({ vin: e.target.value })}
            />
          </Field>
          <Field label="Stock #">
            <input
              className={inputClass}
              value={form.stockNumber}
              onChange={(e) => set({ stockNumber: e.target.value })}
              placeholder="ST1042"
            />
          </Field>
          <Field label="CARFAX URL">
            <input
              className={inputClass}
              value={form.carfaxUrl}
              onChange={(e) => set({ carfaxUrl: e.target.value })}
              placeholder="https://…"
            />
          </Field>
          <Field
            label="Listing ID (slug)"
            hint="Auto-generated if left blank. Used in the page URL."
          >
            <input
              className={inputClass}
              value={form.id}
              onChange={(e) => set({ id: e.target.value })}
              placeholder="2020-honda-civic-lx-st1042"
            />
          </Field>
          <Field label="Date Added" hint="YYYY-MM-DD. Drives “newest” sorting.">
            <input
              className={inputClass}
              value={form.dateAdded}
              onChange={(e) => set({ dateAdded: e.target.value })}
              placeholder="2026-06-15"
            />
          </Field>
          <label className="flex items-center gap-2.5 self-end pb-2 text-sm font-medium text-navy-900">
            <input
              type="checkbox"
              checked={form.featured}
              onChange={(e) => set({ featured: e.target.checked })}
              className="h-4 w-4 rounded border-slate-300 text-brand-500"
            />
            Feature on homepage
          </label>
        </div>

        <div className="mt-5">
          <Field
            label="Description"
            hint="A short, friendly paragraph about the vehicle."
          >
            <textarea
              className={`${inputClass} resize-y`}
              rows={4}
              value={form.description}
              onChange={(e) => set({ description: e.target.value })}
            />
          </Field>
        </div>

        <div className="mt-5">
          <Field
            label="Features"
            hint="One feature per line (e.g. Backup Camera, Heated Seats)."
          >
            <textarea
              className={`${inputClass} resize-y`}
              rows={5}
              value={form.features}
              onChange={(e) => set({ features: e.target.value })}
              placeholder={"Backup Camera\nApple CarPlay\nHeated Seats"}
            />
          </Field>
        </div>

        {/* Photos */}
        <div className="mt-5">
          <span className={labelClass}>Photos</span>
          <p className="mb-2 text-xs text-slate-500">
            Each photo is a path under <code>/public</code>. Place your image
            files in <code>public/inventory/</code> and reference them like{" "}
            <code>/inventory/my-photo.jpg</code>. Use the picker below to preview
            files and auto-fill their paths — then copy those files into{" "}
            <code>public/inventory/</code> before deploying.
          </p>

          <div className="space-y-2">
            {form.images.map((img, i) => (
              <div key={i} className="flex items-center gap-2">
                <div className="h-12 w-16 shrink-0 overflow-hidden rounded border border-slate-200 bg-slate-100">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={previews[img] || img || "/inventory/placeholder-navy.svg"}
                    alt=""
                    className="h-full w-full object-cover"
                    onError={(e) => {
                      (e.currentTarget as HTMLImageElement).src =
                        "/inventory/placeholder-navy.svg";
                    }}
                  />
                </div>
                <input
                  className={inputClass}
                  value={img}
                  onChange={(e) => setImagePath(i, e.target.value)}
                  placeholder="/inventory/photo.jpg"
                />
                <button
                  type="button"
                  onClick={() => removeImagePath(i)}
                  aria-label="Remove photo"
                  className="shrink-0 rounded-lg border border-red-200 p-2 text-red-600 hover:bg-red-50"
                >
                  <Trash size={16} />
                </button>
              </div>
            ))}
          </div>

          <div className="mt-3 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={addImagePath}
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 px-3 py-1.5 text-sm font-medium text-navy-900 hover:bg-slate-50"
            >
              <Plus size={15} /> Add path
            </button>
            <label className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-slate-300 px-3 py-1.5 text-sm font-medium text-navy-900 hover:bg-slate-50">
              <Upload size={15} /> Pick photos to preview
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={onPickPhotos}
                className="hidden"
              />
            </label>
          </div>
        </div>

        <div className="mt-6 flex flex-wrap gap-3 border-t border-slate-200 pt-5">
          <button
            type="button"
            onClick={onSave}
            className="inline-flex items-center gap-1.5 rounded-lg bg-brand-500 px-6 py-2.5 text-sm font-semibold text-white hover:bg-brand-600"
          >
            <Check size={16} /> {isNew ? "Add to list" : "Save changes"}
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="rounded-lg border border-slate-300 px-6 py-2.5 text-sm font-semibold text-navy-900 hover:bg-slate-50"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

function Instructions() {
  return (
    <div className="mt-8 rounded-xl border border-navy-200 bg-navy-50 p-5 text-sm text-navy-900">
      <h2 className="text-base font-bold">How to update the website</h2>
      <ol className="mt-3 list-decimal space-y-1.5 pl-5 text-navy-800">
        <li>Add, edit, or remove vehicles above. Your changes are saved in this browser.</li>
        <li>
          For photos: copy your image files into the{" "}
          <code>public/inventory/</code> folder of the project, then reference
          them by path (e.g. <code>/inventory/my-car-1.jpg</code>).
        </li>
        <li>
          Click <strong>Download inventory.json</strong> and replace the file at{" "}
          <code>data/inventory.json</code> in the project with it.
        </li>
        <li>
          Commit &amp; push the changes (and any new photos). Your host rebuilds
          and the site updates. See <code>HANDOFF.md</code> for details.
        </li>
      </ol>
      <p className="mt-3 text-xs text-navy-600">
        This tool runs entirely in your browser — nothing is uploaded anywhere
        until you commit the exported file.
      </p>
    </div>
  );
}
