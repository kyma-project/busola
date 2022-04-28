/* eslint-disable react-hooks/rules-of-hooks */
/* eslint-disable react-hooks/exhaustive-deps */

import React, { useEffect, useState } from 'react';
import { useMicrofrontendContext } from 'shared/contexts/MicrofrontendContext';
import { useFetch } from 'shared/hooks/BackendAPI/useFetch';
import shortid from 'shortid';
import { useFetchCache } from 'useFetchCache'; // todo move that file somewhere else

// allow <n> consecutive requests to fail before displaying error
const ERROR_TOLERANCY = 2;

const useGetHook = processDataFn =>
  function(path, { pollingInterval, onDataReceived, skip } = {}) {
    const lastAuthData = React.useRef(null);
    const lastResourceVersion = React.useRef(null);
    const [data, setData] = React.useState(null);
    const [loading, setLoading] = React.useState(true);
    const [error, setError] = React.useState(null);
    const { authData } = useMicrofrontendContext();
    const fetch = useFetch();
    const abortController = React.useRef(new AbortController());
    const errorTolerancyCounter = React.useRef(0);
    const currentRequestId = shortid();
    const requestData = React.useRef({});
    const previousRequestNotFinished = React.useRef(null);

    const refetch = (isSilent, currentData) => async () => {
      if (
        skip ||
        !authData ||
        abortController.current.signal.aborted ||
        previousRequestNotFinished.current === path
      )
        return;
      if (!isSilent) setTimeout(_ => setLoading(true));

      abortController.current = new AbortController();

      function processError(error) {
        if (!abortController.current.signal.aborted) {
          errorTolerancyCounter.current++;
          if (errorTolerancyCounter.current > ERROR_TOLERANCY || !data) {
            console.error(error);
            setError(error);
          }
        }
      }

      try {
        previousRequestNotFinished.current = path;
        requestData.current[currentRequestId] = { start: Date.now() };
        const response = await fetch({
          relativeUrl: path,
          abortController: abortController.current,
        });
        const payload = await response.json();

        previousRequestNotFinished.current = null;

        const currentRequest = requestData.current[currentRequestId];
        const newerRequests = Object.values(requestData.current).filter(
          request => request.start > currentRequest.start,
        );
        if (newerRequests.length) {
          // don't override returned value with stale data
          return;
        }

        if (abortController.current.signal.aborted) return;
        if (typeof onDataReceived === 'function')
          onDataReceived({ data: payload });
        if (error) setTimeout(_ => setError(null)); // bring back the data and clear the error once the connection started working again
        errorTolerancyCounter.current = 0;
        setTimeout(_ =>
          processDataFn(payload, currentData, setData, lastResourceVersion),
        );
      } catch (e) {
        previousRequestNotFinished.current = null;
        if (typeof onDataReceived === 'function') onDataReceived({ error: e });
        setTimeout(_ => processError(e));
      }

      if (!isSilent && !abortController.current.signal.aborted)
        setTimeout(_ => setLoading(false));
    };

    React.useEffect(() => {
      const receivedForbidden = error?.code === 403;

      // POLLING
      if (!pollingInterval || receivedForbidden || skip) return;
      const intervalId = setInterval(refetch(true, data), pollingInterval);
      return _ => clearInterval(intervalId);
    }, [path, pollingInterval, data, error, skip]);

    React.useEffect(() => {
      // INITIAL FETCH on path being set/changed
      if (lastAuthData.current && path && !skip) refetch(false, null)();
      return _ => {
        if (loading) setLoading(false);
      };
    }, [path]);

    React.useEffect(() => {
      // silent refetch once 'skip' has been disabled
      if (lastAuthData.current && path && !skip) refetch(true, null)();
      return _ => {
        if (loading) setLoading(false);
      };
    }, [skip]);

    React.useEffect(() => {
      if (JSON.stringify(lastAuthData.current) !== JSON.stringify(authData)) {
        // authData reference is updated multiple times during the route change but the value stays the same (see MicrofrontendContext).
        // To avoid unnecessary refetch(), we 'cache' the last value and do the refetch only if there was an actual change
        lastAuthData.current = authData;
        refetch(false, null)();
      }
    }, [authData]);

    React.useEffect(_ => _ => abortController.current.abort(), []);

    return {
      data,
      loading,
      error,
      refetch: refetch(false, data),
      silentRefetch: refetch(true, data),
    };
  };

