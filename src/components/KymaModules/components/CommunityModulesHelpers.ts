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
      const foundModule = acc.get(moduleName);
      if (foundModule) {
        const newVersionCandidate = {
          version: version,
          channel: channel,
          moduleTemplate: module,
        };
        const foundVersion = foundModule.find(module => {
          return (
            module.channel === newVersionCandidate.channel &&
            module.version === newVersionCandidate.version
          );
        });
        if (!foundVersion) {
          foundModule.push(newVersionCandidate);
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

function findProperModuleTemplate(
  modulesTpls: ModuleTemplateListType,
  channel: string,
  version: string,
) {
  const foundModule = modulesTpls.items.find(moduleTpl => {
    return moduleTpl.spec.channel === channel;
  });
  if (foundModule) {
    return foundModule.metadata.name;
  }
  return '';
}

export function getCommunityModules(
  moduleTemplates: ModuleTemplateListType,
): ModuleTemplateListType {
  return {
    items: moduleTemplates?.items.filter(module => {
      return (
        module.metadata.labels['operator.kyma-project.io/managed-by'] !== 'kyma' //&& !!module.spec?.manager
      );
    }),
  };
}
