import { ModulesDeleteBox } from 'components/Modules/components/ModulesDeleteBox';
import {
  createContext,
  Dispatch,
  FC,
  ReactNode,
  SetStateAction,
  useContext,
  useMemo,
  useState,
} from 'react';
import { checkSelectedModule } from 'components/Modules/support';
import { CommunityModuleContext } from 'components/Modules/community/providers/CommunityModuleProvider';
import { KymaModuleContext } from 'components/Modules/providers/KymaModuleProvider';
import { ModuleTemplatesContext } from 'components/Modules/providers/ModuleTemplatesProvider';
import { Button } from '@ui5/webcomponents-react';
import { useTranslation } from 'react-i18next';
import { createPortal } from 'react-dom';
import { ColumnLayoutState } from 'state/columnLayoutAtom';

type CommunityModulesDeleteBoxContextProviderProps = {
  handleResourceDelete: (options: any) => void;
  showDeleteDialog: boolean;
  DeleteMessageBox: FC<{ moduleName: string }>;
  layoutState: any;
  setLayoutColumn: (update: SetStateAction<ColumnLayoutState>) => void;
  children: ReactNode;
  namespaced: boolean;
  performDelete: () => void;
  performCancel: () => void;
};

type CommunityModulesDeleteBoxContextType = {
  setOpenedModuleIndex: Dispatch<SetStateAction<number | null>>;
  showDeleteDialog?: boolean;
  openedModuleIndex: number | null;
  deleteModuleButton: ReactNode;
  handleResourceDelete: (options: any) => void;
  namespaced?: boolean;
  performDelete: () => void;
  performCancel: () => void;
};

export const CommunityModulesDeleteBoxContext =
  createContext<CommunityModulesDeleteBoxContextType>({
    setOpenedModuleIndex: () => {},
    showDeleteDialog: false,
    openedModuleIndex: null,
    deleteModuleButton: <></>,
    handleResourceDelete: () => {},
    namespaced: false,
    performDelete: () => {},
    performCancel: () => {},
  });

export function CommunityModulesDeleteBoxContextProvider({
  handleResourceDelete,
  showDeleteDialog,
  DeleteMessageBox,
  layoutState,
  setLayoutColumn,
  children,
  namespaced,
  performDelete,
  performCancel,
}: CommunityModulesDeleteBoxContextProviderProps) {
  const { t } = useTranslation();
  const [openedModuleIndex, setOpenedModuleIndex] = useState<number | null>(
    null,
  );

  const { kymaResource } = useContext(KymaModuleContext);

  const { installedCommunityModules, installedCommunityModulesLoading } =
    useContext(CommunityModuleContext);

  const { moduleTemplatesLoading, communityModuleTemplates } = useContext(
    ModuleTemplatesContext,
  );

  const detailsOpen = useMemo(() => {
    if (layoutState?.layout) {
      return layoutState?.layout !== 'OneColumn';
    }
    return false;
  }, [layoutState]);

  const getOpenedModuleIndex = (
    moduleIndex: number | null,
    activeModules: any,
  ) => {
    const index =
      moduleIndex ??
      // Find index of the selected module after a refresh or other case after which we have undefined.
      activeModules.items?.findIndex((module: any) =>
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
        performDelete: performDelete,
        performCancel: performCancel,
      }}
    >
      {createPortal(
        getOpenedModuleIndex(openedModuleIndex, installedCommunityModules) !==
          undefined &&
          !installedCommunityModulesLoading &&
          !moduleTemplatesLoading &&
          showDeleteDialog && (
            <ModulesDeleteBox
              showDeleteDialog={showDeleteDialog}
              performDelete={performDelete}
              performCancel={performCancel}
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
              namespaced={namespaced}
            />
          ),
        document.body,
      )}
      {children}
    </CommunityModulesDeleteBoxContext.Provider>
  );
}
