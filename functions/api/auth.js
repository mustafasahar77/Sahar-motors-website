// POST /api/auth  → 200 if the Bearer token matches ADMIN_PASSWORD, else 401.
// Used by the admin login screen to validate the password before showing the UI.
import { json, bad, checkAuth } from "../_lib.js";

export async function onRequestPost({ request, env }) {
  if (!checkAuth(request, env)) return bad("Unauthorized", 401);
  return json({ ok: true });
}
