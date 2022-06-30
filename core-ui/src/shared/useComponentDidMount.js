import { useRef, useEffect } from 'react';

export const useComponentDidMount = fn => {
  const isMounted = useRef(false);
  useEffect(() => {
    if (!isMounted.current) {
      fn?.();
    }
    isMounted.current = true;
  }, [fn]);

  return isMounted.current;
};
