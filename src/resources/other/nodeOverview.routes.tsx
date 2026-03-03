import { Suspense } from 'react';
import { Route, useParams } from 'react-router';
import { Spinner } from 'shared/components/Spinner/Spinner';
import { lazyWithRetries } from 'shared/helpers/lazyWithRetries';

const NodeOverview = lazyWithRetries(
  () => import('../../components/Nodes/NodeDetails/NodeDetails'),
);

const RoutedNodeOverview = () => {
  const { nodeName } = useParams();
  return <NodeOverview nodeName={nodeName} />;
};

export default (
  <Route
    path={'overview/nodes/:nodeName'}
    element={
      <Suspense fallback={<Spinner />}>
        <RoutedNodeOverview />
      </Suspense>
    }
  />
);
