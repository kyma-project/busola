import { FlexibleColumnLayout } from '@ui5/webcomponents-react';
import React, { Suspense, useEffect, useState } from 'react';
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
import { cloneDeep } from 'lodash';
import { useKymaQuery } from 'components/KymaModules/kymaModulesQueries';
import { usePrepareLayoutColumns } from 'shared/hooks/usePrepareLayout';
import { KymaModuleContextProvider } from '../../components/KymaModules/providers/KymaModuleProvider';

const KymaModulesList = React.lazy(() =>
  import('../../components/KymaModules/KymaModulesList'),
);

const KymaModulesAddModule = React.lazy(() =>
  import('../../components/KymaModules/KymaModulesAddModule'),
);

const ColumnWraper = ({ defaultColumn = 'list', namespaced = false }) => {
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
    resource:
      layoutState?.showCreate?.resource ||
      layoutState?.showEdit?.resource ||
      null,
  });

  const {
    data: kymaResource,
    loading: kymaResourceLoading,
    resourceUrl,
  } = useKymaQuery();

  const [activeKymaModules, setActiveKymaModules] = useState(
    kymaResource?.spec?.modules ?? [],
  );

  useEffect(() => {
    if (kymaResource) {
      setActiveKymaModules(kymaResource?.spec?.modules || []);
      setKymaResourceState(kymaResource);
      setInitialUnchangedResource(cloneDeep(kymaResource));
    }
  }, [kymaResource]);

  const [initialUnchangedResource, setInitialUnchangedResource] = useState();
  const [kymaResourceState, setKymaResourceState] = useState();

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
      <KymaModuleContextProvider
        setLayoutColumn={setLayoutColumn}
        layoutState={layoutState}
        skipModuleTemplateQuery={
          layoutState?.midColumn?.resourceName || resourceName
        }
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

  return (
    <ColumnWraper
      defaultColumn={defaultColumn}
      namespaced={namespaced}
      DeleteMessageBox={DeleteMessageBox}
      handleResourceDelete={handleResourceDelete}
      showDeleteDialog={showDeleteDialog}
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
