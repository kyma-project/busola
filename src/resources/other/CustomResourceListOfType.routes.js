import React, { Suspense, useEffect } from 'react';
import { Route, useParams, useSearchParams } from 'react-router-dom';
import { useSetRecoilState } from 'recoil';
import { Spinner } from 'shared/components/Spinner/Spinner';

import { columnLayoutState } from 'state/columnLayoutAtom';
import { ColumnWrapper } from './CustomResourcesByGroup.routes';
import { useFeature } from 'hooks/useFeature';

const CustomResourcesOfType = React.lazy(() =>
  import('../../components/CustomResources/CustomResourcesOfType'),
);

function RoutedCustomResourcesOfType() {
  const { crdName } = useParams();
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
        endColumn: null,
      }
    : null;

  useEffect(() => {
    if (layout) {
      setLayoutColumn(initialLayoutState);
    }
  }, [layout, crdName]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <Suspense fallback={<Spinner />}>
      {layout && isColumnLeyoutEnabled && <ColumnWrapper />}
      {(!layout || !isColumnLeyoutEnabled) && (
        <CustomResourcesOfType crdName={crdName} />
      )}
    </Suspense>
  );
}

export default (
  <Route
    path="customresources/:crdName"
    element={<RoutedCustomResourcesOfType />}
  />
);
