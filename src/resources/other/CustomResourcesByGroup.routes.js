import React, { Suspense, useEffect } from 'react';
import { Route, useParams, useSearchParams } from 'react-router-dom';
import { useRecoilState } from 'recoil';
import { FlexibleColumnLayout } from '@ui5/webcomponents-react';
import { useTranslation } from 'react-i18next';

import { Spinner } from 'shared/components/Spinner/Spinner';
import { ResourceCreate } from 'shared/components/ResourceCreate/ResourceCreate';

import { columnLayoutState } from 'state/columnLayoutAtom';
import { useUrl } from 'hooks/useUrl';
import { useFeature } from 'hooks/useFeature';
import CRCreate from '../CustomResourceDefinitions/CRCreate';

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

  const { t } = useTranslation();

  const { crdName, crName } = useParams();
  const { namespace } = useUrl();
  console.log(
    'defaultColumn',
    defaultColumn,
    'namespace',
    namespace,
    'crdName',
    crdName,
    'crName',
    crName,
  );

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

  console.log('initialLayoutState', initialLayoutState);
  // <CRCreate {...props} crd={crd} layoutNumber="MidColumn" />

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
      console.log(
        'layoutState?.midColumn?.resourceName',
        layoutState?.midColumn?.resourceName,
        'layoutState',
        layoutState,
      );
      startColumnComponent = (
        <CustomResourcesOfType
          crdName={layoutState?.midColumn?.resourceName ?? crdName}
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
  if (layout && isColumnLeyoutEnabled && layoutState?.midColumn?.resourceName) {
    midColumnComponent = (
      <CustomResourcesOfType
        crdName={layoutState?.midColumn?.resourceName ?? crdName}
      />
    );
  }

  let endColumnComponent = null;
  if (layoutState?.showCreate?.resourceType) {
    endColumnComponent = (
      <ResourceCreate
        title={'sth'}
        confirmText={t('common.buttons.update')}
        renderForm={renderProps => <div>lll</div>}
      />
    );

    // endColumnComponent = (
    //   <ResourceCreate
    //     title={elementCreateProps.resourceTitle}
    //     confirmText={t('common.buttons.update')}
    //     renderForm={renderProps => {
    //       const createComponent = layoutState?.showCreate?.resourceType && (
    //         <Create
    //           resourceSchema={cr}
    //           layoutNumber="StartColumn"
    //           {...elementCreateProps}
    //           {...renderProps}
    //         />
    //       );

    //       return <ErrorBoundary>{createComponent}</ErrorBoundary>;
    //     }}
    //   />
    // );
  }

  if (!layoutState?.showCreate && layoutState?.endColumn) {
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
        <ColumnWrapper />
      </Suspense>
    }
  />
);
