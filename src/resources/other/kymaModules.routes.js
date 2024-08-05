import { Button, FlexibleColumnLayout } from '@ui5/webcomponents-react';
import React, { Suspense, useEffect, useState } from 'react';
import { Route, useParams } from 'react-router-dom';
import { useRecoilState } from 'recoil';
import { ErrorBoundary } from 'shared/components/ErrorBoundary/ErrorBoundary';
import { ResourceCreate } from 'shared/components/ResourceCreate/ResourceCreate';
import { Spinner } from 'shared/components/Spinner/Spinner';
import { columnLayoutState } from 'state/columnLayoutAtom';
import { useUrl } from 'hooks/useUrl';
import ExtensibilityDetails from 'components/Extensibility/ExtensibilityDetails';
import { t } from 'i18next';
import { createPortal } from 'react-dom';
import { useDeleteResource } from 'shared/hooks/useDeleteResource';
import { useNotification } from 'shared/contexts/NotificationContext';
import { useCreateResource } from 'shared/ResourceForm/useCreateResource';
import { cloneDeep } from 'lodash';
import { useGet } from 'shared/hooks/BackendAPI/useGet';

const KymaModulesList = React.lazy(() =>
  import('../../components/KymaModules/KymaModulesList'),
);

const KymaModulesAddModule = React.lazy(() =>
  import('../../components/KymaModules/KymaModulesAddModule'),
);

