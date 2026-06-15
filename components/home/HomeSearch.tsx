"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Search } from "@/components/icons";

type HomeSearchProps = {
  makes: string[];
  bodyTypes: string[];
};

export default function HomeSearch({ makes, bodyTypes }: HomeSearchProps) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [make, setMake] = useState("");
  const [body, setBody] = useState("");

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const params = new URLSearchParams();
    if (query.trim()) params.set("q", query.trim());
    if (make) params.set("make", make);
    if (body) params.set("body", body);
    const qs = params.toString();
    router.push(qs ? `/inventory/?${qs}` : "/inventory/");
  }

  const selectClass =
    "w-full rounded-lg border border-slate-300 bg-white px-3 py-3 text-sm text-slate-900 focus:border-navy-500";

  return (
    <form
      onSubmit={onSubmit}
      className="rounded-2xl border border-white/10 bg-white/95 p-3 shadow-2xl backdrop-blur sm:p-4"
    >
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_auto]">
        <div className="relative">
          <Search
            size={18}
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
          />
          <label htmlFor="home-q" className="sr-only">
            Keyword
          </label>
          <input
            id="home-q"
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search make or model…"
            className="w-full rounded-lg border border-slate-300 bg-white py-3 pl-10 pr-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-navy-500"
          />
        </div>

        <div>
          <label htmlFor="home-make" className="sr-only">
            Make
          </label>
          <select
            id="home-make"
            value={make}
            onChange={(e) => setMake(e.target.value)}
            className={selectClass}
          >
            <option value="">All Makes</option>
            {makes.map((m) => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="home-body" className="sr-only">
            Body type
          </label>
          <select
            id="home-body"
            value={body}
            onChange={(e) => setBody(e.target.value)}
            className={selectClass}
          >
            <option value="">All Types</option>
            {bodyTypes.map((b) => (
              <option key={b} value={b}>
                {b}
              </option>
            ))}
          </select>
        </div>

        <button
          type="submit"
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-brand-500 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-brand-600"
        >
          <Search size={18} /> Search
        </button>
      </div>
    </form>
  );
}
