import { createContext, useContext } from 'react';
import { useGetInstalledNotInstalledModules } from '../hooks';
import { ModuleTemplatesContext } from './ModuleTemplatesProvider';

export const CommunityModuleContext = createContext({
  installedCommunityModules: [],
  installedCommunityModuleTemplates: { items: [] },
  notInstalledCommunityModuleTemplates: { items: [] },
  installedCommunityModulesLoading: false,
});

export function CommunityModuleContextProvider({ children }) {
  const { moduleTemplatesLoading, communityModuleTemplates } = useContext(
    ModuleTemplatesContext,
  );
  const {
    installed: installedCommunityModuleTemplates,
    notInstalled: notInstalledCommunityModuleTemplates,
    loading: installedCommunityModulesLoading,
  } = useGetInstalledNotInstalledModules(
    communityModuleTemplates,
    moduleTemplatesLoading,
  );

  const installedCommunityModules = simplifyInstalledModules(
    installedCommunityModuleTemplates,
  );

  return (
    <CommunityModuleContext.Provider
      value={{
        installedCommunityModules: installedCommunityModules,
        installedCommunityModuleTemplates: installedCommunityModuleTemplates,
        communityModulesLoading: installedCommunityModulesLoading,
        notInstalledCommunityModuleTemplates: notInstalledCommunityModuleTemplates,
      }}
    >
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
