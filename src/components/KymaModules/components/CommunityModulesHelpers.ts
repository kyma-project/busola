import {
  ModuleReleaseMetaListType,
  ModuleTemplateListType,
  ModuleTemplateType,
} from 'components/KymaModules/support';

export type VersionInfo = {
  version: string;
  channel?: string;
  moduleTemplate?: ModuleTemplateType;
  installed?: boolean;
};

export function getAvailableCommunityModules(
  communityModulesTemplates: ModuleTemplateListType,
  moduleReleaseMetas: ModuleReleaseMetaListType,
): Map<string, VersionInfo[]> {
  //This part is responsible for creating moduleName with all Version from ModuleTemplates
  const availableCommunityModules = communityModulesTemplates.items.reduce(
    (acc, module): Map<string, VersionInfo[]> => {
      const moduleName = module.spec.moduleName ?? 'not-found';
      const version = module.spec.version;
      const channel = module.spec.channel;
      const moduleVersions = acc.get(moduleName);
      if (moduleVersions) {
        const newVersionCandidate = {
          version: version,
          channel: channel,
          moduleTemplate: module,
        };
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
        acc.set(moduleName, [
          {
            version: version,
            channel: channel,
            moduleTemplate: module,
          },
        ]);
      }
      return acc;
    },
    new Map<string, VersionInfo[]>(),
  );

  // TODO: do sth with that later
  //
  // moduleReleaseMetas.items.forEach(releaseMeta => {
  //   const foundModuleVersions = availableCommunityModules.get(
  //     releaseMeta.spec.moduleName,
  //   );
  //   if (foundModuleVersions) {
  //     // foundModuleVersions.fin
  //     // releaseMeta.spec.channels.forEach( channel => {
  //     //   if (channel.channel === foundVersions.)
  //     // })
  //     const availableChannels = releaseMeta.spec.channels.map(channel => {
  //       return {
  //         moduleTemplate: findProperModuleTemplate( TUTAJ TRZEBA COŚ CIEKAWEGO DAĆ ,channel.channel, channel.version)
  //         channel: channel.channel,
  //         version: channel.version,
  //       };
  //     });
  //     foundModuleVersions.push(...availableChannels);
  //   }
  // });

  return availableCommunityModules;
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
