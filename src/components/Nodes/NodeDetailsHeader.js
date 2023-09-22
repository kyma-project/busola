import React from 'react';
import { ReadableCreationTimestamp } from 'shared/components/ReadableCreationTimestamp/ReadableCreationTimestamp';
import { DynamicPageComponent } from 'shared/components/DynamicPageComponent/DynamicPageComponent';
import { useTranslation } from 'react-i18next';
import { EMPTY_TEXT_PLACEHOLDER } from 'shared/constants';
import { useUrl } from 'hooks/useUrl';

export function NodeDetailsHeader({ nodeName, node, loading, error, content }) {
  const { t } = useTranslation();
  const { clusterUrl } = useUrl();

  const breadcrumbs = [
    {
      name: t('node-details.name'),
      url: clusterUrl('overview'),
    },
    { name: '' },
  ];

  const internalIP = node?.status.addresses.find(a => a.type === 'InternalIP');
  const hostname = node?.status.addresses.find(a => a.type === 'Hostname');
  const region = node?.metadata?.labels?.['topology.kubernetes.io/region'];
  const zone = node?.metadata?.labels?.['topology.kubernetes.io/zone'];

  return (
    <DynamicPageComponent
      title={nodeName}
      breadcrumbItems={breadcrumbs}
      content={content}
    >
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
          <DynamicPageComponent.Column title={t('node-details.internal-ip')}>
            {internalIP.address}
          </DynamicPageComponent.Column>
          <DynamicPageComponent.Column title={t('common.labels.hostname')}>
            {hostname.address}
          </DynamicPageComponent.Column>
          <DynamicPageComponent.Column title={t('common.headers.region')}>
            {region ?? EMPTY_TEXT_PLACEHOLDER}
          </DynamicPageComponent.Column>
          <DynamicPageComponent.Column title={t('common.headers.zone')}>
            {zone ?? EMPTY_TEXT_PLACEHOLDER}
          </DynamicPageComponent.Column>
        </>
      )}
    </DynamicPageComponent>
  );
}
