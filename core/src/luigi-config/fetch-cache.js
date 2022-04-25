import shortid from 'shortid';
import { failFastFetch } from './navigation/queries';

export function loadCacheItem(clusterName, path) {
  // todo try catch
  // todo cache key
  const cache = JSON.parse(localStorage.getItem('busola.cache')) || {};
  const clusterCache = cache[clusterName] || {};
  return clusterCache[path];
}

export function saveCacheItem(clusterName, path, item) {
  const cache = JSON.parse(localStorage.getItem('busola.cache')) || {};
  if (!cache[clusterName]) {
    cache[clusterName] = {};
  }
  cache[clusterName][path] = item;
  localStorage.setItem('busola.cache', JSON.stringify(cache));
}

class FetchCache {
  constructor() {
    this.subscriptions = {};
  }
  init({ getCacheItem, setCacheItem, fetchOptions = {} }) {
    console.info('cache init');

    this.getCacheItem = getCacheItem;
    this.setCacheItem = setCacheItem;
    this.fetchOptions = fetchOptions;

    for (const sub of Object.values(this.subscriptions || {})) {
      clearInterval(sub.intervalId);
    }
    this.subscriptions = {};
  }
  subscribe({ path, callback, refreshIntervalMs = 10000 }) {
    try {
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
      if (typeof subscription.intervalId === 'undefined') {
        const timeout = this.minInterval(subscription.subscribers);
        // todo interval is not precise enough, and it may change with added subscribers - let's use timeout

        subscription.intervalId = setInterval(async () => {
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
        }, timeout);
      }
      return id;
    } catch (e) {
      console.log('subscribe failed', e);
      throw e;
    }
  }
  unsubscribe(path, id) {
    const subscription = this.subscriptions[path];
    if (!subscription) return;
    subscription.subscribers = subscription.subscribers.filter(
      s => s.id !== id,
    );
  }
  minInterval(subscribers) {
    return (
      subscribers
        .map(s => s.refreshIntervalMs)
        .filter(Boolean)
        .sort()[0] || 10000
    );
  }
  async getAndSubscribe({ path, callback, refreshIntervalMs = 10000 }) {
    this.subscribe({ path, callback, refreshIntervalMs });
    return await this.get(path);
  }
  async get(path) {
    try {
      const item = this.getSync(path);
      if (item !== undefined) {
        return item;
      } else {
        const data = await this.fetch(path);
        this.setCacheItem(path, data);
        return data;
      }
    } catch (e) {
      console.log('get failed', e);
      throw e;
    }
  }
  getSync(path) {
    if (!this.getCacheItem) {
      return null;
    }
    return this.getCacheItem(path);
  }
  async fetch(path) {
    if (!this.fetchOptions?.data) {
      throw new Error('No data to auth');
    }

    try {
      const response = await failFastFetch(path, this.fetchOptions.data);
      return await response.json();
    } catch (e) {
      console.warn('HMMM', e);
      return null;
    }
  }
}

export const fetchCache = new FetchCache();
