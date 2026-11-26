interface CacheEntry<T> {
  expiresAt: number;
  data?: T;
  promise?: Promise<T>;
}

const cacheStore = new Map<string, CacheEntry<unknown>>();
const DEFAULT_TTL_MS = 5 * 60 * 1000; // 5 minutes

export async function getCachedOrFetch<T>(
  key: string,
  fetcher: () => Promise<T>,
  ttlMs: number = DEFAULT_TTL_MS
): Promise<T> {
  const now = Date.now();
  const existing = cacheStore.get(key) as CacheEntry<T> | undefined;

  if (existing && existing.expiresAt > now) {
    if (existing.data !== undefined) {
      return existing.data;
    }
    if (existing.promise) {
      return existing.promise;
    }
  }

  const promise = fetcher()
    .then((data) => {
      cacheStore.set(key, { data, expiresAt: Date.now() + ttlMs });
      return data;
    })
    .catch((err) => {
      cacheStore.delete(key);
      throw err;
    });

  cacheStore.set(key, { promise, expiresAt: now + ttlMs });
  return promise;
}

export function invalidateApiCache(prefix?: string): void {
  if (!prefix) {
    cacheStore.clear();
    return;
  }
  for (const key of cacheStore.keys()) {
    if (key.startsWith(prefix)) {
      cacheStore.delete(key);
    }
  }
}
