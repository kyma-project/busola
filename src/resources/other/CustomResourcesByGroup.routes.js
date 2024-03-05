import React, { Suspense, useEffect } from 'react';
import { Route, useParams, useSearchParams } from 'react-router-dom';
import { useRecoilState } from 'recoil';
import { FlexibleColumnLayout } from '@ui5/webcomponents-react';

import { Spinner } from 'shared/components/Spinner/Spinner';

import { columnLayoutState } from 'state/columnLayoutAtom';
import { useUrl } from 'hooks/useUrl';
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

export const ColumnWrapper = ({ defaultColumn = 'list' }) => {
  const { isEnabled: isColumnLeyoutEnabled } = useFeature('COLUMN_LAYOUT');
  const [layoutState, setLayoutColumn] = useRecoilState(columnLayoutState);
  const [searchParams] = useSearchParams();
  const layout = searchParams.get('layout');

  const { crdName, crName } = useParams();
  const { namespace } = useUrl();

  const initialLayoutState = layout
    ? {
        layout: isColumnLeyoutEnabled && layout ? layout : layoutState?.layout,
        midColumn: crdName
          ? {
              resourceName: crdName,
              resourceType: 'CustomResourceDefinition',
              namespaceId: null,
            }
          : null,
        endColumn:
          crdName && crName
            ? {
                resourceName: crName,
                resourceType: crdName,
                namespaceId: namespace,
              }
            : null,
      }
    : null;

  useEffect(() => {
    if (layout) {
      setLayoutColumn(initialLayoutState);
    }
  }, [layout, isColumnLeyoutEnabled, crdName, crName, namespace]); // eslint-disable-line react-hooks/exhaustive-deps

  let startColumnComponent = null;
  if (!layout || !isColumnLeyoutEnabled) {
    if (defaultColumn === 'details') {
      startColumnComponent = (
        <CustomResource
          params={{
            customResourceDefinitionName:
              layoutState?.endColumn?.resourceType ?? crdName,
            resourceName: layoutState?.endColumn?.resourceName ?? crName,
            resourceNamespace: layoutState?.endColumn?.namespaceId ?? namespace,
          }}
        />
      );
    } else if (defaultColumn === 'listOfType') {
      startColumnComponent = (
        <CustomResourcesOfType
          crdName={layoutState?.midColumn?.resourceName ?? crdName}
          enableColumnLayout={false}
        />
      );
    } else {
      startColumnComponent = (
        <CustomResourcesByGroup enableColumnLayout={isColumnLeyoutEnabled} />
      );
    }
  } else {
    startColumnComponent = (
      <CustomResourcesByGroup enableColumnLayout={isColumnLeyoutEnabled} />
    );
  }

  let midColumnComponent = null;
  if (
    (layoutState?.midColumn?.resourceName || isColumnLeyoutEnabled) &&
    !(layoutState?.layout === 'OneColumn' && defaultColumn === 'listOfType')
  ) {
    midColumnComponent = (
      <CustomResourcesOfType
        crdName={layoutState?.midColumn?.resourceName ?? crdName}
        enableColumnLayout={isColumnLeyoutEnabled}
      />
    );
  }

  let endColumnComponent = null;

  if (
    (layoutState?.endColumn || isColumnLeyoutEnabled) &&
    !(layoutState?.layout === 'OneColumn' && defaultColumn === 'details')
  ) {
    endColumnComponent = (
      <CustomResource
        params={{
          customResourceDefinitionName:
            layoutState?.endColumn?.resourceType ?? crdName,
          resourceName: layoutState?.endColumn?.resourceName ?? crName,
          resourceNamespace: layoutState?.endColumn?.namespaceId ?? namespace,
        }}
      />
    );
  }

  return (
    <FlexibleColumnLayout
      style={{ height: '100%' }}
      layout={layoutState?.layout || 'OneColumn'}
      startColumn={<div>{startColumnComponent}</div>}
      midColumn={<div>{midColumnComponent}</div>}
      endColumn={<div>{endColumnComponent}</div>}
    />
  );
};

export default (
  <Route
    path="customresources"
    element={
      <Suspense fallback={<Spinner />}>
        <ColumnWrapper />
      </Suspense>
    }
  />
);
