import { useEffect } from 'react';
import LuigiClient from '@luigi-project/client';

import { useMicrofrontendContext } from 'shared/contexts/MicrofrontendContext';

// export function getFeature(key) {
// return (LuigiClient.getActiveFeatureToggles() || []).includes(key);
// }

export function useFeature(featureName) {
  const { features } = useMicrofrontendContext();

  // const [value, setValue] = useState(false);
  // const luigiValue = getFeatureToggle(key);

  // useEffect(() => {
  // setValue(luigiValue);
  // }, [luigiValue]);

  useEffect(() => {
    LuigiClient.sendCustomMessage({
      id: 'busola.requestFeature',
      featureName,
    });
    /*
    const customMsgId = LuigiClient.addCustomMessageListener(
      `busola.toggle-changed.${key}`,
      ({ value }) => setValue(value),
    );
    return () => LuigiClient.removeCustomMessageListener(customMsgId);
    */
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // return [value, setValue];
  return features[featureName] ?? { isEnabled: false };
}
