import shortid from 'shortid';
import { config } from '../config';
import { failFastFetch } from './../navigation/queries';

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
        const prevData = this.getCacheItem(path);
        const hasChanged =
          JSON.stringify(updatedData) !== JSON.stringify(prevData);

        // console.log(hasChanged, path);
        if (hasChanged) {
          this.setCacheItem(path, updatedData);
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

      // stop polling if there are no subscribers
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
    if (item?.status) {
      return item;
    } else {
      const data = await this.fetch(path);
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
    if (path.startsWith('/')) {
      path = config.backendAddress + path;
    }
    try {
      const response = await failFastFetch(path, this.fetchOptions.data);
      return { status: response.status, data: await response.json() };
    } catch (e) {
      console.warn('fetch', path, e);
      return { status: 0, data: null };
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
