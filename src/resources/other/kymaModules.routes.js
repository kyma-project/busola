import {
  Button,
  CheckBox,
  FlexibleColumnLayout,
  List,
  ListItemStandard,
  MessageStrip,
  Text,
} from '@ui5/webcomponents-react';

import React, { Suspense, useEffect, useMemo, useState } from 'react';
import { Route, useNavigate, useParams } from 'react-router-dom';

import pluralize from 'pluralize';
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
import { useDelete } from 'shared/hooks/BackendAPI/useMutation';
import { useNotification } from 'shared/contexts/NotificationContext';
import { useCreateResource } from 'shared/ResourceForm/useCreateResource';
import { cloneDeep } from 'lodash';
import {
  useKymaQuery,
  useModuleTemplatesQuery,
} from 'components/KymaModules/kymaModulesQueries';
import { useGetScope, useSingleGet } from 'shared/hooks/BackendAPI/useGet';

import {
  checkIfAssociatedResourceLeft,
  deleteAssociatedResources,
  deleteCrResources,
  fetchResourceCounts,
  generateAssociatedResourcesUrls,
  getAssociatedResources,
  getCRResource,
  handleItemClick,
} from 'components/KymaModules/deleteModulesHelpers';
import { usePrepareLayoutColumns } from 'shared/hooks/usePrepareLayout';

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
  });

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

  const fetchFn = useSingleGet();
  const getScope = useGetScope();
  const navigate = useNavigate();
  const deleteResourceMutation = useDelete();

  const [resourceCounts, setResourceCounts] = useState({});
  const [forceDeleteUrls, setForceDeleteUrls] = useState([]);
  const [crUrls, setCrUrls] = useState([]);
  const [allowForceDelete, setAllowForceDelete] = useState(false);
  const [associatedResourceLeft, setAssociatedResourceLeft] = useState(false);

  const associatedResources = useMemo(
    () =>
      getAssociatedResources(
        openedModuleIndex,
        activeKymaModules,
        kymaResource,
        moduleTemplates,
      ),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [openedModuleIndex, moduleTemplates],
  );

  useEffect(() => {
    const fetchCounts = async () => {
      const counts = await fetchResourceCounts(associatedResources, fetchFn);
      const urls = await generateAssociatedResourcesUrls(
        associatedResources,
        fetchFn,
        clusterUrl,
        getScope,
        namespaceUrl,
        navigate,
      );
      const crUResources = getCRResource(
        openedModuleIndex,
        activeKymaModules,
        kymaResource,
        moduleTemplates,
      );
      const crUrl = await generateAssociatedResourcesUrls(
        crUResources,
        fetchFn,
        clusterUrl,
        getScope,
        namespaceUrl,
        navigate,
      );
      setResourceCounts(counts);
      setForceDeleteUrls(urls);
      setCrUrls([crUrl]);
    };
    fetchCounts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [associatedResources]);

  useEffect(() => {
    const resourcesLeft = checkIfAssociatedResourceLeft(
      resourceCounts,
      associatedResources,
    );

    setAssociatedResourceLeft(resourcesLeft);

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resourceCounts, associatedResources]);

  let startColumnComponent = null;

  const headerActions = (
    <div>
      <Button onClick={() => handleResourceDelete({})} design="Transparent">
        {t('common.buttons.delete-module')}
      </Button>
      {createPortal(
        <DeleteMessageBox
          disableDeleteButton={
            associatedResourceLeft ? !allowForceDelete : false
          }
          customDeleteText={
            associatedResourceLeft && allowForceDelete
              ? 'common.buttons.cascade-delete'
              : null
          }
          cancelFn={() => {
            setAllowForceDelete(false);
          }}
          additionalDeleteInfo={
            <>
              <Text>
                {t('kyma-modules.delete-module', {
                  name: activeKymaModules[openedModuleIndex]?.name,
                })}
              </Text>
              {associatedResources.length > 0 && (
                <>
                  <MessageStrip
                    design="Information"
                    hideCloseButton
                    className="sap-margin-top-small"
                  >
                    {t('kyma-modules.associated-resources-warning')}
                  </MessageStrip>
                  <List
                    headerText={t('kyma-modules.associated-resources')}
                    mode="None"
                    separators="All"
                  >
                    {associatedResources.map(assResource => {
                      const resourceCount =
                        resourceCounts[
                          `${assResource.kind}-${assResource.group}-${assResource.version}`
                        ];

                      return (
                        <ListItemStandard
                          onClick={e => {
                            e.preventDefault();
                            handleItemClick(
                              assResource.kind,
                              assResource.group,
                              assResource.version,
                              clusterUrl,
                              getScope,
                              namespaceUrl,
                              navigate,
                            );
                          }}
                          type="Active"
                          key={`${assResource.kind}-${assResource.group}-${assResource.version}`}
                          additionalText={
                            (resourceCount === 0 ? '0' : resourceCount) ||
                            t('common.headers.loading')
                          }
                        >
                          {pluralize(assResource?.kind)}
                        </ListItemStandard>
                      );
                    })}
                  </List>
                  {associatedResourceLeft && (
                    <CheckBox
                      checked={allowForceDelete}
                      onChange={() => setAllowForceDelete(!allowForceDelete)}
                      accessibleName={t('kyma-modules.cascade-delete')}
                      text={t('kyma-modules.cascade-delete')}
                      className="sap-margin-top-tiny"
                    />
                  )}

                  {associatedResourceLeft && allowForceDelete && (
                    <MessageStrip
                      design="Critical"
                      hideCloseButton
                      className="sap-margin-y-small"
                    >
                      {t('kyma-modules.cascade-delete-warning')}
                    </MessageStrip>
                  )}
                </>
              )}
            </>
          }
          resourceTitle={activeKymaModules[openedModuleIndex]?.name}
          deleteFn={() => {
            if (allowForceDelete && forceDeleteUrls.length > 0) {
              deleteAssociatedResources(
                deleteResourceMutation,
                forceDeleteUrls,
              );
            }
            activeKymaModules.splice(openedModuleIndex, 1);
            setKymaResourceState({
              ...kymaResource,
              spec: {
                ...kymaResource.spec,
                modules: activeKymaModules,
              },
            });
            handleModuleUninstall();
            setInitialUnchangedResource(cloneDeep(kymaResourceState));
            setLayoutColumn({
              layout: 'OneColumn',
              startColumn: null,
              midColumn: null,
              endColumn: null,
            });
            if (allowForceDelete && forceDeleteUrls.length > 0) {
              deleteCrResources(deleteResourceMutation, crUrls);
            }
          }}
        />,
        document.body,
      )}
    </div>
  );

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
        resourceName={kymaResource?.metadata?.name}
        resourceUrl={resourceUrl}
        kymaResource={kymaResource}
        kymaResourceLoading={kymaResourceLoading}
        kymaResourceState={kymaResourceState}
        selectedModules={activeKymaModules}
        setOpenedModuleIndex={setOpenedModuleIndex}
        detailsOpen={detailsOpen}
        namespaced={namespaced}
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
    <FlexibleColumnLayout
      style={{ height: '100%' }}
      layout={layoutState?.layout}
      startColumn={<div className="column-content">{startColumnComponent}</div>}
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
