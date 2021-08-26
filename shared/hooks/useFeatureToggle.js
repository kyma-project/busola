import { useState, useEffect } from 'react';
import LuigiClient from '@luigi-project/client';

export function getFeatureToggle(key) {
  return (LuigiClient.getActiveFeatureToggles() || []).includes(key);
}

export function useFeatureToggle(key) {
  const [value, setValue] = useState(value);
  const luigiValue = getFeatureToggle(key);

  useEffect(() => {
    setValue(luigiValue);
  }, [luigiValue]);

  return [value, setValue];
}
