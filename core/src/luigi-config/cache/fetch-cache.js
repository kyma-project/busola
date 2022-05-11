import shortid from 'shortid';
import { getAuthData } from '../auth/auth-storage';
import { config } from '../config';
import { failFastFetch } from './../navigation/queries';
import { loadCacheItem, saveCacheItem } from './storage';

class FetchCache {
  constructor() {
    this.subscriptions = {};
  }
  init() {
    this.clear();
  }
  // subbscribe and return data (from cache or fresh)
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
        const prevData = loadCacheItem(path);
        const hasChanged =
          JSON.stringify(updatedData) !== JSON.stringify(prevData);

        if (hasChanged) {
          saveCacheItem(path, updatedData);
          for (const sub of subscription.subscribers) {
            sub.callback({
              prevData,
              updatedData,
            });
          }
        }
      } catch (e) {
        console.warn('interval failed', e);
      }

      // continue polling if there are subscribers
      if (this.subscriptions[path]?.subscribers?.length) {
        const timeout = this.minInterval(subscription.subscribers);
        subscription.timeoutId = setTimeout(refetch, timeout);
      }
    };

    // start polling
    if (typeof subscription.timeoutId === 'undefined') {
      subscription.timeoutId = -1;
      refetch();
    }

    const unsubscribe = () => {
      const subscription = this.subscriptions[path];
      if (!subscription) return;
      subscription.subscribers = subscription.subscribers.filter(
        s => s.id !== id,
      );
      // no subscribers anymore, stop polling
      if (subscription.subscribers.length === 0) {
        clearTimeout(subscription.timeoutId);
        delete subscription.timeoutId;
      }
    };

    return { unsubscribe, ...(await this.get(path)) };
  }
  // select the shortest interval for the next poll
  minInterval(subscribers) {
    return (
      subscribers
        .map(s => s.refreshIntervalMs)
        .filter(Boolean)
        .sort()[0] || 10000
    );
  }
  // get item from cache or fetch in case it doesn't exist
  async get(path) {
    const item = this.getSync(path);
    if (item?.status) {
      return item;
    } else {
      const data = await this.fetch(path);
      saveCacheItem(path, data);
      return data;
    }
  }
  // get item from cache
  getSync(path) {
    return loadCacheItem(path);
  }
  async fetch(path) {
    if (path.startsWith('/')) {
      path = config.backendAddress + path;
    }
    try {
      const response = await failFastFetch(path, getAuthData());
      return { status: response.status, data: await response.json() };
    } catch (e) {
      console.warn('fetch', path, e);
      return { status: 0, data: null };
    }
  }
  clear() {
    for (const sub of Object.values(this.subscriptions)) {
      clearTimeout(sub.timeoutId);
    }
    this.subscriptions = {};
  }
}

export const fetchCache = new FetchCache();
