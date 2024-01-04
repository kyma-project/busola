import React, { Suspense, useEffect } from 'react';
import { Route, useParams, useSearchParams } from 'react-router-dom';
import { useSetRecoilState } from 'recoil';
import { Spinner } from 'shared/components/Spinner/Spinner';

import { columnLayoutState } from 'state/columnLayoutAtom';
import { ColumnWrapper } from './CustomResourcesByGroup.routes';

const CustomResourcesOfType = React.lazy(() =>
  import('../../components/CustomResources/CustomResourcesOfType'),
);

function RoutedCustomResourcesOfType() {
  const { crdName } = useParams();

  const setLayoutColumn = useSetRecoilState(columnLayoutState);

  const [searchParams] = useSearchParams();
  const layout = searchParams.get('layout');

  const initialLayoutState = layout
    ? {
        layout: layout,
        midColumn: {
          resourceName: crdName,
          resourceType: 'CustomResourceDefinition',
          namespaceId: null,
        },
        endColumn: null,
      }
    : null;

  useEffect(() => {
    if (layout) {
      setLayoutColumn(initialLayoutState);
    }
  }, [layout]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <Suspense fallback={<Spinner />}>
      {layout && <ColumnWrapper />}
      {!layout && <CustomResourcesOfType crdName={crdName} />}
    </Suspense>
  );
}

export default (
  <Route
    path="customresources/:crdName"
    element={<RoutedCustomResourcesOfType />}
  />
);
