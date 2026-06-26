# Managing Your Inventory — Complete Guide

This explains, step by step, how to **add, edit, photograph, mark sold, and remove**
vehicles on the Sahar Motors website. No coding required.

> **The big picture:** your car listings live in one file — `data/inventory.json`
> — and your photos live in the `public/inventory/` folder. You edit listings
> with the built‑in **/admin** tool (which writes that file for you), add your
> photos, then "publish" by pushing the changes to GitHub. Your host rebuilds the
> site automatically a minute or two later. That's the whole loop:
>
> **Edit in /admin → add photos → download the file → push to GitHub → site updates.**

There are two ways to do the "push to GitHub" part — the **easy way (GitHub
Desktop app)** and the **quick web way (github.com)**. Both are covered below.

---

## Part 1 — One-time setup (do this once)

1. **Install GitHub Desktop** (free, no command line): <https://desktop.github.com>. Sign in with your GitHub account.
2. **Clone the project to your computer:** in GitHub Desktop → **File → Clone repository** → pick **`Sahar-motors-website`** → choose a folder (e.g. your Desktop) → **Clone**. This downloads the whole site to a folder on your computer.
3. That's it. From now on, you edit files in that folder and click "push" to publish.

> If you only ever make tiny text changes and don't want to install anything, you
> can edit files directly on github.com instead — see Part 6.

---

## Part 2 — Add a new vehicle (the easy way, with /admin)

The **/admin** tool is a friendly form that builds the listing data for you.

> 🧪 **Want to practice first?** Open **`sahar-motors-admin-demo.html`** (double-click —
> it opens in your browser). It's a standalone copy of this tool you can play with
> safely: add/edit cars and click *Download inventory.json*. Nothing it does affects
> the live site — it only downloads a file.

### A. Open the admin tool
- **On the live site:** go to your website address followed by **`/admin`**
  (for example `https://saharmotors.com/admin`) and enter the admin password.
  It is a private Cloudflare secret (`ADMIN_PASSWORD`), never stored in the code —
  ask Hamid for it. **Note:** the current one-click admin is described in
  **GO-LIVE-WALKTHROUGH.md**; the steps below describe the older manual flow.
- **Or on your computer** (no internet needed): open the project folder, and if
  you have it running locally it's at `http://localhost:3000/admin`.

> The admin tool runs entirely in your browser. Nothing is saved online until you
> push the file in Part 4 — so you can experiment freely. Your work is also
> auto-saved in your browser between sessions.

### B. Click **"Add Vehicle"** and fill in the form
Here's what each field means:

| Field | What to enter | Required? |
|---|---|---|
| **Year** | e.g. `2020` | Recommended |
| **Make** | e.g. `Honda` | **Yes** |
| **Model** | e.g. `Civic` | **Yes** |
| **Trim** | e.g. `LX` or `EX AWD` | No |
| **Price (CAD)** | e.g. `22995` (numbers only). **Leave blank** to show "Call for Price". | No |
| **Mileage (km)** | e.g. `68000` (numbers only) | Recommended |
| **Body Type** | Pick from the list (Sedan, SUV, Truck, …) | Yes |
| **Fuel Type** | Gasoline, Diesel, Hybrid, Plug-in Hybrid, Electric | Yes |
| **Transmission** | Automatic, Manual, CVT | Yes |
| **Drivetrain** | FWD, RWD, AWD, 4WD | Yes |
| **Condition** | Used, Certified Pre-Owned, New | Yes |
| **Status** | **Available**, **Sale Pending**, or **Sold** | Yes |
| **Exterior / Interior Color** | e.g. `Modern Steel Metallic` / `Black` | No |
| **Engine / Cylinders / Doors / Seats** | e.g. `2.0L 4-Cylinder` / `4` / `4` / `5` | No |
| **VIN / Stock #** | Optional reference numbers | No |
| **CARFAX URL** | Paste a CARFAX link to show a "View CARFAX" button | No |
| **Feature on homepage** | Tick this to show the car in the homepage "Featured" row | No |
| **Description** | A short, friendly paragraph about the car | Recommended |
| **Features** | One feature per line (Backup Camera, Heated Seats, …) | Recommended |
| **Date Added** | Defaults to today; controls "Newest Arrivals" sorting | Auto |
| **Listing ID** | Auto-generated from the title; leave blank | Auto |

### C. Add the photos (see Part 3), then click **"Add to list"**.

### D. Repeat for each vehicle. Reorder with the ▲/▼ arrows, or **Duplicate** a similar car to save typing.

---

## Part 3 — Adding photos

Photos are image files you place in the **`public/inventory/`** folder of the
project, and then reference in the listing.

1. **Name your photos** simply, no spaces — e.g. `2020-civic-1.jpg`, `2020-civic-2.jpg`.
2. **Copy them into** the project's **`public/inventory/`** folder (in the folder
   you cloned in Part 1).
3. In the admin form's **Photos** section, either:
   - Click **"Pick photos to preview"** to select the files — it previews them and
     auto-fills the correct paths; **or**
   - Click **"Add path"** and type the path yourself: `/inventory/2020-civic-1.jpg`
     (always start with `/inventory/`).
4. The **first photo** in the list is the one shown on the inventory grid. Drag
   isn't needed — just list them in the order you want; remove any with the trash
   icon.

