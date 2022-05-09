import { useState, useEffect } from 'react';
import LuigiClient from '@luigi-project/client';

export function getFeatureToggle(key) {
  const value = (LuigiClient.getActiveFeatureToggles() || []).includes(key);
  const value2 = localStorage.getItem('busola.showHiddenNamespaces') || false;
  console.log('Object.keys(localStorage)', Object.keys(localStorage));
  console.log(
    'getFeatureToggle coreUI key',
    key,
    'value',
    value,
    localStorage.getItem('busola.theme'),
  );
  return value2;
}

export function useFeatureToggle(key) {
  const [value, setValue] = useState(false);
  const luigiValue = false;
  // useEffect(() => {
  //   console.log('useFeatureToggle useEffect luigiValue', luigiValue)
  //   setValue(luigiValue);
  // }, [luigiValue]);

  useEffect(() => {
    console.log('useFeatureToggle useEffect on init');

    const customMsgId = LuigiClient.addCustomMessageListener(
      `busola.toggle-changed.${key}`,
      ({ value }) => setValue(value),
    );
    return () => LuigiClient.removeCustomMessageListener(customMsgId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    console.log('lolo');

    window.parent.postMessage({ msg: 'busola.getFeatureToggle', key }, '*'); // send a message to the parent app and expect a response shortly
    const changeFeature = event => {
      if (
        event.data.msg === 'busola.getFeatureToggle.response' &&
        event.data.key === key
      )
        console.log('lolo', event.data, event.data.value);
      setValue(event.data.value);
    };
    window.addEventListener('message', changeFeature);
    return _ => window.removeEventListener('message', changeFeature);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return [value, setValue];
}
