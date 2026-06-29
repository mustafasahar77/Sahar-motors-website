"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import currentInventory from "@/data/inventory.json";
import { OPTIONS } from "@/lib/site";
import { slugify, formatPrice, formatMileage } from "@/lib/format";
import {
  apiList, apiSave, apiDelete, apiSeed, apiUpload, clearToken,
} from "@/lib/adminApi";
import type { Vehicle } from "@/lib/types";
import {
  Plus, Trash, Download, Upload, Check, ChevronLeft, Car,
} from "@/components/icons";

type Json = Record<string, unknown>;

type FormState = {
  id: string; make: string; model: string; trim: string; year: string;
  price: string; mileage: string; bodyType: string; fuelType: string;
  transmission: string; drivetrain: string; exteriorColor: string;
  interiorColor: string; engine: string; cylinders: string; doors: string;
  seats: string; vin: string; stockNumber: string; condition: string;
  status: string; featured: boolean; description: string; features: string;
  images: string[]; carfaxUrl: string; dateAdded: string;
};

function emptyForm(): FormState {
  return {
    id: "", make: "", model: "", trim: "", year: "", price: "", mileage: "",
    bodyType: OPTIONS.bodyType[0], fuelType: OPTIONS.fuelType[0],
    transmission: OPTIONS.transmission[0], drivetrain: OPTIONS.drivetrain[0],
    exteriorColor: "", interiorColor: "", engine: "", cylinders: "", doors: "",
    seats: "", vin: "", stockNumber: "", condition: OPTIONS.condition[0],
    status: "available", featured: false, description: "", features: "",
    images: [], carfaxUrl: "", dateAdded: "",
  };
}

function jsonToForm(j: Json): FormState {
  const f = emptyForm();
  const s = (k: string) => (typeof j[k] === "string" ? (j[k] as string) : "");
  const n = (k: string) => (j[k] === null || j[k] === undefined ? "" : String(j[k]));
  return {
    ...f,
    id: s("id"), make: s("make"), model: s("model"), trim: s("trim"),
    year: n("year"),
    price: j.price === null ? "" : n("price"),
    mileage: j.mileage ? n("mileage") : "",
    bodyType: s("bodyType") || f.bodyType,
    fuelType: s("fuelType") || f.fuelType,
    transmission: s("transmission") || f.transmission,
    drivetrain: s("drivetrain") || f.drivetrain,
    exteriorColor: s("exteriorColor"), interiorColor: s("interiorColor"),
    engine: s("engine"),
    cylinders: j.cylinders ? n("cylinders") : "",
    doors: j.doors ? n("doors") : "",
    seats: j.seats ? n("seats") : "",
    vin: s("vin"), stockNumber: s("stockNumber"),
    condition: s("condition") || f.condition,
    status: s("status") || "available",
    featured: j.featured === true,
    description: s("description"),
    features: Array.isArray(j.features) ? (j.features as string[]).join("\n") : "",
    images: Array.isArray(j.images)
      ? (j.images as unknown[]).filter((x): x is string => typeof x === "string")
      : [],
    carfaxUrl: s("carfaxUrl"), dateAdded: s("dateAdded"),
  };
}

function optNum(v: string): number | undefined {
  const t = v.trim();
  if (t === "") return undefined;
  const num = Number(t);
  return Number.isFinite(num) ? num : undefined;
}

function formToJson(f: FormState): Json {
  const out: Json = {
    id: slugify(f.id) || "",
    make: f.make.trim(), model: f.model.trim(),
    year: optNum(f.year) ?? 0,
    price: f.price.trim() === "" ? null : (optNum(f.price) ?? null),
    mileage: optNum(f.mileage) ?? 0,
    bodyType: f.bodyType, fuelType: f.fuelType, transmission: f.transmission,
    drivetrain: f.drivetrain, exteriorColor: f.exteriorColor.trim(),
    condition: f.condition, status: f.status, featured: f.featured,
    description: f.description.trim(),
    features: f.features.split(/\r?\n/).map((x) => x.trim()).filter(Boolean),
    images: f.images.map((x) => x.trim()).filter(Boolean),
    dateAdded: f.dateAdded.trim(),
    trim: f.trim.trim(), interiorColor: f.interiorColor.trim(),
    engine: f.engine.trim(),
    cylinders: optNum(f.cylinders) ?? 0,
    doors: optNum(f.doors) ?? 0,
    seats: optNum(f.seats) ?? 0,
    vin: f.vin.trim(), stockNumber: f.stockNumber.trim(),
    carfaxUrl: f.carfaxUrl.trim(),
  };
  return out;
}

