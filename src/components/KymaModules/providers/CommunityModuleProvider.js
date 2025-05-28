import { createContext, useContext, useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { Button } from '@ui5/webcomponents-react';

import { t } from 'i18next';

import { checkSelectedModule } from '../support';
import { useGetInstalledModules } from '../hooks';
import { ModulesDeleteBox } from '../components/ModulesDeleteBox';
import { ModuleTemplatesContext } from './ModuleTemplatesProvider';

export const CommunityModuleContext = createContext({
  setOpenedModuleIndex: () => {},
  handleResourceDelete: () => {},
  deleteModuleButton: () => <></>,
  installedCommunityModules: {},
  communityModulesLoading: false,
  communityModuleTemplates: null,
});

export function CommunityModuleContextProvider({
  children,
  setLayoutColumn,
  layoutState,
  DeleteMessageBox,
  handleResourceDelete,
  showDeleteDialog,
}) {
  const [openedModuleIndex, setOpenedModuleIndex] = useState();
  const [detailsOpen, setDetailsOpen] = useState(false);

  useEffect(() => {
    if (layoutState?.layout) {
      setDetailsOpen(layoutState?.layout !== 'OneColumn');
    }
  }, [layoutState]);

  //Will be done with deleting community modules issue
  //const notification = useNotification();

  // const handleModuleUninstall = useCreateResource({
  //   singularName: 'Kyma',
  //   pluralKind: 'Kymas',
  //   resource: kymaResourceState,
  //   initialResource: initialUnchangedResource,
  //   updateInitialResource: setInitialUnchangedResource,
  //   createUrl: resourceUrl,
  //   afterCreatedFn: () =>
  //     notification.notifySuccess({
  //       content: t('kyma-modules.module-uninstall'),
  //     }),
  // });

  const { moduleTemplatesLoading, communityModuleTemplates } = useContext(
    ModuleTemplatesContext,
  );

  const {
    installed: installedCommunityModules,
    loading: communityModulesLoading,
  } = useGetInstalledModules(communityModuleTemplates, moduleTemplatesLoading);

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
        DeleteMessageBox: DeleteMessageBox,
        handleResourceDelete: handleResourceDelete,
        showDeleteDialog: showDeleteDialog,
        deleteModuleButton: deleteModuleButton,
        installedCommunityModules: installedCommunityModules,
        communityModulesLoading: communityModulesLoading,
      }}
    >
      {createPortal(
        !moduleTemplatesLoading && showDeleteDialog && (
          <ModulesDeleteBox
            DeleteMessageBox={DeleteMessageBox}
            selectedModules={installedCommunityModules}
            chosenModuleIndex={
              openedModuleIndex ??
              // Find index of the selected module after a refresh or other case after which we have undefined.
              installedCommunityModules.findIndex(module =>
                checkSelectedModule(module, layoutState),
              )
            }
            moduleTemplates={communityModuleTemplates}
            detailsOpen={detailsOpen}
            setChosenModuleIndex={setOpenedModuleIndex}
            //handleModuleUninstall={handleModuleUninstall}
            setLayoutColumn={setLayoutColumn}
          />
        ),
        document.body,
      )}
      {children}
    </CommunityModuleContext.Provider>
  );
}
