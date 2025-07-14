import { FlexibleColumnLayout } from '@ui5/webcomponents-react';
import React, { Suspense, useDeferredValue } from 'react';
import { Route, useParams } from 'react-router';
import { useRecoilState } from 'recoil';
import { ErrorBoundary } from 'shared/components/ErrorBoundary/ErrorBoundary';
import { ResourceCreate } from 'shared/components/ResourceCreate/ResourceCreate';
import { Spinner } from 'shared/components/Spinner/Spinner';
import { columnLayoutState } from 'state/columnLayoutAtom';
import { useUrl } from 'hooks/useUrl';
import ExtensibilityDetails from 'components/Extensibility/ExtensibilityDetails';
import { t } from 'i18next';
import { useDeleteResource } from 'shared/hooks/useDeleteResource';
import { usePrepareLayoutColumns } from 'shared/hooks/usePrepareLayout';
import { KymaModuleContextProvider } from 'components/KymaModules/providers/KymaModuleProvider';
import { ModuleTemplatesContextProvider } from 'components/KymaModules/providers/ModuleTemplatesProvider';
import { CommunityModulesDeleteBoxContextProvider } from 'components/KymaModules/components/CommunityModulesDeleteBox';
import { CommunityModuleContextProvider } from 'components/KymaModules/providers/CommunityModuleProvider';

const KymaModulesList = React.lazy(() =>
  import('../../components/KymaModules/KymaModulesList'),
);

const KymaModulesAddModule = React.lazy(() =>
  import('../../components/KymaModules/KymaModulesAddModule'),
);

const ColumnWrapper = ({
  defaultColumn = 'list',
  namespaced = false,
  DeleteMessageBox,
  handleResourceDelete,
  showDeleteDialog,
}) => {
  const [layoutState, setLayoutColumn] = useRecoilState(columnLayoutState);
  const { clusterUrl, namespaceUrl } = useUrl();
  const url = namespaced
    ? namespaceUrl('kymamodules')
    : clusterUrl('kymamodules');

  const { resourceName, resourceType, namespace } = useParams();

  usePrepareLayoutColumns({
    resourceType: resourceType,
    namespaceId: namespace,
    apiGroup: '',
    apiVersion: 'v1',
    resourceName: resourceName,
    isModule: true,
    resource:
      layoutState?.showCreate?.resource ||
      layoutState?.showEdit?.resource ||
      null,
    rawResourceTypeName: 'Kyma',
  });

  const startColumnComponent = useDeferredValue(
    <div className="column-content">
      {layoutState.layout === 'OneColumn' && defaultColumn === 'details' ? (
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
        />
      ) : (
        <KymaModulesList namespaced={namespaced} />
      )}
    </div>,
  );

  const midColumnComponent = (
    <>
      {/* details */}
      {!layoutState?.showCreate &&
        layoutState?.midColumn &&
        (defaultColumn !== 'details' || layoutState.layout !== 'OneColumn') && (
          <div className="column-content">
            <ExtensibilityDetails
              layoutCloseCreateUrl={url}
              resourceName={
                layoutState?.midColumn?.resourceName || resourceName
              }
              resourceType={
                layoutState?.midColumn?.resourceType || resourceType
              }
              namespaceId={
                layoutState?.midColumn?.namespaceId ||
                layoutState?.midColumn?.namespaceId === ''
                  ? layoutState?.midColumn?.namespaceId
                  : namespace
              }
              isModule={true}
            />
          </div>
        )}
      {/* create */}
      {!layoutState?.midColumn &&
        (defaultColumn !== 'details' || layoutState.layout !== 'OneColumn') && (
          <div className="column-content">
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
          </div>
        )}
    </>
  );

  return (
    <ModuleTemplatesContextProvider>
      <KymaModuleContextProvider
        setLayoutColumn={setLayoutColumn}
        layoutState={layoutState}
        DeleteMessageBox={DeleteMessageBox}
        handleResourceDelete={handleResourceDelete}
        showDeleteDialog={showDeleteDialog}
      >
        <CommunityModuleContextProvider>
          <CommunityModulesDeleteBoxContextProvider
            setLayoutColumn={setLayoutColumn}
            layoutState={layoutState}
            DeleteMessageBox={DeleteMessageBox}
            handleResourceDelete={handleResourceDelete}
            showDeleteDialog={showDeleteDialog}
          >
            <Suspense fallback={<Spinner />}>
              <FlexibleColumnLayout
                style={{ height: '100%' }}
                layout={layoutState?.layout}
                startColumn={startColumnComponent}
                midColumn={midColumnComponent}
              />
            </Suspense>
          </CommunityModulesDeleteBoxContextProvider>
        </CommunityModuleContextProvider>
      </KymaModuleContextProvider>
    </ModuleTemplatesContextProvider>
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
  return (
    <Suspense fallback={<Spinner />}>
      <ColumnWrapper
        defaultColumn={defaultColumn}
        namespaced={namespaced}
        DeleteMessageBox={DeleteMessageBox}
        handleResourceDelete={handleResourceDelete}
        showDeleteDialog={showDeleteDialog}
      />
    </Suspense>
  );
};

export default (
  <>
    <Route path={'kymamodules'} element={<KymaModules />} />
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
      element={<KymaModules namespaced={true} />}
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
