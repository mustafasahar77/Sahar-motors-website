# How to Host the Sahar Motors Website

A plain-English guide to putting the site online — **for free** — and connecting
your domain. Pick **one** option (Option A is recommended).

---

## First: is it really free, even though it's "multi-page" with a contact form?

**Yes — completely free.** Here's why, so there's no doubt:

- Your site is a **static export** — a folder (`out/`) of plain HTML/CSS/JS files,
  one HTML file per page. "Multi-page" just means *more files in a folder*. Hosts
  never charge by page count, and there's no server to keep running.
- The **inventory search & filters run in the visitor's browser** (JavaScript that
  ships inside the static files) — no server, no cost.
- The **contact form** posts straight from the browser to **Web3Forms** (a free
  external form-to-email service). Your host never processes it, so you need
  **zero "serverless functions"** and never touch any paid quota.

So nothing about being multi-page or having a working contact form forces a paid
plan. The only thing a free tier ever limits is *extreme* traffic or build
volume — far beyond what a dealership site uses (details at the end).

> **Note on Web3Forms:** its free tier allows **250 form submissions/month** with
> unlimited forms — plenty for inquiries. Only very high volume would need a paid
> Web3Forms tier, independent of your website host.

---

## Option A — Cloudflare Pages (recommended: free, unlimited bandwidth)

**Why it's the best pick:** the free plan has **unlimited bandwidth and unlimited
visitor requests** for static sites, free custom domains, and free HTTPS. There's
no traffic cap that could ever take the site offline. It auto-rebuilds whenever you
push changes to GitHub.

