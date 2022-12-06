import { apiGroupState } from './../state/discoverability/apiGroupsSelector';
import { useEffect } from 'react';
import { useFeature } from 'hooks/useFeature';
import * as Sentry from '@sentry/react';
import { useRecoilValue } from 'recoil';

export function useVersionWarning({
  resourceUrl,
  resourceType,
}: {
  resourceUrl: string;
  resourceType: string;
}) {
  const apiGroups = useRecoilValue(apiGroupState);
  const { isEnabled: isTrackingEnabled } = useFeature('SENTRY');

  useEffect(() => {
    if (!isTrackingEnabled) return;

    if (resourceType.toLowerCase() === 'horizontalpodautoscalers') {
      // we don't talk about HPAs

      // unless it's https://github.com/kyma-project/busola/issues/1566
      return;
    }

    if (resourceUrl.startsWith('/api/v1')) return; // ignore core API group

    const urlSegments = resourceUrl.split('/'); // `/apis/<group>/<version>/...rest`
    const group = urlSegments[2];
    const version = urlSegments[3];

    const preferredVersion = (apiGroups || []).find(gV => gV.name === group)
      ?.preferredVersion.version;

    if (preferredVersion && version !== preferredVersion) {
      Sentry.captureMessage(
        `Unexpected version of ${resourceType}: expected ${preferredVersion}, got ${version}.`,
        Sentry.Severity.Info,
      );
    }
  }, [apiGroups, isTrackingEnabled, resourceType, resourceUrl]);
}
