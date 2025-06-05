import { FlexibleColumnLayout } from '@ui5/webcomponents-react';
import React, { Suspense } from 'react';
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
import { KymaModuleContextProvider } from '../../components/KymaModules/providers/KymaModuleProvider';
import { CommunityModuleContextProvider } from 'components/KymaModules/providers/CommunityModuleProvider';
import { ModuleTemplatesContextProvider } from 'components/KymaModules/providers/ModuleTemplatesProvider';

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

  let startColumnComponent = null;

  if (layoutState.layout === 'OneColumn' && defaultColumn === 'details') {
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
        resourceType={layoutState?.midColumn?.resourceType || resourceType}
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
    <ModuleTemplatesContextProvider>
      <KymaModuleContextProvider
        setLayoutColumn={setLayoutColumn}
        layoutState={layoutState}
        DeleteMessageBox={DeleteMessageBox}
        handleResourceDelete={handleResourceDelete}
        showDeleteDialog={showDeleteDialog}
      >
        <CommunityModuleContextProvider
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
              <div className="column-content">
                <Suspense fallback={<Spinner />}>
                  {startColumnComponent}
                </Suspense>
              </div>
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
