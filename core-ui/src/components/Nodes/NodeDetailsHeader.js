import React from 'react';
import { ReadableCreationTimestamp } from 'shared/components/ReadableCreationTimestamp/ReadableCreationTimestamp';
import { PageHeader } from 'shared/components/PageHeader/PageHeader';
import { useTranslation } from 'react-i18next';

export function NodeDetailsHeader({ nodeName, node, loading, error }) {
  const { t } = useTranslation();
  const breadcrumbs = [
    {
      name: t('node-details.name'),
      path: '/overview',
      fromContext: 'cluster',
    },
    { name: '' },
  ];

  console.log(node);
  const internalIP = node?.status.addresses.find(a => a.type === 'InternalIP');
  const hostname = node?.status.addresses.find(a => a.type === 'Hostname');
  const labels = Object.entries(node?.metadata?.labels || {});
  const [, region] = labels.find(([k, v]) => k.endsWith('region')) || [];
  const [, zone] = labels.find(([k, v]) => k.endsWith('zone')) || [];
  console.log(region, zone);

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
            {region}
          </PageHeader.Column>
          <PageHeader.Column title={t('common.headers.zone')}>
            {zone}
          </PageHeader.Column>
        </>
      )}
    </PageHeader>
  );
}
