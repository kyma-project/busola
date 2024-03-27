import React from 'react';
import { decodeHelmRelease } from 'components/HelmReleases/decodeHelmRelease';
import { ReadonlyEditorPanel } from 'shared/components/ReadonlyEditorPanel';
import { ReleaseDataPanel } from './ReleaseDataPanel';
import { ChartContent } from './ChartContent';
import { useTranslation } from 'react-i18next';
import jsyaml from 'js-yaml';
import { UI5Panel } from 'shared/components/UI5Panel/UI5Panel';

export function HelmReleaseData({ encodedRelease }) {
  const { t } = useTranslation();

  const release = decodeHelmRelease(encodedRelease);

  if (!release) {
    return (
      <UI5Panel
        title={t('helm-releases.messages.cannot-decode')}
        keyComponent="helm-release-data"
      />
    );
  }

  return (
    <React.Fragment key="helm-release-data">
      <ReleaseDataPanel release={release} />
      <ReadonlyEditorPanel
        title={t('helm-releases.headers.release-data')}
        value={jsyaml.dump(release.config)}
      />
      <ChartContent chart={release.chart} />
    </React.Fragment>
  );
}
