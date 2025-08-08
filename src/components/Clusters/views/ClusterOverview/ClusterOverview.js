import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useFeature } from 'hooks/useFeature';
import { useNavigate } from 'react-router';
import { useClustersInfo } from 'state/utils/getClustersInfo';
import { useNotification } from 'shared/contexts/NotificationContext';
import { useDeleteResource } from 'shared/hooks/useDeleteResource';
import { useNodesQuery } from 'components/Nodes/nodeQueries';
import { useSetRecoilState } from 'recoil';
import { useSetAtom } from 'jotai';

import { showYamlUploadDialogState } from 'state/showYamlUploadDialogAtom';
import { createPortal } from 'react-dom';
import { deleteCluster } from 'components/Clusters/shared';
import { Button, Title } from '@ui5/webcomponents-react';
import { ClusterNodes } from './ClusterNodes';
import { ClusterValidation } from './ClusterValidation/ClusterValidation';
import { DynamicPageComponent } from 'shared/components/DynamicPageComponent/DynamicPageComponent';
import ClusterStats from './ClusterStats';
import ClusterDetails from './ClusterDetails';
import YamlUploadDialog from 'resources/Namespaces/YamlUpload/YamlUploadDialog';
import BannerCarousel from 'shared/components/FeatureCard/BannerCarousel';
import { columnLayoutState } from 'state/columnLayoutAtom';
import { AIBanner } from 'components/KymaCompanion/components/AIBanner/AIBanner';

import './ClusterOverview.scss';
import { configFeaturesNames } from 'state/types';

const Injections = React.lazy(() =>
  import('../../../Extensibility/ExtensibilityInjections'),
);

export function ClusterOverview() {
  const { t } = useTranslation();
  const {
    isEnabled: isKymaCompanionEnabled,
    config: companionConfig,
  } = useFeature(configFeaturesNames.KYMA_COMPANION);
  const clusterValidation = useFeature(configFeaturesNames.CLUSTER_VALIDATION);
  const clustersInfo = useClustersInfo();
  const currentCluster = clustersInfo?.currentCluster;
  const notification = useNotification();
  const navigate = useNavigate();
  const { nodes, error, loading } = useNodesQuery();
  const [DeleteMessageBox, handleResourceDelete] = useDeleteResource({
    resourceType: t('clusters.labels.name'),
  });
  const setShowAdd = useSetRecoilState(showYamlUploadDialogState);

  const setLayoutColumn = useSetAtom(columnLayoutState);
  useEffect(() => {
    setLayoutColumn({
      layout: 'OneColumn',
      startColumn: {
        resourceType: 'Cluster',
        rawResourceTypeName: 'Cluster',
      },
      midColumn: null,
      endColumn: null,
    });
  }, [setLayoutColumn]);

  const actions = [
    <Button
      key="upload-yaml"
      icon="add"
      onClick={() => {
        setShowAdd(true);
      }}
    >
      {t('upload-yaml.title')}
    </Button>,
    <Button
      key="disconnect"
      design="Transparent"
      onClick={() => {
        handleResourceDelete({
          deleteFn: () => {
            deleteCluster(clustersInfo?.currentCluster?.name, clustersInfo);
            notification.notifySuccess({
              content: t('clusters.disconnect'),
            });
            navigate('/clusters');
          },
        });
      }}
    >
      {t('common.buttons.disconnect')}
    </Button>,
  ];

  return (
    <>
      <DynamicPageComponent
        title={currentCluster?.currentContext?.cluster?.name ?? ''}
        actions={actions}
        content={
          <>
            <BannerCarousel>
              <>
                {isKymaCompanionEnabled && (
                  <AIBanner
                    feedbackUrl={companionConfig?.feedbackLink}
                    documentationUrl={companionConfig?.documentationLink}
                  />
                )}
                <Injections
                  destination="ClusterOverview"
                  slot="banner"
                  root=""
                />
              </>
            </BannerCarousel>
            <Injections
              destination="ClusterOverview"
              slot="details-top"
              root=""
            />
            <Title
              level="H3"
              size="H3"
              className="sap-margin-begin-medium sap-margin-y-medium"
            >
              {t('cluster-overview.headers.cluster-details')}
            </Title>
            <ClusterDetails currentCluster={currentCluster} />
            <ClusterStats nodesData={nodes} />
            <ClusterNodes data={nodes} error={error} loading={loading} />
            {clusterValidation?.isEnabled && <ClusterValidation />}
            <Injections destination="ClusterOverview" slot="details-bottom" />
          </>
        }
      />
      {createPortal(<YamlUploadDialog />, document.body)}
      {createPortal(
        <DeleteMessageBox
          resource={currentCluster}
          resourceIsCluster={true}
          resourceTitle={currentCluster?.kubeconfig['current-context']}
          deleteFn={e => {
            deleteCluster(e.name, clustersInfo);
            notification.notifySuccess({
              content: t('clusters.disconnect'),
            });
            navigate('/clusters');
          }}
        />,
        document.body,
      )}
    </>
  );
}
