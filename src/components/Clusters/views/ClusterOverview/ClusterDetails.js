import { useTranslation } from 'react-i18next';
import { ClusterStorageType } from '../ClusterStorageType';
import { useGetGardenerProvider } from './useGetGardenerProvider';
import { useGetVersions } from './useGetVersions';
import { useFeature } from 'hooks/useFeature';
import { DynamicPageComponent } from 'shared/components/DynamicPageComponent/DynamicPageComponent';
import ResourceDetailsCard from 'shared/components/ResourceDetails/ResourceDetailsCard';
import { Text } from '@ui5/webcomponents-react';
import ClusterModulesCard from './ClusterModulesCard';
import { useRecoilValue } from 'recoil';
import { kymaResourcesAtom } from '../../../../state/kymaResourcesAtom';
import { useKymaQuery } from '../../../KymaModules/kymaModulesQueries';
import { useMemo } from 'react';

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
  const kymaResources = useRecoilValue(kymaResourcesAtom);
  const config = currentCluster?.config;
  const kymaResourceLabels = useMemo(
    () =>
      kymaResources?.items.find(kymaResource => kymaResource?.status)?.metadata
        .labels || kymaResources?.items[0]?.metadata?.labels,
    [kymaResources],
  );

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
            {kymaResourceLabels && (
              <>
                <DynamicPageComponent.Column
                  title={t('clusters.overview.global-account-id')}
                >
                  {kymaResourceLabels['kyma-project.io/global-account-id']}
                </DynamicPageComponent.Column>
                <DynamicPageComponent.Column
                  title={t('clusters.overview.subaccount-id')}
                >
                  {kymaResourceLabels['kyma-project.io/subaccount-id']}
                </DynamicPageComponent.Column>
              </>
            )}
          </>
        }
      />
      <ClusterModulesCard />
    </div>
  );
}
