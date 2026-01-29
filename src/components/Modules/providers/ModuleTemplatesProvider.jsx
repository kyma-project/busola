import { createContext } from 'react';

import {
  useExternalCommunityModulesQuery,
  useModulesReleaseQuery,
  useModuleTemplatesQuery,
} from '../kymaModulesQueries';
import { splitModuleTemplates } from '../support';

export const ModuleTemplatesContext = createContext({
  allModuleTemplates: { items: [] },
  moduleTemplatesLoading: false,
  moduleReleaseMetas: { items: [] },
  moduleReleaseMetasLoading: false,
  communityModuleTemplates: { items: [] },
  moduleTemplates: { items: [] },
});

export function ModuleTemplatesContextProvider({ children }) {
  // Fetching all Module Templates can be replaced with fetching one by one from api after implementing https://github.com/kyma-project/lifecycle-manager/issues/2232
  const { data: allModuleTemplates, loading: moduleTemplatesLoading } =
    useModuleTemplatesQuery({});

  const {
    data: externalCommunityModuleTemplates,
    loading: communityModuleTemplatesLoading,
  } = useExternalCommunityModulesQuery();

  let checkedModuleTemplates;

  if (!moduleTemplatesLoading || !communityModuleTemplatesLoading) {
    checkedModuleTemplates = externalCommunityModuleTemplates
      .filter((resource) => {
        if (allModuleTemplates?.items !== undefined)
          return !allModuleTemplates.items.some(
            (mt) =>
              mt.metadata?.name === resource.value?.metadata?.name &&
              mt.spec?.version === resource.value?.spec?.version,
          );
        return resource.value;
      })
      .flatMap((res) => res.value);
  }

  const mergedModuleTmeplates = {
    items: [
      ...(allModuleTemplates?.items || []),
      ...(checkedModuleTemplates || []),
    ],
  };

  const { data: moduleReleaseMetas, loading: moduleReleaseMetasLoading } =
    useModulesReleaseQuery({});

  const {
    communityTemplates: communityModuleTemplates,
    kymaTemplates: moduleTemplates,
  } = splitModuleTemplates(mergedModuleTmeplates);

  return (
    <ModuleTemplatesContext.Provider
      value={{
        allModuleTemplates: mergedModuleTmeplates,
        moduleTemplates: moduleTemplates,
        moduleReleaseMetas: moduleReleaseMetas,
        moduleReleaseMetasLoading: moduleReleaseMetasLoading,
        moduleTemplatesLoading:
          moduleTemplatesLoading || communityModuleTemplatesLoading,
        communityModuleTemplates: communityModuleTemplates,
      }}
    >
      {children}
    </ModuleTemplatesContext.Provider>
  );
}
