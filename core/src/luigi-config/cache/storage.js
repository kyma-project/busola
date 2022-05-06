const CACHE_KEY = 'busola.cache';

export function loadCacheItem(clusterName, path) {
  try {
    const cache = JSON.parse(localStorage.getItem(CACHE_KEY)) || {};
    const clusterCache = cache[clusterName] || {};
    return clusterCache[path];
  } catch (e) {
    console.warn('loadCacheItem failed', e);
    return null;
  }
}

export function saveCacheItem(clusterName, path, item) {
  try {
    const cache = JSON.parse(localStorage.getItem(CACHE_KEY)) || {};
    if (!cache[clusterName]) {
      cache[clusterName] = {};
    }
    cache[clusterName][path] = item;
    localStorage.setItem('busola.cache', JSON.stringify(cache));
  } catch (e) {
    console.warn('saveCacheItem failed', e);
    return null;
  }
}
