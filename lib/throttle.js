const buckets = new Map();

function fresh(key, windowMs) {
  const now = Date.now();
  const list = (buckets.get(key) || []).filter((time) => now - time < windowMs);
  buckets.set(key, list);
  return list;
}

export function isLimited(key, limit, windowMs) {
  return fresh(key, windowMs).length >= limit;
}

export function record(key, windowMs) {
  fresh(key, windowMs).push(Date.now());
}

export function reset(key) {
  buckets.delete(key);
}
