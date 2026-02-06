import React, { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  CheckBox,
  List,
  ListItemStandard,
  MessageStrip,
} from '@ui5/webcomponents-react';
import {
  checkIfAllResourcesAreDeleted,
  checkIfAssociatedResourceLeft,
  deleteResources,
  fetchResourceCounts,
  generateAssociatedResourcesUrls,
  getAssociatedResources,
  getCommunityResources,
  getCommunityResourceUrls,
  getCRResource,
  handleItemClick,
} from '../deleteModulesHelpers';
import { useNavigate } from 'react-router';
import { useGetScope, useSingleGet } from 'shared/hooks/BackendAPI/useGet';
import { useUrl } from 'hooks/useUrl';
import pluralize from 'pluralize';
import { useDelete } from 'shared/hooks/BackendAPI/useMutation';
import { cloneDeep } from 'lodash';
import { KymaResourceType, ModuleTemplateListType } from '../support';
import { columnLayoutAtom, ColumnLayoutState } from 'state/columnLayoutAtom';
import { usePost } from 'shared/hooks/BackendAPI/usePost';
import { SetStateAction, useAtomValue } from 'jotai';
import { allNodesAtom } from 'state/navigation/allNodesAtom';
import { useNotification } from 'shared/contexts/NotificationContext';

type ModulesListDeleteBoxProps = {
  DeleteMessageBox: React.FC<any>;
  moduleTemplates: ModuleTemplateListType;
  selectedModules: { name: string }[];
  chosenModuleIndex: number;
  kymaResource: KymaResourceType;
  kymaResourceState?: KymaResourceType;
  detailsOpen: boolean;
  isCommunity?: boolean;
  namespaced: boolean;
  showDeleteDialog: boolean;
  performDelete: () => void;
  performCancel: () => void;
  setLayoutColumn: (update: SetStateAction<ColumnLayoutState>) => void;
  handleModuleUninstall: () => void;
  setChosenModuleIndex: React.Dispatch<React.SetStateAction<number | null>>;
  setInitialUnchangedResource: React.Dispatch<React.SetStateAction<any>>;
  setKymaResourceState: React.Dispatch<React.SetStateAction<any>>;
};

