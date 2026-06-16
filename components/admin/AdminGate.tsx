"use client";

import { useEffect, useState } from "react";
import AdminApp from "@/components/admin/AdminApp";
import { site } from "@/lib/site";
import { ShieldCheck } from "@/components/icons";

/**
 * Lightweight password gate for the /admin tool. Client-side only — a deterrent,
 * not real security (the password lives in the bundle). For proper protection put
 * Cloudflare Access in front of /admin (see HOSTING.md). Unlock persists for the
 * browser session only.
 */
export default function AdminGate() {
  const [ok, setOk] = useState(false);
  const [pw, setPw] = useState("");
  const [err, setErr] = useState(false);

  // Client-only: re-open without re-entering the password within the same session.
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (sessionStorage.getItem("sm_admin_ok") === "1") setOk(true);
  }, []);

  if (ok) return <AdminApp />;

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (pw === site.adminPassword) {
      sessionStorage.setItem("sm_admin_ok", "1");
      setOk(true);
    } else {
      setErr(true);
    }
  }

  return (
    <div className="flex min-h-[70vh] items-center justify-center px-4">
      <form
        onSubmit={submit}
        className="w-full max-w-sm rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm"
      >
        <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-navy-50 text-brand-500">
          <ShieldCheck size={22} />
        </span>
        <h1 className="mt-4 text-xl font-extrabold text-navy-900">
          Inventory Manager
        </h1>
        <p className="mt-1 text-sm text-slate-600">
          Enter the admin password to continue.
        </p>
        <input
          type="password"
          value={pw}
          onChange={(e) => {
            setPw(e.target.value);
            setErr(false);
          }}
          placeholder="Password"
          autoFocus
          aria-label="Admin password"
          className="mt-5 w-full rounded-lg border border-slate-300 px-3.5 py-2.5 text-sm text-slate-900 focus:border-navy-500"
        />
        {err && (
          <p role="alert" className="mt-2 text-sm text-red-600">
            Incorrect password.
          </p>
        )}
        <button
          type="submit"
          className="mt-3 w-full rounded-lg bg-brand-500 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-brand-600"
        >
          Unlock
        </button>
      </form>
    </div>
  );
}
