import React from 'react';
import { decodeHelmRelease } from './decodeHelmRelease';
import { ReadonlyEditorPanel } from 'shared/components/ReadonlyEditorPanel';
import { ReleaseData } from './ReleaseData';
import { ChartContent } from './ChartContent';
import { useTranslation } from 'react-i18next';
import jsyaml from 'js-yaml';

export function HelmReleaseData(secret) {
  const { t } = useTranslation();

  if (secret.type !== 'helm.sh/release.v1') {
    return null;
  }
  const release = decodeHelmRelease(secret.data.release);
  if (!release) {
    return null;
  }

  return (
    <React.Fragment key="helm-release-data">
      <ReleaseData release={release} />
      <ReadonlyEditorPanel
        title={t('secrets.helm.release-config')}
        value={jsyaml.dump(release.config)}
      />
      <ChartContent chart={release.chart} />
    </React.Fragment>
  );
}
