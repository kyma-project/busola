import { useCallback, useEffect } from 'react';

type EventType = keyof WindowEventMap;
type EventListenerOptions = boolean | AddEventListenerOptions;

export function useEventListener<E extends EventType>(
  event: E,
  handler: (t: WindowEventMap[E]) => void,
  dependencies: any[] = [],
  options?: EventListenerOptions,
) {
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const callback = useCallback(handler, dependencies);

  useEffect(() => {
    window.addEventListener(event, callback, options);
    return () => window.removeEventListener(event, callback);
  }, dependencies); // eslint-disable-line react-hooks/exhaustive-deps
}
