import React from 'react';
import { decodeHelmRelease } from 'components/HelmReleases/decodeHelmRelease';
import { ReadonlyEditorPanel } from 'shared/components/ReadonlyEditorPanel';
import { ReleaseDataPanel } from './ReleaseDataPanel';
import { ChartContent } from './ChartContent';
import { useTranslation } from 'react-i18next';
import jsyaml from 'js-yaml';
import { LayoutPanel } from 'fundamental-react';

export function HelmReleaseData({ encodedRelease }) {
  const { t } = useTranslation();

  const release = decodeHelmRelease(encodedRelease);

  if (!release) {
    return (
      <LayoutPanel className="fd-has-padding-regular fd-margin--md">
        {t('helm-releases.messages.cannot-decode')}
      </LayoutPanel>
    );
  }

  return (
    <React.Fragment key="helm-release-data">
      <ReleaseDataPanel release={release} />
      <ReadonlyEditorPanel
        title={t('helm-releases.release-config')}
        value={jsyaml.dump(release.config)}
      />
      <ChartContent chart={release.chart} />
    </React.Fragment>
  );
}
