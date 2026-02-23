/* eslint-disable react-hooks/rules-of-hooks */
/* eslint-disable react-hooks/exhaustive-deps */

import { useCallback, useEffect, useRef, useState } from 'react';
import { useAtomValue } from 'jotai';
import { v4 as uuid } from 'uuid';

import { useFetch } from 'shared/hooks/BackendAPI/useFetch';
import { authDataAtom } from '../../../state/authDataAtom';

// allow <n> consecutive requests to fail before displaying error
const ERROR_TOLERANCY = 2;

// Regex to detect Kubernetes API errors returned as stream content
// These have the format: Get "https://...". EOF or similar
const K8S_STREAM_ERROR_REGEX =
  /Get "https?:\/\/[^"]+"[.:]\s*(EOF|connection refused|i\/o timeout)/i;
const MAX_LINE_LENGTH_TO_CHECK = 1000;

const useGetHook = (processDataFn) =>
  function (
    path,
    {
      pollingInterval,
      onDataReceived,
      skip = false,
      errorTolerancy = undefined,
      compareEntireResource = false,
    } = {},
  ) {
    const shouldSkip = skip || !path;

    const authData = useAtomValue(authDataAtom);
    const lastAuthData = useRef(null);
    const lastResourceVersion = useRef(null);
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(!shouldSkip);
    const [error, setError] = useState(null);
    const fetch = useFetch();
    const abortController = useRef(new AbortController());
    const errorTolerancyCounter = useRef(0);
    const currentRequestId = uuid();
    const requestData = useRef({});
    const previousRequestNotFinished = useRef(null);
    const intervalIdRef = useRef(null);

    const refetch = useCallback(
      (isSilent, currentData) => async () => {
        if (
          shouldSkip ||
          !authData ||
          previousRequestNotFinished.current === path
        )
          return;
        if (!isSilent) setTimeout((_) => setLoading(true));

        abortController.current = new AbortController();

        function processError(error) {
          if (!abortController.current.signal.aborted) {
            errorTolerancyCounter.current++;

            const errorLimit =
              typeof errorTolerancy === 'number'
                ? errorTolerancy
                : ERROR_TOLERANCY;

            if (errorTolerancyCounter.current > errorLimit || !data) {
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
            (request) => request.start > currentRequest.start,
          );
          if (newerRequests.length) {
            // don't override returned value with stale data
            return;
          }

          if (abortController.current.signal.aborted) return;

          if (typeof onDataReceived === 'function') {
            onDataReceived({ data: payload });
          }
          if (error) setTimeout((_) => setError(null)); // bring back the data and clear the error once the connection started working again
          errorTolerancyCounter.current = 0;
          setTimeout((_) =>
            processDataFn(
              payload,
              currentData,
              setData,
              lastResourceVersion,
              compareEntireResource,
            ),
          );
        } catch (e) {
          previousRequestNotFinished.current = null;
          if (typeof onDataReceived === 'function')
            onDataReceived({ error: e });
          // Let's wait a moment, because the current request may load
          // and showing the error to the user will not be necessary.
          setTimeout((_) => processError(e), 100);
        }

        if (!isSilent && !abortController.current.signal.aborted)
          setTimeout((_) => setLoading(false));
      },
      [fetch, authData],
    );

    const cleanupPolling = useCallback(() => {
      if (intervalIdRef.current) {
        clearInterval(intervalIdRef.current);
        intervalIdRef.current = null;
      }
    }, []);

    useEffect(() => {
      const receivedForbidden = error?.code === 403;

      cleanupPolling();
      // POLLING
      if (!pollingInterval || receivedForbidden || shouldSkip) return;
      intervalIdRef.current = setInterval(refetch(true, data), pollingInterval);
      return cleanupPolling;
    }, [
      path,
      pollingInterval,
      data,
      error,
      shouldSkip,
      refetch,
      cleanupPolling,
    ]);

    useEffect(() => {
      // INITIAL FETCH on path being set/changed
      if (lastAuthData.current && path && !shouldSkip) refetch(false, null)();
      return (_) => {
        if (loading) setLoading(false);
      };
    }, [path]);

    useEffect(() => {
      // silent refetch once 'skip' has been disabled
      if (lastAuthData.current && path && !shouldSkip) refetch(true, null)();
      return (_) => {
        if (loading) setLoading(false);
      };
    }, [shouldSkip]);

    useEffect(() => {
      if (JSON.stringify(lastAuthData.current) !== JSON.stringify(authData)) {
        // authData reference is updated multiple times during the route change but the value stays the same (see MicrofrontendContext).
        // To avoid unnecessary refetch(), we 'cache' the last value and do the refetch only if there was an actual change
        lastAuthData.current = authData;
        refetch(false, null)();
      }
    }, [authData]);

    useEffect((_) => (_) => abortController.current.abort(), []);

    return {
      data,
      loading,
      error,
      refetch: refetch(false, data),
      silentRefetch: refetch(true, data),
    };
  };

export const useGetStream = (path) => {
  const lastAuthData = useRef(null);
  const initialPath = useRef(true);
  const timeoutRef = useRef();
  const [data, setData] = useState([]);
  const [error, setError] = useState(null);
  const authData = useAtomValue(authDataAtom);
  const fetch = useFetch();
  const readerRef = useRef(null);
  const abortController = useRef(new AbortController());
  const k8sErrorRetryCount = useRef(0);

  const processError = (error) => {
    console.error(error);
    setError(error);
  };

  // Unified retry logic for both text-based and exception-based errors
  const handleTransientError = (e) => {
    if (k8sErrorRetryCount.current < 5) {
      console.warn(`Transient stream error detected (${e}), retrying...`);
      k8sErrorRetryCount.current++;

      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      timeoutRef.current = setTimeout(refetchData, 1000);
    } else {
      processError(e);
    }
  };

  const processData = (data) => {
    const string = new TextDecoder().decode(data);
    const streams = string?.split('\n').filter((stream) => stream !== '');

    const hasK8sError = streams.some((line) => {
      if (line.length > MAX_LINE_LENGTH_TO_CHECK) return false;

      return K8S_STREAM_ERROR_REGEX.test(line);
    });

    if (hasK8sError) {
      handleTransientError(new Error('Stream contained Kubernetes API Error'));
      return;
    }

    k8sErrorRetryCount.current = 0;
    setData((prevData) => [...prevData, ...streams]);
  };

  const fetchData = async (_) => {
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
              // Handle stream read errors (network-level)
              handleTransientError(e);
            }
          };
          push();
        },
      });
    } catch (e) {
      // Handle connection errors (network-level)
      if (!e.toString().includes('abort')) handleTransientError(e);
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

  useEffect(() => {
    if (initialPath.current) {
      initialPath.current = false;
      return;
    }
    // without this logs are duplicated
    setData([]);
    refetchData();
  }, [path]);

  useEffect((_) => {
    cancelOldData();
    return () => {
      cancelOldData();
    };
  }, []);

  useEffect(() => {
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

export const useGetList = (filter) =>
  useGetHook(handleListDataReceived(filter));
export const useGet = useGetHook(handleSingleDataReceived);

function handleListDataReceived(filter) {
  return async (newData, oldData, setDataFn, lastResourceVersionRef) => {
    if (filter) {
      const asyncForFilter = await Promise.all(
        newData.items.map(async (item) => {
          const filtered = await filter(item);
          return filtered ? item : false;
        }),
      );
      newData.items = asyncForFilter.filter(Boolean);
    }

    newData.items = (newData.items || []).map((item) => {
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
      lastResourceVersionRef.current = newData.metadata?.resourceVersion;
      setDataFn(newData.items);
    }
  };
}

function handleSingleDataReceived(
  newData,
  oldData,
  setDataFn,
  compareEntireResource,
) {
  if (
    !oldData || // current data is empty and we received some. There's no doubdt we should update.
    newData?.metadata?.resourceVersion !== oldData?.metadata?.resourceVersion ||
    (compareEntireResource &&
      JSON.stringify(newData) !== JSON.stringify(oldData))
  ) {
    // Compare resourceVersion.
    setDataFn(newData);
  }
}

export const useSingleGet = () => {
  const fetch = useFetch();
  return (url) => fetch({ relativeUrl: url });
};

export const useGetScope = () => {
  const fetch = useFetch();
  return async (group, version, kind) => {
    const response = await fetch({
      relativeUrl: `/apis/${group}/${version}`,
    });
    const openApiSpec = await response.json();

    return openApiSpec.resources.find((r) => r.kind === kind)?.namespaced;
  };
};
