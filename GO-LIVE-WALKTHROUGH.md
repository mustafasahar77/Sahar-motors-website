# Sahar Motors — How to add & manage cars (the easy way)

✅ **The setup is done.** The website now has a real database + photo storage, so
managing inventory is instant. **No files, no code, no "pull requests" — ever again.**

## Adding a car (about a minute)
1. Go to **your site + `/admin`** (e.g. `https://saharmotors.com/admin`).
2. Enter the **admin password**. *(Ask Hamid for it — it's intentionally not written
   in the public code.)*
3. Click **Add Vehicle** and fill in the details (year, make, model, price, etc.).
4. **Drag the phone photos** into the photo box. They shrink themselves and upload
   automatically. The first one is the cover — drag to reorder.
5. Click **Post — Go Live**. The car appears on the website **in seconds.** 🎉

## Editing or removing a car
- On the `/admin` list, click a car → change anything → **Save Changes**.
- To take one down (sold, etc.): open it and click **Delete**, or just set its
  **Status** to *Sold* (sold cars are hidden from shoppers but kept in your records).

## Good to know
- Everything saves to the live site immediately — there's nothing else to "publish."
- All 87 existing cars are already loaded.
- Photo storage and the database are on Cloudflare's free plan (plenty of room).
- Forgot the password or want to change it? Ask Hamid — it's a 10-second change.

*(The original step-by-step Cloudflare setup that built all this is kept in
`ADMIN-BACKEND-SETUP.md` for reference, but you don't need it anymore.)*
