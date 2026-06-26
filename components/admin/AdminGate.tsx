"use client";

import { useEffect, useState } from "react";
import AdminApp from "@/components/admin/AdminApp";
import { apiCheckPassword, getToken, setToken, clearToken } from "@/lib/adminApi";
import { ShieldCheck } from "@/components/icons";

/**
 * Login for the /admin tool. The password is verified server-side against the
 * ADMIN_PASSWORD secret (via /api/auth) and kept for the browser session only.
 */
export default function AdminGate() {
  const [ok, setOk] = useState(false);
  const [checking, setChecking] = useState(true);
  const [pw, setPw] = useState("");
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);

  // Re-open without re-entering the password if a valid session token exists.
  useEffect(() => {
    const t = getToken();
    if (!t) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setChecking(false);
      return;
    }
    apiCheckPassword(t).then((valid) => {
      if (valid) setOk(true);
      else clearToken();
      setChecking(false);
    });
  }, []);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setErr("");
    const valid = await apiCheckPassword(pw);
    setBusy(false);
    if (valid) {
      setToken(pw);
      setOk(true);
    } else {
      setErr("Incorrect password — or the backend isn't set up yet (see ADMIN-BACKEND-SETUP.md).");
    }
  }

  if (checking) {
    return <div className="py-24 text-center text-slate-500">Loading…</div>;
  }

  if (ok) return <AdminApp />;

  return (
    <div className="flex min-h-[70vh] items-center justify-center px-4">
      <form
        onSubmit={submit}
        className="w-full max-w-sm rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm"
      >
        <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-navy-50 text-brand-500">
          <ShieldCheck size={22} />
        </span>
        <h1 className="mt-4 text-xl font-extrabold text-navy-900">Inventory Manager</h1>
        <p className="mt-1 text-sm text-slate-600">Enter the admin password to continue.</p>
        <input
          type="password"
          value={pw}
          onChange={(e) => {
            setPw(e.target.value);
            setErr("");
          }}
          placeholder="Password"
          autoFocus
          aria-label="Admin password"
          className="mt-5 w-full rounded-lg border border-slate-300 px-3.5 py-2.5 text-sm text-slate-900 focus:border-navy-500"
        />
        {err && (
          <p role="alert" className="mt-2 text-sm text-red-600">
            {err}
          </p>
        )}
        <button
          type="submit"
          disabled={busy || !pw}
          className="mt-3 w-full rounded-lg bg-brand-500 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-brand-600 disabled:opacity-60"
        >
          {busy ? "Checking…" : "Unlock"}
        </button>
      </form>
    </div>
  );
}
