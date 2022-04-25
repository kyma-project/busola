import { throwHttpError } from 'shared/hooks/BackendAPI/config';
import shortid from 'shortid';

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
  init({ getCacheItem, setCacheItem, fetchOptions = {} }) {
    console.info('core-ui cache init');

    this.getCacheItem = getCacheItem;
    this.setCacheItem = setCacheItem;
    this.fetchOptions = fetchOptions;

    for (const sub of Object.values(this.subscriptions || {})) {
      clearInterval(sub.intervalId);
    }
    this.subscriptions = {};
  }
  subscribe({
    path,
    callback,
    refreshIntervalMs = 10000,
    fetchIfNotPresent = false,
  }) {
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

      const doFetch = async () => {
        try {
          const updatedData = await this.fetch(path);
          const prevData = this.getCacheItem(path);
          const hasChanged =
            JSON.stringify(updatedData) !== JSON.stringify(prevData);

          if (hasChanged) {
            for (const sub of subscription.subscribers) {
              sub.callback(prevData, updatedData);
            }
            this.setCacheItem(path, updatedData);
          }
        } catch (e) {
          console.warn('interval failed', e);
        }
      };

      if (fetchIfNotPresent && !this.getCacheItem(path)) {
        doFetch();
      }

      if (typeof subscription.intervalId === 'undefined') {
        const timeout = this.minInterval(subscription.subscribers);
        // todo interval is not precise enough, and it may change with added subscribers - let's use timeout

        subscription.intervalId = setInterval(async () => {
          await doFetch();
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
      const item = this.getgetSync(path);
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
    return this.getCacheItem(path);
  }
  async fetch(path) {
    if (!this.fetchOptions?.headers) {
      throw new Error('No data to auth');
    }

    try {
      const response = await fetch(path, this.fetchOptions);
      if (response.ok) {
        return (await response.json()).items;
      } else {
        throw await throwHttpError(response);
      }
    } catch (e) {
      return null;
    }
  }
}

export const fetchCache = new FetchCache();
