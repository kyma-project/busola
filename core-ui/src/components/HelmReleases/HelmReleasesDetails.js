import React from 'react';
import { useTranslation } from 'react-i18next';
import {
  PageHeader,
  useMicrofrontendContext,
  useGetList,
  Spinner,
  prettifyNameSingular,
  ResourceNotFound,
} from 'react-shared';
import { HelmReleaseData } from './HelmReleaseData';

export function HelmReleasesDetails({ releaseName }) {
  const { t, i18n } = useTranslation();
  const { namespaceId: namespace } = useMicrofrontendContext();
  const breadcrumbItems = [
    { name: t('helm-releases.title'), path: '/' },
    { name: '' },
  ];

  const { data, loading } = useGetList(s => s.type === 'helm.sh/release.v1')(
    `/api/v1/namespaces/${namespace}/secrets`,
  );

  if (loading) return <Spinner />;
  const releaseSecret = data?.find(r => r.metadata.name === releaseName);

  if (!releaseSecret) {
    return (
      <ResourceNotFound
        resource={prettifyNameSingular(undefined, t('helm-releases.title'))}
        breadcrumbs={breadcrumbItems}
        i18n={i18n}
      />
    );
  }

  return (
    <>
      <PageHeader title={releaseName} breadcrumbItems={breadcrumbItems} />
      <HelmReleaseData encodedRelease={releaseSecret.data.release} />
    </>
  );
}