export const ModulesDeleteBox = ({
  DeleteMessageBox,
  moduleTemplates,
  selectedModules,
  chosenModuleIndex,
  kymaResource,
  kymaResourceState,
  detailsOpen,
  isCommunity,
  namespaced,
  showDeleteDialog,
  performDelete,
  performCancel,
  setLayoutColumn,
  handleModuleUninstall,
  setChosenModuleIndex,
  setKymaResourceState,
  setInitialUnchangedResource,
}: ModulesListDeleteBoxProps) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const getScope = useGetScope();
  const { clusterUrl, namespaceUrl } = useUrl();
  const deleteFn = useDelete();
  const singleGet = useSingleGet();
  const post = usePost();
  const clusterNodes = useAtomValue(allNodesAtom).filter(
    (node) => !node.namespaced,
  );
  const namespaceNodes = useAtomValue(allNodesAtom).filter(
    (node) => node.namespaced,
  );
  const [resourceCounts, setResourceCounts] = useState<Record<
    string,
    any
  > | null>(null);
  const [associatedResourcesUrls, setAssociatedResourcesUrls] = useState<
    string[]
  >([]);
  const [crUrls, setCrUrls] = useState<string[]>([]);
  const [communityResourcesUrls, setCommunityResourcesUrls] = useState<
    string[]
  >([]);
  const [allowForceDelete, setAllowForceDelete] = useState(false);
  const [associatedResourceLeft, setAssociatedResourceLeft] = useState<
    boolean | null
  >(null);

  const layoutColumn = useAtomValue(columnLayoutAtom);
  const notification = useNotification();

  const kymaModulesUrl = namespaced
    ? namespaceUrl('kymamodules')
    : clusterUrl('kymamodules');

  const associatedResources = useMemo(
    () =>
      getAssociatedResources(
        chosenModuleIndex,
        selectedModules,
        kymaResource,
        moduleTemplates,
      ),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [chosenModuleIndex, moduleTemplates],
  );

  useEffect(() => {
    const fetchCounts = async () => {
      const counts = await fetchResourceCounts(associatedResources, singleGet);
      const urls = await generateAssociatedResourcesUrls(
        associatedResources,
        singleGet,
        getScope,
      );

      const crUResources = getCRResource(
        chosenModuleIndex,
        selectedModules,
        kymaResource,
        moduleTemplates,
        isCommunity,
      );

      const crUrl = isCommunity
        ? await getCommunityResourceUrls(
            crUResources,
            clusterNodes,
            namespaceNodes,
            singleGet,
          )
        : await generateAssociatedResourcesUrls(
            crUResources,
            singleGet,
            getScope,
          );

      if (isCommunity) {
        const communityResources = await getCommunityResources(
          chosenModuleIndex,
          selectedModules,
          kymaResource,
          moduleTemplates,
          post,
        );
        const communityUrls = await getCommunityResourceUrls(
          communityResources,
          clusterNodes,
          namespaceNodes,
          singleGet,
        );
        setCommunityResourcesUrls(communityUrls);
      }

      setResourceCounts(counts);
      setAssociatedResourcesUrls(urls);
      setCrUrls(Array.isArray(crUrl) ? crUrl : [crUrl]);
    };
    fetchCounts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [associatedResources]);

  useEffect(() => {
    // Don't update state until resource counts have been fetched
    if (associatedResources.length > 0 && resourceCounts === null) {
      return;
    }

    const resourcesLeft = checkIfAssociatedResourceLeft(
      resourceCounts ?? {},
      associatedResources,
    );

    setAssociatedResourceLeft(resourcesLeft);
  }, [resourceCounts, associatedResources]);

  const deleteAllResources = async () => {
    try {
      if (allowForceDelete && associatedResourcesUrls.length > 0) {
        await deleteResources(deleteFn, associatedResourcesUrls);
      }
    } catch (e) {
      notification.notifyError({
        content: t('modules.community.messages.delete-failure', {
          module: selectedModules[chosenModuleIndex]?.name,
          error: e instanceof Error ? e.message : e,
        }),
      });
      return;
    }
    if (chosenModuleIndex != null) {
      selectedModules.splice(chosenModuleIndex, 1);
    }
    if (!isCommunity && kymaResource) {
      setKymaResourceState({
        ...kymaResource,
        spec: {
          ...kymaResource.spec,
          modules: selectedModules,
        },
      });
      handleModuleUninstall();
      setInitialUnchangedResource(cloneDeep(kymaResourceState));
    }

    try {
      if (allowForceDelete && crUrls.length > 0) {
        await deleteResources(deleteFn, crUrls);
      }
    } catch (e) {
      notification.notifyError({
        content: t('modules.community.messages.delete-failure', {
          module: selectedModules[chosenModuleIndex]?.name,
          error: e instanceof Error ? e.message : e,
        }),
      });
      return;
    }

    if (detailsOpen) {
      setLayoutColumn({
        ...layoutColumn,
        layout: 'OneColumn',
        midColumn: null,
        endColumn: null,
      });
      navigate(kymaModulesUrl);
    }
  };

  const deleteCommunityResources = async (moduleName: string) => {
    try {
      if (allowForceDelete && associatedResourcesUrls.length) {
        await deleteResources(deleteFn, associatedResourcesUrls);
        const allStillExistingResources = await checkIfAllResourcesAreDeleted(
          singleGet,
          associatedResourcesUrls,
          t,
        );
        if (allStillExistingResources.length !== 0) {
          notification.notifyError({
            content: t('modules.community.messages.resources-delete-failure', {
              module: moduleName,
              resources: allStillExistingResources.join(','),
            }),
          });
          return;
        }
      }
      if (allowForceDelete && crUrls?.length) {
        await deleteResources(deleteFn, crUrls);
      }
      if (communityResourcesUrls?.length) {
        await deleteResources(deleteFn, communityResourcesUrls);
      }
    } catch (e: unknown) {
      console.warn('Error while deleting community module', e);
      notification.notifyError({
        content: t('modules.community.messages.delete-failure', {
          module: moduleName,
          error: e instanceof Error && e?.message ? e.message : '',
        }),
      });
      return;
    }

    if (detailsOpen) {
      setLayoutColumn({
        ...layoutColumn,
        layout: 'OneColumn',
        startColumn: null,
        midColumn: null,
        endColumn: null,
      });
      navigate(kymaModulesUrl);
    }
  };

  const moduleName =
    chosenModuleIndex != null ? selectedModules[chosenModuleIndex]?.name : '';

  return (
    <DeleteMessageBox
      showDeleteDialog={showDeleteDialog}
      performDelete={performDelete}
      performCancel={performCancel}
      additionalPadding
      disableDeleteButton={
        associatedResourceLeft === null ||
        (associatedResourceLeft && !allowForceDelete)
      }
      customDeleteText={
        associatedResourceLeft && allowForceDelete
          ? 'common.buttons.cascade-delete'
          : null
      }
      customTitle={t('kyma-modules.delete-module-title')}
      customMessage={t('kyma-modules.delete-module', { name: moduleName })}
      cancelFn={() => {
        setAllowForceDelete(false);
        setChosenModuleIndex(null);
      }}
      additionalDeleteInfo={
        <>
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
                selectionMode="None"
                separators="All"
              >
                {associatedResources.map(
                  (associatedResource: {
                    kind: string;
                    group: string;
                    version: string;
                  }) => {
                    const key = `${associatedResource.kind}-${associatedResource.group}-${associatedResource.version}`;
                    const resourceCount = resourceCounts?.[key];
                    let additionalText = t(
                      'modules.associated-resources.loading',
                    );
                    if (resourceCount !== undefined) {
                      if (resourceCount === -1) {
                        additionalText = t(
                          'modules.associated-resources.error',
                        );
                      } else {
                        additionalText = resourceCount;
                      }
                    }
                    return (
                      <ListItemStandard
                        onClick={(e) => {
                          e.preventDefault();
                          handleItemClick(
                            associatedResource.kind,
                            associatedResource.group,
                            associatedResource.version,
                            clusterUrl,
                            getScope,
                            namespaceUrl,
                            navigate,
                          );
                        }}
                        type="Active"
                        key={key}
                        additionalText={additionalText}
                      >
                        {pluralize(associatedResource?.kind)}
                      </ListItemStandard>
                    );
                  },
                )}
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
      resourceTitle={selectedModules[chosenModuleIndex]?.name}
      deleteFn={() => {
        if (!isCommunity && kymaResource) {
          deleteAllResources();
        } else if (isCommunity) {
          deleteCommunityResources(selectedModules[chosenModuleIndex]?.name);
        }
      }}
    />
  );
};
