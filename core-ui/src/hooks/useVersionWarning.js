import { useEffect } from 'react';
import { useMicrofrontendContext } from 'shared/contexts/MicrofrontendContext';
import { useFeature } from 'shared/hooks/useFeature';
import * as Sentry from '@sentry/react';

export function useVersionWarning({ resourceUrl, resourceType }) {
  const { groupVersions } = useMicrofrontendContext();
  const { isEnabled: isTrackingEnabled } = useFeature('SENTRY');

  console.log(resourceType);

  useEffect(() => {
    if (!isTrackingEnabled) return;

    if (resourceType === 'HorizontalPodAutoscalers') {
      // we don't talk about HPAs
      // unless it's https://github.com/kyma-project/busola/issues/1566
      return;
    }

    if (resourceUrl.startsWith('/api/v1')) return; // ignore core API group

    const urlSegments = resourceUrl.split('/'); // `/apis/<group>/<version>/...rest`
    const group = urlSegments[2];
    const version = urlSegments[3];

    const preferredVersion = groupVersions.find(gV => gV.name === group)
      ?.preferredVersion.version;

    console.log(version, preferredVersion);
    if (version !== preferredVersion) {
      Sentry.captureMessage(
        `Unexpected version of ${resourceType}: expected ${preferredVersion}, got ${version}.`,
        Sentry.Severity.Info,
      );
    }
  }, [groupVersions, resourceUrl, resourceType, isTrackingEnabled]);
}