function carIdFor(f: FormState): string {
  return (
    slugify(f.id) ||
    slugify([f.year, f.make, f.model, f.trim].filter(Boolean).join(" ")) ||
    "new"
  );
}

export default function AdminApp() {
  const [cars, setCars] = useState<Vehicle[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [loadError, setLoadError] = useState("");
  const [mode, setMode] = useState<"list" | "editor">("list");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm());
  const [toast, setToast] = useState<{ kind: "ok" | "err"; msg: string } | null>(null);
  const [busy, setBusy] = useState(false);
  const toastTimer = useRef<number | null>(null);

  async function load() {
    try {
      const list = await apiList();
      setCars(list);
      setLoadError("");
    } catch {
      setLoadError("Couldn't reach the inventory backend. Make sure the Cloudflare setup is done (see ADMIN-BACKEND-SETUP.md).");
    } finally {
      setLoaded(true);
    }
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load();
    return () => {
      if (toastTimer.current) window.clearTimeout(toastTimer.current);
    };
  }, []);

  function flash(kind: "ok" | "err", msg: string) {
    setToast({ kind, msg });
    if (toastTimer.current) window.clearTimeout(toastTimer.current);
    toastTimer.current = window.setTimeout(() => setToast(null), 4000);
  }

  const sorted = useMemo(
    () => [...cars].sort((a, b) => (b.dateAdded || "").localeCompare(a.dateAdded || "")),
    [cars],
  );
  const availableCount = cars.filter((c) => c.status === "available").length;

  function startAdd() {
    const f = emptyForm();
    f.dateAdded = new Date().toISOString().slice(0, 10);
    setForm(f);
    setEditingId(null);
    setMode("editor");
  }

  function startEdit(car: Vehicle) {
    setForm(jsonToForm(car as unknown as Json));
    setEditingId(car.id);
    setMode("editor");
  }

  async function saveForm() {
    if (!form.make.trim() || !form.model.trim()) {
      flash("err", "Make and Model are required.");
      return;
    }
    setBusy(true);
    try {
      const payload = formToJson(form);
      if (editingId) payload.originalId = editingId;
      const res = await apiSave(payload);
      await load();
      setMode("list");
      setEditingId(null);
      const label = [res.vehicle?.make, res.vehicle?.model].filter(Boolean).join(" ") || "Vehicle";
      flash("ok", editingId ? "Changes saved — live now." : `Posted! "${label}" is live.`);
    } catch (e) {
      flash("err", (e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  async function removeCar(car: Vehicle) {
    if (!confirm(`Delete "${[car.year, car.make, car.model].filter(Boolean).join(" ")}"? This removes it from the live site.`)) return;
    setBusy(true);
    try {
      await apiDelete(car.id);
      await load();
      flash("ok", "Vehicle deleted.");
    } catch (e) {
      flash("err", (e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  async function duplicate(car: Vehicle) {
    setBusy(true);
    try {
      const copy = { ...(car as unknown as Json), id: `${car.id}-copy`, featured: false, status: "available" };
      await apiSave(copy);
      await load();
      flash("ok", "Duplicated — edit the copy and post.");
    } catch (e) {
      flash("err", (e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  async function importExisting() {
    if (!confirm(`Import the ${(currentInventory as unknown[]).length} cars bundled with the site into the database? (Safe to run once; re-running updates, never duplicates.)`)) return;
    setBusy(true);
    try {
      const res = await apiSeed(currentInventory as unknown[]);
      await load();
      flash("ok", `Imported ${res.seeded} vehicles.`);
    } catch (e) {
      flash("err", (e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  function downloadBackup() {
    const blob = new Blob([JSON.stringify(cars, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "inventory-backup.json";
    a.click();
    URL.revokeObjectURL(url);
  }

  function logout() {
    clearToken();
    window.location.reload();
  }

  if (!loaded) {
    return <div className="py-20 text-center text-slate-500">Loading inventory…</div>;
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold text-navy-900">Inventory Manager</h1>
          <p className="mt-1 text-sm text-slate-600">
            Add a car, drop in photos, click <strong>Post</strong> — it goes live instantly.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/inventory/" className="text-sm font-semibold text-brand-600 hover:underline">
            View live inventory →
          </Link>
          <button type="button" onClick={logout} className="text-sm font-medium text-slate-500 hover:text-brand-600">
            Log out
          </button>
        </div>
      </div>

      {toast && (
        <p
          role="status"
          className={`mt-4 rounded-lg border px-3.5 py-2.5 text-sm ${
            toast.kind === "ok"
              ? "border-green-200 bg-green-50 text-green-800"
              : "border-red-200 bg-red-50 text-red-700"
          }`}
        >
          {toast.msg}
        </p>
      )}

      {loadError && (
        <div className="mt-4 rounded-lg border border-amber-200 bg-amber-50 px-3.5 py-3 text-sm text-amber-800">
          <p>{loadError}</p>
          <button type="button" onClick={load} className="mt-2 font-semibold underline">
            Try again
          </button>
        </div>
      )}

      {mode === "list" ? (
        <>
          <div className="mt-6 flex flex-wrap items-center gap-2 rounded-xl border border-slate-200 bg-white p-3 shadow-sm">
            <button
              type="button"
              onClick={startAdd}
              className="inline-flex items-center gap-1.5 rounded-lg bg-brand-500 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-600"
            >
              <Plus size={16} /> Add Vehicle
            </button>
            {cars.length === 0 && (
              <button
                type="button"
                onClick={importExisting}
                disabled={busy}
                className="inline-flex items-center gap-1.5 rounded-lg bg-navy-900 px-4 py-2 text-sm font-semibold text-white hover:bg-navy-800 disabled:opacity-60"
              >
                <Upload size={16} /> Import current inventory
              </button>
            )}
            <button
              type="button"
              onClick={downloadBackup}
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-navy-900 hover:bg-slate-50"
            >
              <Download size={16} /> Backup
            </button>
            <button
              type="button"
              onClick={load}
              className="ml-auto text-sm font-medium text-slate-500 hover:text-brand-600"
            >
              Refresh
            </button>
          </div>

          <p className="mt-4 text-sm text-slate-500">
            {cars.length} {cars.length === 1 ? "vehicle" : "vehicles"} · {availableCount} available
          </p>

          <div className="mt-3 space-y-2">
            {cars.length === 0 && !loadError && (
              <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 px-6 py-12 text-center">
                <Car size={36} className="mx-auto text-slate-300" />
                <p className="mt-3 text-sm text-slate-600">
                  No vehicles yet. Click <strong>Import current inventory</strong> to load the existing cars,
                  or <strong>Add Vehicle</strong> to post a new one.
                </p>
              </div>
            )}
            {sorted.map((c) => {
              const title = [c.year, c.make, c.model, c.trim].filter(Boolean).join(" ");
              return (
                <div
                  key={c.id}
                  className="flex flex-wrap items-center gap-3 rounded-xl border border-slate-200 bg-white p-3 shadow-sm"
                >
                  <div className="h-12 w-16 shrink-0 overflow-hidden rounded border border-slate-200 bg-slate-100">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={c.images[0] || "/inventory/placeholder-navy.svg"}
                      alt=""
                      className="h-full w-full object-cover"
                      onError={(e) => {
                        (e.currentTarget as HTMLImageElement).src = "/inventory/placeholder-navy.svg";
                      }}
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-semibold text-navy-900">
                      {title || "(untitled vehicle)"}
                      {c.featured && (
                        <span className="ml-2 rounded bg-brand-50 px-1.5 py-0.5 text-xs font-semibold text-brand-600">Featured</span>
                      )}
                      {c.status !== "available" && (
                        <span className="ml-2 rounded bg-slate-100 px-1.5 py-0.5 text-xs font-medium capitalize text-slate-600">{c.status}</span>
                      )}
                    </p>
                    <p className="truncate text-xs text-slate-500">
                      {formatPrice(c.price)} · {formatMileage(c.mileage)} · {c.images.length} photo{c.images.length === 1 ? "" : "s"}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button type="button" onClick={() => startEdit(c)} className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm font-semibold text-navy-900 hover:bg-slate-50">Edit</button>
                    <button type="button" onClick={() => duplicate(c)} disabled={busy} className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-600 hover:bg-slate-50 disabled:opacity-50">Duplicate</button>
                    <button type="button" onClick={() => removeCar(c)} disabled={busy} aria-label="Delete vehicle" className="rounded-lg border border-red-200 p-1.5 text-red-600 hover:bg-red-50 disabled:opacity-50"><Trash size={16} /></button>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      ) : (
        <Editor
          form={form}
          setForm={setForm}
          onSave={saveForm}
          onCancel={() => { setMode("list"); setEditingId(null); }}
          isNew={editingId === null}
          busy={busy}
          onUploadError={(m) => flash("err", m)}
        />
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------

const labelClass = "mb-1 block text-sm font-medium text-navy-900";
const inputClass = "w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus:border-navy-500";

function Field({ label, children, hint }: { label: string; children: React.ReactNode; hint?: string }) {
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
  onSave: () => void;
  onCancel: () => void;
  isNew: boolean;
  busy: boolean;
  onUploadError: (msg: string) => void;
};

function Editor({ form, setForm, onSave, onCancel, isNew, busy, onUploadError }: EditorProps) {
  const set = (patch: Partial<FormState>) => setForm((f) => ({ ...f, ...patch }));
  const [uploading, setUploading] = useState(0);

  async function handleFiles(files: File[]) {
    // Accept by MIME OR extension — iPhone HEIC files often arrive with an empty
    // type and would otherwise be silently dropped.
    const IMG_EXT = /\.(jpe?g|png|gif|webp|bmp|avif|heic|heif)$/i;
    const images = files.filter((f) => f.type.startsWith("image/") || IMG_EXT.test(f.name));
    const skipped = files.length - images.length;
    if (skipped > 0) {
      onUploadError(`Skipped ${skipped} file${skipped === 1 ? "" : "s"} that ${skipped === 1 ? "isn't a photo" : "aren't photos"}.`);
    }
    if (images.length === 0) return;
    setUploading((u) => u + images.length);
    const carId = carIdFor(form);
    for (const file of images) {
      try {
        const url = await apiUpload(file, carId);
        setForm((f) => ({ ...f, images: [...f.images.filter(Boolean), url] }));
      } catch (e) {
        onUploadError(`Couldn't add ${file.name}: ${(e as Error).message}`);
      } finally {
        setUploading((u) => u - 1);
      }
    }
  }

  function removeImage(i: number) {
    setForm((f) => ({ ...f, images: f.images.filter((_, idx) => idx !== i) }));
  }
  function moveImage(i: number, delta: number) {
    setForm((f) => {
      const next = [...f.images];
      const t = i + delta;
      if (t < 0 || t >= next.length) return f;
      [next[i], next[t]] = [next[t], next[i]];
      return { ...f, images: next };
    });
  }

  return (
    <div className="mt-6">
      <button type="button" onClick={onCancel} className="mb-4 inline-flex items-center gap-1 text-sm font-semibold text-slate-600 hover:text-navy-900">
        <ChevronLeft size={16} /> Back to list
      </button>

      <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
        <h2 className="text-lg font-bold text-navy-900">{isNew ? "Add Vehicle" : "Edit Vehicle"}</h2>

        <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Field label="Year"><input className={inputClass} inputMode="numeric" value={form.year} onChange={(e) => set({ year: e.target.value })} placeholder="2020" /></Field>
          <Field label="Make *"><input className={inputClass} value={form.make} onChange={(e) => set({ make: e.target.value })} placeholder="Honda" /></Field>
          <Field label="Model *"><input className={inputClass} value={form.model} onChange={(e) => set({ model: e.target.value })} placeholder="Civic" /></Field>
          <Field label="Trim"><input className={inputClass} value={form.trim} onChange={(e) => set({ trim: e.target.value })} placeholder="LX" /></Field>
          <Field label="Price (CAD)" hint="Leave blank for “Call for Price”."><input className={inputClass} inputMode="numeric" value={form.price} onChange={(e) => set({ price: e.target.value })} placeholder="22995" /></Field>
          <Field label="Mileage (km)" hint="Leave blank to show “N/A”."><input className={inputClass} inputMode="numeric" value={form.mileage} onChange={(e) => set({ mileage: e.target.value })} placeholder="68000" /></Field>

          <Field label="Body Type"><select className={inputClass} value={form.bodyType} onChange={(e) => set({ bodyType: e.target.value })}>{OPTIONS.bodyType.map((o) => <option key={o}>{o}</option>)}</select></Field>
          <Field label="Fuel Type"><select className={inputClass} value={form.fuelType} onChange={(e) => set({ fuelType: e.target.value })}>{OPTIONS.fuelType.map((o) => <option key={o}>{o}</option>)}</select></Field>
          <Field label="Transmission"><select className={inputClass} value={form.transmission} onChange={(e) => set({ transmission: e.target.value })}>{OPTIONS.transmission.map((o) => <option key={o}>{o}</option>)}</select></Field>
          <Field label="Drivetrain"><select className={inputClass} value={form.drivetrain} onChange={(e) => set({ drivetrain: e.target.value })}>{OPTIONS.drivetrain.map((o) => <option key={o}>{o}</option>)}</select></Field>
          <Field label="Condition"><select className={inputClass} value={form.condition} onChange={(e) => set({ condition: e.target.value })}>{OPTIONS.condition.map((o) => <option key={o}>{o}</option>)}</select></Field>
          <Field label="Status"><select className={inputClass} value={form.status} onChange={(e) => set({ status: e.target.value })}><option value="available">Available</option><option value="pending">Sale Pending</option><option value="sold">Sold</option></select></Field>

          <Field label="Exterior Color"><input className={inputClass} value={form.exteriorColor} onChange={(e) => set({ exteriorColor: e.target.value })} placeholder="Silver" /></Field>
          <Field label="Interior Color"><input className={inputClass} value={form.interiorColor} onChange={(e) => set({ interiorColor: e.target.value })} placeholder="Black" /></Field>
          <Field label="Engine"><input className={inputClass} value={form.engine} onChange={(e) => set({ engine: e.target.value })} placeholder="2.0L 4-Cylinder" /></Field>
          <Field label="Cylinders"><input className={inputClass} inputMode="numeric" value={form.cylinders} onChange={(e) => set({ cylinders: e.target.value })} placeholder="4" /></Field>
          <Field label="Doors"><input className={inputClass} inputMode="numeric" value={form.doors} onChange={(e) => set({ doors: e.target.value })} placeholder="4" /></Field>
          <Field label="Seats"><input className={inputClass} inputMode="numeric" value={form.seats} onChange={(e) => set({ seats: e.target.value })} placeholder="5" /></Field>
          <Field label="VIN"><input className={inputClass} value={form.vin} onChange={(e) => set({ vin: e.target.value })} /></Field>
          <Field label="Stock #"><input className={inputClass} value={form.stockNumber} onChange={(e) => set({ stockNumber: e.target.value })} placeholder="ST1042" /></Field>
          <Field label="CARFAX URL"><input className={inputClass} value={form.carfaxUrl} onChange={(e) => set({ carfaxUrl: e.target.value })} placeholder="https://…" /></Field>
          <Field label="Listing ID" hint={isNew ? "Auto-generated if blank." : "Fixed once created."}>
            <input className={inputClass} value={form.id} disabled={!isNew} onChange={(e) => set({ id: e.target.value })} placeholder="2020-honda-civic-lx" />
          </Field>
          <Field label="Date Added" hint="Drives “newest” sorting."><input className={inputClass} value={form.dateAdded} onChange={(e) => set({ dateAdded: e.target.value })} placeholder="2026-06-23" /></Field>
          <label className="flex items-center gap-2.5 self-end pb-2 text-sm font-medium text-navy-900">
            <input type="checkbox" checked={form.featured} onChange={(e) => set({ featured: e.target.checked })} className="h-4 w-4 rounded border-slate-300 text-brand-500" />
            Feature on homepage
          </label>
        </div>

        <div className="mt-5">
          <Field label="Description" hint="A short, friendly paragraph about the vehicle.">
            <textarea className={`${inputClass} resize-y`} rows={4} value={form.description} onChange={(e) => set({ description: e.target.value })} />
          </Field>
        </div>

        <div className="mt-5">
          <Field label="Features" hint="One feature per line (e.g. Backup Camera, Heated Seats).">
            <textarea className={`${inputClass} resize-y`} rows={5} value={form.features} onChange={(e) => set({ features: e.target.value })} placeholder={"Backup Camera\nApple CarPlay\nHeated Seats"} />
          </Field>
        </div>

        {/* Photos — drag & drop straight to storage */}
        <div className="mt-5">
          <span className={labelClass}>Photos</span>
          <div
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => { e.preventDefault(); handleFiles(Array.from(e.dataTransfer.files)); }}
            className="rounded-xl border-2 border-dashed border-slate-300 bg-slate-50 px-4 py-8 text-center"
          >
            <Upload size={26} className="mx-auto text-slate-400" />
            <p className="mt-2 text-sm text-slate-600">
              Drag &amp; drop photos here, or{" "}
              <label className="cursor-pointer font-semibold text-brand-600 hover:underline">
                browse
                <input type="file" accept="image/*,.heic,.heif" multiple className="hidden" onChange={(e) => { handleFiles(Array.from(e.target.files ?? [])); e.target.value = ""; }} />
              </label>
            </p>
            <p className="mt-1 text-xs text-slate-500">Photos are shrunk for the web and uploaded automatically. First photo is the cover.</p>
            {uploading > 0 && <p className="mt-2 text-sm font-medium text-brand-600">Uploading {uploading} photo{uploading === 1 ? "" : "s"}…</p>}
          </div>

          {form.images.length > 0 && (
            <div className="mt-3 grid grid-cols-3 gap-2 sm:grid-cols-4">
              {form.images.map((img, i) => (
                <div key={`${img}-${i}`} className="group relative overflow-hidden rounded-lg border border-slate-200 bg-slate-100">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={img} alt="" className="aspect-[4/3] w-full object-cover" onError={(e) => { (e.currentTarget as HTMLImageElement).src = "/inventory/placeholder-navy.svg"; }} />
                  {i === 0 && <span className="absolute left-1 top-1 rounded bg-brand-500 px-1.5 py-0.5 text-[10px] font-semibold text-white">Cover</span>}
                  <div className="absolute inset-x-0 bottom-0 flex justify-between bg-black/45 px-1 py-0.5 opacity-0 transition group-hover:opacity-100">
                    <button type="button" aria-label="Move left" onClick={() => moveImage(i, -1)} className="px-1 text-white disabled:opacity-30" disabled={i === 0}>◀</button>
                    <button type="button" aria-label="Remove photo" onClick={() => removeImage(i)} className="px-1 text-white"><Trash size={13} /></button>
                    <button type="button" aria-label="Move right" onClick={() => moveImage(i, 1)} className="px-1 text-white disabled:opacity-30" disabled={i === form.images.length - 1}>▶</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="mt-6 flex flex-wrap gap-3 border-t border-slate-200 pt-5">
          <button
            type="button"
            onClick={onSave}
            disabled={busy || uploading > 0}
            className="inline-flex items-center gap-1.5 rounded-lg bg-brand-500 px-6 py-2.5 text-sm font-semibold text-white hover:bg-brand-600 disabled:opacity-60"
          >
            <Check size={16} /> {busy ? "Posting…" : isNew ? "Post — Go Live" : "Save Changes"}
          </button>
          <button type="button" onClick={onCancel} className="rounded-lg border border-slate-300 px-6 py-2.5 text-sm font-semibold text-navy-900 hover:bg-slate-50">Cancel</button>
        </div>
      </div>
    </div>
  );
}
