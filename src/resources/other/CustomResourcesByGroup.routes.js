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

const ColumnWrapper = ({ details, ...props }) => {
  const { isEnabled: isColumnLeyoutEnabled } = useFeature('COLUMN_LAYOUT');
  const layoutState = useRecoilValue(columnLayoutState);

  return (
    <FlexibleColumnLayout
      style={{ height: '100%' }}
      layout={layoutState?.layout || 'OneColumn'}
      startColumn={
        <div slot="">
          <CustomResourcesByGroup enableColumnLayout={isColumnLeyoutEnabled} />
        </div>
      }
      midColumn={
        layoutState?.midColumn && (
          <div slot="">
            <CustomResourcesOfType
              crdName={layoutState?.midColumn?.resourceName}
            />
          </div>
        )
      }
      endColumn={
        layoutState?.endColumn && (
          <div slot="">
            <CustomResource
              params={{
                customResourceDefinitionName:
                  layoutState?.endColumn?.resourceType,
                resourceName: layoutState?.endColumn?.resourceName,
                resourceNamespace: layoutState?.endColumn?.namespaceId,
              }}
            />
          </div>
        )
      }
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
