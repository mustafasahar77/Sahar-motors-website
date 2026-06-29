"use client";

// Browser-side client for the inventory backend (Cloudflare Pages Functions).
// Reads are public; writes send the admin password as a Bearer token.
import type { Vehicle } from "@/lib/types";

const TOKEN_KEY = "sm_admin_token";

export function getToken(): string {
  if (typeof window === "undefined") return "";
  try {
    return sessionStorage.getItem(TOKEN_KEY) || "";
  } catch {
    return "";
  }
}
export function setToken(t: string): void {
  try {
    sessionStorage.setItem(TOKEN_KEY, t);
  } catch {
    /* ignore */
  }
}
export function clearToken(): void {
  try {
    sessionStorage.removeItem(TOKEN_KEY);
  } catch {
    /* ignore */
  }
}

function authHeader(): Record<string, string> {
  return { authorization: `Bearer ${getToken()}` };
}

export async function apiList(): Promise<Vehicle[]> {
  const r = await fetch("/api/inventory", { cache: "no-store" });
  if (!r.ok) throw new Error("Failed to load inventory");
  return (await r.json()) as Vehicle[];
}

export async function apiGet(id: string): Promise<Vehicle | null> {
  const r = await fetch(`/api/inventory/${encodeURIComponent(id)}`, { cache: "no-store" });
  if (r.status === 404) return null;
  if (!r.ok) throw new Error("Failed to load vehicle");
  return (await r.json()) as Vehicle;
}

/** Validate a password against the server secret (used by the admin login). */
export async function apiCheckPassword(password: string): Promise<boolean> {
  try {
    const r = await fetch("/api/auth", {
      method: "POST",
      headers: { authorization: `Bearer ${password}` },
    });
    return r.ok;
  } catch {
    return false;
  }
}

export async function apiSave(
  vehicle: Record<string, unknown>,
): Promise<{ ok: boolean; id: string; vehicle: Vehicle }> {
  const r = await fetch("/api/inventory", {
    method: "POST",
    headers: { ...authHeader(), "content-type": "application/json" },
    body: JSON.stringify(vehicle),
  });
  const d = (await r.json().catch(() => ({}))) as { error?: string; ok?: boolean; id?: string; vehicle?: Vehicle };
  if (r.status === 401) throw new Error("Not authorized — please log in again.");
  if (!r.ok) throw new Error(d.error || "Save failed");
  return d as { ok: boolean; id: string; vehicle: Vehicle };
}

export async function apiDelete(id: string): Promise<void> {
  const r = await fetch(`/api/inventory/${encodeURIComponent(id)}`, {
    method: "DELETE",
    headers: authHeader(),
  });
  if (!r.ok) {
    const d = (await r.json().catch(() => ({}))) as { error?: string };
    throw new Error(d.error || "Delete failed");
  }
}

export async function apiSeed(vehicles: unknown[]): Promise<{ seeded: number; skipped: number }> {
  const r = await fetch("/api/seed", {
    method: "POST",
    headers: { ...authHeader(), "content-type": "application/json" },
    body: JSON.stringify(vehicles),
  });
  const d = (await r.json().catch(() => ({}))) as { error?: string; seeded?: number; skipped?: number };
  if (!r.ok) throw new Error(d.error || "Import failed");
  return { seeded: d.seeded || 0, skipped: d.skipped || 0 };
}

const HEIC_RE = /^image\/(heic|heif)$/i;
function isHeic(file: File): boolean {
  return HEIC_RE.test(file.type) || /\.(heic|heif)$/i.test(file.name);
}
// Reject if a step (image decode / HEIC convert / upload) doesn't settle in time,
// so one bad photo can never freeze the whole uploader.
function withTimeout<T>(p: Promise<T>, ms: number, msg = "timed out"): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error(msg)), ms);
    p.then(
      (v) => { clearTimeout(timer); resolve(v); },
      (e) => { clearTimeout(timer); reject(e); },
    );
  });
}

async function decodeBitmap(src: Blob): Promise<ImageBitmap | null> {
  try {
    return await withTimeout(createImageBitmap(src), 20000, "decode timed out");
  } catch {
    return null;
  }
}

