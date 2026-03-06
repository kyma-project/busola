import { createContext } from 'react';

import {
  useExternalCommunityModulesQuery,
  useModulesReleaseQuery,
  useModuleTemplatesQuery,
} from '../kymaModulesQueries';
import { splitModuleTemplates } from '../support';

export const ModuleTemplatesContext = createContext({
  moduleTemplatesLoading: false,
  moduleReleaseMetas: { items: [] },
  moduleReleaseMetasLoading: false,
  communityModuleTemplates: { items: [] },
  moduleTemplates: { items: [] },
});

export function ModuleTemplatesContextProvider({ children }) {
  const { data: allModuleTemplates, loading: moduleTemplatesLoading } =
    useModuleTemplatesQuery({});

  const {
    data: externalCommunityModuleTemplates,
    loading: communityModuleTemplatesLoading,
  } = useExternalCommunityModulesQuery();

  let checkedModuleTemplates;

  if (!moduleTemplatesLoading && !communityModuleTemplatesLoading)
    checkedModuleTemplates = externalCommunityModuleTemplates.flatMap(
      (res) => res.value,
    );

  const mergedModuleTemplates = {
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
  } = splitModuleTemplates(mergedModuleTemplates);

  return (
    <ModuleTemplatesContext.Provider
      value={{
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
