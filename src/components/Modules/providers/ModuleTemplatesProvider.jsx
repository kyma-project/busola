import { createContext, useMemo } from 'react';

import {
  useExternalCommunityModulesQuery,
  useModulesReleaseQuery,
  useModuleTemplatesQuery,
} from '../kymaModulesQueries';
import { splitModuleTemplates } from '../support';
import { useGetAllSourceYAMLModuleTemplates } from '../hooks';

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

  let checkedModuleTemplates;

  if (!moduleTemplatesLoading && !communityModuleTemplatesLoading)
    checkedModuleTemplates = [
      ...externalCommunityModuleTemplates.flatMap((res) => res.value),
      ...additionalSourceTemplates,
    ];

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
