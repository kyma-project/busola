import { useEffect, useMemo, useState } from 'react';

const defaultOptions = {
  root: null,
  rootMargin: '0px',
  threshold: 0.2,
};

export const useIntersectionObserver = (target, options = {}) => {
  const { skip, root, rootMargin, threshold } = options;

  const [hasBeenInView, setHasBeenInView] = useState(false);

  const memoizedOptions = useMemo(() => {
    return {
      root: root || defaultOptions.root,
      rootMargin: rootMargin || defaultOptions.rootMargin,
      threshold: threshold || defaultOptions.threshold,
    };
  }, [root, rootMargin, threshold]);

  useEffect(() => {
    if (skip) {
      return;
    }
    if (options.root === null || !target) {
      // break if target element is not yet defined (waiting for ref)
      // allows for undefined roots (defaults to window), but waits if null is passed, in case of waiting for ref
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
  }, [target, hasBeenInView, memoizedOptions, options.root, skip]);

  return { hasBeenInView };
};
