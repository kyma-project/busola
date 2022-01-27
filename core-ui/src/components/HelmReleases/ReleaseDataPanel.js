import React from 'react';
import { LayoutPanel } from 'fundamental-react';
import { ReadableCreationTimestamp, StatusBadge } from 'react-shared';
import { LayoutPanelRow } from 'shared/components/LayoutPanelRow/LayoutPanelRow';
import { HelmReleaseStatus } from 'components/HelmReleases/HelmReleaseStatus';
import { useTranslation } from 'react-i18next';

export function ReleaseDataPanel({ release }) {
  const { t } = useTranslation();

  const { name, version, chart, info } = release;

  return (
    <LayoutPanel className="fd-margin--md">
      <LayoutPanel.Header>
        <LayoutPanel.Head title={t('helm-releases.data-title', { name })} />
        <div className="fd-margin-begin--sm">
          <StatusBadge noTooltip type="info">
            {t('helm-releases.release-version', { version })}
          </StatusBadge>
        </div>
        <div className="fd-margin-begin--tiny">
          <HelmReleaseStatus release={release} />
        </div>
      </LayoutPanel.Header>
      <LayoutPanel.Body>
        <LayoutPanelRow
          name={t('helm-releases.chart-version')}
          value={chart.metadata.version}
        />
        <LayoutPanelRow
          name={t('helm-releases.chart-name')}
          value={chart.metadata.name}
        />
        <LayoutPanelRow
          name={t('helm-releases.chart-description')}
          value={chart.metadata.description}
        />
        <LayoutPanelRow
          name={t('helm-releases.first-deployed')}
          value={<ReadableCreationTimestamp timestamp={info.first_deployed} />}
        />
        <LayoutPanelRow
          name={t('helm-releases.last-deployed')}
          value={<ReadableCreationTimestamp timestamp={info.last_deployed} />}
        />
      </LayoutPanel.Body>
    </LayoutPanel>
  );
}
