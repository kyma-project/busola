import { createContext, useContext, useEffect, useRef } from 'react';
import { useConfig } from 'shared/contexts/ConfigContext';
import { useMicrofrontendContext } from 'shared/contexts/MicrofrontendContext';
import { baseUrl, throwHttpError } from 'shared/hooks/BackendAPI/config';
import { createHeaders } from 'shared/hooks/BackendAPI/createHeaders';
import shortid from 'shortid';
import { db } from 'components/App/db';

export function loadCacheItem(clusterName, path) {
  // todo try catch
  // todo cache key
  const cache = JSON.parse(localStorage.getItem('busola.cache')) || {};
  const dbCache = getFromDB(clusterName, path);
  const clusterCache = cache[clusterName] || {};
  console.log('clusterCache[path]', clusterCache[path], 'dbCache', dbCache);
  return clusterCache[path];
}

async function getFromDB(clusterName, path) {
  console.log('getFromDB', clusterName, path);
  const pathItems = await db.paths
    .where({ cluster: clusterName, path })
    .first(); //.equals(clusterName).and('path').equals(path).toArray();
  return pathItems.items || [];
}
async function saveToDB(clusterName, path, items) {
  console.log('saveToDB', clusterName, path, items);
  const dbObject = {
    cluster: clusterName,
    path,
    items,
  };
  try {
    await db.paths.put(dbObject);
  } catch (error) {
    console.log(
      `Failed to add or modify ${path} for cluster ${clusterName}: ${error}`,
    );
  }
}
export async function saveCacheItem(clusterName, path, item) {
  const cache = JSON.parse(localStorage.getItem('busola.cache')) || {};
  if (!cache[clusterName]) {
    cache[clusterName] = {};
  }
  cache[clusterName][path] = item;
  localStorage.setItem('busola.cache', JSON.stringify(cache));
  await saveToDB(clusterName, path, item);
}

export const FetchCacheContext = createContext({});

function sortResources(a, b) {
  const { name: aName, namespace: aNamespace = '' } = a.metadata;
  const { name: bName, namespace: bNamespace = '' } = b.metadata;
  if (aNamespace === bNamespace) {
    return aName.localeCompare(bName);
  } else {
    return aNamespace.localeCompare(bNamespace);
  }
}

