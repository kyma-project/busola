import { Suspense, useEffect } from 'react';
import { Route, useParams } from 'react-router';
import { useSetAtom } from 'jotai';
import { FlexibleColumnLayout } from '@ui5/webcomponents-react';
import { useTranslation } from 'react-i18next';

import { columnLayoutAtom } from 'state/columnLayoutAtom';
import { Spinner } from 'shared/components/Spinner/Spinner';
import { lazyWithRetries } from 'shared/helpers/lazyWithRetries';
import { WithTitle } from 'shared/hooks/useWindowTitle';
import { ClusterOverview } from 'components/Clusters/views/ClusterOverview/ClusterOverview';
import { useUrl } from 'hooks/useUrl';

const NodeOverview = lazyWithRetries(
  () => import('../../components/Nodes/NodeDetails/NodeDetails'),
);

export const ColumnWrapper = () => {
  const { t } = useTranslation();
  const setLayoutColumn = useSetAtom(columnLayoutAtom);
  const { nodeName } = useParams();
  const { clusterUrl } = useUrl();

  // A node opens full-page (OneColumn), not beside the overview.
  useEffect(() => {
    setLayoutColumn({
      layout: 'OneColumn',
      startColumn: nodeName
        ? {
            resourceName: nodeName,
            resourceType: 'Nodes',
            rawResourceTypeName: 'Node',
            apiGroup: '',
            apiVersion: 'v1',
          }
        : {
            resourceName: null,
            resourceType: 'Cluster',
            rawResourceTypeName: 'Cluster',
          },
      midColumn: null,
      endColumn: null,
    });
  }, [nodeName, setLayoutColumn]);

  return (
    <FlexibleColumnLayout
      style={{ height: '100%' }}
      layout="OneColumn"
      startColumn={
        <div className="column-content">
          {nodeName ? (
            <Suspense fallback={<Spinner />}>
              <NodeOverview
                nodeName={nodeName}
                layoutNumber="startColumn"
                layoutCloseCreateUrl={clusterUrl('overview')}
              />
            </Suspense>
          ) : (
            <WithTitle title={t('clusters.overview.title-current-cluster')}>
              <ClusterOverview />
            </WithTitle>
          )}
        </div>
      }
    />
  );
};

export default (
  <>
    <Route path="overview" element={<ColumnWrapper />} />
    <Route path="overview/nodes/:nodeName" element={<ColumnWrapper />} />
  </>
);
