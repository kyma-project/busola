import { useCallback, useEffect } from 'react';

type EventType = keyof WindowEventMap;
type EventListenerOptions = boolean | AddEventListenerOptions;

export function useEventListener(
  event: EventType,
  handler: (t: Event) => void,
  dependencies: any[] = [],
  options?: EventListenerOptions,
) {
  const callback = useCallback(handler, dependencies); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    window.addEventListener(event, callback, options);
    return () => window.removeEventListener(event, callback);
  }, dependencies); // eslint-disable-line react-hooks/exhaustive-deps
}
