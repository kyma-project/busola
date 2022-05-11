import { getActiveClusterName } from '../cluster-management/cluster-management';
const CACHE_KEY = 'busola.cache';

function loadCache() {
  return JSON.parse(localStorage.getItem(CACHE_KEY)) || {};
}

function saveCache(cache) {
  localStorage.setItem(CACHE_KEY, JSON.stringify(cache));
}

export function loadCacheItem(path) {
  try {
    const clusterName = getActiveClusterName();
    if (!clusterName) {
      throw Error('No active cluster');
    }

    const cache = loadCache();
    const clusterCache = cache[clusterName] || {};
    return clusterCache[path];
  } catch (e) {
    console.warn('loadCacheItem failed', e);
    return null;
  }
}

export function saveCacheItem(path, item) {
  try {
    const clusterName = getActiveClusterName();
    if (!clusterName) {
      throw Error('No active cluster');
    }

    const cache = loadCache();
    if (!cache[clusterName]) {
      cache[clusterName] = {};
    }
    cache[clusterName][path] = item;
    saveCache(cache);
  } catch (e) {
    console.warn('saveCacheItem failed', e);
    return null;
  }
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
