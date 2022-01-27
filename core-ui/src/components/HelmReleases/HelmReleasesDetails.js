import React from 'react';
import { useTranslation } from 'react-i18next';
import { PageHeader, useMicrofrontendContext, useGetList } from 'react-shared';

export function HelmReleasesDetails({ releaseName }) {
  const { t } = useTranslation();
  const { namespaceId: namespace } = useMicrofrontendContext();

  const { data, loading, error } = useGetList(
    s => s.type === 'helm.sh/release.v1',
  )(`/api/v1/namespaces/${namespace}/secrets`);

  const release = data?.find(r => r.metadata.name === releaseName);
  console.log(release);

  return (
    <>
      <PageHeader
        title={releaseName}
        breadcrumbItems={[{ name: 'Helm Releases', path: '/' }, { name: '' }]}
      />
    </>
  );
}
