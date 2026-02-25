import { useFeature } from 'hooks/useFeature';
import { Route } from 'react-router';
import { lazyWithRetries } from 'shared/helpers/lazyWithRetries';
import { configFeaturesNames } from 'state/types';

const GardenerLogin = lazyWithRetries(() => import('./GardenerLogin'));

export function useMakeGardenerLoginRoute() {
  const gardenerLoginFeature = useFeature(configFeaturesNames.GARDENER_LOGIN);
  if (gardenerLoginFeature.isEnabled) {
    return <Route path="/gardener-login" element={<GardenerLogin />} />;
  } else {
    return null;
  }
}
