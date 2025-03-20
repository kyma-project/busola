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
import {
  useKymaQuery,
  useModuleTemplatesQuery,
} from 'components/KymaModules/kymaModulesQueries';
import { ModulesDeleteBox } from 'components/KymaModules/components/ModulesDeleteBox';

const KymaModulesList = React.lazy(() =>
  import('../../components/KymaModules/KymaModulesList'),
);

const KymaModulesAddModule = React.lazy(() =>
  import('../../components/KymaModules/KymaModulesAddModule'),
);

const ColumnWraper = ({ defaultColumn = 'list', namespaced = false }) => {
  const [layoutState, setLayoutColumn] = useRecoilState(columnLayoutState);
  const { clusterUrl, namespaceUrl } = useUrl();
  const layout = 'OneColumn';
  const url = namespaced
    ? namespaceUrl('kymamodules')
    : clusterUrl('kymamodules');

  if (layoutState.layout === layout) {
    window.history.pushState(window.history.state, '', url);
  }

  const { resourceName, resourceType, namespace } = useParams();

  const initialLayoutState = {
    layout: layout,
    startColumn: {
      resourceType: resourceType,
      namespaceId: namespace,
    },
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

  const {
    data: kymaResource,
    loading: kymaResourceLoading,
    resourceUrl,
  } = useKymaQuery();
  const [activeKymaModules, setActiveKymaModules] = useState(
    kymaResource?.spec?.modules ?? [],
  );
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [openedModuleIndex, setOpenedModuleIndex] = useState();
  useEffect(() => {
    if (kymaResource) {
      setActiveKymaModules(kymaResource?.spec?.modules || []);
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

  // Force delete functionality

  // Fetching all Module Templates can be replaced with fetching one by one from api after implementing https://github.com/kyma-project/lifecycle-manager/issues/2232
  const { data: moduleTemplates } = useModuleTemplatesQuery({
    skip: !(layoutState?.midColumn?.resourceName || resourceName),
  });

  let startColumnComponent = null;

  const headerActions = (
    <div>
      <Button onClick={() => handleResourceDelete({})} design="Transparent">
        {t('common.buttons.delete-module')}
      </Button>
    </div>
  );

  if (!layout && defaultColumn === 'details') {
    startColumnComponent = (
      <ExtensibilityDetails
        layoutCloseCreateUrl={url}
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
        resourceName={kymaResource?.metadata?.name}
        resourceUrl={resourceUrl}
        kymaResource={kymaResource}
        kymaResourceLoading={kymaResourceLoading}
        selectedModules={activeKymaModules}
        namespaced={namespaced}
        setOpenedModuleIndex={setOpenedModuleIndex}
        handleResourceDelete={handleResourceDelete}
      />
    );
  }

  let detailsMidColumn = null;
  if (!layoutState?.showCreate && layoutState?.midColumn) {
    detailsMidColumn = (
      <ExtensibilityDetails
        layoutCloseCreateUrl={url}
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
      layoutCloseCreateUrl={url}
      renderForm={renderProps => {
        return (
          <ErrorBoundary>
            <KymaModulesAddModule
              resourceName={kymaResource}
              kymaResourceUrl={resourceUrl}
              initialKymaResource={kymaResource}
              loading={kymaResourceLoading}
              activeKymaModules={activeKymaModules}
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
    <>
      {createPortal(
        <ModulesDeleteBox
          DeleteMessageBox={DeleteMessageBox}
          selectedModules={activeKymaModules}
          chosenModuleIndex={openedModuleIndex}
          kymaResource={kymaResource}
          kymaResourceState={kymaResourceState}
          moduleTemplates={moduleTemplates}
          detailsOpen={detailsOpen}
          setKymaResourceState={setKymaResourceState}
          setInitialUnchangedResource={setInitialUnchangedResource}
          setChosenModuleIndex={setOpenedModuleIndex}
          handleModuleUninstall={handleModuleUninstall}
          setLayoutColumn={setLayoutColumn}
        />,
        document.body,
      )}
      <FlexibleColumnLayout
        style={{ height: '100%' }}
        layout={layoutState?.layout || 'OneColumn'}
        startColumn={
          <div className="column-content">{startColumnComponent}</div>
        }
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
    </>
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
    <Route
      path={'namespaces/:globalnamespace/kymamodules'}
      element={
        <Suspense fallback={<Spinner />}>
          <ColumnWraper namespaced={true} />
        </Suspense>
      }
    />
    <Route
      path="namespaces/:globalnamespace/kymamodules/namespaces/:namespace/:resourceType/:resourceName"
      element={<ColumnWraper defaultColumn="details" namespaced={true} />}
    />
    <Route
      path="namespaces/:globalnamespace/kymamodules/:resourceType/:resourceName"
      element={<ColumnWraper defaultColumn="details" namespaced={true} />}
    />
  </>
);
