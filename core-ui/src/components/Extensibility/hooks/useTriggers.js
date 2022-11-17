import { useEffect, useContext, useRef } from 'react';

import { TriggerContext } from '../contexts/Trigger';

export function useTrigger(storeKeys) {
  const triggers = useContext(TriggerContext);
  return triggers.trigger;
}

export function useSubscription(subscriptions) {
  const subscription = useRef(null);
  const triggers = useContext(TriggerContext);

  subscription.current = subscriptions;

  useEffect(() => {
    triggers.subscribe(subscription);
    return () => triggers.unsubscribe(subscription);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps
}
