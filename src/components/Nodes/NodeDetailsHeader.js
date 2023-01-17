import React from 'react';
import { ReadableCreationTimestamp } from 'shared/components/ReadableCreationTimestamp/ReadableCreationTimestamp';
import { PageHeader } from 'shared/components/PageHeader/PageHeader';
import { useTranslation } from 'react-i18next';
import { EMPTY_TEXT_PLACEHOLDER } from 'shared/constants';
import { useUrl } from 'hooks/useUrl';

export function NodeDetailsHeader({ nodeName, node, loading, error }) {
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
    <PageHeader title={nodeName} breadcrumbItems={breadcrumbs}>
      {loading && t('common.headers.loading')}
      {error && error.message}
      {node && (
        <>
          <PageHeader.Column title={t('common.headers.created')}>
            <ReadableCreationTimestamp
              timestamp={node.metadata.creationTimestamp}
            />
          </PageHeader.Column>
          <PageHeader.Column title={t('node-details.pod-cidr')}>
            {node.spec.podCIDR}
          </PageHeader.Column>
          <PageHeader.Column title={t('node-details.internal-ip')}>
            {internalIP.address}
          </PageHeader.Column>
          <PageHeader.Column title={t('common.labels.hostname')}>
            {hostname.address}
          </PageHeader.Column>
          <PageHeader.Column title={t('common.headers.region')}>
            {region ?? EMPTY_TEXT_PLACEHOLDER}
          </PageHeader.Column>
          <PageHeader.Column title={t('common.headers.zone')}>
            {zone ?? EMPTY_TEXT_PLACEHOLDER}
          </PageHeader.Column>
        </>
      )}
    </PageHeader>
  );
}
