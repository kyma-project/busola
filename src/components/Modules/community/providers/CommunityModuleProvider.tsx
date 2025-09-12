import { createContext, useContext } from 'react';
import { useGetInstalledNotInstalledModules } from 'components/Modules/hooks';
import { ModuleTemplatesContext } from 'components/Modules/providers/ModuleTemplatesProvider';
import { ModuleTemplateListType } from 'components/Modules/support';

interface CommunityModuleContextType {
  installedCommunityModules: {
    name: string;
    moduleTemplateName: string;
    namespace: string;
    version: string;
    resource: any;
  }[];
  installedCommunityModuleTemplates: ModuleTemplateListType;
  notInstalledCommunityModuleTemplates: ModuleTemplateListType;
  installedCommunityModulesLoading: boolean;
}

export const CommunityModuleContext = createContext<CommunityModuleContextType>(
  {
    installedCommunityModules: [],
    installedCommunityModuleTemplates: { items: [] },
    notInstalledCommunityModuleTemplates: { items: [] },
    installedCommunityModulesLoading: false,
  },
);

export function CommunityModuleContextProvider({
  children,
}: {
  children: JSX.Element;
}) {
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
        installedCommunityModulesLoading,
        notInstalledCommunityModuleTemplates:
          notInstalledCommunityModuleTemplates,
      }}
    >
      {children}
    </CommunityModuleContext.Provider>
  );
}

function simplifyInstalledModules(installedModules: ModuleTemplateListType) {
  return (
    installedModules.items?.map((module) => ({
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
