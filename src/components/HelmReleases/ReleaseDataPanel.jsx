import { ReadableCreationTimestamp } from 'shared/components/ReadableCreationTimestamp/ReadableCreationTimestamp';
import { LayoutPanelRow } from 'shared/components/LayoutPanelRow/LayoutPanelRow';
import { useTranslation } from 'react-i18next';
import { useUrl } from 'hooks/useUrl';
import { UI5Panel } from 'shared/components/UI5Panel/UI5Panel';
import { Link } from 'shared/components/Link/Link';

export function ReleaseDataPanel({ release, secret }) {
  const { t } = useTranslation();
  const { namespaceUrl } = useUrl();

  const { chart, info } = release;

  return (
    <UI5Panel
      title={<>{t('helm-releases.headers.chart-information')}</>}
      accessibleName={t('helm-releases.accessible-name.chart-information')}
    >
      {secret?.metadata && (
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
      <LayoutPanelRow
        name={t('helm-releases.headers.chart-version')}
        value={chart.metadata.version}
      />
      <LayoutPanelRow
        name={t('helm-releases.headers.chart-name')}
        value={chart.metadata.name}
      />
      {chart.metadata.description && (
        <LayoutPanelRow
          name={t('helm-releases.headers.chart-description')}
          value={chart.metadata.description}
        />
      )}
      {chart.metadata.appVersion && (
        <LayoutPanelRow
          name={t('helm-releases.headers.app-version')}
          value={chart.metadata.appVersion}
        />
      )}
      {info.first_deployed && (
        <LayoutPanelRow
          name={t('helm-releases.headers.first-deployed')}
          value={<ReadableCreationTimestamp timestamp={info.first_deployed} />}
        />
      )}
      {info.last_deployed && (
        <LayoutPanelRow
          name={t('helm-releases.headers.last-deployed')}
          value={<ReadableCreationTimestamp timestamp={info.last_deployed} />}
        />
      )}
    </UI5Panel>
  );
}
