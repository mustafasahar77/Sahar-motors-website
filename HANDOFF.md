# Sahar Motors — Owner's Guide & Handoff

This document covers everything needed to launch, maintain, and take ownership of
the website. For developer/run details see **README.md**.

---

## 1. Pre-launch checklist

The site is fully functional, but a few items use **placeholders** that should be
replaced before going live. Each is clearly marked in the code.

- [ ] **Real vehicle listings & photos.** Add real cars via `/admin` and put real
      photos in `public/inventory/`. The included cars and "Photo Coming Soon"
      images are demo data — replace or delete them.
- [ ] **Business hours** — `lib/site.ts` → `hours`. Currently placeholder hours;
      set the real schedule.
- [ ] **Social links** — `lib/site.ts` → `social.instagram` / `social.facebook`.
      Currently point to generic profiles.
- [ ] **Contact forms** — connect a free Web3Forms key (see §2). Until then forms
      run in clearly-labelled "demo mode" and don't send email.
- [ ] **Customer reviews** — `components/home/Testimonials.tsx` contains clearly
      labelled *sample* reviews. Replace with real ones (e.g. from Google).
- [ ] **Production URL** — `lib/site.ts` → `url`. Set to the final domain so SEO
      tags, the sitemap, and structured data are correct.
- [ ] **Verify contact details** — address, phone numbers, and email in
      `lib/site.ts` (pre-filled from the current Squarespace site).
- [ ] *(Optional)* **PNG social image.** The share image `public/og.svg` is an SVG;
      some social platforms only preview PNG/JPG. For best results, export it to
      `public/og.png` and update the two `/og.svg` references in
      `app/layout.tsx` and `app/inventory/[slug]/page.tsx`.

Everything you change day-to-day lives in **`lib/site.ts`**, **`data/inventory.json`**
(via `/admin`), and **`public/inventory/`**.

> **Two notes on the `/admin` tool:**
> 1. The page is reachable by URL on the live site (it's hidden from Google via
>    `robots`/`noindex`, but that's not access control). It exposes only the
>    editing UI and the already-public inventory — no secret data. If you'd
>    rather lock it down, protect the `/admin/*` path at your host (e.g.
>    **Cloudflare Access** or HTTP Basic Auth), or simply run the tool locally
>    with `npm run dev` and never rely on the hosted copy.
> 2. If you ever hand-edit `data/inventory.json` instead of using `/admin`, keep
>    it valid JSON (run it through a JSON validator before committing) — a syntax
>    error will stop the next build.

---

## 2. Connecting the contact forms (Web3Forms — free)

All forms (contact, service booking, sell/trade, vehicle inquiry) submit through
[Web3Forms](https://web3forms.com), which emails submissions to you — no server
required.

1. Go to <https://web3forms.com>, enter the dealership email
   (`saharbrothersenterprise@gmail.com`), and copy the **Access Key** they email you.
2. Open `lib/site.ts` and replace:
   ```ts
   web3formsAccessKey: "YOUR-WEB3FORMS-ACCESS-KEY",
   ```
   with your real key.
3. Rebuild/redeploy. Submissions now arrive in the inbox. (You can test the form;
   a "demo mode" banner disappears once the key is set.)

---

## 3. Deploying

Run `npm run build` → the entire site is generated into the **`out/`** folder.
Upload that folder's contents to any static host. Recommended options:

### Cloudflare Pages (recommended — matches your other sites)
- Connect the GitHub repo.
- **Build command:** `npm run build`
- **Build output directory:** `out`
- Add the custom domain (`saharmotors.com`) in the Pages project.

### Netlify
- Build command `npm run build`, publish directory `out`.

### Any web server (Nginx/Apache/cPanel/S3)
- Upload the contents of `out/`. The site uses trailing-slash folders with
  `index.html`, so deep links like `/inventory/2020-honda-civic-lx-st1042/` work on
  plain static hosts with no special config.

> After choosing the final domain, set `url` in `lib/site.ts` and redeploy so SEO
> metadata points at the right place.

---

## 4. Getting the code onto GitHub (for Hamid)

The project is already a local git repository with a clean initial commit. GitHub
isn't authenticated in this environment, so push it from your machine using a
**fine-grained Personal Access Token** (no OAuth needed).

**Step 1 — Create the empty repo** (once):
- Go to <https://github.com/new>
- Owner: `hamidabawi` · Name: `sahar-motors-website` · Visibility: **Private**
- **Do not** add a README, .gitignore, or license (the repo already has them).

**Step 2 — Create a fine-grained token:**
- GitHub → Settings → Developer settings → **Fine-grained tokens** → Generate new
- Resource owner: `hamidabawi`
- Repository access: **Only select repositories** → `sahar-motors-website`
- Permissions: **Contents → Read and write**
- Generate and copy the token.

**Step 3 — Push:**
```bash
cd "C:\Claud Code\sahar-motors-website"
git remote add origin https://github.com/hamidabawi/sahar-motors-website.git
git push -u origin main
```
When prompted: **Username** = `hamidabawi`, **Password** = paste the token.
*(If a browser OAuth window pops up from Git Credential Manager, just close it — the
terminal will then ask for the username/token directly, keeping with your
PAT-only preference.)*

---

## 5. Transferring ownership to the dealership

Once you're ready to hand it to the dealership owner:

1. The owner creates a free GitHub account (if they don't have one).
2. On the repo: **Settings → General → Danger Zone → Transfer ownership**, enter
   their username. *(Or add them under **Collaborators** if you'll keep managing it.)*
3. If hosting on Cloudflare Pages/Netlify, either transfer the project or have the
   owner connect their own account to the transferred repo.
4. Point the `saharmotors.com` DNS at the host and add it as the custom domain.

---

## 6. Day-to-day: adding & updating cars

1. Open **`/admin`** on the site (it's hidden from search engines).
2. **Add Vehicle** → fill in the details. Leave **Price** blank for
   "Call for Price". Tick **Feature on homepage** to highlight a car.
3. **Photos:** copy image files into `public/inventory/`, then reference them
   (e.g. `/inventory/2020-civic-1.jpg`). Use **Pick photos to preview** to preview
   and auto-fill the paths.
4. Mark cars **Sale Pending** or **Sold** with the Status field — sold cars are
   hidden from the default listing but their page still works.
5. **Download inventory.json** and replace `data/inventory.json` in the project.
6. Commit & push the new `data/inventory.json` plus any new photos. The host
   rebuilds automatically and the site updates.

> Your in-progress edits are saved in the browser automatically, so you won't lose
> work between sessions on the same computer.

---

## 7. What's intentionally not included (yet)

Per the current scope, the site does **not** include financing, a parts catalogue,
or a scholarship section — these were left out by request and can be added later.
Service/repairs **is** included. The structure makes each easy to add when needed.
