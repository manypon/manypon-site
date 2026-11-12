import { requireAuth } from "../lib/guard.js";
import { isSameOrigin, methodNotAllowed, sendJson } from "../lib/http.js";
import { isValidId, listMessages, removeMessage, setRead } from "../lib/store.js";

export default async function handler(req, res) {
  if (!requireAuth(req, res)) return;

  try {
    if (req.method === "GET") {
      const { messages, total } = await listMessages();
      const unread = messages.filter((message) => !message.read).length;
      return sendJson(res, 200, { messages, total, unread });
    }

    if (req.method !== "PATCH" && req.method !== "DELETE") {
      return methodNotAllowed(res, ["GET", "PATCH", "DELETE"]);
    }
    if (!isSameOrigin(req)) return sendJson(res, 403, { error: "forbidden" });

    const id = req.body && req.body.id;
    if (!isValidId(id)) return sendJson(res, 400, { error: "invalid_id" });

    if (req.method === "DELETE") {
      await removeMessage(id);
      return sendJson(res, 200, { ok: true });
    }

    const found = await setRead(id, req.body.read !== false);
    return sendJson(res, found ? 200 : 404, found ? { ok: true } : { error: "not_found" });
  } catch {
    return sendJson(res, 500, { error: "server_error" });
  }
}
