import { useEffect } from 'react';
import LuigiClient from '@luigi-project/client';

import { useMicrofrontendContext } from 'shared/contexts/MicrofrontendContext';

export function useFeature(featureName) {
  const { features } = useMicrofrontendContext();

  useEffect(() => {
    LuigiClient.sendCustomMessage({
      id: 'busola.startRequestFeature',
      featureName,
    });
    return () => {
      LuigiClient.sendCustomMessage({
        id: 'busola.stopRequestFeature',
        featureName,
      });
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return features[featureName] ?? { isEnabled: false };
}
