type Key = string;

const buckets = new Map<Key, number[]>();

export function rateLimit({
  key,
  limit,
  windowMs,
}: {
  key: Key;
  limit: number;
  windowMs: number;
}) {
  const now = Date.now();
  const from = now - windowMs;
  const arr = (buckets.get(key) || []).filter((t) => t > from);
  if (arr.length >= limit) return false;
  arr.push(now);
  buckets.set(key, arr);
  return true;
}
