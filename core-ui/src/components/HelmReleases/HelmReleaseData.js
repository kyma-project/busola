import React from 'react';
import { decodeHelmRelease } from 'components/HelmReleases/decodeHelmRelease';
import { ReadonlyEditorPanel } from 'shared/components/ReadonlyEditorPanel';
import { ReleaseDataPanel } from './ReleaseDataPanel';
import { ChartContent } from './ChartContent';
import { useTranslation } from 'react-i18next';
import jsyaml from 'js-yaml';
import { LayoutPanel } from 'fundamental-react';

export function HelmReleaseData({ encodedRelease, simpleHeader }) {
  const { t } = useTranslation();

  const release = decodeHelmRelease(encodedRelease);

  if (!release) {
    return (
      <LayoutPanel
        key="helm-release-data"
        className="fd-has-padding-regular fd-margin--md"
      >
        {t('helm-releases.messages.cannot-decode')}
      </LayoutPanel>
    );
  }

  return (
    <React.Fragment key="helm-release-data">
      <ReleaseDataPanel release={release} simpleHeader={simpleHeader} />
      <ReadonlyEditorPanel
        title={t('helm-releases.release-data')}
        value={jsyaml.dump(release.config)}
      />
      <ChartContent chart={release.chart} />
    </React.Fragment>
  );
}
