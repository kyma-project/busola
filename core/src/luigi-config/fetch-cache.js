import shortid from 'shortid';
import { failFastFetch } from './navigation/queries';

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

class FetchCache {
  constructor() {
    this.subscriptions = {};
  }
  init({ getCacheItem, setCacheItem, fetchOptions = {} }) {
    this.getCacheItem = getCacheItem;
    this.setCacheItem = setCacheItem;
    this.fetchOptions = fetchOptions;

    for (const sub of Object.values(this.subscriptions || {})) {
      clearInterval(sub.timeoutId);
    }
    this.subscriptions = {};
  }
  async subscribe({ path, callback, refreshIntervalMs = 10000 }) {
    if (!this.subscriptions[path]) {
      this.subscriptions[path] = { subscribers: [] };
    }
    const subscription = this.subscriptions[path];
    const id = shortid();
    subscription.subscribers.push({
      refreshIntervalMs,
      callback,
      id,
    });

    const refetch = async () => {
      try {
        const updatedData = await this.fetch(path);
        const hasChanged =
          JSON.stringify(updatedData) !==
          JSON.stringify(this.getCacheItem(path));

        if (hasChanged) {
          for (const sub of subscription.subscribers) {
            sub.callback(this.getCacheItem(path), updatedData);
          }
          this.setCacheItem(path, updatedData);
        }
      } catch (e) {
        console.warn('interval failed', e);
      }

      const timeout = this.minInterval(subscription.subscribers);
      subscription.timeoutId = setTimeout(refetch, timeout);
    };

    if (typeof subscription.timeoutId === 'undefined') {
      const timeout = this.minInterval(subscription.subscribers);
      subscription.timeoutId = setTimeout(refetch, timeout);
    }

    return { subscriptionId: id, data: await this.get(path) };
  }
  unsubscribe(path, id) {
    const subscription = this.subscriptions[path];
    if (!subscription) return;
    subscription.subscribers = subscription.subscribers.filter(
      s => s.id !== id,
    );
    if (subscription.subscribers.length === 0) {
      clearInterval(subscription.timeoutId);
      delete subscription.timeoutId;
    }
  }
  minInterval(subscribers) {
    return (
      subscribers
        .map(s => s.refreshIntervalMs)
        .filter(Boolean)
        .sort()[0] || 10000
    );
  }
  async get(path) {
    const item = this.getSync(path);
    if (item) {
      return item;
    } else {
      const data = await this.fetch(path);
      if (!data) {
        // alert('possible null in get ' + path);
      }
      this.setCacheItem(path, data);
      return data;
    }
  }
  getSync(path) {
    if (!this.getCacheItem) {
      return null;
    }
    return this.getCacheItem(path);
  }
  async fetch(path) {
    try {
      const response = await failFastFetch(path, this.fetchOptions.data);
      return await response.json();
    } catch (e) {
      console.warn(e);
      return;
    }
  }
  destroy() {
    for (const sub of Object.values(this.subscriptions || {})) {
      clearInterval(sub.timeoutId);
    }
    this.subscriptions = {};
  }
}

export const fetchCache = new FetchCache();
