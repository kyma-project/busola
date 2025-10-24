import { FlexibleColumnLayout, MessageStrip } from '@ui5/webcomponents-react';
import React, { Suspense, useDeferredValue, useEffect, useState } from 'react';
import { createPortal } from 'react-dom';

import { Route, useParams, useSearchParams } from 'react-router';
import { useAtom } from 'jotai';
import { ErrorBoundary } from 'shared/components/ErrorBoundary/ErrorBoundary';
import { ResourceCreate } from 'shared/components/ResourceCreate/ResourceCreate';
import { Spinner } from 'shared/components/Spinner/Spinner';
import { columnLayoutAtom } from 'state/columnLayoutAtom';
import { useUrl } from 'hooks/useUrl';
import ExtensibilityDetails from 'components/Extensibility/ExtensibilityDetails';
import { t } from 'i18next';
import { useDeleteResource } from 'shared/hooks/useDeleteResource';
import { usePrepareLayoutColumns } from 'shared/hooks/usePrepareLayout';
import { KymaModuleContextProvider } from 'components/Modules/providers/KymaModuleProvider';
import { ModuleTemplatesContextProvider } from 'components/Modules/providers/ModuleTemplatesProvider';
import { CommunityModulesDeleteBoxContextProvider } from 'components/Modules/community/components/CommunityModulesDeleteBox';
import { AddSourceYamls } from 'components/Modules/community/components/AddSourceYamls';
import { CommunityModuleContextProvider } from 'components/Modules/community/providers/CommunityModuleProvider';
import { CommunityModulesUploadProvider } from 'components/Modules/community/providers/CommunitModulesInstalationProvider';
import YamlUploadDialog from 'resources/Namespaces/YamlUpload/YamlUploadDialog';

const KymaModulesList = React.lazy(
  () => import('components/Modules/ModulesList'),
);

const KymaModulesAddModule = React.lazy(
  () => import('../../components/Modules/KymaModulesAddModule'),
);
const CommunityModulesAddModule = React.lazy(
  () => import('components/Modules/community/CommunityModulesAddModule.tsx'),
);

const ColumnWrapper = ({
  defaultColumn = 'list',
  namespaced = false,
  DeleteMessageBox,
  handleResourceDelete,
  showDeleteDialog,
}) => {
  const [layoutState, setLayoutColumn] = useAtom(columnLayoutAtom);
  const { clusterUrl, namespaceUrl } = useUrl();
  const url = namespaced
    ? namespaceUrl('kymamodules')
    : clusterUrl('kymamodules');

  const { resourceName, resourceType, namespace: rawNamespace } = useParams();
  const [searchParams] = useSearchParams();
  const namespace =
    rawNamespace === '-all-'
      ? searchParams.get('resourceNamespace')
      : rawNamespace;
  const [resMetadata, setResMetadata] = useState(null);

  useEffect(() => {
    setLayoutColumn((prev) => {
      // Only update if previous values were empty strings
      if (prev?.midColumn?.apiGroup === '') {
        return {
          ...prev,
          midColumn: {
            ...prev.midColumn,
            apiGroup: resMetadata?.group,
            apiVersion: resMetadata?.version,
            rawResourceTypeName: resMetadata?.kind,
          },
        };
      }
      return prev;
    });
  }, [resMetadata, setLayoutColumn]);

  usePrepareLayoutColumns({
    resourceType: resourceType,
    namespaceId: namespace,
    apiGroup: '',
    apiVersion: '',
    resourceName: resourceName,
    isModule: true,
    resource:
      layoutState?.showCreate?.resource ||
      layoutState?.showEdit?.resource ||
      null,
    rawResourceTypeName: '',
  });

  const startColumnComponent = useDeferredValue(
    <div className="column-content">
      {layoutState.layout === 'OneColumn' && defaultColumn === 'details' ? (
        <ExtensibilityDetails
          layoutCloseCreateUrl={url}
          resourceName={layoutState?.midColumn?.resourceName || resourceName}
          resourceType={layoutState?.midColumn?.resourceType || resourceType}
          namespaceId={layoutState?.midColumn?.namespaceId ?? namespace}
          isModule={true}
        />
      ) : (
        <KymaModulesList namespaced={namespaced} />
      )}
    </div>,
  );

  const addSourceYAMLsButton = <AddSourceYamls />;

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
              setResMetadata={setResMetadata}
            />
          </div>
        )}

      {/* create */}
      {!layoutState?.midColumn &&
        (defaultColumn !== 'details' || layoutState.layout !== 'OneColumn') && (
          <div className="column-content">
            {layoutState?.showCreate?.createType === 'community' && (
              <ResourceCreate
                title={t('modules.community.add-module')}
                headerActions={addSourceYAMLsButton}
                confirmText={t('common.buttons.add')}
                layoutCloseCreateUrl={url}
                renderForm={(renderProps) => {
                  return (
                    <ErrorBoundary>
                      <CommunityModulesAddModule {...renderProps} />
                    </ErrorBoundary>
                  );
                }}
              />
            )}
            {layoutState?.showCreate?.createType === 'kyma' && (
              <ResourceCreate
                title={t('kyma-modules.add-module')}
                confirmText={t('common.buttons.add')}
                layoutCloseCreateUrl={url}
                renderForm={(renderProps) => {
                  return (
                    <ErrorBoundary>
                      <KymaModulesAddModule {...renderProps} />
                    </ErrorBoundary>
                  );
                }}
              />
            )}
            {layoutState?.showCreate?.createType !== 'community' &&
              layoutState?.showCreate?.createType !== 'kyma' && (
                <ResourceCreate
                  title={t('kyma-modules.add-module')}
                  confirmText={t('common.buttons.add')}
                  layoutCloseCreateUrl={url}
                  renderForm={(renderProps) => {
                    return (
                      <ErrorBoundary>
                        <div className="sap-margin-small">
                          <MessageStrip design="Critical" hideCloseButton>
                            {t('err-boundary.sth-went-wrong')}
                          </MessageStrip>
                        </div>
                      </ErrorBoundary>
                    );
                  }}
                />
              )}
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
        namespaced={namespaced}
      >
        <CommunityModuleContextProvider>
          <CommunityModulesDeleteBoxContextProvider
            setLayoutColumn={setLayoutColumn}
            layoutState={layoutState}
            DeleteMessageBox={DeleteMessageBox}
            handleResourceDelete={handleResourceDelete}
            showDeleteDialog={showDeleteDialog}
            namespaced={namespaced}
          >
            <CommunityModulesUploadProvider>
              <Suspense fallback={<Spinner />}>
                {createPortal(<YamlUploadDialog />, document.body)}
                <FlexibleColumnLayout
                  style={{ height: '100%' }}
                  layout={layoutState?.layout}
                  startColumn={startColumnComponent}
                  midColumn={
                    midColumnComponent?.props?.children?.some(
                      (component) => !!component,
                    ) ? (
                      midColumnComponent
                    ) : (
                      <Spinner />
                    )
                  }
                />
              </Suspense>
            </CommunityModulesUploadProvider>
          </CommunityModulesDeleteBoxContextProvider>
        </CommunityModuleContextProvider>
      </KymaModuleContextProvider>
    </ModuleTemplatesContextProvider>
  );
};

const KymaModules = ({ defaultColumn, namespaced }) => {
  const [DeleteMessageBox, handleResourceDelete, showDeleteDialog] =
    useDeleteResource({
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
