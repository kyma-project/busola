import { useRef, useEffect } from 'react';

export const useComponentDidMount = onMountHandler => {
  const componentDidMount = useRef(false);

  useEffect(() => {
    if (!componentDidMount.current) {
      onMountHandler();
      componentDidMount.current = true;
    }
  }, [onMountHandler]);

  return { componentDidMount };
};
