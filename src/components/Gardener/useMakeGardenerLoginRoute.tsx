import { useFeature } from 'hooks/useFeature';
import React from 'react';
import { Route } from 'react-router-dom';

const GardenerLogin = React.lazy(() => import('./GardenerLogin'));

export function useMakeGardenerLoginRoute() {
  const gardenerLoginFeature = useFeature('GARDENER_LOGIN');

  return () => {
    if (gardenerLoginFeature.isEnabled) {
      return <Route path="/gardener-login" element={<GardenerLogin />} />;
    } else {
      return null;
    }
  };
}
