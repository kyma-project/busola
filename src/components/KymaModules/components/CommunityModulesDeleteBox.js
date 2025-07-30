import { ModulesDeleteBox } from 'components/KymaModules/components/ModulesDeleteBox';
import { createContext, useContext, useEffect, useState } from 'react';
import { checkSelectedModule } from 'components/KymaModules/support';
import { CommunityModuleContext } from 'components/KymaModules/providers/CommunityModuleProvider';
import { KymaModuleContext } from 'components/KymaModules/providers/KymaModuleProvider';
import { ModuleTemplatesContext } from 'components/KymaModules/providers/ModuleTemplatesProvider';
import { Button } from '@ui5/webcomponents-react';
import { useTranslation } from 'react-i18next';
import { createPortal } from 'react-dom';

export const CommunityModulesDeleteBoxContext = createContext({
  setOpenedModuleIndex: () => {},
  showDeleteDialog: () => {},
  openedModuleIndex: undefined,
  deleteModuleButton: <></>,
  handleResourceDelete: () => {},
});

export function CommunityModulesDeleteBoxContextProvider({
  handleResourceDelete,
  showDeleteDialog,
  DeleteMessageBox,
  layoutState,
  setLayoutColumn,
  children,
}) {
  const { t } = useTranslation();
  const [openedModuleIndex, setOpenedModuleIndex] = useState();

  const { kymaResource } = useContext(KymaModuleContext);

  const { installedCommunityModules, installedCommunityModulesLoading } =
    useContext(CommunityModuleContext);

  const { moduleTemplatesLoading, communityModuleTemplates } = useContext(
    ModuleTemplatesContext,
  );

  const [detailsOpen, setDetailsOpen] = useState(false);

  useEffect(() => {
    if (layoutState?.layout) {
      setDetailsOpen(layoutState?.layout !== 'OneColumn');
    }
  }, [layoutState]);

  const getOpenedModuleIndex = (moduleIndex, activeModules) => {
    const index =
      moduleIndex ??
      // Find index of the selected module after a refresh or other case after which we have undefined.
      activeModules.items?.findIndex((module) =>
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
    <CommunityModulesDeleteBoxContext.Provider
      value={{
        setOpenedModuleIndex: setOpenedModuleIndex,
        openedModuleIndex: openedModuleIndex,
        handleResourceDelete: handleResourceDelete,
        deleteModuleButton: deleteModuleButton,
      }}
    >
      {createPortal(
        getOpenedModuleIndex(openedModuleIndex, installedCommunityModules) !==
          undefined &&
          !installedCommunityModulesLoading &&
          !moduleTemplatesLoading &&
          showDeleteDialog && (
            <ModulesDeleteBox
              kymaResource={kymaResource}
              DeleteMessageBox={DeleteMessageBox}
              selectedModules={installedCommunityModules}
              chosenModuleIndex={getOpenedModuleIndex(
                openedModuleIndex,
                installedCommunityModules,
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
    </CommunityModulesDeleteBoxContext.Provider>
  );
}
