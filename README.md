# Sahar Motors — Website

A fast, modern website for **Sahar Motors**, a family-owned used-car dealership in
Langley, BC. Built as a **static site** so it can be hosted anywhere (Cloudflare
Pages, Netlify, Nginx/Apache, S3, Vercel, etc.) with no server to maintain.

- Interactive inventory with filtering, sorting, search & shareable filtered URLs
- Individual vehicle pages with photo galleries, full specs & inquiry forms
- Service & repairs page with a booking request form
- "Sell / Trade your car" lead form
- About & Contact pages with map + hours
- **Built-in Inventory Manager** at `/admin` so listings can be added/edited in the
  browser and exported — no coding required
- SEO-ready: per-page metadata, sitemap, robots, Open Graph & structured data

## Tech stack

| | |
|---|---|
| Framework | Next.js 16 (App Router) |
| Output | Static export (`output: "export"`) → `./out` |
| Styling | Tailwind CSS v4 |
| Animations | Framer Motion |
| Forms | [Web3Forms](https://web3forms.com) (no backend needed) |
| Language | TypeScript |

## Getting started

```bash
npm install      # install dependencies
npm run dev      # start the dev server at http://localhost:3000
npm run build    # produce the static site in ./out
npm run lint     # run ESLint
```

After `npm run build`, the complete website is in the **`out/`** folder — upload its
contents to any static host.

## Project structure

```
app/                     # Pages (App Router)
  page.tsx               # Home
  inventory/page.tsx     # Inventory listing (filter/sort/search)
  inventory/[slug]/      # Individual vehicle pages (one per car)
  services/              # Service & repairs + booking form
  sell-your-car/         # Sell/trade lead form
  about/  contact/       # About & Contact
  admin/                 # Inventory Manager tool (noindexed)
  sitemap.ts robots.ts   # SEO routes
components/              # UI components (Navbar, Footer, VehicleCard, …)
  home/                  # Homepage sections
  admin/AdminApp.tsx     # The inventory editor
lib/
  site.ts                # ⭐ Business info, hours, social, Web3Forms key
  types.ts               # Vehicle data model
  inventory.ts           # Loads + sanitizes inventory data
  filters.ts             # Filtering / sorting / URL-sync logic
  format.ts              # Price/mileage/date formatting
data/
  inventory.json         # ⭐ The car listings (edited via /admin)
public/
  inventory/             # ⭐ Vehicle photos live here
```

The three ⭐ items are what you edit day-to-day. See **HANDOFF.md** for the full
owner's guide and pre-launch checklist.

## Managing inventory (the easy way)

> 📘 **Full owner's walkthrough:** see **[MANAGING-INVENTORY.md](MANAGING-INVENTORY.md)** — detailed, beginner-friendly steps for adding/editing cars, photos, marking sold, publishing, plus a full field reference and troubleshooting.

1. Run the site (or visit the live site) and go to **`/admin`**.
2. Add, edit, reorder or remove vehicles. Your work auto-saves in your browser.
3. For photos, drop image files into `public/inventory/` and reference them
   (e.g. `/inventory/my-car-1.jpg`). The tool can preview files and pre-fill paths.
4. Click **Download inventory.json** and replace `data/inventory.json` with it.
5. Commit & push (or re-upload). The site rebuilds with the new inventory.

The data file is also plain JSON, so power users can edit it directly. Every
**entry** is validated/sanitized at build time, so a bad value in one record
degrades gracefully instead of breaking the site. The file itself must stay
valid JSON, though — a stray comma or missing quote will fail the build, so
prefer the `/admin` tool (which always exports valid JSON) for hand-edits.

## Configuration

Edit **`lib/site.ts`** to update business name, phone numbers, address, email,
hours, social links, and the Web3Forms access key. Everything across the site reads
from this one file.
