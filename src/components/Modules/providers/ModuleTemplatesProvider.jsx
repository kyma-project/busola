import { createContext } from 'react';

import {
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

  const { data: moduleReleaseMetas, loading: moduleReleaseMetasLoading } =
    useModulesReleaseQuery({});

  const {
    communityTemplates: communityModuleTemplates,
    kymaTemplates: moduleTemplates,
  } = splitModuleTemplates(allModuleTemplates);

  return (
    <ModuleTemplatesContext.Provider
      value={{
        allModuleTemplates: allModuleTemplates,
        moduleTemplates: moduleTemplates,
        moduleReleaseMetas: moduleReleaseMetas,
        moduleReleaseMetasLoading: moduleReleaseMetasLoading,
        moduleTemplatesLoading: moduleTemplatesLoading,
        communityModuleTemplates: communityModuleTemplates,
      }}
    >
      {children}
    </ModuleTemplatesContext.Provider>
  );
}
