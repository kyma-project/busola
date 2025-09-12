import { apiGroupAtom } from 'state/discoverability/apiGroupsAtom';
import { useEffect } from 'react';
import { useFeature } from 'hooks/useFeature';
import * as Sentry from '@sentry/react';
import { useAtomValue } from 'jotai';
import { configFeaturesNames } from 'state/types';

export function useVersionWarning({
  resourceUrl,
  resourceType,
}: {
  resourceUrl: string;
  resourceType: string;
}) {
  const apiGroups = useAtomValue(apiGroupAtom);
  const { isEnabled: isTrackingEnabled } = useFeature(
    configFeaturesNames.SENTRY,
  );

  useEffect(() => {
    if (!isTrackingEnabled) return;

    if (resourceUrl.startsWith('/api/v1')) return; // ignore core API group

    const urlSegments = resourceUrl.split('/'); // `/apis/<group>/<version>/...rest`
    const group = urlSegments[2];
    const version = urlSegments[3];

    const preferredVersion = (apiGroups || []).find((gV) => gV.name === group)
      ?.preferredVersion.version;

    if (preferredVersion && version !== preferredVersion) {
      Sentry.captureMessage(
        `Unexpected version of ${resourceType}: expected ${preferredVersion}, got ${version}.`,
      );
    }
  }, [apiGroups, isTrackingEnabled, resourceType, resourceUrl]);
}
