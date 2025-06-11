import { createContext, useContext, useEffect, useState } from 'react';
import { t } from 'i18next';
import { useGetInstalledModules } from '../hooks';
import { ModuleTemplatesContext } from './ModuleTemplatesProvider';
import { createPortal } from 'react-dom';
import { ModulesDeleteBox } from '../components/ModulesDeleteBox';
import { checkSelectedModule } from '../support';
import { Button } from '@ui5/webcomponents-react';
import { useNotification } from 'shared/contexts/NotificationContext';
import { useCreateResource } from 'shared/ResourceForm/useCreateResource';

export const CommunityModuleContext = createContext({
  setOpenedModuleIndex: () => {},
  handleResourceDelete: () => {},
  deleteModuleButton: () => <></>,
  installedCommunityModules: [],
  communityModulesLoading: false,
  communityModuleTemplates: null,
});

export function CommunityModuleContextProvider({
  children,
  layoutState,
  showDeleteDialog,
  DeleteMessageBox,
  handleResourceDelete,
  setLayoutColumn,
}) {
  const [openedModuleIndex, setOpenedModuleIndex] = useState();
  const [detailsOpen, setDetailsOpen] = useState(false);
  // TODO: Is this two needed in community modules?:
  const [initialUnchangedResource, setInitialUnchangedResource] = useState();
  const [kymaResourceState, setKymaResourceState] = useState();

  const notification = useNotification();
  const { moduleTemplatesLoading, communityModuleTemplates } = useContext(
    ModuleTemplatesContext,
  );

  const {
    installed: installedCommunityModules,
    loading: communityModulesLoading,
  } = useGetInstalledModules(communityModuleTemplates, moduleTemplatesLoading);
  /////////////////////////// TODO: Is it necessary? KymaResource? resourceUrl?
  const handleModuleUninstall = useCreateResource({
    singularName: 'Kyma',
    pluralKind: 'Kymas',
    resource: kymaResourceState,
    initialResource: initialUnchangedResource,
    updateInitialResource: setInitialUnchangedResource,
    // TODO: resourceUrl
    createUrl:
      '/apis/operator.kyma-project.io/v1beta2/namespaces/kyma-system/kymas/default',
    afterCreatedFn: () =>
      notification.notifySuccess({
        content: t('kyma-modules.module-uninstall'),
      }),
  });

  useEffect(() => {
    if (layoutState?.layout) {
      setDetailsOpen(layoutState?.layout !== 'OneColumn');
    }
  }, [layoutState]);

  // useEffect(() => {
  //   if (installedCommunityModules?.length) {
  //     setKymaResourceState(installedCommunityModules);
  //     setInitialUnchangedResource(cloneDeep(installedCommunityModules));
  //   }
  // }, [installedCommunityModules]);

  const getOpenedModuleIndex = (moduleIndex, activeModules) => {
    const index =
      moduleIndex ??
      // Find index of the selected module after a refresh or other case after which we have undefined.
      activeModules.findIndex(module =>
        checkSelectedModule(module, layoutState),
      );
    return index > -1 ? index : undefined;
  };

  const deleteModuleButton = (
    <div>
      <Button onClick={() => handleResourceDelete({})} design="Transparent">
        {t('common.buttons.delete-module')}
      </Button>
    </div>
  );

  return (
    <CommunityModuleContext.Provider
      value={{
        setOpenedModuleIndex: setOpenedModuleIndex,
        showDeleteDialog: showDeleteDialog,
        installedCommunityModules: installedCommunityModules,
        communityModulesLoading: communityModulesLoading,
        DeleteMessageBox: DeleteMessageBox,
        deleteModuleButton: deleteModuleButton,
        handleResourceDelete: handleResourceDelete,
      }}
    >
      {createPortal(
        getOpenedModuleIndex(openedModuleIndex, installedCommunityModules) !=
          undefined &&
          !communityModulesLoading &&
          !moduleTemplatesLoading &&
          showDeleteDialog && (
            <ModulesDeleteBox
              DeleteMessageBox={DeleteMessageBox}
              selectedModules={installedCommunityModules}
              chosenModuleIndex={getOpenedModuleIndex(
                openedModuleIndex,
                installedCommunityModules,
              )}
              moduleTemplates={communityModuleTemplates}
              detailsOpen={detailsOpen}
              setKymaResourceState={setKymaResourceState}
              setInitialUnchangedResource={setInitialUnchangedResource}
              setChosenModuleIndex={setOpenedModuleIndex}
              handleModuleUninstall={handleModuleUninstall}
              setLayoutColumn={setLayoutColumn}
              isCommunity={true}
            />
          ),
        document.body,
      )}
      {children}
    </CommunityModuleContext.Provider>
  );
}
