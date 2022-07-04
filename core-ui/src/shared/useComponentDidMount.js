import { useRef, useEffect } from 'react';

export const useComponentDidMount = fn => {
  const isMounted = useRef(true);
  useEffect(() => {
    if (isMounted.current) {
      fn();
    }
    isMounted.current = false;
  }, [fn]);
};
