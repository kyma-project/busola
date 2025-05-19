import { FlexibleColumnLayout } from '@ui5/webcomponents-react';
import React, { Suspense, useMemo } from 'react';
import { Route, useParams } from 'react-router';
import { useRecoilState } from 'recoil';
import pluralize from 'pluralize';

import { ErrorBoundary } from 'shared/components/ErrorBoundary/ErrorBoundary';
import { ResourceCreate } from 'shared/components/ResourceCreate/ResourceCreate';
import { Spinner } from 'shared/components/Spinner/Spinner';
import { columnLayoutState } from 'state/columnLayoutAtom';
import { useUrl } from 'hooks/useUrl';
import ExtensibilityDetails from 'components/Extensibility/ExtensibilityDetails';
import { t } from 'i18next';
import { useDeleteResource } from 'shared/hooks/useDeleteResource';
import { usePrepareLayoutColumns } from 'shared/hooks/usePrepareLayout';
import { KymaModuleContextProvider } from '../../components/KymaModules/providers/KymaModuleProvider';
import { useGetCRbyPath } from 'components/Extensibility/useGetCRbyPath';
import { useGet } from 'shared/hooks/BackendAPI/useGet';

const KymaModulesList = React.lazy(() =>
  import('../../components/KymaModules/KymaModulesList'),
);

const KymaModulesAddModule = React.lazy(() =>
  import('../../components/KymaModules/KymaModulesAddModule'),
);

const ColumnWraper = ({
  defaultColumn = 'list',
  namespaced = false,
  DeleteMessageBox,
  handleResourceDelete,
  showDeleteDialog,
  extensionResource,
  crd,
}) => {
  const [layoutState, setLayoutColumn] = useRecoilState(columnLayoutState);
  const { clusterUrl, namespaceUrl } = useUrl();
  const url = namespaced
    ? namespaceUrl('kymamodules')
    : clusterUrl('kymamodules');

  const { resourceName, resourceType, namespace } = useParams();

  const layoutResourceData = useMemo(() => {
    let resource = {};

    // Set resource data from extension config map or custom resource definition
    if (crd?.spec) {
      resource = {
        resourceType: crd.spec.names.kind,
        namespaceId: namespace,
        apiGroup: crd.spec.group,
        apiVersion: crd.spec.names.kind[0].name,
        resourceName: resourceName,
      };
    }

    if (extensionResource?.general?.resource) {
      resource = {
        resourceType: extensionResource.general.resource.kind,
        namespaceId: namespace,
        apiGroup: extensionResource.general.resource.group,
        apiVersion: extensionResource.general.resource.version,
        resourceName: resourceName,
      };
    }

    console.log('resource', resource);
    return resource;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    resourceType,
    resourceName,
    namespace,
    layoutState,
    crd,
    extensionResource,
  ]);

  let startColumnComponent = null;

  usePrepareLayoutColumns({
    ...layoutResourceData,
    isModule: true,
    resource:
      layoutState?.showCreate?.resource ||
      layoutState?.showEdit?.resource ||
      null,
  });
  if (!layoutResourceData) {
    return <>loading</>;
  }
  const plurarizedResourceType = extensionResource
    ? pluralize(extensionResource?.resourceType || '')
    : crd?.metadata?.name;
  console.log(
    'plurarizedResourceType',
    plurarizedResourceType,
    extensionResource?.resourceType,
  );
  if (layoutState.layout === 'OneColumn' && defaultColumn === 'details') {
    startColumnComponent = (
      <ExtensibilityDetails
        layoutCloseCreateUrl={url}
        resourceName={layoutState?.midColumn?.resourceName || resourceName}
        resourceType={plurarizedResourceType || resourceType}
        namespaceId={
          layoutState?.midColumn?.namespaceId ||
          layoutState?.midColumn?.namespaceId === ''
            ? layoutState?.midColumn?.namespaceId
            : namespace
        }
        isModule={true}
      />
    );
  } else {
    startColumnComponent = <KymaModulesList namespaced={namespaced} />;
  }

  let detailsMidColumn = null;
  if (!layoutState?.showCreate && layoutState?.midColumn) {
    detailsMidColumn = (
      <ExtensibilityDetails
        layoutCloseCreateUrl={url}
        resourceName={layoutState?.midColumn?.resourceName || resourceName}
        resourceType={plurarizedResourceType || resourceType}
        namespaceId={
          layoutState?.midColumn?.namespaceId ||
          layoutState?.midColumn?.namespaceId === ''
            ? layoutState?.midColumn?.namespaceId
            : namespace
        }
        isModule={true}
      />
    );
  }

  const createMidColumn = (
    <ResourceCreate
      title={t('kyma-modules.add-module')}
      confirmText={t('common.buttons.add')}
      layoutCloseCreateUrl={url}
      renderForm={renderProps => {
        return (
          <ErrorBoundary>
            <KymaModulesAddModule {...renderProps} />
          </ErrorBoundary>
        );
      }}
    />
  );

  return (
    <>
      <KymaModuleContextProvider
        setLayoutColumn={setLayoutColumn}
        layoutState={layoutState}
        DeleteMessageBox={DeleteMessageBox}
        handleResourceDelete={handleResourceDelete}
        showDeleteDialog={showDeleteDialog}
      >
        <FlexibleColumnLayout
          style={{ height: '100%' }}
          layout={layoutState?.layout}
          startColumn={
            <div className="column-content">{startColumnComponent}</div>
          }
          midColumn={
            <>
              {!layoutState?.showCreate &&
                (defaultColumn !== 'details' ||
                  layoutState.layout !== 'OneColumn') && (
                  <div className="column-content">{detailsMidColumn}</div>
                )}
              {!layoutState?.midColumn &&
                (defaultColumn !== 'details' ||
                  layoutState.layout !== 'OneColumn') && (
                  <div className="column-content">{createMidColumn}</div>
                )}
            </>
          }
        />
      </KymaModuleContextProvider>
    </>
  );
};

