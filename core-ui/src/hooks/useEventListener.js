import { useCallback, useEffect } from 'react';

export function useEventListener(event, handler, dependencies = []) {
  const callback = useCallback(handler, dependencies);
  // eslint-disable-next-line react-hooks/exhaustive-deps

  useEffect(() => {
    window.addEventListener(event, callback);
    return () => window.removeEventListener(event, callback);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, dependencies);
}
