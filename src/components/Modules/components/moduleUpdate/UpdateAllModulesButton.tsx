import { useState, useEffect, useContext, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Button,
  MessageBox,
  Table,
  TableCell,
  TableHeaderCell,
  TableHeaderRow,
  TableRow,
  TableSelectionMulti,
  TableSelectionMultiDomRef,
  Text,
} from '@ui5/webcomponents-react';
import {
  DEFAULT_K8S_NAMESPACE,
  ModuleTemplateType,
} from 'components/Modules/support';
import { useAtomValue } from 'jotai';
import { useSingleGet } from 'shared/hooks/BackendAPI/useGet';
import { useUpdate } from 'shared/hooks/BackendAPI/useMutation';
import { usePost } from 'shared/hooks/BackendAPI/usePost';
import { allNodesAtom } from 'state/navigation/allNodesAtom';
import {
  fetchResourcesToApply,
  getUpdateTemplate,
} from '../../community/communityModulesHelpers';
import { uploadResource } from '../../community/communityModulesInstallHelpers';
import { useUploadResources } from 'resources/Namespaces/YamlUpload/useUploadResources';
import { useNotification } from 'shared/contexts/NotificationContext';
import { ModuleTemplatesContext } from 'components/Modules/providers/ModuleTemplatesProvider';
import { CommunityModuleContext } from 'components/Modules/community/providers/CommunityModuleProvider';

type UpdatableModule = {
  moduleName: string;
  currentVersion: string;
  newVersion: string;
  moduleTpl: ModuleTemplateType;
};

async function applyModuleTemplateResources(
  moduleTpls: ModuleTemplateType[],
  namespaceId: string,
  clusterNodes: any[],
  namespaceNodes: any[],
  postRequest: any,
  patchRequest: any,
  singleGet: any,
) {
  await Promise.all(
    moduleTpls
      .filter((tpl) => tpl.metadata.creationTimestamp === undefined)
      .map((tpl) =>
        uploadResource(
          { value: tpl },
          namespaceId,
          clusterNodes,
          namespaceNodes,
          postRequest,
          patchRequest,
          singleGet,
        ),
      ),
  );
}

