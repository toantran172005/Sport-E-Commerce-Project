/**
 * In-memory TTL Cache with LRU eviction, optional storage persistence,
 * and concurrent in-flight promise de-duplication.
 */

export function createTtlCache({
  ttlMs = 10 * 60_000,
  maxEntries = 50,
  storage = null,
  storageKey = 'sport_ttl_cache',
  now = Date.now,
} = {}) {
  const cache = new Map();
  const inFlight = new Map();

  function safeStorageGet() {
    if (!storage) return null;
    try {
      const raw = storage.getItem(storageKey);
      if (!raw) return null;
      return JSON.parse(raw);
    } catch {
      return null;
    }
  }

  function safeStorageSave() {
    if (!storage) return;
    try {
      const serializable = {};
      const currentTime = now();
      for (const [k, entry] of cache.entries()) {
        if (entry.expiresAt > currentTime) {
          serializable[k] = entry;
        }
      }
      storage.setItem(storageKey, JSON.stringify(serializable));
    } catch {
      // Ignore storage errors (quota, disabled, etc.)
    }
  }

  // Khởi tạo từ storage nếu có
  const initialData = safeStorageGet();
  if (initialData && typeof initialData === 'object') {
    const currentTime = now();
    for (const [k, entry] of Object.entries(initialData)) {
      if (entry && typeof entry === 'object' && entry.expiresAt > currentTime) {
        cache.set(k, entry);
      }
    }
  }

  function get(key) {
    const entry = cache.get(key);
    if (!entry) return undefined;

    if (entry.expiresAt <= now()) {
      cache.delete(key);
      safeStorageSave();
      return undefined;
    }

    // Refresh LRU order (re-insert at tail)
    cache.delete(key);
    cache.set(key, entry);
    return entry.value;
  }

  function set(key, value, { ttlMs: entryTtl } = {}) {
    const activeTtl = typeof entryTtl === 'number' ? entryTtl : ttlMs;
    const expiresAt = now() + activeTtl;

    if (cache.has(key)) {
      cache.delete(key);
    } else if (cache.size >= maxEntries) {
      // LRU: evict oldest entry (first item)
      const oldestKey = cache.keys().next().value;
      if (oldestKey !== undefined) {
        cache.delete(oldestKey);
      }
    }

    cache.set(key, { value, expiresAt });
    safeStorageSave();
    return value;
  }

  function has(key) {
    return get(key) !== undefined;
  }

  function deleteKey(key) {
    const existed = cache.delete(key);
    inFlight.delete(key);
    if (existed) {
      safeStorageSave();
    }
    return existed;
  }

  function clear() {
    cache.clear();
    inFlight.clear();
    if (storage) {
      try {
        storage.removeItem(storageKey);
      } catch {
        // Ignore
      }
    }
  }

  async function getOrLoad(key, loader, { ttlMs: entryTtl } = {}) {
    const cached = get(key);
    if (cached !== undefined) {
      return cached;
    }

    if (inFlight.has(key)) {
      return inFlight.get(key);
    }

    const promise = (async () => {
      try {
        const result = await loader();
        set(key, result, { ttlMs: entryTtl });
        return result;
      } finally {
        inFlight.delete(key);
      }
    })();

    inFlight.set(key, promise);
    return promise;
  }

  return {
    get,
    set,
    has,
    delete: deleteKey,
    clear,
    getOrLoad,
  };
}
