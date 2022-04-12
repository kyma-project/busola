import { useCallback, useEffect } from 'react';

export function useEventListener(event, handler, dependencies = []) {
  console.log(dependencies);
  const callback = useCallback(handler, dependencies); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    window.addEventListener(event, callback);
    return () => window.removeEventListener(event, callback);
  }, dependencies); // eslint-disable-line react-hooks/exhaustive-deps
}
