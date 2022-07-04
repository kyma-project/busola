const CACHE_KEY = 'busola.cache';

function loadCache() {
  return JSON.parse(localStorage.getItem(CACHE_KEY)) || {};
}

function saveCache(cache) {
  localStorage.setItem(CACHE_KEY, JSON.stringify(cache));
}

export function loadCacheItem(clusterName, path) {
  const cache = loadCache();
  const clusterCache = cache[clusterName] || {};
  return clusterCache[path];
}

export function saveCacheItem(clusterName, path, item) {
  const cache = loadCache();
  if (!cache[clusterName]) {
    cache[clusterName] = {};
  }
  cache[clusterName][path] = item;
  saveCache(cache);
}

export function clearClusterCache(clusterName) {
  try {
    const cache = loadCache();
    delete cache[clusterName];
    saveCache(cache);
  } catch (e) {
    console.warn('clearClusterData failed', e);
    return null;
  }
}
