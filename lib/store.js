import { randomBytes } from "node:crypto";
import { del, get, list, put } from "@vercel/blob";

const PREFIX = "messages/";
const MAX_LISTED = 200;
const ID_PATTERN = /^\d{13}-[a-f0-9]{12}$/;

export function isValidId(id) {
  return typeof id === "string" && ID_PATTERN.test(id);
}

function pathFor(id) {
  return `${PREFIX}${id}.json`;
}

async function readRecord(pathname) {
  const result = await get(pathname, { access: "private", useCache: false });
  if (!result || result.statusCode !== 200) return null;
  return new Response(result.stream).json();
}

async function writeRecord(record, overwrite) {
  await put(pathFor(record.id), JSON.stringify(record), {
    access: "private",
    addRandomSuffix: false,
    allowOverwrite: overwrite,
    contentType: "application/json"
  });
}

export async function saveMessage(data) {
  const id = `${Date.now()}-${randomBytes(6).toString("hex")}`;
  const record = { id, ...data, createdAt: new Date().toISOString(), read: false };
  await writeRecord(record, false);
  return record;
}

export async function listMessages() {
  const pathnames = [];
  let cursor;
  do {
    const page = await list({ prefix: PREFIX, cursor, limit: 1000 });
    for (const blob of page.blobs) pathnames.push(blob.pathname);
    cursor = page.hasMore ? page.cursor : undefined;
  } while (cursor);

  pathnames.sort().reverse();
  const records = [];
  const slice = pathnames.slice(0, MAX_LISTED);
  for (let index = 0; index < slice.length; index += 20) {
    const batch = await Promise.all(slice.slice(index, index + 20).map(readRecord));
    for (const record of batch) if (record) records.push(record);
  }
  return { messages: records, total: pathnames.length };
}

export async function setRead(id, read) {
  const record = await readRecord(pathFor(id));
  if (!record) return false;
  record.read = Boolean(read);
  await writeRecord(record, true);
  return true;
}

export async function removeMessage(id) {
  await del(pathFor(id));
}
