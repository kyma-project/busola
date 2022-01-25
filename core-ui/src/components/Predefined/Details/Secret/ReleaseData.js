import React from 'react';
import { LayoutPanel } from 'fundamental-react';
import { ReadableCreationTimestamp, StatusBadge } from 'react-shared';
import { LayoutPanelRow } from 'shared/components/LayoutPanelRow/LayoutPanelRow';
import { ReleaseStatus } from './ReleaseStatus';
import { useTranslation } from 'react-i18next';

export function ReleaseData({ release }) {
  const { t } = useTranslation();

  const { name, version, chart, info } = release;

  return (
    <LayoutPanel className="fd-margin--md">
      <LayoutPanel.Header>
        <LayoutPanel.Head title={t('secrets.helm.data-title', { name })} />
        <div className="fd-margin-begin--sm">
          <StatusBadge noTooltip type="info">
            {t('secrets.helm.release-version', { version })}
          </StatusBadge>
        </div>
        <div className="fd-margin-begin--tiny">
          <ReleaseStatus release={release} />
        </div>
      </LayoutPanel.Header>
      <LayoutPanel.Body>
        <LayoutPanelRow
          name={t('secrets.helm.chart-version')}
          value={chart.metadata.version}
        />
        <LayoutPanelRow
          name={t('secrets.helm.chart-name')}
          value={chart.metadata.name}
        />
        <LayoutPanelRow
          name={t('secrets.helm.chart-description')}
          value={chart.metadata.description}
        />
        <LayoutPanelRow
          name={t('secrets.helm.first-deployed')}
          value={<ReadableCreationTimestamp timestamp={info.first_deployed} />}
        />
        <LayoutPanelRow
          name={t('secrets.helm.last-deployed')}
          value={<ReadableCreationTimestamp timestamp={info.last_deployed} />}
        />
      </LayoutPanel.Body>
    </LayoutPanel>
  );
}
