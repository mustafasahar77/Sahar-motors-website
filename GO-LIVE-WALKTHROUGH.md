# Sahar Motors — Turn on the easy admin (one-time, ~15 min)

**Do this once.** After it's done, adding a car forever after is just:
**type the details → drag in the photos → click Post → it's live.** No files, no
code, no "pull request." Promise.

**How to do this:** Hamid and Mustafa together, sharing Mustafa's screen, signed
into **Mustafa's Cloudflare** (dash.cloudflare.com). Just follow the parts in
order. Each part ends with a ✅ "you should see this" check so you know it worked.

> Three names must be typed **exactly** (the site is wired to them):
> **`DB`** · **`BUCKET`** · **`ADMIN_PASSWORD`**

---

## Part 0 — Check the new version is ready (2 min)
1. dash.cloudflare.com → left menu **Workers & Pages** → click the **Sahar Motors** site.
2. Open the **Deployments** tab. Find the row for the branch **`admin-backend`**.
3. ✅ It should say **Success** (green). Click it and copy its **preview link**
   (looks like `https://admin-backend.<something>.pages.dev`) — you'll test on it in Part 5.
   - ❌ If it says *Failed*, stop and send Hamid the error — don't continue.

## Part 1 — Make the database (3 min)
1. Left menu → **Storage & Databases** → **D1 SQL Database** → **Create database**.
2. Name: **`sahar-motors`** → **Create**.
3. Click the new database → **Console** tab.
4. Open the file **`schema.sql`** from the project, copy everything in it, paste into
   the console box, click **Execute**.
   - ✅ You should see **Success** and a new table called **vehicles**.

## Part 2 — Make the photo storage (3 min)
1. Left menu → **R2 Object Storage**.
   - First time only: it asks you to **enable R2 / add a card**. This is normal —
     it stays **free** (under 10 GB). Add the card and continue.
2. **Create bucket** → name: **`sahar-motors-photos`** → **Create**.
   - ✅ You should see an empty bucket named `sahar-motors-photos`. (Leave it private —
     that's correct.)

## Part 3 — Connect them + set the password (4 min)
1. Left menu → **Workers & Pages** → the **Sahar Motors** site → **Settings**.
2. Find **Bindings** (sometimes under "Functions"). Add **two** bindings:
   - **Add → D1 database** → Variable name **`DB`** → choose **sahar-motors** → Save.
   - **Add → R2 bucket** → Variable name **`BUCKET`** → choose **sahar-motors-photos** → Save.
3. Find **Variables and Secrets** → **Add**:
   - Name **`ADMIN_PASSWORD`**, Value = **a password you choose** (this is the admin login),
     Type = **Secret** → Save.
4. **Important:** if the page has a **Production / Preview** switch, add all three to
   **both** so you can test first.
   - ✅ You should now see `DB`, `BUCKET`, and `ADMIN_PASSWORD` listed.

## Part 4 — Apply it (1 min)
1. **Deployments** tab → the newest **admin-backend** deployment → **⋯ → Retry deployment**.
   - (Settings only take effect on a fresh deploy.) Wait for it to go green.

## Part 5 — Test it on the preview link (2 min)
Open the preview link from Part 0 and add **`/admin`** to the end.
1. Log in with the password you set.  ✅ You see the Inventory Manager.
2. Click **Import current inventory** (one time).  ✅ It loads all 87 cars.
3. Click **Add Vehicle** → type a fake car → **drag a photo in** → **Post**.
4. Open the preview's **/inventory** page.  ✅ Your test car is there. Delete it after.

## Part 6 — Make it the real site
**Tell Hamid "it works."** He flips the new version onto the live site (one command on
his end) and the live `/admin` becomes the easy one. *(If you want, you can skip the
preview test and Hamid can flip it live first — but testing on the preview is safer.)*

---

## From now on — Mustafa's whole job (this is the payoff)
1. Go to **your-site.com/admin** → log in.
2. **Add Vehicle** → fill in the details.
3. **Drag the phone photos** into the box (they shrink themselves).
4. Click **Post**. The car is live in seconds. 🎉
   - To remove or change a car later: click it → **Save** or **Delete**. Same screen.

**No more** downloading files, no more "inventory.json," no more pull requests.

---

### If something's off
- **Can't log in** → the password must match `ADMIN_PASSWORD` exactly (Part 3.3). If you
  changed it, redo Part 4 (Retry deployment).
- **"Database not configured" / "Photo storage not configured"** → a binding name is
  wrong. It must be exactly `DB` and `BUCKET` (Part 3.2). Fix it, then redo Part 4.
- **Photos won't upload** → check the `BUCKET` binding points to `sahar-motors-photos`.
- Stuck on anything → screenshot it and send Hamid.
