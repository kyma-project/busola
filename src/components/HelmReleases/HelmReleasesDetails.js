import { useTranslation } from 'react-i18next';
import { ResourceNotFound } from 'shared/components/ResourceNotFound/ResourceNotFound';
import { useGetList } from 'shared/hooks/BackendAPI/useGet';
import { prettifyNameSingular } from 'shared/utils/helpers';
import { Spinner } from 'shared/components/Spinner/Spinner';
import { DynamicPageComponent } from 'shared/components/DynamicPageComponent/DynamicPageComponent';
import { HelmReleaseData } from './HelmReleaseData';
import { Link } from 'react-router-dom';
import { HelmReleaseStatus } from './HelmReleaseStatus';
import { OtherReleaseVersions } from './OtherReleaseVersions';
import { findRecentRelease } from './findRecentRelease';
import { ResourceCreate } from 'shared/components/ResourceCreate/ResourceCreate';
import { useUrl } from 'hooks/useUrl';
import YamlUploadDialog from 'resources/Namespaces/YamlUpload/YamlUploadDialog';
import { ResourceDescription } from 'components/HelmReleases';
import HelmReleasesYaml from './HelmReleasesYaml';
import { ErrorBoundary } from 'shared/components/ErrorBoundary/ErrorBoundary';
import { showYamlTab } from './index';

function HelmReleasesDetails({ releaseName, namespace }) {
  const { t } = useTranslation();
  const { namespaceUrl } = useUrl();

  const { data, loading } = useGetList(s => s.type === 'helm.sh/release.v1')(
    `/api/v1/namespaces/${namespace}/secrets?labelSelector=name==${releaseName}`,
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

  return (
    <>
      <DynamicPageComponent
        title={releaseName}
        description={ResourceDescription}
        showYamlTab={showYamlTab}
        inlineEditForm={() => (
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
        content={
          <>
            <HelmReleaseData
              encodedRelease={releaseSecret.data.release}
              simpleHeader
            />
            <OtherReleaseVersions
              releaseSecret={releaseSecret}
              secrets={data}
            />
          </>
        }
      >
        {releaseSecret && (
          <>
            <DynamicPageComponent.Column title={t('secrets.name_singular')}>
              <Link
                className="bsl-link"
                to={namespaceUrl(`secrets/${releaseSecret.metadata.name}`)}
              >
                {releaseSecret.metadata.name}
              </Link>
            </DynamicPageComponent.Column>
            <DynamicPageComponent.Column
              title={t('helm-releases.headers.revision')}
            >
              {releaseSecret.metadata.labels.version}
            </DynamicPageComponent.Column>
            <DynamicPageComponent.Column title={t('common.headers.status')}>
              <HelmReleaseStatus
                status={releaseSecret.metadata.labels.status}
              />
            </DynamicPageComponent.Column>
          </>
        )}
        <YamlUploadDialog />
      </DynamicPageComponent>
    </>
  );
}

export default HelmReleasesDetails;
