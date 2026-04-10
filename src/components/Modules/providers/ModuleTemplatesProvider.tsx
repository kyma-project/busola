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
import { useGetAllSourceYAMLModuleTemplates } from '../hooks';

type ModuleTemplatesContextType = {
  moduleTemplatesLoading: boolean;
  moduleReleaseMetas: { items: ModuleReleaseMetas[] } | null;
  moduleReleaseMetasLoading: boolean;
  communityModuleTemplates: { items: ModuleTemplateType[] };
  moduleTemplates: { items: ModuleTemplateType[] };
  preloadedCommunityTemplates: ModuleTemplateType[];
};

export const ModuleTemplatesContext = createContext<ModuleTemplatesContextType>(
  {
    moduleTemplatesLoading: false,
    moduleReleaseMetas: { items: [] },
    moduleReleaseMetasLoading: false,
    communityModuleTemplates: { items: [] },
    moduleTemplates: { items: [] },
    preloadedCommunityTemplates: [],
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

  const installedSourceURLs = useMemo(() => {
    const defaultURL =
      'https://kyma-project.github.io/community-modules/all-modules.yaml';
    const sources = (allModuleTemplates?.items || [])
      .map((item) => item?.metadata?.annotations?.source)
      .filter((url) => url && url !== defaultURL);
    return [...new Set(sources)];
  }, [allModuleTemplates?.items]);

  const { resources: additionalSourceTemplates } =
    useGetAllSourceYAMLModuleTemplates(installedSourceURLs);

  let checkedModuleTemplates: ModuleTemplateType[];

  if (!moduleTemplatesLoading && !communityModuleTemplatesLoading)
    checkedModuleTemplates = [
      ...(externalCommunityModuleTemplates?.flatMap((res: any) => res.value) ??
        []),
    ] as any;
  else checkedModuleTemplates = [];

  const preloadedCommunityTemplates: ModuleTemplateType[] = useMemo(
    () =>
      [
        ...(externalCommunityModuleTemplates?.flatMap(
          (res: any) => res.value,
        ) ?? []),
        ...additionalSourceTemplates,
      ] as any,
    [externalCommunityModuleTemplates, additionalSourceTemplates],
  );

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
      preloadedCommunityTemplates,
    }),
    [
      moduleTemplates,
      moduleReleaseMetas,
      moduleReleaseMetasLoading,
      moduleTemplatesLoading,
      communityModuleTemplatesLoading,
      communityModuleTemplates,
      preloadedCommunityTemplates,
    ],
  );

  return (
    <ModuleTemplatesContext.Provider value={contextValue}>
      {children}
    </ModuleTemplatesContext.Provider>
  );
}
