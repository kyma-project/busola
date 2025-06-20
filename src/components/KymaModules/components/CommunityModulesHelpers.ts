import {
  ModuleReleaseMetaListType,
  ModuleTemplateListType,
} from 'components/KymaModules/support';

export type VersionInfo = {
  version: string;
  channel?: string;
  moduleTemplate: string;
  installed?: boolean;
};

export function getAvailableCommunityModules(
  communityModulesTemplates: ModuleTemplateListType,
  moduleReleaseMetas: ModuleReleaseMetaListType,
): Map<string, VersionInfo[]> {
  const availableCommunityModules = communityModulesTemplates.items.reduce(
    (acc, module): Map<string, VersionInfo[]> => {
      const moduleName = module.spec.moduleName ?? 'not-found';
      const moduleTplName = module.metadata.name;
      const version = module.spec.version;
      const channel = module.spec.channel;
      const foundModule = acc.get(moduleName);
      if (foundModule) {
        const newVersionCandidate = {
          version: version,
          channel: channel,
          moduleTemplate: moduleTplName,
        };
        const foundVersion = foundModule.find(module => {
          return (
            module.channel === newVersionCandidate.channel &&
            module.version === newVersionCandidate.version
          );
        });
        if (foundVersion) {
          foundModule.push(newVersionCandidate);
        }
      } else {
        acc.set(moduleName, [
          { version: version, channel: channel, moduleTemplate: moduleTplName },
        ]);
      }
      return acc;
    },
    new Map<string, VersionInfo[]>(),
  );

  console.log('MODULE TEMPLATES VERSIONS', availableCommunityModules);

  moduleReleaseMetas.items.forEach(releaseMeta => {
    const foundModuleVersions = availableCommunityModules.get(
      releaseMeta.spec.moduleName,
    );
    if (foundModuleVersions) {
      // foundModuleVersions.fin
      // releaseMeta.spec.channels.forEach( channel => {
      //   if (channel.channel === foundVersions.)
      // })
      const availableChannels = releaseMeta.spec.channels.map(channel => {
        return {
          moduleTemplate: `${releaseMeta.metadata.name}-${channel.channel}`, //TODO: we should found the moduleTempalte with given spec.channel+spec.version, if not found I don't know
          channel: channel.channel,
          version: channel.version,
        };
      });
      foundModuleVersions.push(...availableChannels);
    }
  });

  return availableCommunityModules;
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
