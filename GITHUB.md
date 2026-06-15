# GitHub Guide — Push, Transfer Ownership & Everyday Edits

This covers three things:

- **Part A** — (Hamid) Push this project to *your* GitHub for the first time.
- **Part B** — (Hamid) Transfer the repository to *your friend's* GitHub.
- **Part C** — (The new owner) How to make changes and push them from now on.

> **What is GitHub?** A place to store your website's code online. Your hosting
> (Cloudflare/Netlify) watches GitHub and automatically rebuilds the live site
> whenever you push a change. So the normal routine is: *edit → push → site updates*.

---

## Part A — Hamid: first push to your GitHub

The project on your computer (`C:\Claud Code\sahar-motors-website`) is already a git
repository with a first commit ready to go. You just need to send it to GitHub.

### A1. Create an empty repository
1. Go to <https://github.com/new> (sign in as **hamidabawi**).
2. **Repository name:** `sahar-motors-website`
3. **Visibility:** Private
4. **Do NOT** check "Add a README", ".gitignore", or "license" — the project already
   has them. (Adding them here causes a conflict.)
5. Click **Create repository**.

### A2. Create a fine-grained access token (your standing preference — no OAuth)
1. GitHub → click your avatar → **Settings** → **Developer settings** (bottom left).
2. **Personal access tokens → Fine-grained tokens → Generate new token**.
3. **Resource owner:** `hamidabawi`
4. **Repository access:** *Only select repositories* → choose `sahar-motors-website`.
5. **Permissions → Repository permissions → Contents → Read and write**.
6. **Generate token** and copy it (you won't see it again — paste it somewhere safe
   temporarily).

### A3. Push
Open a terminal in the project folder and run:
```bash
cd "C:\Claud Code\sahar-motors-website"
git remote add origin https://github.com/hamidabawi/sahar-motors-website.git
git branch -M main
git push -u origin main
```
When prompted:
- **Username:** `hamidabawi`
- **Password:** paste the **token** from step A2 (not your GitHub password).

> If a browser window pops up asking you to "Sign in with GitHub" (Git Credential
> Manager's OAuth), just **close it** — the terminal will then ask for the
> username/token directly, keeping to your token-only approach.

Refresh the GitHub repo page — your code is now there. ✅

---

## Part B — Hamid: transfer ownership to your friend

Do this once your friend has the site how he wants it and has his own GitHub account.

1. Ask your friend to create a free account at <https://github.com/signup> and send
   you his **username** (e.g. `saharmotors-owner`).
2. On the repo, go to **Settings** (top tab) → scroll to the **Danger Zone** at the
   bottom → **Transfer**.
3. Type the repository name to confirm, enter your friend's **username** as the new
   owner, and confirm.
4. GitHub emails your friend to **accept the transfer**. Once he accepts, the repo
   moves to *his* account: `github.com/<his-username>/sahar-motors-website`.

**Important — reconnect hosting after transfer:**
- If you set up Cloudflare/Netlify under *your* account, the new owner should connect
  the transferred repo under *his* hosting account (see HOSTING.md), OR you add him
  as a member of the hosting project. Either way, point the live domain at the host
  connected to the now-transferred repo.

**Alternative (if you'll keep managing it for him):** instead of transferring, add him
as a **Collaborator** (Settings → Collaborators) so he can view/edit while you retain
ownership.

---

## Part C — The new owner: making changes & pushing

You have two easy ways to edit. **Most people should use GitHub Desktop (C1).**

### C1. The easy way — GitHub Desktop (recommended, no command line)
1. Install **GitHub Desktop** from <https://desktop.github.com> and sign in.
2. **File → Clone repository →** pick `sahar-motors-website` → choose a folder on
   your computer → **Clone**. (This downloads the project.)
3. Make your changes:
   - **To change cars:** open the site's `/admin` page, edit your inventory, click
     **Download inventory.json**, and replace `data/inventory.json` in the cloned
     folder with the downloaded file. Put any new car photos in
     `public/inventory/`. (See README.md / HANDOFF.md.)
   - **To change text, hours, phone, etc.:** edit `lib/site.ts`.
4. Back in GitHub Desktop, you'll see your changes listed. Type a short summary
   (e.g. "Add 2021 Honda CR-V"), click **Commit to main**, then **Push origin**.
5. Your host (Cloudflare/Netlify) rebuilds automatically — the live site updates in
   a minute or two. Done!

### C2. Tiny edits directly on GitHub.com (no install)
For a quick text change:
1. On GitHub, open the file (e.g. `lib/site.ts` or `data/inventory.json`).
2. Click the **pencil (Edit)** icon, make your change, scroll down, and
   **Commit changes**.
3. The site rebuilds automatically. *(Best for small text edits — for adding cars
   with photos, use C1.)*

### C3. For developers — command line
```bash
git clone https://github.com/<owner>/sahar-motors-website.git
cd sahar-motors-website
npm install
npm run dev          # preview locally at http://localhost:3000
# ...make changes...
git add .
git commit -m "Describe your change"
git push
```

---

## Quick reference

| I want to… | Do this |
|---|---|
| Add / edit / remove cars | Use `/admin`, download `inventory.json`, replace `data/inventory.json`, push |
| Add car photos | Put files in `public/inventory/`, reference them in `/admin`, push |
| Change hours/phone/social/email | Edit `lib/site.ts`, push |
| Connect contact-form emails | Add Web3Forms key in `lib/site.ts` (HANDOFF.md §2) |
| Put the site online | See HOSTING.md |

Every push automatically updates the live website.
