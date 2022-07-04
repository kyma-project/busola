import shortid from 'shortid';
import { getAuthData } from '../auth/auth-storage';
import { config } from '../config';
import { failFastFetch } from './../navigation/queries';
import { loadCacheItem, saveCacheItem } from './storage';
import { isNil } from 'lodash';

let subscriptions = {};
let clusterName = null;

export function init(_clusterName) {
  clear();
  clusterName = _clusterName;
}

// subbscribe and return data (from cache or fresh)
export async function subscribe({ path, callback, refreshIntervalMs = 10000 }) {
  if (!clusterName) {
    console.debug('subscribe: no clusterName');
    return null;
  }

  if (!subscriptions[path]) {
    subscriptions[path] = { subscribers: [] };
  }
  const subscription = subscriptions[path];
  const id = shortid();
  subscription.subscribers.push({
    refreshIntervalMs,
    callback,
    id,
  });

  const refetch = async () => {
    try {
      const updatedData = await fetch(path);
      const prevData = loadCacheItem(clusterName, path);
      const hasChanged =
        JSON.stringify(updatedData) !== JSON.stringify(prevData);

      if (hasChanged) {
        saveCacheItem(clusterName, path, updatedData);
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
    if (subscriptions[path]?.subscribers?.length) {
      const timeout = minInterval(subscription.subscribers);
      subscription.timeoutId = setTimeout(refetch, timeout);
    }
  };

  // start polling
  if (isNil(subscription.timeoutId)) {
    subscription.timeoutId = -1;
    refetch();
  }

  const unsubscribe = () => {
    const subscription = subscriptions[path];
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

  return { unsubscribe, ...(await get(path)) };
}

// select the shortest interval for the next poll
function minInterval(subscribers) {
  return (
    subscribers
      .map(s => s.refreshIntervalMs)
      .filter(Boolean)
      .sort()[0] || 10000
  );
}

// get item from cache or fetch in case it doesn't exist
export async function get(path) {
  if (!clusterName) {
    console.debug('get: no clusterName');
    return null;
  }
  const item = getSync(path);
  if (item) {
    return item;
  } else {
    const data = await fetch(path);
    saveCacheItem(clusterName, path, data);
    return data;
  }
}

// get item from cache
export function getSync(path) {
  return loadCacheItem(clusterName, path);
}

async function fetch(path) {
  if (path.startsWith('/')) {
    path = config.backendAddress + path;
  }
  try {
    const response = await failFastFetch(path, getAuthData());
    return { status: response.status, data: await response.json() };
  } catch (e) {
    console.warn('fetch', path, e);
    return null;
  }
}

export function clear() {
  for (const sub of Object.values(subscriptions)) {
    clearTimeout(sub.timeoutId);
  }
  subscriptions = {};
  clusterName = null;
}
