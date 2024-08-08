import { ReadableCreationTimestamp } from 'shared/components/ReadableCreationTimestamp/ReadableCreationTimestamp';
import { DynamicPageComponent } from 'shared/components/DynamicPageComponent/DynamicPageComponent';
import { useTranslation } from 'react-i18next';
import { EMPTY_TEXT_PLACEHOLDER } from 'shared/constants';
import ResourceDetailsCard from 'shared/components/ResourceDetails/ResourceDetailsCard';

export function NodeDetailsCard({ node, loading, error }) {
  const { t } = useTranslation();

  const internalIP = node?.status.addresses.find(a => a.type === 'InternalIP');
  const hostname = node?.status.addresses.find(a => a.type === 'Hostname');
  const region = node?.metadata?.labels?.['topology.kubernetes.io/region'];
  const zone = node?.metadata?.labels?.['topology.kubernetes.io/zone'];

  return (
    <ResourceDetailsCard
      wrapperClassname="resource-overview__details-wrapper"
      titleText={t('cluster-overview.headers.metadata')}
      content={
        <>
          {loading && t('common.headers.loading')}
          {error && error.message}
          {node && (
            <>
              <DynamicPageComponent.Column title={t('common.headers.created')}>
                <ReadableCreationTimestamp
                  timestamp={node.metadata.creationTimestamp}
                />
              </DynamicPageComponent.Column>
              <DynamicPageComponent.Column title={t('node-details.pod-cidr')}>
                {node.spec.podCIDR}
              </DynamicPageComponent.Column>
              <DynamicPageComponent.Column
                title={t('node-details.internal-ip')}
              >
                {internalIP?.address ?? EMPTY_TEXT_PLACEHOLDER}
              </DynamicPageComponent.Column>
              <DynamicPageComponent.Column title={t('common.labels.hostname')}>
                {hostname?.address ?? EMPTY_TEXT_PLACEHOLDER}
              </DynamicPageComponent.Column>
              <DynamicPageComponent.Column title={t('common.headers.region')}>
                {region ?? EMPTY_TEXT_PLACEHOLDER}
              </DynamicPageComponent.Column>
              <DynamicPageComponent.Column title={t('common.headers.zone')}>
                {zone ?? EMPTY_TEXT_PLACEHOLDER}
              </DynamicPageComponent.Column>
            </>
          )}
        </>
      }
    ></ResourceDetailsCard>
  );
}
