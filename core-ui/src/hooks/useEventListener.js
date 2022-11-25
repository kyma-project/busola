import { useCallback, useEffect } from 'react';

export function useEventListener(event, handler, dependencies = [], options) {
  const callback = useCallback(handler, dependencies); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    window.addEventListener(event, callback, options);
    return () => window.removeEventListener(event, callback);
  }, dependencies); // eslint-disable-line react-hooks/exhaustive-deps
}
