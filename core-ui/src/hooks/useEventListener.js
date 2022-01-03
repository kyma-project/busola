import { useEffect } from 'react';

export function useEventListener(event, handler, dependencies = []) {
  useEffect(() => {
    window.addEventListener(event, handler);
    return () => window.removeEventListener(event, handler);
  }, dependencies);
}
