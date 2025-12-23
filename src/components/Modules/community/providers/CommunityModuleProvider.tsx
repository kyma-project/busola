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
    managerKey: string;
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
  const seen = new Set<string>();

  return (
    installedModules.items
      ?.map((module: ModuleTemplateType) => {
        const versionLookupKey = `${module.metadata.name}:${module.spec?.manager?.namespace}`;
        const installedVersion = installedVersions.get(versionLookupKey);
        const moduleName =
          module.metadata?.labels['operator.kyma-project.io/module-name'] ??
          module.spec.moduleName;
        const managerKey = `${module.spec?.manager?.name}:${module.spec?.manager?.namespace}`;

        return {
          name: moduleName,
          moduleTemplateName: module.metadata.name,
          namespace: module.metadata.namespace,
          version: installedVersion ?? module.spec.version,
          templateVersion: module.spec.version,
          resource: module.spec.data,
          managerKey,
        };
      })
      .filter((module) => {
        const dedupeKey = `${module.name}::${module.managerKey}`;
        if (seen.has(dedupeKey)) {
          return false;
        }
        seen.add(dedupeKey);
        return true;
      }) ?? []
  );
}
