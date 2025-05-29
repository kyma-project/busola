import { createContext, useContext, useEffect, useState } from 'react';
import { useGetInstalledModules } from '../hooks';
import { ModuleTemplatesContext } from './ModuleTemplatesProvider';

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
}) {
  const [, setOpenedModuleIndex] = useState();
  const [, setDetailsOpen] = useState(false);

  useEffect(() => {
    if (layoutState?.layout) {
      setDetailsOpen(layoutState?.layout !== 'OneColumn');
    }
  }, [layoutState]);

  const { moduleTemplatesLoading, communityModuleTemplates } = useContext(
    ModuleTemplatesContext,
  );

  const {
    installed: installedCommunityModules,
    loading: communityModulesLoading,
  } = useGetInstalledModules(communityModuleTemplates, moduleTemplatesLoading);

  return (
    <CommunityModuleContext.Provider
      value={{
        setOpenedModuleIndex: setOpenedModuleIndex,
        showDeleteDialog: showDeleteDialog,
        installedCommunityModules: installedCommunityModules,
        communityModulesLoading: communityModulesLoading,
      }}
    >
      {children}
    </CommunityModuleContext.Provider>
  );
}
