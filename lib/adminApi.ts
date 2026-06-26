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

/** Downscale an image File to a web-friendly JPEG before upload. */
export async function resizeImage(file: File, maxW = 1400, quality = 0.82): Promise<Blob> {
  let bitmap: ImageBitmap | null = null;
  try {
    bitmap = await createImageBitmap(file);
  } catch {
    return file; // unsupported format — upload as-is
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
    return file;
  }
  ctx.drawImage(bitmap, 0, 0, w, h);
  bitmap.close();
  const blob = await new Promise<Blob | null>((resolve) =>
    canvas.toBlob((b) => resolve(b), "image/jpeg", quality),
  );
  return blob || file;
}

/** Resize + upload a photo to R2; returns the public URL to store in images[]. */
export async function apiUpload(file: File, carId: string): Promise<string> {
  const blob = await resizeImage(file);
  const r = await fetch(`/api/upload?carId=${encodeURIComponent(carId || "misc")}&ext=jpg`, {
    method: "POST",
    headers: { ...authHeader(), "content-type": "image/jpeg" },
    body: blob,
  });
  const d = (await r.json().catch(() => ({}))) as { error?: string; url?: string };
  if (!r.ok || !d.url) throw new Error(d.error || "Upload failed");
  return d.url;
}
