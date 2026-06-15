# How to Host the Sahar Motors Website

A plain-English guide to putting the website online and connecting your domain.
No prior experience needed — just follow the steps. Pick **one** hosting option
below (Option A is recommended).

> **What "hosting" means:** the website is a set of files. A host is a company that
> serves those files to visitors on the internet. After `npm run build`, all the
> files live in a folder called **`out`** — that folder *is* the website.

---

## Option A — Cloudflare Pages (recommended: free, fast, auto-updates)

Best choice. It connects to your GitHub repo and **rebuilds the site automatically**
every time you change your inventory and push to GitHub. Free for this kind of site.

**You need:** the GitHub repo (see GITHUB.md) and a free Cloudflare account.

1. Go to <https://dash.cloudflare.com> and sign up / log in.
2. In the left menu, click **Workers & Pages** → **Create** → **Pages** tab →
   **Connect to Git**.
3. Authorize Cloudflare to access GitHub, then **select the `sahar-motors-website`
   repository**.
4. On the build settings screen, enter exactly:
   - **Framework preset:** `Next.js (Static HTML Export)` (or leave as "None")
   - **Build command:** `npm run build`
   - **Build output directory:** `out`
5. Click **Save and Deploy**. Wait ~1–2 minutes. Cloudflare gives you a live URL
   like `sahar-motors-website.pages.dev` — open it to see your site online. 🎉

**To use your real domain (saharmotors.com):**
1. In your Pages project → **Custom domains** → **Set up a domain**.
2. Type `saharmotors.com` (and add `www.saharmotors.com` too).
3. Cloudflare shows you the DNS records to add. If your domain is already on
   Cloudflare, it can do this for you in one click. If your domain is registered
   elsewhere (e.g. Squarespace, GoDaddy), log in there and add the CNAME/records
   Cloudflare gives you.
4. HTTPS (the padlock) is set up automatically — no extra steps.

**Updating the site later:** just push your changes to GitHub (see GITHUB.md).
Cloudflare rebuilds and publishes automatically within a couple of minutes.

---

## Option B — Netlify (also free; drag-and-drop possible)

Two ways:

**B1 — Connect GitHub (auto-updates, like Cloudflare):**
1. Sign up at <https://app.netlify.com>.
2. **Add new site → Import an existing project → GitHub →** pick the repo.
3. Build command: `npm run build` · Publish directory: `out` → **Deploy**.
4. Add your domain under **Domain settings**.

**B2 — Manual drag-and-drop (no GitHub needed):**
1. On your computer, run `npm run build` to create the `out` folder.
2. Go to <https://app.netlify.com/drop> and **drag the `out` folder** onto the page.
3. It's instantly live. To update later, build again and drag the new `out` folder.

---

## Option C — A traditional web host / cPanel / existing hosting

If you already pay for web hosting (cPanel, Bluehost, GoDaddy hosting, etc.):

1. On your computer, run `npm run build` to create the **`out`** folder.
2. Log in to your host's **File Manager** (or use an FTP app like FileZilla).
3. Open the **`public_html`** folder (this is your website's root).
4. **Upload everything *inside* the `out` folder** into `public_html`
   (the files, not the `out` folder itself).
5. Visit your domain — the site is live.

To update later: build again and re-upload the new files (overwrite the old ones).

> This site is built so deep links (like a specific car page) work on plain hosts
> with no special server configuration.

---

## Connecting your domain (general notes)

- Your **domain registrar** is where you bought `saharmotors.com` (it may currently
  be Squarespace). That's where you change DNS records.
- When you "connect a domain," you're pointing it at your new host using the records
  the host gives you (usually a `CNAME` or `A` record).
- DNS changes can take a few minutes to a few hours to take effect worldwide.
- **Moving off Squarespace:** keep the Squarespace site up until the new site is live
  and the domain points to it. Then cancel Squarespace once you've confirmed the new
  site works on your domain.

---

## After it's live — quick checklist

- [ ] Open the site on your phone and a computer; click through the pages.
- [ ] Submit a test message on the Contact page to confirm emails arrive
      (requires the Web3Forms key — see HANDOFF.md §2).
- [ ] Add a couple of real cars via `/admin` and confirm they appear.
- [ ] Confirm the padlock (HTTPS) shows in the browser.

**Need to change cars, hours, or photos?** See README.md and HANDOFF.md — it's quick.
