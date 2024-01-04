import React, { Suspense, useEffect } from 'react';
import { Route, useParams, useSearchParams } from 'react-router-dom';
import { useSetRecoilState } from 'recoil';
import { useUrl } from 'hooks/useUrl';

import { columnLayoutState } from 'state/columnLayoutAtom';
import { Spinner } from 'shared/components/Spinner/Spinner';
import { ColumnWrapper } from './CustomResourcesByGroup.routes';

const CustomResource = React.lazy(() =>
  import('../CustomResourceDefinitions/CustomResources.details'),
);

function RoutedCRDDetails() {
  const { crdName, crName } = useParams();
  const { namespace } = useUrl();

  const setColumnLayoutState = useSetRecoilState(columnLayoutState);

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
        endColumn: {
          resourceName: crName,
          resourceType: crdName,
          namespaceId: namespace,
        },
      }
    : null;

  useEffect(() => {
    if (layout) {
      setColumnLayoutState(initialLayoutState);
    }
  }, [layout]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <Suspense fallback={<Spinner />}>
      {layout && <ColumnWrapper />}

      {!layout && (
        <CustomResource
          params={{
            customResourceDefinitionName: crdName,
            resourceName: crName,
          }}
        />
      )}
    </Suspense>
  );
}

export default (
  <Route
    path="customresources/:crdName/:crName"
    element={<RoutedCRDDetails />}
  />
);
