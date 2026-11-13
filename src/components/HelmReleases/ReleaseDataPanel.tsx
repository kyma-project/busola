import { ReadableCreationTimestamp } from 'shared/components/ReadableCreationTimestamp/ReadableCreationTimestamp';
import { ResourceDetailsForm } from 'shared/components/ResourceDetails/ResourceDetailsForm';
import { ResourceDetailsFormItem } from 'shared/components/ResourceDetails/ResourceDetailsFormItem';
import { useTranslation } from 'react-i18next';
import { useUrl } from 'hooks/useUrl';
import { UI5Card } from 'shared/components/UI5Card/UI5Card';
import { Link } from 'shared/components/Link/Link';
import { Release } from './HelmReleaseData';

export function ReleaseDataPanel({
  release,
  secret,
}: {
  secret: Record<string, any>;
  release: Release;
}) {
  const { t } = useTranslation();
  const { namespaceUrl } = useUrl();

  const { chart, info } = release;

  return (
    <UI5Card
      title={t('helm-releases.headers.chart-information')}
      accessibleName={t('helm-releases.accessible-name.chart-information')}
      keyComponent="chart-information"
    >
      <ResourceDetailsForm>
        {secret?.metadata && (
          <ResourceDetailsFormItem
            label={t('secrets.name_singular')}
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
        <ResourceDetailsFormItem
          label={t('helm-releases.headers.chart-version')}
          value={chart?.metadata?.version}
        />
        <ResourceDetailsFormItem
          label={t('helm-releases.headers.chart-name')}
          value={chart?.metadata?.name}
        />
        {chart?.metadata?.description && (
          <ResourceDetailsFormItem
            label={t('helm-releases.headers.chart-description')}
            value={chart.metadata.description}
          />
        )}
        {chart?.metadata?.appVersion && (
          <ResourceDetailsFormItem
            label={t('helm-releases.headers.app-version')}
            value={chart?.metadata?.appVersion}
          />
        )}
        {info.first_deployed && (
          <ResourceDetailsFormItem
            label={t('helm-releases.headers.first-deployed')}
            value={
              <ReadableCreationTimestamp timestamp={info.first_deployed} />
            }
          />
        )}
        {info.last_deployed && (
          <ResourceDetailsFormItem
            label={t('helm-releases.headers.last-deployed')}
            value={<ReadableCreationTimestamp timestamp={info.last_deployed} />}
          />
        )}
      </ResourceDetailsForm>
    </UI5Card>
  );
}
