import React, { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  CheckBox,
  List,
  ListItemStandard,
  MessageStrip,
  Text,
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
import { ColumnLayoutState } from 'state/columnLayoutAtom';
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
  const fetchFn = useSingleGet();
  const post = usePost();
  const clusterNodes = useAtomValue(allNodesAtom).filter(
    node => !node.namespaced,
  );
  const namespaceNodes = useAtomValue(allNodesAtom).filter(
    node => node.namespaced,
  );
  const [resourceCounts, setResourceCounts] = useState<Record<string, any>>({});
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

  const notification = useNotification();

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
      const counts = await fetchResourceCounts(associatedResources, fetchFn);
      const urls = await generateAssociatedResourcesUrls(
        associatedResources,
        fetchFn,
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
            fetchFn,
          )
        : await generateAssociatedResourcesUrls(
            crUResources,
            fetchFn,
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
          fetchFn,
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
    const resourcesLeft = checkIfAssociatedResourceLeft(
      resourceCounts,
      associatedResources,
    );

    setAssociatedResourceLeft(resourcesLeft);

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resourceCounts, associatedResources]);

  const deleteAllResources = () => {
    if (allowForceDelete && associatedResourcesUrls.length > 0) {
      deleteResources(deleteFn, associatedResourcesUrls);
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

    if (detailsOpen) {
      setLayoutColumn({
        layout: 'OneColumn',
        startColumn: null,
        midColumn: null,
        endColumn: null,
      });
    }
    if (allowForceDelete && associatedResourcesUrls.length > 0) {
      deleteResources(deleteFn, crUrls);
    }
  };

  const deleteCommunityResources = async (moduleName: string) => {
    try {
      if (allowForceDelete && associatedResourcesUrls.length) {
        await deleteResources(deleteFn, associatedResourcesUrls);
        const allStillExistingResources = await checkIfAllResourcesAreDeleted(
          fetchFn,
          associatedResourcesUrls,
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
    } catch (e) {
      console.warn(e);
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
        layout: 'OneColumn',
        startColumn: null,
        midColumn: null,
        endColumn: null,
      });
    }
  };

  return (
    <DeleteMessageBox
      disableDeleteButton={associatedResourceLeft ? !allowForceDelete : false}
      customDeleteText={
        associatedResourceLeft && allowForceDelete
          ? 'common.buttons.cascade-delete'
          : null
      }
      cancelFn={() => {
        setAllowForceDelete(false);
        setChosenModuleIndex(null);
      }}
      additionalDeleteInfo={
        <>
          <Text>
            {t('kyma-modules.delete-module', {
              name:
                chosenModuleIndex != null
                  ? selectedModules[chosenModuleIndex]?.name
                  : '',
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
                    const resourceCount = resourceCounts[key];
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
                        onClick={e => {
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
