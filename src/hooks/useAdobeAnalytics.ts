import { useEffect } from 'react';
import { useFeature } from './useFeature';
import { configFeaturesNames } from 'state/types';

export function useAdobeAnalytics() {
  const feature = useFeature(configFeaturesNames.ADOBE_ANALYTICS);

  useEffect(() => {
    if (!feature?.isEnabled || !feature?.config?.embedUrl) return;
    const script = document.createElement('script');
    script.src = feature.config.embedUrl;
    script.async = true;
    document.head.appendChild(script);
  }, [feature]);
}
