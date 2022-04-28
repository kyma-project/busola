import { useEffect, useState } from 'react';
import { useFetchCache } from 'useFetchCache';

export function useTestPrometheusQuery() {
  //   const [state, setState] = useState({
  //     'api/v1/namespaces/kyma-system/services/monitoring-prometheus:web/proxy/api/v1': undefined,
  //     'api/v1/namespaces/kyma-system/services/monitoring-prometheus:http-web/proxy/api/v1': undefined,
  //   });
  const [state, setState] = useState({
    'http://localhost:30001/endpoint-1': undefined,
    'http://localhost:30001/endpoint-2': undefined,
  });

  const { subscribeUrl, unsubscribe, getFromCacheUrl } = useFetchCache();

  useEffect(() => {
    for (const url of Object.keys(state)) {
      const cachedValue = getFromCacheUrl(url);
      console.log('CACHE', url, !!cachedValue);
    }
  }, []);

  useEffect(() => {
    console.log('current state', state);
  }, [state]);

  useEffect(() => {
    const cleanups = [];
    for (const url of Object.keys(state)) {
      const { subscriptionKey, id } = subscribeUrl({
        url,
        onData: a => setState(state => ({ ...state, [url]: !!a })),
        refreshIntervalMs: 1000,
      });

      cleanups.push(() => unsubscribe(subscriptionKey, id));
    }
    return () => {
      for (const c of cleanups) {
        c();
      }
    };
  }, [setState, subscribeUrl]);
}
