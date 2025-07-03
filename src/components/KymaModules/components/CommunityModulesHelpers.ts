import {
  getModuleName,
  ModuleReleaseMetaListType,
  ModuleTemplateListType,
  ModuleTemplateType,
} from 'components/KymaModules/support';
import { PostFn } from 'shared/hooks/BackendAPI/usePost';

export type VersionInfo = {
  version: string;
  moduleTemplateName: string;
  moduleTemplateNamespace: string;
  channel?: string;
  installed?: boolean;
  beta?: boolean;
  docsURL?: string;
  icon?: {
    link: string;
    name: string;
  };
};

export function getAvailableCommunityModules(
  communityModulesTemplates: ModuleTemplateListType,
  installedModuleTemplates: ModuleTemplateListType,
  moduleReleaseMetas: ModuleReleaseMetaListType,
): Map<string, VersionInfo[]> {
  const availableCommunityModules = new Map<string, VersionInfo[]>();
  fillModuleVersions(availableCommunityModules, communityModulesTemplates);
  markInstalledVersion(availableCommunityModules, installedModuleTemplates);
  fillModulesWithMetadata(availableCommunityModules, moduleReleaseMetas);
  return availableCommunityModules;
}

function fillModuleVersions(
  availableCommunityModules: Map<string, VersionInfo[]>,
  communityModulesTemplates: ModuleTemplateListType,
) {
  communityModulesTemplates.items.reduce((acc, moduleTemplate): Map<
    string,
    VersionInfo[]
  > => {
    const moduleName = getModuleName(moduleTemplate);
    const newVersionCandidate = createVersion(moduleTemplate);

    const moduleVersions = acc.get(moduleName);
    if (moduleVersions) {
      const foundVersion = moduleVersions.find(module => {
        return (
          module.channel === newVersionCandidate.channel &&
          module.version === newVersionCandidate.version
        );
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
    channel: moduleTemplate.spec.channel,
    moduleTemplateNamespace: moduleTemplate.metadata.namespace,
    moduleTemplateName: moduleTemplate.metadata.name,
    docsURL: moduleTemplate.spec.info?.documentation,
    icon: getiFirstIcon(moduleTemplate.spec.info?.icons),
  };
}

function getiFirstIcon(
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
    return undefinedg;
  }
}
function markInstalledVersion(
  availableCommunityModules: Map<string, VersionInfo[]>,
  installedModuleTemplates: ModuleTemplateListType,
) {
  installedModuleTemplates.items.forEach(installedModule => {
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

function fillModulesWithMetadata(
  availableCommunityModules: Map<string, VersionInfo[]>,
  moduleReleaseMetas: ModuleReleaseMetaListType,
) {
  moduleReleaseMetas.items.forEach(releaseMeta => {
    const foundVersions = availableCommunityModules.get(
      releaseMeta.spec.moduleName,
    );
    if (foundVersions) {
      foundVersions.forEach(version => {
        const matchedChannelMeta = releaseMeta.spec.channels.find(
          channelMeta => {
            return channelMeta.version === version.version;
          },
        );
        if (matchedChannelMeta) {
          version.channel = matchedChannelMeta.channel;
          version.beta = releaseMeta.spec.beta ?? false;
        }
      });
    }
  });
}

export function getCommunityModules(
  moduleTemplates: ModuleTemplateListType,
): ModuleTemplateListType {
  return {
    items: moduleTemplates?.items.filter(module => {
      return (
        module.metadata.labels['operator.kyma-project.io/managed-by'] !== 'kyma'
      );
    }),
  };
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

function imageMatchVersion(image: string, version: string): boolean {
  const imgName = image.split(':');
  const imgTag = imgName[imgName.length - 1];
  return imgTag.includes(version);
}

export default async function postForCommunityResources(
  post: PostFn,
  link: string,
) {
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
