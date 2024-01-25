import React, { Suspense, useEffect } from 'react';
import { Route, useParams, useSearchParams } from 'react-router-dom';
import { useSetRecoilState } from 'recoil';
import { useUrl } from 'hooks/useUrl';
import { useFeature } from 'hooks/useFeature';

import { columnLayoutState } from 'state/columnLayoutAtom';
import { Spinner } from 'shared/components/Spinner/Spinner';
import { ColumnWrapper } from './CustomResourcesByGroup.routes';

const CustomResource = React.lazy(() =>
  import('../CustomResourceDefinitions/CustomResources.details'),
);

function RoutedCRDDetails() {
  const { crdName, crName } = useParams();
  const { namespace } = useUrl();
  const { isEnabled: isColumnLeyoutEnabled } = useFeature('COLUMN_LAYOUT');

  const setLayoutColumn = useSetRecoilState(columnLayoutState);

  const [searchParams] = useSearchParams();
  const layout = searchParams.get('layout');

  const initialLayoutState = layout
    ? {
        layout: isColumnLeyoutEnabled ? layout : 'OneColumn',
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
      setLayoutColumn(initialLayoutState);
    }
  }, [layout, crdName, crName]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <Suspense fallback={<Spinner />}>
      {layout && isColumnLeyoutEnabled && <ColumnWrapper />}

      {(!layout || !isColumnLeyoutEnabled) && (
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
