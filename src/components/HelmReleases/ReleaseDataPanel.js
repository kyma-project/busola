import React from 'react';
import { StatusBadge } from 'shared/components/StatusBadge/StatusBadge';
import { ReadableCreationTimestamp } from 'shared/components/ReadableCreationTimestamp/ReadableCreationTimestamp';
import { LayoutPanelRow } from 'shared/components/LayoutPanelRow/LayoutPanelRow';
import { HelmReleaseStatus } from 'components/HelmReleases/HelmReleaseStatus';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import './HelmReleaseDataPanel.scss';
import { useUrl } from 'hooks/useUrl';
import { Panel, Title, Toolbar } from '@ui5/webcomponents-react';

export function ReleaseDataPanel({ release, simpleHeader }) {
  const { t } = useTranslation();
  const { namespaceUrl } = useUrl();

  const { name, version, chart, info } = release;

  return (
    <Panel
      fixed
      className="fd-margin--md"
      header={
        simpleHeader ? (
          <Toolbar>
            <Title level="H5">{t('helm-releases.headers.release-data')}</Title>
          </Toolbar>
        ) : (
          <Toolbar>
            <Link
              className="fd-link release-link"
              to={namespaceUrl(`helm-releases/${name}`)}
            >
              {name}
            </Link>
            <div className="fd-margin-begin--sm">
              <StatusBadge noTooltip type="info">
                {t('helm-releases.headers.release-version', { version })}
              </StatusBadge>
            </div>
            <div className="fd-margin-begin--tiny">
              <HelmReleaseStatus status={release.info.status} />
            </div>
          </Toolbar>
        )
      }
    >
      <LayoutPanelRow
        name={t('helm-releases.headers.chart-version')}
        value={chart.metadata.version}
      />
      <LayoutPanelRow
        name={t('helm-releases.headers.chart-name')}
        value={chart.metadata.name}
      />
      <LayoutPanelRow
        name={t('helm-releases.headers.chart-description')}
        value={chart.metadata.description}
      />
      <LayoutPanelRow
        name={t('helm-releases.headers.first-deployed')}
        value={<ReadableCreationTimestamp timestamp={info.first_deployed} />}
      />
      <LayoutPanelRow
        name={t('helm-releases.headers.last-deployed')}
        value={<ReadableCreationTimestamp timestamp={info.last_deployed} />}
      />
    </Panel>
  );
}
