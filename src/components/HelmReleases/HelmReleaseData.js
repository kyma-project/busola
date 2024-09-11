import React from 'react';
import { ReadonlyEditorPanel } from 'shared/components/ReadonlyEditorPanel';
import { ReleaseDataPanel } from './ReleaseDataPanel';
import { ChartContent } from './ChartContent';
import { useTranslation } from 'react-i18next';
import jsyaml from 'js-yaml';
import { UI5Panel } from 'shared/components/UI5Panel/UI5Panel';

export function HelmReleaseData({ releaseSecret, release }) {
  const { t } = useTranslation();

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
      <ReleaseDataPanel release={release} secret={releaseSecret} />
      <ChartContent chart={release.chart} />
      <ReadonlyEditorPanel
        title={t('helm-releases.headers.release-manifest')}
        value={jsyaml.dump(release.manifest)}
      />
    </React.Fragment>
  );
}
