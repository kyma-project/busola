import { useCallback, useEffect } from 'react';

export function useEventListener(event, handler, dependencies = []) {
  const callback = useCallback(handler, dependencies);

  useEffect(() => {
    window.addEventListener(event, callback);
    return () => window.removeEventListener(event, callback);
  }, dependencies);
}
