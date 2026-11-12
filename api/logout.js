import { isSameOrigin, methodNotAllowed, sendJson, setCookie } from "../lib/http.js";
import { SESSION_COOKIE } from "../lib/session.js";

export default function handler(req, res) {
  if (req.method !== "POST") return methodNotAllowed(res, ["POST"]);
  if (!isSameOrigin(req)) return sendJson(res, 403, { error: "forbidden" });
  setCookie(res, SESSION_COOKIE, "", 0);
  return sendJson(res, 200, { ok: true });
}
