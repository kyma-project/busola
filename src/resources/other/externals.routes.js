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

const Externals = React.lazy(() =>
  import('../../components/Externals/Externals'),
);

const ColumnWraper = (defaultColumn = 'list') => {
  const [layoutState, setLayoutColumn] = useRecoilState(columnLayoutState);
  const { clusterUrl } = useUrl();
  const layout = 'OneColumn';

  if (layoutState.layout === layout) {
    window.history.pushState(
      window.history.state,
      '',
      `${clusterUrl('externals')}`,
    );
  }
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
      <Button onClick={() => handleResourceDelete({})} design="Transparent">
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
            setLayoutColumn({
              layout: 'OneColumn',
              midColumn: null,
              endColumn: null,
            });
          }}
        />,
        document.body,
      )}
    </>
  );

  startColumnComponent = <Externals />;

  let detailsMidColumn = null;

  return (
    <FlexibleColumnLayout
      style={{ height: '100%' }}
      layout={layoutState?.layout || 'OneColumn'}
      startColumn={<div className="column-content">{startColumnComponent}</div>}
    />
  );
};

export default (
  <>
    <Route
      path={'externals'}
      element={
        <Suspense fallback={<Spinner />}>
          <ColumnWraper />
        </Suspense>
      }
    />
    <Route
      path="externals/namespaces/:namespace/:resourceType/:resourceName"
      element={<ColumnWraper defaultColumn="details" />}
    />
    <Route
      path="externals/:resourceType/:resourceName"
      element={<ColumnWraper defaultColumn="details" />}
    />
  </>
);
