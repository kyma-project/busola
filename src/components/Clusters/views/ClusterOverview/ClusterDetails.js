import { useTranslation } from 'react-i18next';
import { ClusterStorageType } from '../ClusterStorageType';
import { useGetGardenerProvider } from './useGetGardenerProvider';
import { useGetVersions } from './useGetVersions';
import { useFeature } from 'hooks/useFeature';
import { DynamicPageComponent } from 'shared/components/DynamicPageComponent/DynamicPageComponent';
import ResourceDetailsCard from 'shared/components/ResourceDetails/ResourceDetailsCard';
import { Button, Text } from '@ui5/webcomponents-react';
import { CountingCard } from 'shared/components/CountingCard/CountingCard';
import { useKymaModulesQuery } from 'components/KymaModules/KymaModulesQuery';
import { useUrl } from 'hooks/useUrl';
import { useNavigate } from 'react-router-dom';

const GardenerProvider = () => {
  const { t } = useTranslation();
  const showGardenerMetadata = useFeature('SHOW_GARDENER_METADATA')?.isEnabled;

  const provider = useGetGardenerProvider({
    skip: !showGardenerMetadata,
  });

  if (!showGardenerMetadata) return null;
  if (!provider) return null;

  return (
    <DynamicPageComponent.Column title={t('gardener.headers.provider')}>
      <p className="gardener-provider">{provider}</p>
    </DynamicPageComponent.Column>
  );
};

export default function ClusterDetails({ currentCluster }) {
  const { t } = useTranslation();
  const { loading, kymaVersion, k8sVersion } = useGetVersions();
  const config = currentCluster?.config;
  const { modules, error, loading: loadingModules } = useKymaModulesQuery();
  const { clusterUrl } = useUrl();
  const navigate = useNavigate();

  return (
    <div className="resource-details-container">
      <ResourceDetailsCard
        titleText={t('cluster-overview.headers.metadata')}
        wrapperClassname="cluster-overview__details-wrapper"
        content={
          <>
            {!loading && k8sVersion && (
              <DynamicPageComponent.Column
                title={t('clusters.overview.kubernetes-version')}
              >
                {k8sVersion}
              </DynamicPageComponent.Column>
            )}
            {!loading && kymaVersion && (
              <DynamicPageComponent.Column
                title={t('clusters.overview.kyma-version')}
              >
                {kymaVersion}
              </DynamicPageComponent.Column>
            )}
            <DynamicPageComponent.Column title={t('clusters.storage.title')}>
              <ClusterStorageType clusterConfig={config} />
            </DynamicPageComponent.Column>
            <DynamicPageComponent.Column
              title={t('clusters.common.api-server-address')}
            >
              <Text>
                {currentCluster?.currentContext?.cluster?.cluster?.server}
              </Text>
            </DynamicPageComponent.Column>
            <GardenerProvider />
          </>
        }
      />
      {!error && !loadingModules && modules && (
        <div className="item-wrapper small">
          <CountingCard
            className="item"
            value={modules?.length}
            title={'Installed Modules'}
            additionalContent={
              <Button
                design="Emphasized"
                onClick={() => navigate(clusterUrl('kymamodules'))}
              >
                {t('kyma-modules.modify-modules')}
              </Button>
            }
          />
        </div>
      )}
    </div>
  );
}
