import { getActiveClusterName } from '../cluster-management/cluster-management';
const CACHE_KEY = 'busola.cache';

export function loadCacheItem(path) {
  try {
    const clusterName = getActiveClusterName();
    if (!clusterName) {
      throw Error('No active cluster');
    }

    const cache = JSON.parse(localStorage.getItem(CACHE_KEY)) || {};
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

export function clearClusterCache(clusterName) {
  try {
    const cache = JSON.parse(localStorage.getItem(CACHE_KEY)) || {};
    delete cache[clusterName];
    localStorage.setItem('busola.cache', JSON.stringify(cache));
  } catch (e) {
    console.warn('clearClusterData failed', e);
    return null;
  }
}
