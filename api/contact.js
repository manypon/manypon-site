import { clientIp, isSameOrigin, methodNotAllowed, sendJson } from "../lib/http.js";
import { isLimited, record } from "../lib/throttle.js";
import { isHoneypotFilled, validateContact } from "../lib/validate.js";
import { saveMessage } from "../lib/store.js";

const WINDOW_MS = 10 * 60 * 1000;
const LIMIT = 5;

export default async function handler(req, res) {
  if (req.method !== "POST") return methodNotAllowed(res, ["POST"]);
  if (!isSameOrigin(req)) return sendJson(res, 403, { error: "forbidden" });

  const key = `contact:${clientIp(req)}`;
  if (isLimited(key, LIMIT, WINDOW_MS)) return sendJson(res, 429, { error: "too_many_requests" });
  record(key, WINDOW_MS);

  if (isHoneypotFilled(req.body)) return sendJson(res, 200, { ok: true });

  const result = validateContact(req.body);
  if (!result.ok) return sendJson(res, 400, { error: "invalid_input" });

  try {
    await saveMessage(result.data);
    return sendJson(res, 200, { ok: true });
  } catch {
    return sendJson(res, 500, { error: "server_error" });
  }
}
