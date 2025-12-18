import { useFeature } from 'hooks/useFeature';
import React from 'react';
import { Route } from 'react-router';
import { configFeaturesNames } from 'state/types';

const GardenerLogin = React.lazy(() => import('./GardenerLogin'));

export function useMakeGardenerLoginRoute() {
  const gardenerLoginFeature = useFeature(configFeaturesNames.GARDENER_LOGIN);
  if (gardenerLoginFeature.isEnabled) {
    return <Route path="/gardener-login" element={<GardenerLogin />} />;
  } else {
    return null;
  }
}
