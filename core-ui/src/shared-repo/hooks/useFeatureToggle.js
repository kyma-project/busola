import { useState, useEffect } from 'react';
import LuigiClient from '@luigi-project/client';

export function getFeatureToggle(key) {
  return (LuigiClient.getActiveFeatureToggles() || []).includes(key);
}

export function useFeatureToggle(key) {
  const [value, setValue] = useState(false);
  const luigiValue = getFeatureToggle(key);

  useEffect(() => {
    setValue(luigiValue);
  }, [luigiValue]);

  useEffect(() => {
    const customMsgId = LuigiClient.addCustomMessageListener(
      `busola.toggle-changed.${key}`,
      ({ value }) => setValue(value),
    );
    return () => LuigiClient.removeCustomMessageListener(customMsgId);
  }, []);

  return [value, setValue];
}
