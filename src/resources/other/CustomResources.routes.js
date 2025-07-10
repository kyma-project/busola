import React, { Suspense, useMemo } from 'react';
import { Route, useParams } from 'react-router';
import { useRecoilValue } from 'recoil';
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
import { usePrepareLayoutColumns } from 'shared/hooks/usePrepareLayout';

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
  const layoutState = useRecoilValue(columnLayoutState);

  const { t } = useTranslation();

  const { crdName, crName } = useParams();
  const { namespace, scopedUrl } = useUrl();

  usePrepareLayoutColumns({
    resourceType: 'CustomResourceDefinition',
    namespaceId: namespace,
    apiGroup: 'apiextensions.k8s.io',
    apiVersion: 'v1',
    resourceName: crdName,
    isCustomResource: true,
    crName: crName,
    resource:
      layoutState?.showCreate?.resource ||
      layoutState?.showEdit?.resource ||
      null,
    rawResourceTypeName: 'CustomResourceDefinition',
  });
  const defaultColumn = crName ? 'details' : 'list';

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
  if (layoutState.layout === 'OneColumn') {
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
      startColumnComponent = <CustomResourcesByGroup />;
    }
  } else {
    startColumnComponent = <CustomResourcesByGroup />;
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
              layoutNumber="midColumn"
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
        crdName={layoutState?.midColumn?.resourceName ?? crdName}
        enableColumnLayout={true}
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
        layoutNumber="endColumn"
        layoutCloseCreateUrl={layoutCloseCreateUrl}
        renderForm={renderProps => {
          const createComponent = layoutState?.showCreate?.resourceType && (
            <CRCreate
              {...renderProps}
              {...elementCreateProps}
              crd={crd}
              layoutNumber="midColumn"
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
      layout={layoutState?.layout}
      startColumn={
        <div className="column-content">
          <Suspense fallback={<Spinner />}>{startColumnComponent}</Suspense>
        </div>
      }
      midColumn={
        <div className="column-content">
          <Suspense fallback={<Spinner />}>{midColumnComponent}</Suspense>
        </div>
      }
      endColumn={
        <div className="column-content">
          <Suspense fallback={<Spinner />}>{endColumnComponent}</Suspense>
        </div>
      }
    />
  );
};

export default (
  <Route
    path="customresources/:crdName?/:crName?"
    element={
      <Suspense fallback={<Spinner />}>
        <ColumnWrapper />
      </Suspense>
    }
  />
);
