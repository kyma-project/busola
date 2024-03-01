import React, { Suspense } from 'react';
import { Route } from 'react-router-dom';
import { useRecoilValue } from 'recoil';
import { FlexibleColumnLayout } from '@ui5/webcomponents-react';
import { Spinner } from 'shared/components/Spinner/Spinner';
import { columnLayoutState } from 'state/columnLayoutAtom';

import { useFeature } from 'hooks/useFeature';

const CustomResourcesByGroup = React.lazy(() =>
  import('../../components/CustomResources/CustomResourcesByGroup'),
);

const CustomResourcesOfType = React.lazy(() =>
  import('../../components/CustomResources/CustomResourcesOfType'),
);

const CustomResource = React.lazy(() =>
  import('../CustomResourceDefinitions/CustomResources.details'),
);

export const ColumnWrapper = () => {
  const { isEnabled: isColumnLeyoutEnabled } = useFeature('COLUMN_LAYOUT');
  const layoutState = useRecoilValue(columnLayoutState);

  let startColumnComponent = null;

  if (layoutState?.startColumn || isColumnLeyoutEnabled) {
    startColumnComponent = (
      <CustomResourcesByGroup enableColumnLayout={isColumnLeyoutEnabled} />
    );
  }

  let midColumnComponent = null;

  if (layoutState?.midColumn || isColumnLeyoutEnabled) {
    console.log('in');
    midColumnComponent = (
      <CustomResourcesOfType crdName={layoutState?.midColumn?.resourceName} />
    );
  }

  let endColumnComponent = null;
  if (layoutState?.endColumn || isColumnLeyoutEnabled) {
    console.log('in');
    endColumnComponent = (
      <CustomResource
        params={{
          customResourceDefinitionName: layoutState?.endColumn?.resourceType,
          resourceName: layoutState?.endColumn?.resourceName,
          resourceNamespace: layoutState?.endColumn?.namespaceId,
        }}
      />
    );
  }

  console.log(midColumnComponent, 'midColumn');
  return (
    <FlexibleColumnLayout
      style={{ height: '100%' }}
      layout={layoutState?.layout || 'OneColumn'}
      startColumn={<div slot="">{startColumnComponent}</div>}
      midColumn={<div slot="">{midColumnComponent}</div>}
      endColumn={<div slot="">{endColumnComponent}</div>}
    />
  );
};

export default (
  <Route
    path="customresources"
    element={
      <Suspense fallback={<Spinner />}>
        <ColumnWrapper>
          <CustomResourcesByGroup />
        </ColumnWrapper>
      </Suspense>
    }
  />
);
