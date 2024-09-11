import { StatusBadge } from 'shared/components/StatusBadge/StatusBadge';
import { ReadableCreationTimestamp } from 'shared/components/ReadableCreationTimestamp/ReadableCreationTimestamp';
import { LayoutPanelRow } from 'shared/components/LayoutPanelRow/LayoutPanelRow';
import { HelmReleaseStatus } from 'components/HelmReleases/HelmReleaseStatus';
import { useTranslation } from 'react-i18next';
import { useUrl } from 'hooks/useUrl';
import { UI5Panel } from 'shared/components/UI5Panel/UI5Panel';

import './HelmReleaseDataPanel.scss';
import { spacing } from '@ui5/webcomponents-react-base';
import { Link } from 'shared/components/Link/Link';

export function ReleaseDataPanel({ release, secret }) {
  const { t } = useTranslation();
  const { namespaceUrl } = useUrl();

  const { name, version, chart, info } = release;
  console.log(release);
  return (
    <UI5Panel title={<>{'Chart Info'}</>}>
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
      {secret && (
        <LayoutPanelRow
          name={t('secrets.name_singular')}
          value={
            <Link
              url={namespaceUrl(`secrets/${secret.metadata.name}`, {
                namespace: secret.metadata.namespace,
              })}
            >
              {secret.metadata.name}
            </Link>
          }
        />
      )}
    </UI5Panel>
  );
}
