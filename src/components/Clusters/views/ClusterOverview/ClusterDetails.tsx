import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useAtomValue } from 'jotai';
import { unwrap } from 'jotai/utils';

import { useGetVersions } from './useGetVersions';
import { useGetClusterInfo } from './useGetClusterInfo';
import { ClusterInfoFields } from './ClusterInfoFields';
import { kymaResourcesAtom } from 'state/kymaResourcesAtom';

import { FormItem, Text, Title, Label, Form } from '@ui5/webcomponents-react';
import ResourceDetailsCard from 'shared/components/ResourceDetails/ResourceDetailsCard';
import ClusterModulesCard from './ClusterModulesCard';
import { ClusterStorageType } from '../ClusterStorageType';
import { CommunityModuleContextProvider } from 'components/Modules/community/providers/CommunityModuleProvider';
import { ModuleTemplatesContextProvider } from 'components/Modules/providers/ModuleTemplatesProvider';
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
  const { clusterInfo, loading: clusterInfoLoading } = useGetClusterInfo();
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
              <ClusterInfoFields
                clusterInfo={clusterInfo}
                kymaResourceLabels={kymaResourceLabels}
                loading={clusterInfoLoading}
              />
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
