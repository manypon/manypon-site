const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const CONTROL = /[\u0000-\u001f\u007f]/;

export function validateContact(body) {
  if (!body || typeof body !== "object") return { ok: false };
  const name = String(body.name ?? "").trim();
  const email = String(body.email ?? "").trim();
  const message = String(body.message ?? "").trim();

  if (name.length < 1 || name.length > 80 || CONTROL.test(name)) return { ok: false };
  if (email.length > 120 || CONTROL.test(email) || !EMAIL.test(email)) return { ok: false };
  if (message.length < 5 || message.length > 3000) return { ok: false };

  return { ok: true, data: { name, email, message } };
}

export function isHoneypotFilled(body) {
  return Boolean(body && typeof body === "object" && String(body.website ?? "").length > 0);
}
