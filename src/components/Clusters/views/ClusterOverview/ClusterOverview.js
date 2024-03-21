import React from 'react';
import { Button, Title } from '@ui5/webcomponents-react';
import { ClusterNodes } from './ClusterNodes';
import { ClusterValidation } from './ClusterValidation/ClusterValidation';
import { useFeature } from 'hooks/useFeature';
import { useNodesQuery } from 'components/Nodes/nodeQueries';
import ClusterStats from './ClusterStats';
import ClusterDetails from './ClusterDetails';
import YamlUploadDialog from 'resources/Namespaces/YamlUpload/YamlUploadDialog';
import { DynamicPageComponent } from 'shared/components/DynamicPageComponent/DynamicPageComponent';
import { useTranslation } from 'react-i18next';
import { createPortal } from 'react-dom';
import { useDeleteResource } from 'shared/hooks/useDeleteResource';
import { useClustersInfo } from 'state/utils/getClustersInfo';
import { useNotification } from 'shared/contexts/NotificationContext';
import { useNavigate } from 'react-router-dom';
import { deleteCluster } from 'components/Clusters/shared';
import { spacing } from '@ui5/webcomponents-react-base';
import './ClusterOverview.scss';

const Injections = React.lazy(() =>
  import('../../../Extensibility/ExtensibilityInjections'),
);

export function ClusterOverview() {
  const { t } = useTranslation();
  const clusterValidation = useFeature('CLUSTER_VALIDATION');
  const clustersInfo = useClustersInfo();
  const currentCluster = clustersInfo?.currentCluster;
  const notification = useNotification();
  const navigate = useNavigate();
  const { nodes: data, error, loading } = useNodesQuery();
  const [DeleteMessageBox, handleResourceDelete] = useDeleteResource({
    resourceType: t('clusters.labels.name'),
  });

  const actions = (
    <Button
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
    </Button>
  );

  return (
    <>
      <DynamicPageComponent
        title={currentCluster.currentContext.cluster.name}
        actions={actions}
        content={
          <>
            <Injections
              destination="ClusterOverview"
              slot="details-top"
              root=""
            />
            <Title
              level="H3"
              style={{
                ...spacing.sapUiMediumMarginBegin,
                ...spacing.sapUiMediumMarginTopBottom,
              }}
            >
              {t('cluster-overview.headers.cluster-details')}
            </Title>
            <ClusterDetails currentCluster={currentCluster} />
            {data && <ClusterStats data={data} />}
            <ClusterNodes data={data} error={error} loading={loading} />
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
