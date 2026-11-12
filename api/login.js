import { verifyPassword } from "../lib/auth.js";
import { clientIp, isSameOrigin, methodNotAllowed, setCookie, sendJson, sleep } from "../lib/http.js";
import { SESSION_COOKIE, SESSION_TTL_SECONDS, createSession } from "../lib/session.js";
import { isLimited, record, reset } from "../lib/throttle.js";

const WINDOW_MS = 15 * 60 * 1000;
const LIMIT = 5;

export default async function handler(req, res) {
  if (req.method !== "POST") return methodNotAllowed(res, ["POST"]);
  if (!isSameOrigin(req)) return sendJson(res, 403, { error: "forbidden" });

  const key = `login:${clientIp(req)}`;
  if (isLimited(key, LIMIT, WINDOW_MS)) return sendJson(res, 429, { error: "too_many_attempts" });

  const password = req.body && typeof req.body.password === "string" ? req.body.password : "";
  const stored = process.env.ADMIN_PASSWORD_HASH;
  if (!stored) return sendJson(res, 500, { error: "server_error" });

  await sleep(500);
  let valid = false;
  try {
    valid = password.length > 0 && password.length <= 256 && (await verifyPassword(password, stored));
  } catch {
    return sendJson(res, 500, { error: "server_error" });
  }

  if (!valid) {
    record(key, WINDOW_MS);
    return sendJson(res, 401, { error: "invalid_credentials" });
  }

  reset(key);
  try {
    setCookie(res, SESSION_COOKIE, createSession(), SESSION_TTL_SECONDS);
  } catch {
    return sendJson(res, 500, { error: "server_error" });
  }
  return sendJson(res, 200, { ok: true });
}
