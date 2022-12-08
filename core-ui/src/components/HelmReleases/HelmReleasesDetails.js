import React from 'react';
import { useTranslation } from 'react-i18next';
import { ResourceNotFound } from 'shared/components/ResourceNotFound/ResourceNotFound';
import { useGetList } from 'shared/hooks/BackendAPI/useGet';
import { prettifyNameSingular } from 'shared/utils/helpers';
import { Spinner } from 'shared/components/Spinner/Spinner';
import { PageHeader } from 'shared/components/PageHeader/PageHeader';
import { HelmReleaseData } from './HelmReleaseData';
import { Link } from 'react-router-dom';
import { HelmReleaseStatus } from './HelmReleaseStatus';
import { OtherReleaseVersions } from './OtherReleaseVersions';
import { findRecentRelease } from './findRecentRelease';
import { useRecoilValue } from 'recoil';
import { activeNamespaceIdState } from 'state/activeNamespaceIdAtom';
import { useUrl } from 'hooks/useUrl';

function HelmReleasesDetails({ releaseName }) {
  const { t } = useTranslation();
  const { namespaceUrl } = useUrl();

  const namespace = useRecoilValue(activeNamespaceIdState);
  const breadcrumbItems = [
    { name: t('helm-releases.title'), path: '/' },
    { name: '' },
  ];

  const { data, loading } = useGetList(s => s.type === 'helm.sh/release.v1')(
    `/api/v1/namespaces/${namespace}/secrets?labelSelector=name==${releaseName}`,
  );

  if (loading) return <Spinner />;
  const releaseSecret = findRecentRelease(data || []);

  if (!releaseSecret) {
    return (
      <ResourceNotFound
        resource={prettifyNameSingular(undefined, t('helm-releases.title'))}
        breadcrumbs={breadcrumbItems}
      />
    );
  }

  return (
    <>
      <PageHeader title={releaseName} breadcrumbItems={breadcrumbItems}>
        {releaseSecret && (
          <>
            <PageHeader.Column title={t('secrets.name_singular')}>
              <Link
                className="fd-link"
                to={namespaceUrl(`secrets/${releaseSecret.metadata.name}`)}
              >
                {releaseSecret.metadata.name}
              </Link>
            </PageHeader.Column>
            <PageHeader.Column title={t('helm-releases.headers.revision')}>
              {releaseSecret.metadata.labels.version}
            </PageHeader.Column>
            <PageHeader.Column title={t('common.headers.status')}>
              <HelmReleaseStatus
                status={releaseSecret.metadata.labels.status}
              />
            </PageHeader.Column>
          </>
        )}
      </PageHeader>
      <HelmReleaseData
        encodedRelease={releaseSecret.data.release}
        simpleHeader
      />
      <OtherReleaseVersions releaseSecret={releaseSecret} secrets={data} />
    </>
  );
}
export default HelmReleasesDetails;
