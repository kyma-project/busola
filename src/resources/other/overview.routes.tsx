import { Suspense, useEffect } from 'react';
import { Route, useParams } from 'react-router';
import { useAtomValue, useSetAtom } from 'jotai';
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

const ColumnWrapper = () => {
  const { t } = useTranslation();
  const layoutState = useAtomValue(columnLayoutAtom);
  const setLayoutColumn = useSetAtom(columnLayoutAtom);
  const { nodeName } = useParams();
  const { clusterUrl } = useUrl();

  useEffect(() => {
    setLayoutColumn({
      layout: nodeName ? 'TwoColumnsMidExpanded' : 'OneColumn',
      startColumn: {
        resourceName: null,
        resourceType: 'Cluster',
        rawResourceTypeName: 'Cluster',
      },
      midColumn: nodeName
        ? {
            resourceName: nodeName,
            resourceType: 'Nodes',
            rawResourceTypeName: 'Node',
            apiGroup: '',
            apiVersion: 'v1',
          }
        : null,
      endColumn: null,
    });
  }, [nodeName, setLayoutColumn]);

  const nodeNameResolved = layoutState?.midColumn?.resourceName || nodeName;

  return (
    <FlexibleColumnLayout
      style={{ height: '100%' }}
      layout={layoutState?.layout || 'OneColumn'}
      startColumn={
        <div className="column-content">
          <WithTitle title={t('clusters.overview.title-current-cluster')}>
            <ClusterOverview />
          </WithTitle>
        </div>
      }
      midColumn={
        nodeNameResolved ? (
          <div className="column-content">
            <Suspense fallback={<Spinner />}>
              <NodeOverview
                nodeName={nodeNameResolved}
                layoutCloseCreateUrl={clusterUrl('overview')}
              />
            </Suspense>
          </div>
        ) : (
          <></>
        )
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
