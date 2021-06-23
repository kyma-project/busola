import React from 'react';
import { useMicrofrontendContext } from '../../contexts/MicrofrontendContext';

import { useFetch } from './useFetch';

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

    const refetch = (isSilent, currentData) => async () => {
      if (skip || !authData || abortController.current.signal.aborted) return;
      if (!isSilent) setTimeout(_ => setLoading(true));

      abortController.current = new AbortController();

      function processError(error) {
        if (!abortController.current.signal.aborted) {
          console.error(error);
          setError(error);
        }
      }

      try {
        const response = await fetch({ relativeUrl: path, abortController });
        const payload = await response.json();

        if (abortController.current.signal.aborted) return;
        if (typeof onDataReceived === 'function') onDataReceived(payload.items);
        if (error) setTimeout(_ => setError(null)); // bring back the data and clear the error once the connection started working again
        setTimeout(_ =>
          processDataFn(payload, currentData, setData, lastResourceVersion),
        );
      } catch (e) {
        setTimeout(_ => processError(e));
      }

      if (!isSilent && !abortController.current.signal.aborted)
        setTimeout(_ => setLoading(false));
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
    if (!authData || abortController.current.signal.aborted) return;

    try {
      const response = await fetch({ relativeUrl: path, abortController });
      if (!authData || abortController.current.signal.aborted) return;
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
                return setTimeout(refetchData);
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

  React.useEffect(() => {
    if (initialPath.current) {
      initialPath.current = false;
      return;
    }
    setData([]);
    refetchData();
  }, [path]);

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
