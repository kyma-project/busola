import shortid from 'shortid';
import { useEffect } from 'react';
import LuigiClient from '@luigi-project/client';

import { useMicrofrontendContext } from 'shared/contexts/MicrofrontendContext';

export function useFeature(featureName) {
  const { features } = useMicrofrontendContext();

  useEffect(() => {
    const requestId = shortid();
    LuigiClient.sendCustomMessage({
      id: 'busola.startRequestFeature',
      featureName,
      requestId,
    });
    return () => {
      LuigiClient.sendCustomMessage({
        id: 'busola.stopRequestFeature',
        featureName,
        requestId,
      });
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return features[featureName] ?? { isEnabled: false };
}
