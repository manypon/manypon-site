import { readCookie, sendJson } from "./http.js";
import { SESSION_COOKIE, verifySession } from "./session.js";

export function requireAuth(req, res) {
  if (verifySession(readCookie(req, SESSION_COOKIE))) return true;
  sendJson(res, 401, { error: "unauthorized" });
  return false;
}
