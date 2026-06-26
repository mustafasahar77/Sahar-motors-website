# Sahar Motors — One-Time Admin Setup (≈15 minutes)

This connects the website to a **database** (for car details) and **photo storage** so
that adding a car in `/admin` is instant: type details → drag in photos → **Post** →
it's live on the site in seconds. You only do this **once**.

Everything is on **Cloudflare** (the same account hosting the site) and stays on the
**free plan**. You never touch code — just click through the dashboard.

> Use these **exact names** — the website is wired to them:
> - Database binding name: **`DB`**
> - Photo storage binding name: **`BUCKET`**
> - Password name: **`ADMIN_PASSWORD`**

---

## Step 1 — Create the database (D1)

1. Go to **dash.cloudflare.com** and sign in.
2. Left menu → **Storage & Databases** → **D1 SQL Database** → **Create database**.
3. Name it **`sahar-motors`** → **Create**.
4. Open the new database → **Console** tab.
5. Open the file **`schema.sql`** (in the website's code), copy ALL of it, paste it into
   the console box, and click **Execute**. You should see "Success". (This builds the
   table that holds the cars.)

## Step 2 — Create the photo storage (R2)

1. Left menu → **R2 Object Storage**.
   - First time only: it may ask you to **enable R2 / add a payment method**. This is
     normal — usage stays inside the **free tier** (10 GB), you won't be charged.
2. **Create bucket** → name it **`sahar-motors-photos`** → **Create**.
   (Leave all settings default. You do NOT need to make it public — photos are served
   safely through the website.)

## Step 3 — Connect them to the website + set your password

1. Left menu → **Workers & Pages** → click the **Sahar Motors** site (the Pages project).
2. **Settings** tab → find **Bindings** (may be under "Functions").
3. **Add binding → D1 database**:
   - Variable name: **`DB`**
   - D1 database: **sahar-motors** → **Save**.
4. **Add binding → R2 bucket**:
   - Variable name: **`BUCKET`**
   - R2 bucket: **sahar-motors-photos** → **Save**.
5. Still in Settings → **Variables and Secrets** → **Add**:
   - Name: **`ADMIN_PASSWORD`**
   - Value: **a strong password of your choice** (this is the admin login)
   - Type: **Secret** (so it's encrypted) → **Save**.

> If you also want to test on the **Preview** site, repeat steps 3–5 and choose the
> **Preview** environment too.

## Step 4 — Redeploy so the settings take effect

1. **Deployments** tab → newest deployment → **⋯ → Retry deployment**
   (bindings only apply on a fresh deploy).

## Step 5 — Load the current 87 cars (one click)

1. Go to **https://YOUR-SITE/admin**.
2. Enter your **ADMIN_PASSWORD** to log in.
3. Click **"Import current inventory"**. This loads all 87 existing cars into the
   database in one shot. Do this only once. (Re-clicking is harmless — it updates, never
   duplicates.)

## Step 6 — You're done. Adding a car from now on:

1. `/admin` → **Add Vehicle**.
2. Fill in the details (make, model, year, price, etc.).
3. **Drag your phone photos** into the upload box (they're shrunk automatically for the web).
4. Click **Post** → the car appears in the inventory **immediately**. No waiting, no rebuild.

Editing or removing a car is the same screen: click a car → change it → **Save**, or **Delete**.

---

### Quick troubleshooting
- **"Database not configured" / "Photo storage not configured"** → a binding name is wrong
  or you haven't redeployed. Re-check Step 3 names (`DB`, `BUCKET`) and redo Step 4.
- **Can't log in** → the password must match `ADMIN_PASSWORD` exactly (Step 3.5). After
  changing it, redeploy.
- **Photos not showing** → confirm the `BUCKET` binding points to `sahar-motors-photos`.
- Free-tier limits (plenty for a dealership): D1 5 GB; R2 10 GB. New-car photos use R2;
  the original 87 cars' photos are served from the site itself.
