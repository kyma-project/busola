import { useEffect } from 'react';
import { useLocation } from 'react-router';
import { useFeature } from './useFeature';
import { configFeaturesNames } from 'state/types';

export function useAdobePageView() {
  const location = useLocation();
  const feature = useFeature(configFeaturesNames.ADOBE_ANALYTICS);

  useEffect(() => {
    if (!feature?.isEnabled) return;
    if (typeof (window as any)._satellite === 'undefined') return;

    const pageName = buildPageName(location.pathname);
    (window as any)._satellite.track('page-view', { pageName });
  }, [location.pathname, feature?.isEnabled]);
}

function buildPageName(pathname: string): string {
  return pathname
    .replace(/\/namespaces\/[^/]+/g, '/namespaces/{namespace}')
    .replace(
      /\/(pods|deployments|services|configmaps|secrets)\/[^/]+/g,
      '/$1/{name}',
    );
}
