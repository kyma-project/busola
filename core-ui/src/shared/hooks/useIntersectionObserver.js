import React, { useEffect, useMemo, useState } from 'react';

const defaultOptions = {
  root: null,
  rootMargin: '0px',
  threshold: 1.0,
};

export const useIntersectionObserver = (target, options = {}) => {
  const [hasBeenInView, setHasBeenInView] = useState(false);

  const { root, rootMargin, threshold } = options;

  const memoizedOptions = useMemo(() => {
    return {
      root: root || defaultOptions.root,
      rootMargin: rootMargin || defaultOptions.rootMargin,
      threshold: threshold || defaultOptions.threshold,
    };
  }, [root, rootMargin, threshold]);

  useEffect(() => {
    if (options.root === null || !target) {
      // break if target is not yet defined
      // allows for undefined roots (defaults to window), but waits if null is passed,
      // null is interpreted that the element hasn't been assigned to a ref yet
      return;
    }

    const callback = ([element]) => {
      if (element.isIntersecting) {
        setHasBeenInView(element.isIntersecting);
      }
    };

    const observer = new IntersectionObserver(callback, memoizedOptions);

    observer.observe(target);

    return () => {
      observer.disconnect();
    };
  }, [target, hasBeenInView, memoizedOptions, options.root]);

  return { hasBeenInView };
};
