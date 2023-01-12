import { useState, useEffect } from 'react';

export const TABLET = 768;
export const DESKTOP = 1200;

const getWidth = () => {
  return window.innerWidth;
};

export const useMinWidth = (minResolution = 0) => {
  const [isWider, setIsWider] = useState(getWidth() > minResolution);
  useEffect(() => {
    const listenerFn = () => {
      setIsWider(getWidth() > minResolution);
    };

    window.addEventListener('resize', listenerFn);

    return () => window.removeEventListener('resize', listenerFn);
  }, [minResolution]);

  return isWider;
};
