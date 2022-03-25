import React, { Suspense } from 'react';
import { Route, useParams } from 'react-router-dom';
import { Spinner } from 'react-shared';

const NodeOverview = React.lazy(() =>
  import('../../components/Nodes/NodeDetails/NodeDetails'),
);

const RoutedNodeOverview = () => {
  const { nodeName } = useParams();
  return <NodeOverview nodeName={nodeName} />;
};

export default (
  <Route
    path={'/overview/nodes/:nodeName'}
    element={
      <Suspense fallback={<Spinner />}>
        <RoutedNodeOverview />
      </Suspense>
    }
  />
);
