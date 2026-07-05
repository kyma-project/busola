export function createBoundedCache({ max = 1000, ttlMs = 0 } = {}) {
  const store = new Map();

  const get = (key) => {
    const entry = store.get(key);
    if (!entry) return undefined;
    if (ttlMs && Date.now() - entry.timestamp >= ttlMs) {
      store.delete(key);
      return undefined;
    }
    return entry.value;
  };

  const set = (key, value) => {
    if (!store.has(key) && store.size >= max) {
      store.delete(store.keys().next().value);
    }
    store.set(key, { value, timestamp: Date.now() });
  };

  return {
    get,
    set,
    has: (key) => get(key) !== undefined,
    get size() {
      return store.size;
    },
  };
}
