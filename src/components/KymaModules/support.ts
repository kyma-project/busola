import pluralize from 'pluralize';
import jsyaml from 'js-yaml';
import { ColumnLayoutState } from 'state/columnLayoutAtom';
import { resolveType } from './components/ModuleStatus';

export const enum ModuleTemplateStatus {
  Ready = 'Ready',
  Processing = 'Processing',
  Deleting = 'Deleting',
  Unknown = 'Unknown',
  Unmanaged = 'Unmanaged',
  Warning = 'Warning',
  Error = 'Error',
  NotInstalled = 'Not installed',
}

export type ConditionType = {
  lastTransitionTime: string;
  lastUpdateTime: string;
  message: string;
  reason: string;
  status: string;
  type: string;
};

export type CustomResourceDefinitionsType = {
  items: {
    metadata?: { name: string };
    spec?: { names?: { kind?: string } };
  }[];
};

export type KymaResourceSpecModuleType = {
  name: string;
  channel?: string;
};

export type KymaResourceStatusModuleType = {
  name: string;
  channel?: string;
  version?: string;
  state?: string;
  resource?: {
    apiVersion?: string;
    metadata?: { name: string; namespace?: string };
    kind?: string;
  };
  message?: string;
};

export type KymaResourceType = {
  apiVersion: string;
  kind: string;
  metadata: {
    name: string;
    namespace: string;
  };
  spec: {
    channel: string;
    modules: KymaResourceSpecModuleType[];
  };
  status: {
    modules: KymaResourceStatusModuleType[];
  };
};

export type ModuleManagerType = {
  name: string;
  namespace: string;
  group: string;
  version: string;
  kind: string;
};

export type ModuleTemplateType = {
  metadata: {
    name: string;
    namespace: string;
    labels: Record<string, string>;
    annotations: Record<string, string>;
  };
  spec: {
    associatedResources: any;
    data: any;
    channel: string;
    version: string;
    info?: {
      documentation?: string;
    };
    manager: ModuleManagerType;
    moduleName?: string;
  };
};

export type ModuleTemplateListType = {
  items: ModuleTemplateType[];
};

export const getResourcePath = (resource: any) => {
  if (!resource) return '';

  const apiVersion =
    resource?.apiVersion || `${resource?.group}/${resource?.version}`;
  const resourceName = resource?.metadata?.name || resource?.name;
  const resourceNamespace =
    resource?.metadata?.namespace || resource?.namespace;

  return resourceNamespace
    ? `/apis/${apiVersion}/namespaces/${resourceNamespace}/${pluralize(
        resource.kind,
      ).toLowerCase()}/${resourceName}`
    : `/apis/${apiVersion}/${pluralize(
        resource.kind || '',
      ).toLowerCase()}/${resourceName}`;
};

export const findChannel = (
  module: { name: string; channels: [{ version: string; channel: string }] },
  channel: string,
) => {
  return module.channels.find(
    (ch: { version: string; channel: string }) => ch.channel === channel,
  );
};
export const findCrd = (resourceKind: string, crds: any) => {
  return (crds as CustomResourceDefinitionsType | null)?.items?.find(
    crd => crd.spec?.names?.kind === resourceKind,
  );
};

export const findExtension = (resourceKind: string, extensions: any) => {
  return (extensions as { data: { general: string } }[] | null)?.find(ext => {
    const { resource: extensionResource } =
      jsyaml.load(ext.data.general, { json: true }) || ({} as any);
    return extensionResource.kind === resourceKind;
  });
};

export const findModuleStatus = (
  kymaResource: KymaResourceType,
  moduleName: string,
) => {
  return kymaResource?.status?.modules?.find(
    (module: { name: string }) => moduleName === module?.name,
  );
};

export const findModuleSpec = (
  kymaResource: KymaResourceType,
  moduleName: string,
) => {
  return kymaResource?.spec.modules?.find(
    (module: { name: string }) => moduleName === module?.name,
  );
};

