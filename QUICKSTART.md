# Quick Start — Using Your Sahar Motors Website

A short, plain-English guide for running the site day to day **once it's deployed**.
For deeper detail, each section points to a fuller guide.

---

## Your website
Once deployed (see **HOSTING.md**), the site is live at **https://saharmotors.com**
(and `www.saharmotors.com`). It **updates automatically** within a minute or two
whenever a change is pushed to GitHub — so the routine is always: *change → push →
site updates.*

The current **7 live vehicles are already loaded** with real photos.

---

## 1. Manage your inventory (add / edit / sell cars)
1. Go to **`saharmotors.com/admin`**.
2. Enter the password — currently **`password`** *(please change it, see §4)*.
3. **Add Vehicle**, or **Edit / Duplicate / Delete** any car. Set price (leave blank
   for "Call for Price"), mileage, status (Available / Sale Pending / Sold), photos, etc.
4. Click **Download inventory.json**.
5. **Publish it:** replace `data/inventory.json` with the downloaded file and push
   (easiest with the GitHub Desktop app). The live site updates in ~1–2 minutes.

➡️ **Full step-by-step (with photos & GitHub Desktop setup): [MANAGING-INVENTORY.md](MANAGING-INVENTORY.md)**

> Tip: there's a practice copy you can open and click around safely —
> `sahar-motors-admin-demo.html` (same password). It only downloads a file; it never
> touches the live site.

---

## 2. Customer inquiries (where messages go)
- The **Contact form** and the **Sell / Trade Your Car form** both email submissions
  straight to **sales@saharmotors.com**.
- The Sell/Trade form collects the seller's details and the vehicle details, **including VIN**.
- Free tier handles 250 messages/month. To change the destination, see HANDOFF.md §2.

---

## 3. Change text, hours, phone, social links
Almost all wording and business info lives in one file: **`lib/site.ts`**
(phone numbers, address, **hours**, email, Instagram/Facebook links, etc.).
Edit it, push, and the whole site updates. (See HANDOFF.md §1.)

---

## 4. The /admin login (important)
- `/admin` is protected by a password verified **server-side** against the
  Cloudflare secret `ADMIN_PASSWORD` — it is **never** stored in the code/repo.
  **Change it:** `wrangler pages secret put ADMIN_PASSWORD --project-name sahar-motors-website`
  (or dashboard → Pages project → Settings → Variables and Secrets).
- This is a basic gate (the password lives in the page code). The tool only
  *downloads a file*, so risk is low — but for a proper **per-person email login**,
  turn on **Cloudflare Access** (free). Step-by-step in **HOSTING.md → "Lock the
  /admin page with a login"**.

---

## 5. Going live & moving off Squarespace
- Deploy on **Cloudflare Pages** (free, recommended) and connect `saharmotors.com` —
  full walkthrough in **HOSTING.md**.
- Keep Squarespace running until the new site is confirmed live on the domain, then cancel it.

---

## All the guides
| File | What it covers |
|---|---|
| **QUICKSTART.md** | This file — day-to-day basics |
| **MANAGING-INVENTORY.md** | Detailed: adding/editing cars, photos, publishing |
| **HOSTING.md** | Deploying, custom domain, and the `/admin` login |
| **HANDOFF.md** | Full owner handoff + pre-launch checklist |
| **GITHUB.md** | Pushing changes + transferring ownership to you |
| **README.md** | Technical overview (for a developer) |
