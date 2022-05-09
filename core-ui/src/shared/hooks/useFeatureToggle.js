import { useState, useEffect } from 'react';
import LuigiClient from '@luigi-project/client';

export function getFeatureToggle(key) {
  return (LuigiClient.getActiveFeatureToggles() || []).includes(key);
}

export function useFeatureToggle(key) {
  const [value, setValue] = useState(getFeatureToggle(key));

  useEffect(() => {
    window.parent.postMessage({ msg: 'busola.getFeatureToggle', key }, '*'); // send a message to the parent app and expect a response shortly
    const changeFeature = event => {
      if (
        event.data.msg === 'busola.getFeatureToggle.response' &&
        event.data.key === key
      ) {
        setValue(
          String(event.data.value).toLowerCase() === 'true' ? true : false,
        );
      }
    };
    window.addEventListener('message', changeFeature);
    return _ => window.removeEventListener('message', changeFeature);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return [value, setValue];
}
