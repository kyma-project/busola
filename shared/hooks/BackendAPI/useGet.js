import React from 'react';
import { useMicrofrontendContext } from '../../contexts/MicrofrontendContext';

import { useFetch } from './useFetch';

const useGetHook = processDataFn =>
  function(path, { pollingInterval, onDataReceived, skip } = {}) {
    const isHookMounted = React.useRef(true); // becomes 'false' after the hook is unmounted to avoid performing any async actions afterwards
    const lastAuthData = React.useRef(null);
    const lastResourceVersion = React.useRef(null);
    const [data, setData] = React.useState(null);
    const [loading, setLoading] = React.useState(true);
    const [error, setError] = React.useState(null);
    const { authData } = useMicrofrontendContext();
    const fetch = useFetch();

    const refetch = (isSilent, currentData) => async () => {
      if (skip || !authData || !isHookMounted.current) return;
      if (!isSilent) setLoading(true);

      function processError(error) {
        console.error(error);
        if (!isSilent) setError(error);
      }

      try {
        const response = await fetch({ relativeUrl: path });
        const payload = await response.json();

        if (!isHookMounted.current) return;
        if (typeof onDataReceived === 'function') onDataReceived(payload.items);
        if (error) setError(null); // bring back the data and clear the error once the connection started working again
        processDataFn(payload, currentData, setData, lastResourceVersion);
      } catch (e) {
        processError(e);
      }

      if (!isSilent && isHookMounted.current) setLoading(false);
    };

    React.useEffect(() => {
      const receivedForbidden = error?.code === 403;
      // POLLING
      if (!pollingInterval || receivedForbidden) return;
      const intervalId = setInterval(refetch(true, data), pollingInterval);
      return _ => clearInterval(intervalId);
    }, [path, pollingInterval, data, error]);

    React.useEffect(() => {
      // INITIAL FETCH
      if (lastAuthData.current && path) refetch(false, null)();
      return _ => {
        if (loading) setLoading(false);
      };
    }, [path]);

    React.useEffect(() => {
      if (JSON.stringify(lastAuthData.current) != JSON.stringify(authData)) {
        // authData reference is updated multiple times during the route change but the value stays the same (see MicrofrontendContext).
        // To avoid unnecessary refetch(), we 'cache' the last value and do the refetch only if there was an actual change
        lastAuthData.current = authData;
        refetch(false, null)();
      }
    }, [authData]);

    React.useEffect(() => {
      isHookMounted.current = true;
      return _ => {
        isHookMounted.current = false;
      };
    }, []);

    return {
      data,
      loading,
      error,
      refetch: refetch(false, data),
      silentRefetch: refetch(true, data),
    };
  };

export const useGetStream = path => {
  const isHookMounted = React.useRef(true); // becomes 'false' after the hook is unmounted to avoid performing any async actions afterwards
  const lastAuthData = React.useRef(null);
  const [data, setData] = React.useState([]);
  const [error, setError] = React.useState(null);
  const { authData } = useMicrofrontendContext();
  const fetch = useFetch();
  const abortController = React.useRef(new AbortController());

  const processError = error => {
    if (!abortController.current.signal.aborted) {
      console.error(error);
      setError(error);
    }
  };

  const fetchData = async _ => {
    if (!authData || !isHookMounted.current) return;

    try {
      const response = await fetch({ relativeUrl: path, abortController });
      if (!authData || !isHookMounted.current) return;
      const reader = response.body.getReader();

      return new ReadableStream({
        start(streamController) {
          const push = async () => {
            try {
              const { done, value } = await reader.read();
              // If there is no more data to read
              if (done) return streamController.close();

              // Get the data and send it to the browser via the controller
              streamController.enqueue(value);
              const string = new TextDecoder().decode(value);
              const streams = string
                ?.split('\n')
                .filter(stream => stream !== '');

              setData(prevData => [...prevData, ...streams]);
              return push();
            } catch (e) {
              // Chrome closes connections after a while.
              // Refetch logs after the connection has been closed.
              if (e.toString().includes('network error'))
                return setImmediate(refetchData);
              else processError(e);
            }
          };
          return push();
        },
      });
    } catch (e) {
      processError(e);
    }
  };

  function abort() {
    abortController.current.abort();
  }

  function refetchData() {
    abort();
    abortController.current = new AbortController();
    fetchData();
  }

  React.useEffect(_ => abort, [path]);
  React.useEffect(_ => abort, []);
  React.useEffect(() => {
    if (
      authData &&
      JSON.stringify(lastAuthData.current) != JSON.stringify(authData)
    ) {
      lastAuthData.current = authData;
      refetchData();
    }
  }, [authData]);

  React.useEffect(() => {
    isHookMounted.current = true;
    return _ => {
      isHookMounted.current = false;
    };
  }, []);

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

    if (
      !oldData ||
      lastResourceVersionRef.current !== newData.metadata.resourceVersion
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
