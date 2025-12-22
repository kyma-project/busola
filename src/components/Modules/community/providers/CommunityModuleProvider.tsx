import { createContext, useContext } from 'react';
import { useGetInstalledNotInstalledModules } from 'components/Modules/hooks';
import { ModuleTemplatesContext } from 'components/Modules/providers/ModuleTemplatesProvider';
import {
  ModuleTemplateListType,
  ModuleTemplateType,
} from 'components/Modules/support';

interface CommunityModuleContextType {
  installedCommunityModules: {
    name: string;
    moduleTemplateName: string;
    namespace: string;
    version: string;
    templateVersion: string;
    resource: any;
  }[];
  installedCommunityModuleTemplates: ModuleTemplateListType;
  notInstalledCommunityModuleTemplates: ModuleTemplateListType;
  installedCommunityModulesLoading: boolean;
  installedVersions: Map<string, string>;
}

export const CommunityModuleContext = createContext<CommunityModuleContextType>(
  {
    installedCommunityModules: [],
    installedCommunityModuleTemplates: { items: [] },
    notInstalledCommunityModuleTemplates: { items: [] },
    installedCommunityModulesLoading: false,
    installedVersions: new Map(),
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
    installedVersions,
    loading: installedCommunityModulesLoading,
  } = useGetInstalledNotInstalledModules(
    communityModuleTemplates,
    moduleTemplatesLoading,
  );

  const installedCommunityModules = simplifyInstalledModules(
    installedCommunityModuleTemplates,
    installedVersions,
  );

  return (
    <CommunityModuleContext.Provider
      value={{
        installedCommunityModules: installedCommunityModules,
        installedCommunityModuleTemplates: installedCommunityModuleTemplates,
        installedCommunityModulesLoading,
        notInstalledCommunityModuleTemplates:
          notInstalledCommunityModuleTemplates,
        installedVersions,
      }}
    >
      {children}
    </CommunityModuleContext.Provider>
  );
}

function simplifyInstalledModules(
  installedModules: ModuleTemplateListType,
  installedVersions: Map<string, string>,
) {
  return (
    installedModules.items?.map((module: ModuleTemplateType) => {
      const managerKey = `${module.metadata.name}:${module.spec?.manager?.namespace}`;
      const installedVersion = installedVersions.get(managerKey);

      return {
        name:
          module.metadata?.labels['operator.kyma-project.io/module-name'] ??
          module.spec.moduleName,
        moduleTemplateName: module.metadata.name,
        namespace: module.metadata.namespace,
        version: installedVersion ?? module.spec.version,
        templateVersion: module.spec.version,
        resource: module.spec.data,
      };
    }) ?? []
  );
}