export const useGetStream = path => {
  const lastAuthData = React.useRef(null);
  const initialPath = React.useRef(true);
  const timeoutRef = React.useRef();
  const [data, setData] = React.useState([]);
  const [error, setError] = React.useState(null);
  const { authData } = useMicrofrontendContext();
  const fetch = useFetch();
  const readerRef = React.useRef(null);
  const abortController = React.useRef(new AbortController());

  const processError = error => {
    console.error(error);
    setError(error);
  };

  const processData = data => {
    const string = new TextDecoder().decode(data);
    const streams = string?.split('\n').filter(stream => stream !== '');
    setData(prevData => [...prevData, ...streams]);
  };

  const fetchData = async _ => {
    if (!authData) return;

    try {
      // browsers close the connection after a minute (only on a cluster!), erroring with:
      // FF: TypeError: Error in body stream
      // Chrome: TypeError: network error
      // Safari: The operation couldn’t be completed. (kCFErrorDomainCFNetwork error 303.)
      // reset the connection a little before
      timeoutRef.current = setTimeout(refetchData, 55 * 1000);
      const response = await fetch({
        relativeUrl: path,
        abortController: abortController.current,
      });
      if (!authData) return;
      readerRef.current = response.body.getReader();

      return new ReadableStream({
        start(streamController) {
          const push = async () => {
            try {
              const { done, value } = await readerRef.current.read();
              // If there is no more data to read
              if (done) {
                streamController.close();
                cancelReader();
                return;
              }

              // Get the data and send it to the browser via the controller
              streamController.enqueue(value);

              processData(value);

              return push();
            } catch (e) {
              processError(e);
            }
          };
          push();
        },
      });
    } catch (e) {
      if (!e.toString().includes('abort')) processError(e);
    }
  };

  function abort() {
    //if there is no reader, then it means that the call is pending, abort it
    if (readerRef.current) return;
    abortController.current.abort();
    abortController.current = new AbortController();
  }

  const cancelTimeout = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
  };

  const cancelReader = () => {
    if (readerRef.current) {
      readerRef.current.cancel();
      readerRef.current = null;
    }
  };

  const cancelOldData = () => {
    cancelTimeout();
    cancelReader();
    abort();
  };

  const refetchData = () => {
    cancelOldData();
    setData([]);
    fetchData();
  };

  React.useEffect(() => {
    if (initialPath.current) {
      initialPath.current = false;
      return;
    }
    // without this logs are duplicated
    setData([]);
    refetchData();
  }, [path]);

  React.useEffect(_ => {
    cancelOldData();
    return () => {
      cancelOldData();
    };
  }, []);

  React.useEffect(() => {
    if (
      authData &&
      JSON.stringify(lastAuthData.current) !== JSON.stringify(authData)
    ) {
      lastAuthData.current = authData;
      refetchData();
    }
  }, [authData]);

  return {
    data,
    error,
  };
};

export const useGetList = filter => useGetHook(handleListDataReceived(filter));
export const useGet = useGetHook(handleSingleDataReceived);

function handleListDataReceived(filter) {
  return (newData, oldData, setDataFn, lastResourceVersionRef) => {
    if (filter) {
      newData.items = newData.items.filter(filter);
    }

    newData.items = newData.items.map(item => {
      if (!item.kind && newData.kind?.endsWith('List')) {
        item = {
          kind: newData.kind.substring(0, newData.kind.length - 4),
          ...item,
        };
      }
      if (!item.apiVersion && newData.apiVersion) {
        item = {
          apiVersion: newData.apiVersion,
          ...item,
        };
      }
      return item;
    });

    if (
      !oldData ||
      newData.items.length !== oldData.length ||
      (lastResourceVersionRef.current !== newData.metadata.resourceVersion &&
        !newData.items.every(
          (item, idx) =>
            item.metadata.resourceVersion ===
            oldData[idx]?.metadata.resourceVersion,
        ))
    ) {
      lastResourceVersionRef.current = newData.metadata.resourceVersion;
      setDataFn(newData.items);
    }
  };
}

function handleSingleDataReceived(newData, oldData, setDataFn) {
  if (
    !oldData || // current data is empty and we received some. There's no doubdt we should update.
    newData.metadata.resourceVersion !== oldData.metadata.resourceVersion
  ) {
    // Compare resourceVersion.
    setDataFn(newData);
  }
}

export const useSingleGet = () => {
  const fetch = useFetch();
  return url => fetch({ relativeUrl: url });
};

export const useGet3 = ({
  pollingInterval,
  resourceType,
  namespace,
  apiPath,
  name,
}) => {
  resourceType = resourceType.toLowerCase();
  const [data, setData] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [cachedResultsOnly, setCachedResultsOnly] = useState(true);

  const { subscribe, unsubscribe, getFromCache } = useFetchCache();

  useEffect(() => {
    const cacheData = getFromCache({
      namespace,
      resourceType,
      name,
    });
    if (cacheData) {
      setData(cacheData);
      setLoading(false);
    }

    const { subscriptionKey, id } = subscribe({
      apiPath,
      resourceType,
      namespace,
      onData: data => {
        setData(data);
        setLoading(false);
        setCachedResultsOnly(false);
      },
      onError: setError,
      refreshIntervalMs: pollingInterval,
      name,
    });
    return () => unsubscribe(subscriptionKey, id);
  }, [setData, apiPath, resourceType, namespace]);

  return {
    data: data?.[0],
    loading,
    error,
    setCachedResultsOnly,
  };
};

export const useGetList3 = ({
  pollingInterval,
  resourceType,
  namespace,
  apiPath,
  labelSelector,
}) => {
  resourceType = resourceType.toLowerCase();
  const [data, setData] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [cachedResultsOnly, setCachedResultsOnly] = useState(true);

  const { subscribe, unsubscribe, getFromCache } = useFetchCache();

  useEffect(() => {
    const cacheData = getFromCache({
      namespace,
      resourceType,
      labelSelector,
    });

    if (cacheData) {
      setData(cacheData);
      setLoading(false);
    }

    const { subscriptionKey, id } = subscribe({
      apiPath,
      resourceType,
      namespace,
      onData: data => {
        setData(data);
        setLoading(false);
        setCachedResultsOnly(false);
      },
      onError: setError,
      refreshIntervalMs: pollingInterval,
      labelSelector,
    });
    return () => {
      unsubscribe(subscriptionKey, id);
    };
  }, [
    setData,
    apiPath,
    resourceType,
    namespace,
    setLoading,
    setCachedResultsOnly,
  ]);

  return {
    data,
    loading,
    error,
    cachedResultsOnly,
  };
};