export const findModuleTemplate = (
  moduleTemplates: ModuleTemplateListType,
  moduleName: string,
  channel: string,
  version: string,
) => {
  // This change was made due to changes in moduleTemplates and should be simplified once all moduleTemplates migrate
  const moduleTemplateWithoutInfo = moduleTemplates?.items?.find(
    moduleTemplate =>
      moduleName ===
        moduleTemplate.metadata.labels[
          'operator.kyma-project.io/module-name'
        ] && moduleTemplate.spec.channel === channel,
  );
  const moduleWithInfo = moduleTemplates?.items?.find(
    moduleTemplate =>
      moduleName ===
        moduleTemplate.metadata.labels[
          'operator.kyma-project.io/module-name'
        ] &&
      !moduleTemplate.spec.channel &&
      moduleTemplate.spec.version === version,
  );

  return moduleWithInfo ?? moduleTemplateWithoutInfo;
};

export const setChannel = (
  module: { name: string; channels: [{ version: string; channel: string }] },
  channel: string,
  index: number,
  selectedModules: {
    name: string;
    channel?: string;
    version?: string;
  }[],
  setSelectedModules: React.Dispatch<React.SetStateAction<any[]>>,
) => {
  const modulesToUpdate = [...selectedModules];
  const channelData = findChannel(module, channel);
  if (
    selectedModules.find(
      (selectedModule: { name: string }) => selectedModule.name === module.name,
    )
  ) {
    if (channel === 'predefined') {
      delete modulesToUpdate[index].channel;
    } else modulesToUpdate[index].channel = channel;
    if (channelData?.version && modulesToUpdate[index]) {
      modulesToUpdate[index].version = channelData.version;
    }
  } else {
    modulesToUpdate.push({
      name: module.name,
    });
    if (channel !== 'predefined')
      modulesToUpdate[modulesToUpdate?.length - 1].channel = channel;
    if (channelData?.version) {
      modulesToUpdate[modulesToUpdate?.length - 1].version =
        channelData.version;
    }
  }
  setSelectedModules(modulesToUpdate);
};

export const checkSelectedModule = (
  module: { name: string },
  layoutState: ColumnLayoutState,
) => {
  // Checking if this is the selected module after a refresh or other case after which we have undefined.
  if (
    window.location.href.includes('kymamodules') &&
    layoutState?.midColumn?.resourceType
  ) {
    const [resourceTypeBase] = layoutState.midColumn.resourceType.split('.');
    return pluralize(module?.name?.replace('-', '') || '') === resourceTypeBase;
  }
  return false;
};

export const createModulePartialPath = (
  hasExtension: boolean,
  moduleStatusResource: {
    kind: string;
    apiVersion: string;
    metadata: { name: string; namespace: string };
  },
  moduleCrd?: { metadata?: { name: string } },
) => {
  // Taking info for path from extension or crd
  const pathName = `${
    hasExtension
      ? `${pluralize(moduleStatusResource?.kind || '').toLowerCase()}/${
          moduleStatusResource?.metadata?.name
        }`
      : `${moduleCrd?.metadata?.name}/${moduleStatusResource?.metadata?.name}`
  }`;

  const partialPath = moduleStatusResource?.metadata?.namespace
    ? `kymamodules/namespaces/${moduleStatusResource?.metadata?.namespace}/${pathName}`
    : `kymamodules/${pathName}`;

  return partialPath;
};

export const resolveInstallationStateName = (
  state?: string,
  managerExists?: boolean,
  managerResourceState?: string,
) => {
  if (state === ModuleTemplateStatus.Unmanaged && !managerExists) {
    return ModuleTemplateStatus.NotInstalled;
  }

  if (state === ModuleTemplateStatus.Unmanaged && managerExists) {
    if (resolveType(state) !== resolveType(managerResourceState ?? '')) {
      return ModuleTemplateStatus.Processing;
    }
    return managerResourceState || ModuleTemplateStatus.Unknown;
  }

  return state || ModuleTemplateStatus.Unknown;
};

export const splitModuleTemplates = (
  moduleTemplates: ModuleTemplateListType,
) => {
  if (!moduleTemplates?.items) return { managed: [], unmanaged: [] };

  const communityTemplates: ModuleTemplateListType = { items: [] };
  const kymaTemplates: ModuleTemplateListType = { items: [] };

  moduleTemplates.items.forEach(item => {
    if (item.metadata?.labels?.['operator.kyma-project.io/managed-by']) {
      kymaTemplates.items.push(item);
    } else {
      communityTemplates.items.push(item);
    }
  });

  return { kymaTemplates, communityTemplates };
};
