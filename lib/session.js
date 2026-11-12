import { createHmac, timingSafeEqual } from "node:crypto";

export const SESSION_COOKIE = "mp_session";
export const SESSION_TTL_SECONDS = 12 * 60 * 60;

function secret() {
  const value = process.env.SESSION_SECRET;
  if (!value || value.length < 32) throw new Error("SESSION_SECRET is missing or too short");
  return value;
}

function sign(payload) {
  return createHmac("sha256", secret()).update(payload).digest("base64url");
}

export function createSession() {
  const expires = String(Date.now() + SESSION_TTL_SECONDS * 1000);
  return `${expires}.${sign(expires)}`;
}

export function verifySession(token) {
  if (typeof token !== "string") return false;
  const [expires, signature] = token.split(".");
  if (!expires || !signature || !/^\d+$/.test(expires)) return false;
  if (Number(expires) < Date.now()) return false;
  const expected = Buffer.from(sign(expires));
  const given = Buffer.from(signature);
  return given.length === expected.length && timingSafeEqual(given, expected);
}
