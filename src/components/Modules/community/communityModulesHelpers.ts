import {
  getModuleName,
  ModuleTemplateListType,
  ModuleTemplateType,
} from 'components/Modules/support';
import { PostFn } from 'shared/hooks/BackendAPI/usePost';

export type VersionInfo = {
  version: string;
  moduleTemplateName: string;
  moduleTemplateNamespace: string;
  installed?: boolean;
  docsURL?: string;
  icon?: {
    link: string;
    name: string;
  };
};

export type VersionDisplayInfo = {
  moduleTemplate: {
    name: string;
    namespace: string;
  };
  version: string;
  installed: boolean;
  textToDisplay: string;
  icon?: { link: string; name: string };
  docsURL?: string;
};

export type ModuleDisplayInfo = {
  name: string;
  versions: VersionDisplayInfo[];
};

export function transformDataForDisplay(
  availableCommunityModules: Map<string, VersionInfo[]>,
): ModuleDisplayInfo[] {
  return Array.from(availableCommunityModules, ([moduleName, versions]) => ({
    name: moduleName,
    versions: versions.map((v) => ({
      moduleTemplate: {
        name: v.moduleTemplateName,
        namespace: v.moduleTemplateNamespace,
      },
      version: v.version,
      installed: v.installed ?? false,
      textToDisplay: `v${v.version}`,
      icon: v.icon,
      docsURL: v.docsURL,
    })),
  }));
}

export function getAvailableCommunityModules(
  communityModulesTemplates: ModuleTemplateListType,
  installedModuleTemplates: ModuleTemplateListType,
  installedVersions?: Map<string, string>,
): Map<string, VersionInfo[]> {
  const availableCommunityModules = new Map<string, VersionInfo[]>();
  fillModuleVersions(availableCommunityModules, communityModulesTemplates);
  markInstalledVersion(
    availableCommunityModules,
    installedModuleTemplates,
    installedVersions,
  );
  return availableCommunityModules;
}

function fillModuleVersions(
  availableCommunityModules: Map<string, VersionInfo[]>,
  communityModulesTemplates: ModuleTemplateListType,
) {
  (communityModulesTemplates?.items || []).reduce(
    (acc, moduleTemplate): Map<string, VersionInfo[]> => {
      const moduleName = getModuleName(moduleTemplate);
      const newVersionCandidate = createVersion(moduleTemplate);

      const moduleVersions = acc.get(moduleName);
      if (moduleVersions) {
        const foundVersion = moduleVersions.find((module) => {
          return (
            module.version === newVersionCandidate.version &&
            module.moduleTemplateNamespace ===
              newVersionCandidate.moduleTemplateNamespace
          );
        });
        if (!foundVersion) {
          moduleVersions.push(newVersionCandidate);
        }
      } else {
        acc.set(moduleName, [newVersionCandidate]);
      }
      return acc;
    },
    availableCommunityModules,
  );
}

function createVersion(moduleTemplate: ModuleTemplateType): VersionInfo {
  return {
    version: moduleTemplate.spec.version,
    moduleTemplateNamespace: moduleTemplate.metadata.namespace,
    moduleTemplateName: moduleTemplate.metadata.name,
    docsURL: moduleTemplate.spec.info?.documentation,
    icon: getFirstIcon(moduleTemplate.spec.info?.icons),
  };
}

function getFirstIcon(
  icons?: [
    {
      name: string;
      link: string;
    },
  ],
) {
  const firstIcon = icons?.at(0);
  if (firstIcon) {
    return {
      link: firstIcon.link,
      name: firstIcon.name,
    };
  } else {
    return undefined;
  }
}

function markInstalledVersion(
  availableCommunityModules: Map<string, VersionInfo[]>,
  installedModuleTemplates: ModuleTemplateListType,
  installedVersions?: Map<string, string>,
) {
  (installedModuleTemplates?.items || []).forEach((installedModule) => {
    const foundModuleVersions = availableCommunityModules.get(
      getModuleName(installedModule),
    );

    const installedNamespace = installedModule.metadata.namespace;

    if (foundModuleVersions) {
      const managerKey = `${installedModule.metadata.name}:${installedModule.spec?.manager?.namespace}`;
      const actualInstalledVersion =
        installedVersions?.get(managerKey) ?? installedModule.spec.version;

      const versionIdx = foundModuleVersions.findIndex((version) => {
        const versionMatches =
          actualInstalledVersion?.includes(version.version) ?? false;
        return (
          versionMatches &&
          version.moduleTemplateNamespace === installedNamespace
        );
      });

      if (versionIdx > -1) {
        foundModuleVersions[versionIdx].installed = true;
      }
    }
  });
}

export function extractVersionFromImage(image: string): string | undefined {
  if (!image) return undefined;
  const parts = image.split(':');
  if (parts.length > 1) {
    return parts[parts.length - 1];
  }
  return undefined;
}

export function getInstalledModules(
  moduleTemplates: ModuleTemplateListType,
  managers: any,
): { items: ModuleTemplateType[]; installedVersions: Map<string, string> } {
  const installedVersions = new Map<string, string>();

  const installedModuleTemplates = moduleTemplates.items?.filter((module) => {
    const managerKey = `${module.metadata.name}:${module.spec?.manager?.namespace}`;
    const foundManager = managers[managerKey];

    if (
      !foundManager ||
      foundManager.metadata.namespace !== module.spec?.manager?.namespace
    ) {
      return false;
    }

    const containers = foundManager.spec?.template?.spec?.containers || [];
    for (const container of containers) {
      const version = extractVersionFromImage(container.image);
      if (version) {
        installedVersions.set(managerKey, version);
        break;
      }
    }

    return true;
  });

  return {
    items: installedModuleTemplates,
    installedVersions,
  };
}

export function getNotInstalledModules(
  moduleTemplates: ModuleTemplateListType,
  managers: any,
): ModuleTemplateListType {
  const notInstalledModuleTemplates = moduleTemplates.items?.filter(
    (module) => {
      const foundManager =
        managers[`${module.metadata.name}:${module.spec?.manager?.namespace}`];

      return !foundManager;
    },
  );

  return {
    items: notInstalledModuleTemplates,
  };
}

export async function postForCommunityResources(post: PostFn, link: string) {
  if (!link) {
    console.error('No link provided for community resource');
    return false;
  }

  const response = await post('/modules/community-resource', { link });
  if (!response?.length) {
    throw new Error('Empty or invalid response:', response);
  }
  return response;
}

export async function fetchResourcesToApply(
  communityModulesToApply: Map<string, ModuleTemplateType>,
  setResourcesToApply: (_: { value: any }[]) => void,
  post: PostFn,
) {
  const resourcesLinks = [...communityModulesToApply.values()]
    .map((moduleTpl) => moduleTpl.spec.resources)
    .flat()
    .map((item) => item?.link || '');

  try {
    const yamls = await getAllResourcesYamls(resourcesLinks, post);

    const yamlsResources = yamls?.map((resource) => {
      return { value: resource };
    });

    setResourcesToApply(yamlsResources || []);
  } catch (e) {
    console.error(e);
    throw e;
  }
}

export async function getAllResourcesYamls(
  links: string[],
  post: PostFn,
): Promise<any[]> {
  if (links?.length) {
    const yamlRes = await Promise.all(
      links.map(async (link) => {
        if (link) {
          return await postForCommunityResources(post, link);
        }
      }),
    );
    return yamlRes.flat();
  }
  return [];
}
