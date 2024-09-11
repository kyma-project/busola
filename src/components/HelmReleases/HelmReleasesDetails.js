import { useTranslation } from 'react-i18next';
import { ResourceNotFound } from 'shared/components/ResourceNotFound/ResourceNotFound';
import { useGetList } from 'shared/hooks/BackendAPI/useGet';
import { prettifyNameSingular } from 'shared/utils/helpers';
import { Spinner } from 'shared/components/Spinner/Spinner';
import { HelmReleaseData } from './HelmReleaseData';
import { HelmReleaseStatus } from './HelmReleaseStatus';
import { OtherReleaseVersions } from './OtherReleaseVersions';
import { findRecentRelease } from './findRecentRelease';
import { ResourceCreate } from 'shared/components/ResourceCreate/ResourceCreate';
import { ResourceDescription } from 'components/HelmReleases';
import HelmReleasesYaml from './HelmReleasesYaml';
import { ErrorBoundary } from 'shared/components/ErrorBoundary/ErrorBoundary';
import { ResourceDetails } from 'shared/components/ResourceDetails/ResourceDetails';
import { decodeHelmRelease } from './decodeHelmRelease';
import { EventsList } from 'shared/components/EventsList';
import { filterByResource } from 'hooks/useMessageList';

function HelmReleasesDetails({ releaseName, namespace }) {
  const { t } = useTranslation();

  const resourceUrl =
    namespace === '-all-'
      ? `/api/v1/secrets?labelSelector=name==${releaseName}`
      : `/api/v1/namespaces/${namespace}/secrets?labelSelector=name==${releaseName}`;

  const { data, loading } = useGetList(s => s.type === 'helm.sh/release.v1')(
    resourceUrl,
  );

  if (loading) return <Spinner />;
  const releaseSecret = findRecentRelease(data || []);

  if (!releaseSecret) {
    return (
      <ResourceNotFound
        resource={prettifyNameSingular(undefined, t('helm-releases.title'))}
      />
    );
  }

  const release = decodeHelmRelease(releaseSecret.data.release);

  const customComponents = [
    () => <HelmReleaseData releaseSecret={releaseSecret} />,
    () => <OtherReleaseVersions releaseSecret={releaseSecret} secrets={data} />,
    () => (
      <EventsList
        key="events"
        namespace={namespace}
        filter={filterByResource('Secret', releaseSecret.metadata.name)}
        hideInvolvedObjects={true}
      />
    ),
  ];

  const customStatusColumns = [
    {
      header: t('helm-releases.headers.revision'),
      value: () => releaseSecret.metadata.labels.version,
    },
    {
      header: t('common.headers.description'),
      value: () => release.info.description,
    },
  ];

  const statusBadge = () => (
    <HelmReleaseStatus status={releaseSecret.metadata.labels.status} />
  );

  return (
    <>
      <ResourceDetails
        description={ResourceDescription}
        resourceType="HelmReleases"
        namespace={namespace}
        resourceName={releaseName}
        customTitle={releaseName}
        resourceUrl={resourceUrl}
        resource={releaseSecret}
        customStatusColumns={customStatusColumns}
        statusBadge={statusBadge}
        createResourceForm={() => (
          <ResourceCreate
            title={'HelmRelease'}
            isEdit={true}
            confirmText={t('common.buttons.save')}
            disableEdit={true}
            renderForm={props => (
              <ErrorBoundary>
                <HelmReleasesYaml
                  resource={releaseSecret}
                  editMode={true}
                  {...props}
                />
              </ErrorBoundary>
            )}
          />
        )}
        customComponents={customComponents}
        disableDelete
      />
    </>
  );
}

export default HelmReleasesDetails;
