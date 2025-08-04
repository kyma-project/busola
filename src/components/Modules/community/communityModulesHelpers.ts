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

export function getAvailableCommunityModules(
  communityModulesTemplates: ModuleTemplateListType,
  installedModuleTemplates: ModuleTemplateListType,
): Map<string, VersionInfo[]> {
  const availableCommunityModules = new Map<string, VersionInfo[]>();
  fillModuleVersions(availableCommunityModules, communityModulesTemplates);
  markInstalledVersion(availableCommunityModules, installedModuleTemplates);
  return availableCommunityModules;
}

function fillModuleVersions(
  availableCommunityModules: Map<string, VersionInfo[]>,
  communityModulesTemplates: ModuleTemplateListType,
) {
  (communityModulesTemplates?.items || []).reduce((acc, moduleTemplate): Map<
    string,
    VersionInfo[]
  > => {
    const moduleName = getModuleName(moduleTemplate);
    const newVersionCandidate = createVersion(moduleTemplate);

    const moduleVersions = acc.get(moduleName);
    if (moduleVersions) {
      const foundVersion = moduleVersions.find(module => {
        return module.version === newVersionCandidate.version;
      });
      if (!foundVersion) {
        moduleVersions.push(newVersionCandidate);
      }
    } else {
      acc.set(moduleName, [newVersionCandidate]);
    }
    return acc;
  }, availableCommunityModules);
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
) {
  (installedModuleTemplates?.items || []).forEach(installedModule => {
    const foundModuleVersions = availableCommunityModules.get(
      getModuleName(installedModule),
    );
    if (foundModuleVersions) {
      const versionIdx = foundModuleVersions.findIndex(version => {
        return version.version === installedModule.spec.version;
      });

      if (versionIdx > -1) {
        foundModuleVersions[versionIdx].installed = true;
      }
    }
  });
}

export function getInstalledModules(
  moduleTemplates: ModuleTemplateListType,
  managers: any,
): ModuleTemplateListType {
  const installedModuleTemplates = moduleTemplates.items?.filter(module => {
    const foundManager = managers[module.metadata.name];
    if (!foundManager) {
      return false;
    }
    const matchedManagerContainer = foundManager.spec?.template?.spec.containers.find(
      (container: { image: string }) => {
        return imageMatchVersion(container.image, module.spec.version);
      },
    );
    return !!matchedManagerContainer;
  });

  return {
    items: installedModuleTemplates,
  };
}

export function getNotInstalledModules(
  moduleTemplates: ModuleTemplateListType,
  managers: any,
): ModuleTemplateListType {
  const notInstalledModuleTemplates = moduleTemplates.items?.filter(module => {
    const foundManager = managers[module.metadata.name];

    return !foundManager;
  });

  return {
    items: notInstalledModuleTemplates,
  };
}

function imageMatchVersion(image: string, version: string): boolean {
  const imgName = image.split(':');
  const imgTag = imgName[imgName.length - 1];
  return imgTag.includes(version);
}

export async function postForCommunityResources(post: PostFn, link: string) {
  if (!link) {
    console.error('No link provided for community resource');
    return false;
  }

  try {
    const response = await post('/modules/community-resource', { link });
    if (response?.length) {
      return response;
    }
    console.error('Empty or invalid response:', response);
    return false;
  } catch (error) {
    console.error('Error fetching data:', error);
    return false;
  }
}

export async function getAllResourcesYamls(links: string[], post: PostFn) {
  if (links?.length) {
    const yamlRes = await Promise.all(
      links.map(async link => {
        if (link) {
          return await postForCommunityResources(post, link);
        }
      }),
    );
    return yamlRes.flat();
  }
}

export function fetchResourcesToApply(
  communityModulesToApply: Map<string, ModuleTemplateType>,
  setResourcesToApply: Function,
  post: PostFn,
) {
  const resourcesLinks = [...communityModulesToApply.values()]
    .map(moduleTpl => moduleTpl.spec.resources)
    .flat()
    .map(item => item?.link || '');

  (async function() {
    try {
      const yamls = await getAllResourcesYamls(resourcesLinks, post);

      const yamlsResources = yamls?.map(resource => {
        return { value: resource };
      });

      setResourcesToApply(yamlsResources || []);
    } catch (e) {
      console.error(e);
    }
  })();
}
