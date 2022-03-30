import React, { Suspense } from 'react';
import { Route, useParams } from 'react-router-dom';
import { Spinner } from 'shared/components/Spinner/Spinner';

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
