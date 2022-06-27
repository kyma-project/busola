import { useEffect, useRef } from 'react';

// prevents `setState` on onmounted component
export function useMounted() {
  const mounted = useRef(false);

  useEffect(() => {
    mounted.current = true;
    return () => (mounted.current = false);
  }, []);

  return mounted;
}
