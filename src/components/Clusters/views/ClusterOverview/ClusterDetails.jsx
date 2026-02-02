import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useAtomValue } from 'jotai';

import { useGetGardenerProvider } from './useGetGardenerProvider';
import { useGetVersions } from './useGetVersions';
import { kymaResourcesAtom } from 'state/kymaResourcesAtom';

import { Text, Title } from '@ui5/webcomponents-react';
import { DynamicPageComponent } from 'shared/components/DynamicPageComponent/DynamicPageComponent';
import ResourceDetailsCard from 'shared/components/ResourceDetails/ResourceDetailsCard';
import ClusterModulesCard from './ClusterModulesCard';
import { ClusterStorageType } from '../ClusterStorageType';
import { CommunityModuleContextProvider } from 'components/Modules/community/providers/CommunityModuleProvider';
import { ModuleTemplatesContextProvider } from 'components/Modules/providers/ModuleTemplatesProvider';
import { useGetEnvironmentParameters } from './useGetEnvironmentParameters';
import { Tokens } from 'shared/components/Tokens';

const GardenerProvider = () => {
  const { t } = useTranslation();
  const provider = useGetGardenerProvider();

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
  const kymaResources = useAtomValue(kymaResourcesAtom);
  const config = currentCluster?.config;
  const kymaResourceLabels = useMemo(
    () =>
      kymaResources?.items.find((kymaResource) => kymaResource?.status)
        ?.metadata.labels || kymaResources?.items[0]?.metadata?.labels,
    [kymaResources],
  );
  const { natGatewayIps, environmentParametersLoading } =
    useGetEnvironmentParameters();

  return (
    <section aria-labelledby="cluster-details-heading">
      <Title
        level="H3"
        size="H3"
        className="sap-margin-top-small sap-margin-bottom-medium"
        id="cluster-details-heading"
      >
        {t('cluster-overview.headers.cluster-overview')}
      </Title>
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
              {!!kymaResourceLabels?.['kyma-project.io/global-account-id'] && (
                <DynamicPageComponent.Column
                  title={t('clusters.overview.global-account-id')}
                >
                  {kymaResourceLabels['kyma-project.io/global-account-id']}
                </DynamicPageComponent.Column>
              )}
              {!!kymaResourceLabels?.['kyma-project.io/subaccount-id'] && (
                <DynamicPageComponent.Column
                  title={t('clusters.overview.subaccount-id')}
                >
                  {kymaResourceLabels['kyma-project.io/subaccount-id']}
                </DynamicPageComponent.Column>
              )}
              {!environmentParametersLoading && !!natGatewayIps && (
                <DynamicPageComponent.Column
                  title={t('clusters.overview.nat-gateway-ips')}
                >
                  <Tokens tokens={natGatewayIps} />
                </DynamicPageComponent.Column>
              )}
            </>
          }
        />
        <ModuleTemplatesContextProvider>
          <CommunityModuleContextProvider>
            <ClusterModulesCard />
          </CommunityModuleContextProvider>
        </ModuleTemplatesContextProvider>
      </div>
    </section>
  );
}
