import {
  ModuleReleaseMetaListType,
  ModuleTemplateListType,
} from 'components/KymaModules/support';

export type VersionInfo = {
  version: string;
  channel?: string;
  moduleTemplate: string;
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
      const foundModule = acc.get(moduleName);
      if (foundModule) {
        foundModule.push({ version: version, moduleTemplate: moduleTplName });
      } else {
        acc.set(moduleName, [
          { version: version, moduleTemplate: moduleTplName },
        ]);
      }
      return acc;
    },
    new Map<string, VersionInfo[]>(),
  );

  moduleReleaseMetas.items.forEach(releaseMeta => {
    const foundVersions = availableCommunityModules.get(
      releaseMeta.spec.moduleName,
    );
    if (foundVersions) {
      const availableChannels = releaseMeta.spec.channels.map(channel => {
        return {
          moduleTemplate: `${releaseMeta.metadata.name}-${channel.channel}`, //TODO: this is probably the name of moduleTempalte, might not exist | channel or version!
          channel: channel.channel,
          version: channel.version,
        };
      });
      foundVersions.push(...availableChannels);
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

// TODO: use it later
// What set community module template manager?
export function getInstalledCommunityModules(
  moduleTemplates: ModuleTemplateListType,
) {
  return getCommunityModules(moduleTemplates).items.find(moduleTemplate => {
    return moduleTemplate.spec.manager;
  });
}