const ColumnWraper = (defaultColumn = 'list') => {
  const [layoutState, setLayoutColumn] = useRecoilState(columnLayoutState);
  const { clusterUrl } = useUrl();
  const layout = 'OneColumn';
  const { resourceName, resourceType, namespace } = useParams();
  const initialLayoutState = {
    layout: layout,
    midColumn: {
      resourceName: resourceName,
      resourceType: resourceType,
      namespaceId: namespace,
    },
    endColumn: null,
  };

  useEffect(() => {
    if (layout && resourceName && resourceType) {
      setLayoutColumn(initialLayoutState);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [layout, namespace, resourceName, resourceType]);

  const [DeleteMessageBox, handleResourceDelete] = useDeleteResource({
    resourceType: t('kyma-modules.title'),
    forceConfirmDelete: true,
  });

  const { data: kymaResources, loading: kymaResourcesLoading } = useGet(
    '/apis/operator.kyma-project.io/v1beta2/namespaces/kyma-system/kymas',
  );
  const kymaResourceName =
    kymaResources?.items.find(kymaResource => kymaResource?.status)?.metadata
      .name || kymaResources?.items[0]?.metadata?.name;
  const resourceUrl = `/apis/operator.kyma-project.io/v1beta2/namespaces/kyma-system/kymas/${kymaResourceName}`;

  const { data: kymaResource, loading: kymaResourceLoading } = useGet(
    resourceUrl,
    {
      pollingInterval: 3000,
      skip: !kymaResourceName,
    },
  );
  const [selectedModules, setSelectedModules] = useState(
    kymaResource?.spec?.modules ?? [],
  );
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [openedModuleIndex, setOpenedModuleIndex] = useState();
  useEffect(() => {
    if (kymaResource) {
      setSelectedModules(kymaResource?.spec?.modules || []);
      setKymaResourceState(kymaResource);
      setInitialUnchangedResource(cloneDeep(kymaResource));
    }
  }, [kymaResource]);

  useEffect(() => {
    if (layoutState?.layout) {
      setDetailsOpen(layoutState?.layout !== 'OneColumn');
    }
  }, [layoutState]);

  const [initialUnchangedResource, setInitialUnchangedResource] = useState();
  const [kymaResourceState, setKymaResourceState] = useState();
  const notification = useNotification();
  const handleModuleUninstall = useCreateResource({
    singularName: 'Kyma',
    pluralKind: 'Kymas',
    resource: kymaResourceState,
    initialUnchangedResource: initialUnchangedResource,
    createUrl: resourceUrl,
    afterCreatedFn: () =>
      notification.notifySuccess({
        content: t('kyma-modules.module-uninstall'),
      }),
  });

  let startColumnComponent = null;

  const headerActions = (
    <>
      <Button
        onClick={() =>
          handleResourceDelete({
            deleteFn: () => {
              selectedModules.splice(openedModuleIndex, 1);
              setKymaResourceState({
                ...kymaResource,
                spec: {
                  ...kymaResource.spec,
                  modules: selectedModules,
                },
              });
              handleModuleUninstall();
            },
          })
        }
        design="Transparent"
      >
        {t('common.buttons.delete-module')}
      </Button>
      {createPortal(
        <DeleteMessageBox
          resourceTitle={selectedModules[openedModuleIndex]?.name}
          deleteFn={() => {
            selectedModules.splice(openedModuleIndex, 1);
            setKymaResourceState({
              ...kymaResource,
              spec: {
                ...kymaResource.spec,
                modules: selectedModules,
              },
            });
            handleModuleUninstall();
            setInitialUnchangedResource(cloneDeep(kymaResourceState));
          }}
        />,
        document.body,
      )}
    </>
  );

  if (!layout && defaultColumn === 'details') {
    startColumnComponent = (
      <ExtensibilityDetails
        layoutCloseCreateUrl={clusterUrl('kymamodules')}
        resourceName={layoutState?.midColumn?.resourceName || resourceName}
        resourceType={layoutState?.midColumn?.resourceType || resourceType}
        namespaceId={
          layoutState?.midColumn?.namespaceId ||
          layoutState?.midColumn?.namespaceId === ''
            ? layoutState?.midColumn?.namespaceId
            : namespace
        }
        isModule={true}
        headerActions={headerActions}
      />
    );
  } else {
    startColumnComponent = (
      <KymaModulesList
        DeleteMessageBox={DeleteMessageBox}
        handleResourceDelete={handleResourceDelete}
        handleModuleUninstall={handleModuleUninstall}
        setKymaResourceState={setKymaResourceState}
        setInitialUnchangedResource={setInitialUnchangedResource}
        resourceName={kymaResourceName}
        resourceUrl={resourceUrl}
        kymaResource={kymaResource}
        kymaResourceLoading={kymaResourceLoading}
        kymaResourcesLoading={kymaResourcesLoading}
        kymaResourceState={kymaResourceState}
        selectedModules={selectedModules}
        setOpenedModuleIndex={setOpenedModuleIndex}
        detailsOpen={detailsOpen}
      />
    );
  }

  let detailsMidColumn = null;
  if (!layoutState?.showCreate && layoutState?.midColumn) {
    detailsMidColumn = (
      <ExtensibilityDetails
        layoutCloseCreateUrl={clusterUrl('kymamodules')}
        resourceName={layoutState?.midColumn?.resourceName || resourceName}
        resourceType={layoutState?.midColumn?.resourceType || resourceType}
        namespaceId={
          layoutState?.midColumn?.namespaceId ||
          layoutState?.midColumn?.namespaceId === ''
            ? layoutState?.midColumn?.namespaceId
            : namespace
        }
        isModule={true}
        headerActions={headerActions}
      />
    );
  }

  const createMidColumn = (
    <ResourceCreate
      title={t('kyma-modules.add-module')}
      confirmText={t('common.buttons.add')}
      layoutCloseCreateUrl={clusterUrl('kymamodules')}
      renderForm={renderProps => {
        return (
          <ErrorBoundary>
            <KymaModulesAddModule
              resourceName={kymaResourceName}
              loadingKymaResources={kymaResourcesLoading}
              kymaResourceUrl={resourceUrl}
              initialKymaResource={kymaResource}
              loading={kymaResourceLoading}
              selectedModules={selectedModules}
              initialUnchangedResource={initialUnchangedResource}
              kymaResource={kymaResourceState}
              setKymaResource={setKymaResourceState}
              props={renderProps}
            />
          </ErrorBoundary>
        );
      }}
    />
  );

  return (
    <FlexibleColumnLayout
      style={{ height: '100%' }}
      layout={layoutState?.layout || 'OneColumn'}
      startColumn={<div className="column-content">{startColumnComponent}</div>}
      midColumn={
        <>
          {!layoutState?.showCreate &&
            (defaultColumn !== 'details' || layout) && (
              <div className="column-content">{detailsMidColumn}</div>
            )}
          {!layoutState?.midColumn &&
            (defaultColumn !== 'details' || layout) && (
              <div className="column-content">{createMidColumn}</div>
            )}
        </>
      }
    />
  );
};

export default (
  <>
    <Route
      path={'kymamodules'}
      element={
        <Suspense fallback={<Spinner />}>
          <ColumnWraper />
        </Suspense>
      }
    />
    <Route
      path="kymamodules/namespaces/:namespace/:resourceType/:resourceName"
      element={<ColumnWraper defaultColumn="details" />}
    />
    <Route
      path="kymamodules/:resourceType/:resourceName"
      element={<ColumnWraper defaultColumn="details" />}
    />
  </>
);