**Free-plan limits (none of which you'll hit):** unlimited bandwidth/requests ·
**500 builds/month** (each push = 1 build) · up to 20,000 files per deploy ·
25 MiB max per file · up to 100 custom domains · free automatic SSL/HTTPS.
*(Source: developers.cloudflare.com/pages/platform/limits — limits can change.)*

**You need:** the GitHub repo (already done — `hamidabawi/Sahar-motors-website`)
and a free Cloudflare account.

**Steps:**
1. Sign up / log in at <https://dash.cloudflare.com>.
2. Left menu → **Workers & Pages** → **Create application** → **Pages** tab →
   **Connect to Git**.
3. Click **Install & Authorize** for GitHub, then select the
   **`Sahar-motors-website`** repository → **Begin setup**.
4. Enter a **Project name** (becomes `your-name.pages.dev`) and set the
   **Production branch** to `main`.
5. **Framework preset:** choose **“Next.js (Static HTML Export)”**. This auto-fills:
   - **Build command:** `npx next build`
   - **Build output directory:** `out`
   *(If the preset doesn't appear, type those two values manually.)*
6. Leave everything else default → **Save and Deploy**. Watch the build log
   (~1–2 minutes). You'll get a live `your-name.pages.dev` URL. 🎉
7. **Every future push to `main` rebuilds and republishes automatically.**

**Custom domain (saharmotors.com):**
1. In the project → **Custom domains** → **Set up a custom domain** → enter
   `saharmotors.com` (repeat for `www.saharmotors.com`).
2. Follow the DNS prompts. If the domain's DNS is on Cloudflare, it's one click;
   if it's registered elsewhere (e.g. Squarespace/GoDaddy), add the records
   Cloudflare shows you in that registrar's DNS settings.
3. HTTPS is provisioned automatically — nothing else to do.

### Lock the `/admin` page with a login (Cloudflare Access — free)

The inventory manager at `saharmotors.com/admin` has no password on its own. Put a
free **email login** in front of it with **Cloudflare Access** — do this once, after
the site is deployed on Cloudflare Pages with the custom domain:

1. In the Cloudflare dashboard, open **Zero Trust** (left sidebar). The first time, it
   asks you to pick a **team name** and a plan — choose the **Free** plan (up to 50 users).
2. **Access → Applications → Add an application → Self-hosted**.
3. **Application name:** `Sahar Motors Admin`. **Session duration:** e.g. 24 hours.
4. Under **Application domain**, add:
   - Domain `saharmotors.com`, **Path:** `admin`
   - Click **+ Add** and add a second row: Domain `saharmotors.com`, **Path:** `admin/*`
     (so every sub-page is covered).
5. **Identity providers:** the built-in **One-time PIN** is enabled by default — it emails
   a login code, so there's nothing else to set up. (You can add Google later if you want.)
6. **Next → add a policy:**
   - **Action:** Allow
   - **Include → Emails →** list who's allowed in, e.g. `sales@saharmotors.com`, the
     owner's email, and yours.
7. **Save / Add application.**

Now visiting `saharmotors.com/admin` shows a Cloudflare login screen; only the emails you
listed can enter (they type their email, get a 6-digit code, and they're in). Everyone else
is blocked before the page loads. To add/remove people later, edit the policy's email list.

> The page already has `noindex` (keeps it out of Google); Cloudflare Access adds the
> actual lock. Prefer not to expose it at all? Just run the tool locally with
> `npm run dev` → `http://localhost:3000/admin` and skip the hosted copy.

---

## Option B — Netlify (also free, but now metered — read the caveat)

Netlify also hosts this site free with custom domain + HTTPS. **Important change:**
as of 2026, new Netlify free accounts use a **credit-based** model:

- **300 credits/month — a hard cap.** Bandwidth costs ~20 credits/GB (≈ **15 GB/month**),
  each production deploy costs ~15 credits, and **form submissions are free**.
- ⚠️ **When credits run out, the site is *paused* until the next month** (visitors
  see an unavailable page). Frequent pushes (each deploy = ~15 credits) or a
  traffic spike with large photos could exhaust it.
  *(Source: docs.netlify.com — credit model; limits can change.)*

For a small dealership site this is usually fine, but it's why **Cloudflare Pages
(unlimited bandwidth, no pause risk) is the safer free choice.**

**Connect-repo steps (auto-updates):**
1. Sign up at <https://app.netlify.com> → **Add new project** → **Import an existing project** → **GitHub** → authorize → pick `Sahar-motors-website`.
2. Set **Build command:** `npm run build` and **Publish directory:** `out`
   *(important: change the auto-detected `.next` to `out` for a static export).*
3. **Deploy**, then add your domain under **Domain settings** (free SSL included).

**No-GitHub option (manual drag-and-drop):** run `npm run build` on your computer,
then drag the generated **`out`** folder onto <https://app.netlify.com/drop>. To
update later, build again and drag the new `out` folder.

---

## Option C — A traditional web host / cPanel (if you already pay for one)

1. On your computer, run `npm run build` to create the **`out`** folder.
2. Log in to your host's **File Manager** (or FTP, e.g. FileZilla).
3. Open **`public_html`** and **upload everything *inside* the `out` folder**
   (the files, not the `out` folder itself).
4. Visit your domain — the site is live. To update: build again and re-upload.

The site is built so deep links (e.g. a specific car page) work on plain static
hosts with no special configuration.

---

## Quick comparison

| | Cloudflare Pages (A) | Netlify (B) | cPanel/host (C) |
|---|---|---|---|
| Cost | **Free** | Free (credit-capped) | Whatever you already pay |
| Bandwidth | **Unlimited** | ~15 GB/mo, then **paused** | Per your plan |
| Auto-deploy on git push | ✅ | ✅ | ❌ (manual upload) |
| Custom domain + HTTPS | ✅ free | ✅ free | Usually included |
| Risk of going offline on a traffic spike | **None** | Possible (credit cap) | Per your plan |
| Best for | **This site (recommended)** | Fine alternative | Already-owned hosting |

---

## Moving off Squarespace safely

Keep the current Squarespace site up until the new site is live and the domain
points to it. Then: confirm the new site works on `saharmotors.com`, and only then
cancel Squarespace.

---

## After it's live — checklist

- [ ] Open the site on phone + computer; click through every page.
- [ ] Submit a test message on the Contact page → confirm it arrives at
      sales@saharmotors.com (needs the Web3Forms key — HANDOFF.md §2).
- [ ] Add a couple of real cars via `/admin` and confirm they appear
      (see **MANAGING-INVENTORY.md** for the full how-to).
- [ ] Confirm the padlock (HTTPS) shows.

---

## When would you *ever* need to pay?

None of these are caused by being multi-page or having a contact form — they're
pure scale limits, and a dealership site won't reach them:

- **Cloudflare Pages:** more than 500 builds/month, a single file over 25 MiB, or
  over 20,000 files. (Bandwidth/traffic is unlimited and free.)
- **Netlify:** traffic beyond ~15 GB/month (the 300-credit cap).
- **Web3Forms:** more than 250 form submissions/month.

Because the site uses a static export, you **never** need paid serverless
functions. **Bottom line: host on Cloudflare Pages and it's free, full stop.**
