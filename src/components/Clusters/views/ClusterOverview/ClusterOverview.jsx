import { lazy, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useFeature } from 'hooks/useFeature';
import { useNavigate } from 'react-router';
import { useClustersInfo } from 'state/utils/getClustersInfo';
import { useNotification } from 'shared/contexts/NotificationContext';
import { useDeleteResource } from 'shared/hooks/useDeleteResource';
import { useNodesQuery } from 'components/Nodes/nodeQueries';
import { useSetAtom } from 'jotai';

import { showYamlUploadDialogAtom } from 'state/showYamlUploadDialogAtom';
import { createPortal } from 'react-dom';
import { deleteCluster } from 'components/Clusters/shared';
import { ToolbarButton } from '@ui5/webcomponents-react';
import { ClusterNodes } from './ClusterNodes';
import { ClusterValidation } from './ClusterValidation/ClusterValidation';
import { DynamicPageComponent } from 'shared/components/DynamicPageComponent/DynamicPageComponent';
import ClusterStats from './ClusterStats';
import ClusterDetails from './ClusterDetails';
import YamlUploadDialog from 'resources/Namespaces/YamlUpload/YamlUploadDialog';
import BannerCarousel from 'shared/components/FeatureCard/BannerCarousel';
import { columnLayoutAtom } from 'state/columnLayoutAtom';
import { AIBanner } from 'components/KymaCompanion/components/AIBanner/AIBanner';

import './ClusterOverview.scss';
import { configFeaturesNames } from 'state/types';
import { useCheckSAPUser } from 'hooks/useCheckSAPUser';

const Injections = lazy(
  () => import('../../../Extensibility/ExtensibilityInjections'),
);

export function ClusterOverview() {
  const { t } = useTranslation();
  const { isEnabled: isKymaCompanionEnabled, config: companionConfig } =
    useFeature(configFeaturesNames.KYMA_COMPANION);
  const clusterValidation = useFeature(configFeaturesNames.CLUSTER_VALIDATION);
  const clustersInfo = useClustersInfo();
  const currentCluster = clustersInfo?.currentCluster;
  const notification = useNotification();
  const navigate = useNavigate();
  const { nodes, error, loading } = useNodesQuery();
  const [DeleteMessageBox, handleResourceDelete] = useDeleteResource({
    resourceType: t('clusters.labels.name'),
  });
  const setShowAdd = useSetAtom(showYamlUploadDialogAtom);
  const isSAPUser = useCheckSAPUser();

  const setLayoutColumn = useSetAtom(columnLayoutAtom);
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

  const actions = (
    <section aria-label="Cluster actions" className="actions">
      <ToolbarButton
        key="upload-yaml"
        icon="add"
        onClick={() => {
          setShowAdd(true);
        }}
        text={t('upload-yaml.title')}
      />
      <ToolbarButton
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
        text={t('common.buttons.disconnect')}
      />
    </section>
  );

  return (
    <>
      <DynamicPageComponent
        title={currentCluster?.currentContext?.cluster?.name ?? ''}
        actions={actions}
        content={
          <>
            <BannerCarousel>
              {isKymaCompanionEnabled && isSAPUser && (
                <AIBanner
                  feedbackUrl={companionConfig?.feedbackLink}
                  documentationUrl={companionConfig?.documentationLink}
                />
              )}
              <Injections destination="ClusterOverview" slot="banner" root="" />
            </BannerCarousel>
            <Injections
              destination="ClusterOverview"
              slot="details-top"
              root=""
            />
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
          deleteFn={(e) => {
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