> **No photo yet?** Leave the photo list empty and the site shows a branded
> "Photo coming soon" placeholder automatically — so a car can go live before you
> have pictures.

---

## Part 4 — Publish your changes (make them live)

After adding/editing cars in /admin:

1. In the admin tool, click **"Download inventory.json"**. Your browser saves a
   file called `inventory.json`.
2. In your cloned project folder, go to the **`data/`** folder and **replace** the
   existing `inventory.json` with the one you just downloaded (move it in and
   choose "Replace").
3. Make sure any **new photos** are in **`public/inventory/`** (Part 3).
4. **Publish with GitHub Desktop:**
   - Open GitHub Desktop. It lists your changes (the edited `inventory.json` and any new photos).
   - Type a short summary in the bottom-left box, e.g. *"Add 2020 Honda Civic"*.
   - Click **"Commit to main"**, then click **"Push origin"** (top bar).
5. Done! Your host (Cloudflare Pages / Netlify) rebuilds automatically. Your
   changes are live in **1–2 minutes**. Refresh the website to see them.

---

## Part 5 — Common tasks

- **Mark a car as Sold:** open it in /admin, set **Status = Sold**, then publish
  (Parts 4). Sold cars are hidden from the main list by default but their page
  still works, and shoppers can tick "Include sold vehicles" to see them.
- **Mark a car Sale Pending:** set **Status = Sale Pending** — it stays visible
  with a "Sale Pending" badge.
- **Change a price / mileage / anything:** open the car in /admin, edit, then
  publish.
- **Remove a car entirely:** in /admin click the **trash icon** on that car, then
  publish.
- **Feature a car on the homepage:** tick **"Feature on homepage"** in /admin.

---

## Part 6 — Quick edits directly on GitHub.com (no install)

For a fast change (e.g. drop a price) without GitHub Desktop:

1. Go to your repo on github.com → open **`data/inventory.json`**.
2. Click the **pencil (Edit)** icon → make the change → scroll down → **Commit changes**.
3. The site rebuilds automatically.

> Best for small text tweaks. For adding cars **with photos**, use the /admin +
> GitHub Desktop flow above (you need to upload photo files too).

---

## Part 7 — For the technically curious: editing the data file directly

`data/inventory.json` is a plain list of vehicles. Each one looks like this:

```json
{
  "id": "2020-honda-civic-lx-st1042",
  "make": "Honda",
  "model": "Civic",
  "trim": "LX",
  "year": 2020,
  "price": 22995,
  "mileage": 68000,
  "bodyType": "Sedan",
  "fuelType": "Gasoline",
  "transmission": "CVT",
  "drivetrain": "FWD",
  "exteriorColor": "Modern Steel Metallic",
  "interiorColor": "Black",
  "engine": "2.0L 4-Cylinder",
  "cylinders": 4,
  "doors": 4,
  "seats": 5,
  "stockNumber": "ST1042",
  "condition": "Used",
  "status": "available",
  "featured": true,
  "description": "Clean, one-owner Civic with low kilometres.",
  "features": ["Backup Camera", "Apple CarPlay", "Heated Seats"],
  "images": ["/inventory/2020-civic-1.jpg", "/inventory/2020-civic-2.jpg"],
  "carfaxUrl": "",
  "dateAdded": "2026-06-15"
}
```

**Allowed values:**
- `price`: a number, or `null` for "Call for Price".
- `bodyType`: `Sedan`, `SUV`, `Truck`, `Coupe`, `Hatchback`, `Minivan`, `Van`, `Convertible`, `Wagon`
- `fuelType`: `Gasoline`, `Diesel`, `Hybrid`, `Plug-in Hybrid`, `Electric`
- `transmission`: `Automatic`, `Manual`, `CVT`
- `drivetrain`: `FWD`, `RWD`, `AWD`, `4WD`
- `condition`: `Used`, `Certified Pre-Owned`, `New`
- `status`: `available`, `pending`, `sold`
- `featured`: `true` or `false`

> ⚠️ The file must stay **valid JSON** — every car wrapped in `{ }`, separated by
> commas, inside the outer `[ ]`. A misplaced comma will stop the site building.
> **This is why the /admin tool is recommended — it always produces valid JSON.**
> If you do hand-edit, paste the file into a checker like jsonlint.com first.

---

## Part 8 — Troubleshooting

- **My change didn't appear.** Give it 1–2 minutes (the host is rebuilding), then
  hard-refresh (Ctrl/Cmd + Shift + R). Check your host's "Deployments" tab to
  confirm the latest build succeeded.
- **A photo shows the "Photo coming soon" placeholder.** The image path doesn't
  match a real file. Confirm the file is in `public/inventory/` and the path in
  the listing matches exactly (including capitalization), e.g.
  `/inventory/2020-civic-1.jpg`.
- **The build failed after a hand-edit.** Your `inventory.json` likely has a JSON
  typo (a stray/missing comma or quote). Re-export from /admin, or validate at
  jsonlint.com, then push again.
- **I lost my draft in /admin.** Drafts are saved per-browser. Use the same
  browser/computer, or click **"Reset to live data"** to reload what's currently
  published and start from there.

That's everything. Day to day it's just: **/admin → download → replace the file →
push → live.**
