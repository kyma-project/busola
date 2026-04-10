import { createContext, ReactNode, useMemo } from 'react';

import {
  useExternalCommunityModulesQuery,
  useModulesReleaseQuery,
  useModuleTemplatesQuery,
} from '../kymaModulesQueries';
import {
  ModuleReleaseMetas,
  ModuleTemplateType,
  splitModuleTemplates,
} from '../support';

type ModuleTemplatesContextType = {
  moduleTemplatesLoading: boolean;
  moduleReleaseMetas: { items: ModuleReleaseMetas[] } | null;
  moduleReleaseMetasLoading: boolean;
  communityModuleTemplates: { items: ModuleTemplateType[] };
  moduleTemplates: { items: ModuleTemplateType[] };
};

export const ModuleTemplatesContext = createContext<ModuleTemplatesContextType>(
  {
    moduleTemplatesLoading: false,
    moduleReleaseMetas: { items: [] },
    moduleReleaseMetasLoading: false,
    communityModuleTemplates: { items: [] },
    moduleTemplates: { items: [] },
  },
);

export function ModuleTemplatesContextProvider({
  children,
}: {
  children: ReactNode;
}) {
  const { data: allModuleTemplates, loading: moduleTemplatesLoading } =
    useModuleTemplatesQuery({});

  const {
    data: externalCommunityModuleTemplates,
    loading: communityModuleTemplatesLoading,
  } = useExternalCommunityModulesQuery() as {
    data: ModuleTemplateType[] | null;
    loading: boolean;
  };

  let checkedModuleTemplates: ModuleTemplateType[];

  if (!moduleTemplatesLoading && !communityModuleTemplatesLoading)
    checkedModuleTemplates = externalCommunityModuleTemplates?.flatMap(
      (res: any) => res.value,
    ) as any;
  else checkedModuleTemplates = [];

  const mergedModuleTemplates = useMemo(
    () => ({
      items: [
        ...(allModuleTemplates?.items || []),
        ...(checkedModuleTemplates || []),
      ],
    }),
    [allModuleTemplates?.items, checkedModuleTemplates],
  );

  const { data: moduleReleaseMetas, loading: moduleReleaseMetasLoading } =
    useModulesReleaseQuery({});

  const {
    communityTemplates: communityModuleTemplates,
    kymaTemplates: moduleTemplates,
  } = useMemo(
    () => splitModuleTemplates(mergedModuleTemplates),
    [mergedModuleTemplates],
  );

  const contextValue = useMemo(
    () => ({
      moduleTemplates,
      moduleReleaseMetas,
      moduleReleaseMetasLoading,
      moduleTemplatesLoading:
        moduleTemplatesLoading || communityModuleTemplatesLoading,
      communityModuleTemplates,
    }),
    [
      moduleTemplates,
      moduleReleaseMetas,
      moduleReleaseMetasLoading,
      moduleTemplatesLoading,
      communityModuleTemplatesLoading,
      communityModuleTemplates,
    ],
  );

  return (
    <ModuleTemplatesContext.Provider value={contextValue}>
      {children}
    </ModuleTemplatesContext.Provider>
  );
}
