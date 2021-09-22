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
  const timeoutRef = React.useRef();
  const [data, setData] = React.useState([]);
  const [error, setError] = React.useState(null);
  const { authData } = useMicrofrontendContext();
  const fetch = useFetch();
  const readerRef = React.useRef(null);

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
      const response = await fetch({ relativeUrl: path });
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
      processError(e);
    }
  };

  const cancelTimeout = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
  };

  const cancelReader = () => {
    if (readerRef.current) {
      readerRef.current.cancel();
    }
  };

  const refetchData = () => {
    cancelTimeout();
    cancelReader();
    setData([]);
    fetchData();
  };

  React.useEffect(() => {
    // without this logs are duplicated
    if (initialPath.current) {
      initialPath.current = false;
      return;
    }
    setData([]);
    refetchData();
  }, [path]);

  React.useEffect(_ => {
    cancelTimeout();
    cancelReader();
  }, []);
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