const KymaModules = ({ defaultColumn, namespaced }) => {
  const [
    DeleteMessageBox,
    handleResourceDelete,
    showDeleteDialog,
  ] = useDeleteResource({
    resourceType: t('kyma-modules.title'),
    forceConfirmDelete: true,
  });
  const { resourceType } = useParams();

  // Get extension config map or custom resource definition
  const extensionResource = useGetCRbyPath(resourceType);
  const { data: crd } = useGet(
    `/apis/apiextensions.k8s.io/v1/customresourcedefinitions/${resourceType}`,
    {
      pollingInterval: null,
    },
  );
  console.log(extensionResource, crd);
  return (
    <ColumnWraper
      defaultColumn={defaultColumn}
      namespaced={namespaced}
      DeleteMessageBox={DeleteMessageBox}
      handleResourceDelete={handleResourceDelete}
      showDeleteDialog={showDeleteDialog}
      extensionResource={extensionResource}
      crd={crd}
    />
  );
};

export default (
  <>
    <Route
      path={'kymamodules'}
      element={
        <Suspense fallback={<Spinner />}>
          <KymaModules />
        </Suspense>
      }
    />
    <Route
      path="kymamodules/namespaces/:namespace/:resourceType/:resourceName"
      element={<KymaModules defaultColumn="details" />}
    />
    <Route
      path="kymamodules/:resourceType/:resourceName"
      element={<KymaModules defaultColumn="details" />}
    />
    <Route
      path={'namespaces/:globalnamespace/kymamodules'}
      element={
        <Suspense fallback={<Spinner />}>
          <KymaModules namespaced={true} />
        </Suspense>
      }
    />
    <Route
      path="namespaces/:globalnamespace/kymamodules/namespaces/:namespace/:resourceType/:resourceName"
      element={<KymaModules defaultColumn="details" namespaced={true} />}
    />
    <Route
      path="namespaces/:globalnamespace/kymamodules/:resourceType/:resourceName"
      element={<KymaModules defaultColumn="details" namespaced={true} />}
    />
  </>
);