export function FetchCacheProvider({ children }) {
  const { authData, cluster, config, ssoData } = useMicrofrontendContext();
  const { fromConfig } = useConfig();

  const subscriptions = useRef({});

  const getCacheItem = key => cluster && loadCacheItem(cluster.name, key);
  const setCacheItem = (key, item) =>
    cluster && saveCacheItem(cluster.name, key, item);

  useEffect(() => {
    for (const sub of Object.values(subscriptions.current)) {
      clearInterval(sub.intervalId);
    }
    subscriptions.current = {};
  }, [cluster?.name]); //todo add authData}

  const filter = (items, filteringParams) => {
    if (!items) return items;

    const { name, namespace, labelSelector } = filteringParams;
    if (namespace) {
      items = items.filter(i => i.metadata.namespace === namespace);
    }
    if (name) {
      items = items.filter(i => i.metadata.name === name);
    } else if (labelSelector) {
      items = items.filter(i => {
        for (const [key, value] of Object.entries(labelSelector)) {
          if (i.matadata?.labels?.[key] !== value) {
            return false;
          }
        }
        return true;
      });
    }
    return items;
  };
  const minInterval = subscribers => {
    return (
      subscribers
        .map(s => s.refreshIntervalMs)
        .filter(Boolean)
        .sort()[0] || 10000
    );
  };
  const doFetch = async url => {
    const headers = createHeaders(
      authData,
      cluster.cluster,
      config.requiresCA,
      ssoData,
    );
    try {
      const response = await fetch(url, { headers });
      if (response.ok) {
        return await response.json();
      } else {
        throw await throwHttpError(response);
      }
    } catch (e) {
      console.warn(e);
      return null;
    }
  };

  const buildRequestUrl = ({
    namespace,
    resourceType,
    name = '',
    apiPath,
    labelSelector,
  }) => {
    const namespacePart = namespace ? `/namespaces/${namespace}` : '';
    const basePath = `${baseUrl(
      fromConfig,
    )}${apiPath}${namespacePart}/${resourceType.toLowerCase()}`;

    if (labelSelector) {
      const toLabelSelector = obj =>
        Object.entries(obj)
          .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`)
          .join(',');
      const labelSelectorPart = `?labelSelector=${toLabelSelector(
        labelSelector,
      )}`;
      return `${basePath}${labelSelectorPart}`;
    } else {
      return `${basePath}/${name}`;
    }
  };

  const value = {
    subscribe: ({
      onData,
      onError,
      namespace = '',
      name = '',
      apiPath,
      resourceType,
      labelSelector = null,
      refreshIntervalMs = 10000,
    }) => {
      const subscriptionKey = `${namespace}/${resourceType}/${name}/${labelSelector ||
        ''}`;
      if (!subscriptions.current[subscriptionKey]) {
        subscriptions.current[subscriptionKey] = { subscribers: [] };
      }
      const subscription = subscriptions.current[subscriptionKey];
      const subscriptionId = shortid();
      subscription.subscribers.push({
        refreshIntervalMs,
        onData,
        id: subscriptionId,
      });

      const url = buildRequestUrl({
        namespace,
        resourceType,
        name,
        apiPath,
        labelSelector,
      });
      const cacheKey = resourceType;
      const filteringParams = { namespace, name, labelSelector };

      const refetchSingle = async () => {
        const updatedData = await doFetch(url);
        const prevData = filter(getCacheItem(cacheKey), filteringParams)?.[0];
        const hasChanged =
          JSON.stringify(updatedData) !== JSON.stringify(prevData);

        if (hasChanged) {
          for (const sub of subscription.subscribers) {
            sub.onData(updatedData ? [updatedData] : null, prevData);
          }
        }
      };

      const refetchList = async () => {
        const updatedData = (await doFetch(url)).items;
        const prevData = filter(getCacheItem(cacheKey), filteringParams);
        const hasChanged =
          JSON.stringify(updatedData) !== JSON.stringify(prevData);

        for (const sub of subscription.subscribers) {
          sub.onData(updatedData, {
            prevData,
            hasChanged,
            fromCache: false,
          });
        }
        const otherResources = (getCacheItem(cacheKey) || []).filter(
          i => !updatedData.find(u => u.metadata.uid === i.metadata.uid),
        );
        setCacheItem(
          cacheKey,
          [...otherResources, ...updatedData].sort(sortResources),
        );
      };

      const refetch = async () => {
        try {
          if (name) {
            await refetchSingle();
          } else {
            await refetchList();
          }
        } catch (e) {
          onError(e);
          console.warn('refetch failed', e);
        }
      };

      if (typeof subscription.intervalId === 'undefined') {
        refetch();
        const timeout = minInterval(subscription.subscribers);
        // todo interval is not precise enough, and it may change with added subscribers - let's use timeout
        subscription.intervalId = setInterval(() => refetch(), timeout);
      }
      return { subscriptionKey, id: subscriptionId };
    },
    unsubscribe: (subscriptionKey, id) => {
      const subscription = subscriptions.current[subscriptionKey];
      if (!subscription) return;
      subscription.subscribers = subscription.subscribers.filter(
        s => s.id !== id,
      );
      if (subscription.subscribers.length === 0) {
        clearInterval(subscription.intervalId);
        delete subscription.intervalId;
      }
    },
    getFromCache: ({
      namespace = '',
      name = '',
      resourceType,
      labelSelector = null,
    }) => {
      const items = getCacheItem(resourceType);
      return filter(items, {
        name,
        namespace,
        labelSelector,
      });
    },
  };
  return (
    <FetchCacheContext.Provider value={value}>
      {children}
    </FetchCacheContext.Provider>
  );
}

export function useFetchCache() {
  return useContext(FetchCacheContext);
}