export const UpdateAllModulesButton = () => {
  const { t } = useTranslation();
  const postRequest = usePost();
  const patchRequest = useUpdate();
  const singleGet = useSingleGet();
  const notification = useNotification();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedModuleNames, setSelectedModuleNames] = useState<Set<string>>(
    new Set(),
  );
  const [resourcesToApply, setResourcesToApply] = useState<{ value: any }[]>(
    [],
  );
  const [pendingUpdate, setPendingUpdate] = useState(false);

  const selectionRef = useRef<TableSelectionMultiDomRef | null>(null);

  const { preloadedCommunityTemplates } = useContext(ModuleTemplatesContext);
  const { installedCommunityModules } = useContext(CommunityModuleContext);

  const clusterNodes = useAtomValue(allNodesAtom).filter(
    (node) => !node.namespaced,
  );
  const namespaceNodes = useAtomValue(allNodesAtom).filter(
    (node) => node.namespaced,
  );

  const updatableModules: UpdatableModule[] = installedCommunityModules
    .map((installedModule) => {
      const repoTpl = getUpdateTemplate(
        installedModule.name,
        preloadedCommunityTemplates,
        installedCommunityModules,
      );
      if (!repoTpl) return null;
      return {
        moduleName: installedModule.name,
        currentVersion: installedModule.version,
        newVersion: repoTpl.spec.version,
        moduleTpl: repoTpl,
      };
    })
    .filter((m): m is UpdatableModule => m !== null);

  const uploadResources = useUploadResources(
    resourcesToApply,
    setResourcesToApply,
    () => {},
    DEFAULT_K8S_NAMESPACE,
  );

  useEffect(() => {
    if (pendingUpdate && resourcesToApply.length > 0) {
      const selectedTpls = updatableModules
        .filter((m) => selectedModuleNames.has(m.moduleName))
        .map((m) => m.moduleTpl);

      uploadResources();
      applyModuleTemplateResources(
        selectedTpls,
        DEFAULT_K8S_NAMESPACE,
        clusterNodes,
        namespaceNodes,
        postRequest,
        patchRequest,
        singleGet,
      )
        .then(() => {
          notification.notifySuccess({
            content: t('modules.community.messages.modules-updated'),
          });
        })
        .catch((e) => {
          notification.notifyError({
            content: t('modules.community.messages.install-failure', {
              resourceType: [...selectedModuleNames].join(', '),
              error: e instanceof Error ? e.message : '',
            }),
          });
        });

      setPendingUpdate(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pendingUpdate, resourcesToApply]);

  if (updatableModules.length === 0) return null;

  const handleSelectionChange = () => {
    const selectionFeature = selectionRef.current;
    if (!selectionFeature) return;

    const newSelectedSet = selectionFeature.getSelectedAsSet();
    setSelectedModuleNames(new Set(newSelectedSet));
  };

  const handleOpen = () => {
    setSelectedModuleNames(new Set(updatableModules.map((m) => m.moduleName)));
    setIsDialogOpen(true);
  };

  const handleUpdate = async () => {
    setIsDialogOpen(false);

    notification.notifySuccess({
      content: t('modules.community.messages.module-update-started'),
    });

    const templateMap = new Map<string, ModuleTemplateType>();
    updatableModules
      .filter((m) => selectedModuleNames.has(m.moduleName))
      .forEach((m) => templateMap.set(m.moduleName, m.moduleTpl));

    await fetchResourcesToApply(templateMap, setResourcesToApply, postRequest);
    setPendingUpdate(true);
  };

  return (
    <>
      <Button onClick={handleOpen}>
        {t('modules.community.update.update-all')}
      </Button>
      {isDialogOpen && (
        <MessageBox
          className="update-all-modules-dialog"
          open={isDialogOpen}
          onClose={() => setIsDialogOpen(false)}
          titleText={t('modules.community.update.update-all-title')}
          actions={[
            <Button
              key="update"
              design="Emphasized"
              onClick={handleUpdate}
              disabled={selectedModuleNames.size === 0}
            >
              {t('kyma-modules.update')}
            </Button>,
            <Button key="cancel" onClick={() => setIsDialogOpen(false)}>
              {t('common.buttons.cancel')}
            </Button>,
          ]}
        >
          <Text>{t('modules.community.update.update-all-confirmation')}</Text>
          <div className="sap-margin-top-small">
            <Table
              features={
                <TableSelectionMulti
                  ref={selectionRef}
                  selected={[...selectedModuleNames].join(' ')}
                  onChange={handleSelectionChange}
                />
              }
              headerRow={
                <TableHeaderRow>
                  <TableHeaderCell>
                    {t('modules.community.update.module')}
                  </TableHeaderCell>
                  <TableHeaderCell>
                    {t('modules.community.update.current-version')}
                  </TableHeaderCell>
                  <TableHeaderCell>
                    {t('modules.community.update.latest-version')}
                  </TableHeaderCell>
                  <TableHeaderCell>
                    {t('modules.community.update.note')}
                  </TableHeaderCell>
                </TableHeaderRow>
              }
            >
              {updatableModules.length !== 0 &&
                updatableModules.map(
                  ({ moduleName, currentVersion, newVersion }) => (
                    <TableRow key={moduleName} rowKey={moduleName}>
                      <TableCell>{moduleName}</TableCell>
                      <TableCell>{currentVersion}</TableCell>
                      <TableCell>{newVersion}</TableCell>
                      <TableCell>
                        {/* TODO: Has to be adjusted when we get Release Notes in modules - 
                        https://github.com/kyma-project/busola/issues/4826 */}
                      </TableCell>
                    </TableRow>
                  ),
                )}
            </Table>
          </div>
        </MessageBox>
      )}
    </>
  );
};
