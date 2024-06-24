import React, { Suspense, useEffect, useMemo } from 'react';
import { Route, useParams, useSearchParams } from 'react-router-dom';
import { useRecoilState } from 'recoil';
import { FlexibleColumnLayout } from '@ui5/webcomponents-react';
import { useTranslation } from 'react-i18next';

import { useGet } from 'shared/hooks/BackendAPI/useGet';
import { ErrorBoundary } from 'shared/components/ErrorBoundary/ErrorBoundary';
import { Spinner } from 'shared/components/Spinner/Spinner';
import { ResourceCreate } from 'shared/components/ResourceCreate/ResourceCreate';
import { usePrepareCreateProps } from 'resources/helpers';

import { columnLayoutState } from 'state/columnLayoutAtom';
import { useUrl } from 'hooks/useUrl';
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
  const [layoutState, setLayoutColumn] = useRecoilState(columnLayoutState);
  const [searchParams] = useSearchParams();
  const layout = searchParams.get('layout');

  const { t } = useTranslation();

  const { crdName, crName } = useParams();
  const { namespace, scopedUrl } = useUrl();

  const initialLayoutState = layout
    ? {
        layout: layout ? layout : layoutState?.layout,
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
  }, [layout, crdName, crName, namespace]); // eslint-disable-line react-hooks/exhaustive-deps

  const layoutCloseCreateUrl = scopedUrl(
    `customresources/${layoutState?.midColumn?.resourceName ?? crdName}`,
  );

  const crdResourceName = useMemo(
    () =>
      layoutState?.endColumn?.resourceName ??
      layoutState?.midColumn?.resourceName ??
      crdName,
    [
      layoutState?.endColumn?.resourceName,
      layoutState?.midColumn?.resourceName,
      crdName,
    ],
  );

  const { data: crd } = useGet(
    `/apis/apiextensions.k8s.io/v1/customresourcedefinitions/${crdResourceName}`,
    {
      pollingInterval: null,
      skip: !crdResourceName,
    },
  );

  const elementCreateProps = usePrepareCreateProps({
    resourceType: crdResourceName,
    apiGroup: 'apiextensions.k8s.io',
    apiVersion: 'v1',
  });

  let startColumnComponent = null;
  if (!layout) {
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
          layoutCloseCreateUrl={layoutCloseCreateUrl}
        />
      );
    } else {
      startColumnComponent = (
        <CustomResourcesByGroup enableColumnLayout={true} />
      );
    }
  } else {
    startColumnComponent = <CustomResourcesByGroup enableColumnLayout={true} />;
  }

  let midColumnComponent = null;
  if (!layoutState?.midColumn && layoutState?.showCreate?.resourceType) {
    midColumnComponent = (
      <ResourceCreate
        title={elementCreateProps.resourceTitle}
        confirmText={t('common.buttons.create')}
        layoutCloseCreateUrl={layoutCloseCreateUrl}
        renderForm={renderProps => {
          const createComponent = layoutState?.showCreate?.resourceType && (
            <CRCreate
              {...renderProps}
              {...elementCreateProps}
              crd={crd}
              layoutNumber="MidColumn"
            />
          );

          return <ErrorBoundary>{createComponent}</ErrorBoundary>;
        }}
      />
    );
  }
  if (
    !(layoutState?.layout === 'OneColumn' && defaultColumn === 'listOfType')
  ) {
    midColumnComponent = (
      <CustomResourcesOfType
        enableColumnLayout={true}
        crdName={layoutState?.midColumn?.resourceName ?? crdName}
        layoutCloseCreateUrl={layoutCloseCreateUrl}
      />
    );
  }

  let endColumnComponent = null;
  if (layoutState?.showCreate?.resourceType && layoutState?.midColumn) {
    endColumnComponent = (
      <ResourceCreate
        title={elementCreateProps.resourceTitle}
        confirmText={t('common.buttons.create')}
        layoutNumber="EndColumn"
        layoutCloseCreateUrl={layoutCloseCreateUrl}
        renderForm={renderProps => {
          const createComponent = layoutState?.showCreate?.resourceType && (
            <CRCreate
              {...renderProps}
              {...elementCreateProps}
              crd={crd}
              layoutNumber="MidColumn"
            />
          );

          return <ErrorBoundary>{createComponent}</ErrorBoundary>;
        }}
      />
    );
  }

  if (
    !layoutState?.showCreate &&
    layoutState?.endColumn &&
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
      startColumn={<div className="column-content">{startColumnComponent}</div>}
      midColumn={<div className="column-content">{midColumnComponent}</div>}
      endColumn={<div className="column-content">{endColumnComponent}</div>}
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