// heic-to (libheif) is self-hosted at public/vendor/heic-to.js — the IIFE build with
// the WASM inlined, loaded on demand via a <script> tag. Self-hosting sidesteps
// Next/turbopack WASM-bundling issues; it exposes window.HeicTo.
type HeicToFn = (args: { blob: Blob; type: string; quality?: number }) => Promise<ImageBitmap | Blob>;
let heicToLoader: Promise<HeicToFn> | null = null;
function loadHeicTo(): Promise<HeicToFn> {
  const w = window as unknown as { HeicTo?: HeicToFn };
  if (w.HeicTo) return Promise.resolve(w.HeicTo);
  if (!heicToLoader) {
    heicToLoader = new Promise<HeicToFn>((resolve, reject) => {
      const s = document.createElement("script");
      s.src = "/vendor/heic-to.js";
      s.async = true;
      s.onload = () => (w.HeicTo ? resolve(w.HeicTo) : reject(new Error("converter unavailable")));
      s.onerror = () => reject(new Error("failed to load the photo converter"));
      document.head.appendChild(s);
    });
  }
  return heicToLoader;
}

/**
 * Turn any common phone/computer photo — including iPhone HEIC/HEIF, which most
 * browsers can't decode or display — into a web-friendly JPEG Blob. HEIC is
 * converted with heic-to (self-hosted libheif, loaded on demand). Every step is time-bounded so
 * a single bad photo can't hang the uploader. Throws a clear, user-facing message
 * when the file isn't usable, so the caller can surface it.
 */
export async function toUploadableJpeg(file: File, maxW = 1400, quality = 0.82): Promise<Blob> {
  let bitmap = await decodeBitmap(file);

  if (!bitmap && isHeic(file)) {
    // iPhone HEIC/HEIF (HEVC) — decode with heic-to (libheif). Its Next.js build
    // handles the WASM bundling; "bitmap" gives us an ImageBitmap to resize directly.
    try {
      const heicTo = await loadHeicTo();
      bitmap = (await withTimeout(
        heicTo({ blob: file, type: "bitmap" }),
        60000,
        "conversion timed out",
      )) as ImageBitmap;
    } catch {
      throw new Error("couldn't convert this iPhone photo — in Photos, export it as JPEG (or set Camera → Formats → Most Compatible) and try again.");
    }
  }

  if (!bitmap) {
    throw new Error("couldn't read this photo — please use a JPEG or PNG image.");
  }

  const scale = Math.min(1, maxW / bitmap.width);
  const w = Math.max(1, Math.round(bitmap.width * scale));
  const h = Math.max(1, Math.round(bitmap.height * scale));
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    bitmap.close();
    throw new Error("your browser couldn't process this photo.");
  }
  ctx.drawImage(bitmap, 0, 0, w, h);
  bitmap.close();
  const blob = await new Promise<Blob | null>((resolve) =>
    canvas.toBlob((b) => resolve(b), "image/jpeg", quality),
  );
  if (!blob) throw new Error("your browser couldn't process this photo.");
  return blob;
}

/** Convert + resize a photo to JPEG, upload it, return the public URL for images[]. */
export async function apiUpload(file: File, carId: string): Promise<string> {
  const blob = await toUploadableJpeg(file);
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), 60000);
  let r: Response;
  try {
    r = await fetch(`/api/upload?carId=${encodeURIComponent(carId || "misc")}`, {
      method: "POST",
      headers: { ...authHeader(), "content-type": "image/jpeg" },
      body: blob,
      signal: ctrl.signal,
    });
  } catch (e) {
    throw new Error(
      (e as Error).name === "AbortError"
        ? "upload timed out — check your connection and try again."
        : "upload failed — check your connection.",
    );
  } finally {
    clearTimeout(timer);
  }
  const d = (await r.json().catch(() => ({}))) as { error?: string; url?: string };
  if (!r.ok || !d.url) throw new Error(d.error || "upload failed");
  return d.url;
}

/** Best-effort cleanup of a photo the admin uploaded but discarded before saving
 *  (Remove or Cancel). Ref-counted server-side, so it never removes a photo a
 *  saved vehicle still references. Failures are swallowed — must not block the UI. */
export async function apiDeletePhoto(url: string): Promise<void> {
  if (!url) return;
  try {
    await fetch(`/api/upload?url=${encodeURIComponent(url)}`, {
      method: "DELETE",
      headers: authHeader(),
    });
  } catch {
    /* best effort */
  }
}
