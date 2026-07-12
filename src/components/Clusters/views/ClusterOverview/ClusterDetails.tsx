import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useAtomValue } from 'jotai';
import { unwrap } from 'jotai/utils';

import { useGetGardenerProvider } from './useGetGardenerProvider';
import { useGetVersions } from './useGetVersions';
import { kymaResourcesAtom } from 'state/kymaResourcesAtom';

import { FormItem, Text, Title, Label, Form } from '@ui5/webcomponents-react';
import ResourceDetailsCard from 'shared/components/ResourceDetails/ResourceDetailsCard';
import ClusterModulesCard from './ClusterModulesCard';
import { ClusterStorageType } from '../ClusterStorageType';
import { CommunityModuleContextProvider } from 'components/Modules/community/providers/CommunityModuleProvider';
import { ModuleTemplatesContextProvider } from 'components/Modules/providers/ModuleTemplatesProvider';
import { useGetEnvironmentParameters } from './useGetEnvironmentParameters';
import { Tokens } from 'shared/components/Tokens';
import { ActiveClusterState } from 'state/clusterAtom';
import { useFeature } from 'hooks/useFeature';
import { configFeaturesNames } from 'state/types';

import './ClusterOverview.scss';

const kymaResourcesAtomSync = unwrap(kymaResourcesAtom, (prev) => prev ?? null);

type KymaResourcesItem = {
  status?: string;
  metadata?: {
    labels?: {
      [key: string]: string;
    };
  };
};

const GardenerProvider = () => {
  const { t } = useTranslation();
  const provider = useGetGardenerProvider();

  if (!provider) return null;

  return (
    <FormItem
      labelContent={<Label showColon>{t('gardener.headers.provider')}</Label>}
    >
      <p className="gardener-provider">{provider}</p>
    </FormItem>
  );
};

export default function ClusterDetails({
  currentCluster,
}: {
  currentCluster: ActiveClusterState;
}) {
  const { t } = useTranslation();
  const { loading, kymaVersion, k8sVersion } = useGetVersions();
  const kymaResources = useAtomValue(kymaResourcesAtomSync);
  const config = currentCluster?.config;
  const kymaResourceLabels = useMemo(
    () =>
      kymaResources?.items.find(
        (kymaResource?: KymaResourcesItem) => kymaResource?.status,
      )?.metadata.labels || kymaResources?.items[0]?.metadata?.labels,
    [kymaResources],
  );
  const { natGatewayIps, environmentParametersLoading } =
    useGetEnvironmentParameters();
  const { isEnabled: isCommunityModulesEnabled } = useFeature(
    configFeaturesNames.COMMUNITY_MODULES,
  );

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
      <Form
        layout="S1 M2 L2 XL2"
        labelSpan="S12 M12 L12 XL12"
        className="form-without-background"
      >
        <ResourceDetailsCard
          titleText={t('cluster-overview.headers.metadata')}
          content={
            <>
              {!loading && k8sVersion && (
                <FormItem
                  labelContent={
                    <Label showColon>
                      {t('clusters.overview.kubernetes-version')}
                    </Label>
                  }
                >
                  <Text>{k8sVersion}</Text>
                </FormItem>
              )}
              {!loading && kymaVersion && (
                <FormItem
                  labelContent={
                    <Label showColon>
                      {t('clusters.overview.kyma-version')}
                    </Label>
                  }
                >
                  <Text>{kymaVersion}</Text>
                </FormItem>
              )}
              <FormItem
                labelContent={
                  <Label showColon>{t('clusters.storage.title')}</Label>
                }
              >
                <ClusterStorageType clusterConfig={config} />
              </FormItem>
              <FormItem
                labelContent={
                  <Label showColon>
                    {t('clusters.common.api-server-address')}
                  </Label>
                }
              >
                <Text>
                  {currentCluster?.currentContext?.cluster?.cluster?.server}
                </Text>
              </FormItem>
              <GardenerProvider />
              {!!kymaResourceLabels?.['kyma-project.io/global-account-id'] && (
                <FormItem
                  labelContent={
                    <Label showColon>
                      {t('clusters.overview.global-account-id')}
                    </Label>
                  }
                >
                  <Text>
                    {kymaResourceLabels['kyma-project.io/global-account-id']}
                  </Text>
                </FormItem>
              )}
              {!!kymaResourceLabels?.['kyma-project.io/subaccount-id'] && (
                <FormItem
                  labelContent={
                    <Label showColon>
                      {t('clusters.overview.subaccount-id')}
                    </Label>
                  }
                >
                  <Text>
                    {kymaResourceLabels['kyma-project.io/subaccount-id']}
                  </Text>
                </FormItem>
              )}
              {!environmentParametersLoading && !!natGatewayIps && (
                <FormItem
                  labelContent={
                    <Label showColon>
                      {t('clusters.overview.nat-gateway-ips')}
                    </Label>
                  }
                >
                  <Tokens tokens={natGatewayIps} />
                </FormItem>
              )}
            </>
          }
        />
        {(kymaResources || isCommunityModulesEnabled) && (
          <ModuleTemplatesContextProvider>
            <CommunityModuleContextProvider>
              <ClusterModulesCard />
            </CommunityModuleContextProvider>
          </ModuleTemplatesContextProvider>
        )}
      </Form>
    </section>
  );
}
