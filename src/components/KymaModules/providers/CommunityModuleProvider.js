import { createContext, useContext, useEffect, useState } from 'react';
import { t } from 'i18next';
import { useGetInstalledModules } from '../hooks';
import { ModuleTemplatesContext } from './ModuleTemplatesProvider';
import { createPortal } from 'react-dom';
import { ModulesDeleteBox } from '../components/ModulesDeleteBox';
import { checkSelectedModule } from '../support';
import { Button } from '@ui5/webcomponents-react';
import { KymaModuleContext } from './KymaModuleProvider';

export const CommunityModuleContext = createContext({
  setOpenedModuleIndex: () => {},
  handleResourceDelete: () => {},
  deleteModuleButton: () => <></>,
  installedCommunityModules: { items: [] },
  installedCommunityModulesSimpleList: [],
  installedCommunityModulesLoading: false,
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

  const { kymaResource } = useContext(KymaModuleContext);
  const { moduleTemplatesLoading, communityModuleTemplates } = useContext(
    ModuleTemplatesContext,
  );
  const {
    installed: installedCommunityModules,
    loading: installedCommunityModulesLoading,
  } = useGetInstalledModules(communityModuleTemplates, moduleTemplatesLoading);

  useEffect(() => {
    if (layoutState?.layout) {
      setDetailsOpen(layoutState?.layout !== 'OneColumn');
    }
  }, [layoutState]);

  const getOpenedModuleIndex = (moduleIndex, activeModules) => {
    const index =
      moduleIndex ??
      // Find index of the selected module after a refresh or other case after which we have undefined.
      activeModules.items?.findIndex(module =>
        checkSelectedModule(module, layoutState),
      );
    return index > -1 ? index : undefined;
  };

  const simplifiedInstalledModules = simplifyInstalledModules(
    installedCommunityModules,
  );
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
        installedCommunityModulesSimpleList: simplifiedInstalledModules,
        communityModulesLoading: installedCommunityModulesLoading,
        DeleteMessageBox: DeleteMessageBox,
        deleteModuleButton: deleteModuleButton,
        handleResourceDelete: handleResourceDelete,
      }}
    >
      {createPortal(
        getOpenedModuleIndex(openedModuleIndex, simplifiedInstalledModules) !==
          undefined &&
          !installedCommunityModulesLoading &&
          !moduleTemplatesLoading &&
          showDeleteDialog && (
            <ModulesDeleteBox
              kymaResource={kymaResource}
              DeleteMessageBox={DeleteMessageBox}
              selectedModules={simplifiedInstalledModules}
              chosenModuleIndex={getOpenedModuleIndex(
                openedModuleIndex,
                simplifiedInstalledModules,
              )}
              moduleTemplates={communityModuleTemplates}
              detailsOpen={detailsOpen}
              setChosenModuleIndex={setOpenedModuleIndex}
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

function simplifyInstalledModules(installedModules) {
  return (
    installedModules.items?.map(module => ({
      name:
        module.metadata?.labels['operator.kyma-project.io/module-name'] ??
        module.spec.moduleName,
      moduleTemplateName: module.metadata.name,
      namespace: module.metadata.namespace,
      version: module.spec.version,
      resource: module.spec.data,
    })) ?? []
  );
}
