import pluralize from 'pluralize';
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
  };
};

export type ModuleTemplateListType = {
  items: ModuleTemplateType[];
};

export const getResourcePath = (resource: KymaResourceType) => {
  if (!resource) return '';
  return resource?.metadata?.namespace
    ? `/apis/${resource?.apiVersion}/namespaces/${
        resource?.metadata?.namespace
      }/${pluralize(resource?.kind || '').toLowerCase()}/${
        resource?.metadata?.name
      }`
    : `/apis/${resource?.apiVersion}/${pluralize(
        resource?.kind || '',
      ).toLowerCase()}/${resource?.metadata?.name}`;
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
  module: { name: string },
  channel: string,
  index: number,
  selectedModules: {
    name: string;
    channel?: string;
  }[],
  setSelectedModules: React.Dispatch<React.SetStateAction<any[]>>,
) => {
  const modulesToUpdate = [...selectedModules];
  if (
    selectedModules.find(
      (selectedModule: { name: string }) => selectedModule.name === module.name,
    )
  ) {
    if (channel === 'predefined') {
      delete modulesToUpdate[index].channel;
    } else modulesToUpdate[index].channel = channel;
  } else {
    modulesToUpdate.push({
      name: module.name,
    });
    if (channel !== 'predefined')
      modulesToUpdate[modulesToUpdate?.length - 1].channel = channel;
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

export const splitModuleTemplates = moduleTemplates => {
  if (!moduleTemplates?.items) return { managed: [], unmanaged: [] };

  const managed = { items: [] };
  const unmanaged = { items: [] };

  moduleTemplates.items.forEach(item => {
    if (item.metadata?.labels?.['operator.kyma-project.io/managed-by']) {
      managed.items.push(item);
    } else {
      unmanaged.items.push(item);
    }
  });

  return { managed, unmanaged };
};
