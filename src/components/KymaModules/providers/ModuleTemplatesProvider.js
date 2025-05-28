import { createContext } from 'react';

import { useModuleTemplatesQuery } from '../kymaModulesQueries';
import { splitModuleTemplates } from '../support';

export const ModuleTemplatesContext = createContext({
  allModuleTemplates: null,
  moduleTemplatesLoading: false,
  communityModuleTemplates: null,
  moduleTemplates: null,
});

export function ModuleTemplatesContextProvider({ children }) {
  // Fetching all Module Templates can be replaced with fetching one by one from api after implementing https://github.com/kyma-project/lifecycle-manager/issues/2232
  const {
    data: allModuleTemplates,
    loading: moduleTemplatesLoading,
  } = useModuleTemplatesQuery({});

  const {
    communityTemplates: communityModuleTemplates,
    kymaTemplates: moduleTemplates,
  } = splitModuleTemplates(allModuleTemplates);

  return (
    <ModuleTemplatesContext.Provider
      value={{
        allModuleTemplates: allModuleTemplates,
        moduleTemplates: moduleTemplates,
        moduleTemplatesLoading: moduleTemplatesLoading,
        communityModuleTemplates: communityModuleTemplates,
      }}
    >
      {children}
    </ModuleTemplatesContext.Provider>
  );
}
